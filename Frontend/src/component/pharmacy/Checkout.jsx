import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../shared/UserContext';
import { FaArrowLeft, FaCreditCard, FaMoneyBillWave, FaShieldAlt, FaTruck } from 'react-icons/fa';
import { BASE_URL } from '../../utils/Data';

const Checkout = () => {
  const [cart, setCart] = useState([]);
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    mainLocation: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [captcha, setCaptcha] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user?.user) {
      navigate('/login');
      return;
    }

    if (location.state?.cart) {
      setCart(location.state.cart);
      // Pre-fill user info
      setUserInfo({
        name: user.user.username || '',
        email: user.user.email || '',
        phone: '',
        street: '',
        city: '',
        state: '',
        pincode: '',
        mainLocation: ''
      });
    } else {
      // Try to get cart from localStorage
      const savedCart = localStorage.getItem('medicineCart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
        setUserInfo({
          name: user.user.username || '',
          email: user.user.email || '',
          phone: '',
          street: '',
          city: '',
          state: '',
          pincode: '',
          mainLocation: ''
        });
      } else {
        navigate('/medicine-store');
      }
    }
    generateCaptcha();
  }, [user, navigate, location]);

  const generateCaptcha = () => {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptcha(result);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve();
      document.body.appendChild(script);
    });
  };

  const validateForm = () => {
    const requiredFields = ['name', 'email', 'phone', 'street', 'city', 'state', 'pincode', 'mainLocation'];
    const missingFields = requiredFields.filter(field => !userInfo[field]);

    if (missingFields.length > 0) {
      setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return false;
    }

    if (captchaInput.toUpperCase() !== captcha) {
      setError('Invalid captcha. Please try again.');
      generateCaptcha();
      setCaptchaInput('');
      return false;
    }

    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError('');

      // Create order
      const orderData = {
        items: cart.map(item => ({
          medicineId: item._id,
          quantity: item.quantity
        })),
        deliveryAddress: {
          street: userInfo.street,
          city: userInfo.city,
          state: userInfo.state,
          pincode: userInfo.pincode,
          phone: userInfo.phone
        },
        paymentMethod: paymentMethod
      };

      const response = await fetch(`${BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(orderData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create order');
      }

      if (paymentMethod === 'online') {
        // Load Razorpay script
        await loadRazorpayScript();

      // Initialize Razorpay payment
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_YOUR_KEY_ID', // Replace with your key
        amount: Math.round(getCartTotal() * 100), // Convert to paise
        currency: 'INR',
        name: 'HealthCare Pharmacy',
        description: 'Medicine Purchase',
        order_id: data.razorpayOrder.id,
        handler: async (response) => {
          try {
            // Verify payment
            const verifyResponse = await fetch(`${BASE_URL}/orders/verify-payment`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });

            const verifyData = await verifyResponse.json();

            if (verifyResponse.ok) {
              alert('Order placed successfully! You will receive an email confirmation.');
              navigate('/my-orders');
            } else {
              throw new Error(verifyData.message || 'Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: userInfo.name,
          email: userInfo.email,
          contact: userInfo.phone
        },
        theme: {
          color: '#F97316'
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
      } else {
        // COD order
        alert('Order placed successfully! You will receive an email confirmation.');
        localStorage.removeItem('medicineCart'); // Clear cart after successful order
        navigate('/my-orders');
      }

    } catch (error) {
      console.error('Error placing order:', error);
      setError(error.message || 'Error placing order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user.user) {
    return null;
  }

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/medicine-store')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <FaArrowLeft />
            Back to Store
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-gray-600">Complete your medicine purchase</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            
            {cart.length === 0 ? (
              <p className="text-gray-500">No items in cart</p>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item._id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <img
                      src={`${BASE_URL}/${item.image}`}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/64x64?text=No+Image';
                      }}
                    />
                    <div className="flex-1">
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      <p className="text-sm text-gray-600">₹{item.price} each</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₹{item.price * item.quantity}</p>
                    </div>
                  </div>
                ))}
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total:</span>
                    <span className="text-2xl font-bold text-green-600">₹{getCartTotal()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Delivery Information & Payment */}
          <div className="space-y-6">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* Delivery Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Delivery Information</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={userInfo.name}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={userInfo.email}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={userInfo.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Main Location *</label>
                    <input
                      type="text"
                      name="mainLocation"
                      value={userInfo.mainLocation}
                      onChange={handleInputChange}
                      placeholder="e.g., Near City Center"
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
                  <input
                    type="text"
                    name="street"
                    value={userInfo.street}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                    <input
                      type="text"
                      name="city"
                      value={userInfo.city}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                    <input
                      type="text"
                      name="state"
                      value={userInfo.state}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
                    <input
                      type="text"
                      name="pincode"
                      value={userInfo.pincode}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
              
              <div className="space-y-3">
                <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="online"
                    checked={paymentMethod === 'online'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <FaCreditCard className="mr-2 text-blue-600" />
                  <span>Online Payment (Razorpay)</span>
                </label>
                <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <FaMoneyBillWave className="mr-2 text-green-600" />
                  <span>Cash on Delivery</span>
                </label>
              </div>
            </div>

            {/* Captcha */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Verification</h3>
              <div className="flex items-center gap-4">
                <div className="bg-gray-100 p-3 rounded-lg font-mono text-lg tracking-wider">
                  {captcha}
                </div>
                <button
                  type="button"
                  onClick={generateCaptcha}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Refresh
                </button>
              </div>
              <input
                type="text"
                placeholder="Enter the code above"
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent mt-2"
              />
            </div>

            {/* Delivery Info */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-800 mb-2">
                <FaTruck />
                <span className="font-medium">Delivery Information</span>
              </div>
              <p className="text-sm text-blue-700">
                • Standard delivery: 5-7 business days<br/>
                • Free delivery on orders above ₹500<br/>
                • Track your order with the tracking number provided
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* Place Order Button */}
            <button
              onClick={handlePlaceOrder}
              disabled={loading || cart.length === 0}
              className="w-full bg-orange-500 text-white py-4 rounded-lg hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold text-lg transition-colors"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Processing...
                </div>
              ) : (
                `Place Order - ₹${getCartTotal()}`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout; 