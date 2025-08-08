import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../shared/UserContext';
import { FaArrowLeft, FaCreditCard, FaMoneyBillWave, FaShieldAlt, FaTruck } from 'react-icons/fa';
import { BASE_URL } from '../../utils/Data';
const REACT_APP_RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;
import {    FaStar, FaGift, FaEnvelope } from 'react-icons/fa';

const BuyNow = () => {
  const [medicine, setMedicine] = useState(null);
  const [quantity, setQuantity] = useState(1);
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
  const [showCongratulations, setShowCongratulations] = useState(false);

  const  user = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user?.user) {
      navigate('/login');
      return;
    }

    if (location.state?.medicine) {
      setMedicine(location.state.medicine);
      setQuantity(location.state.quantity || 1);
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
      navigate('/medicine-store');
    }
    generateCaptcha();
  }, [user, navigate, location.state]);

  const generateCaptcha = () => {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz@$';
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

  const validateForm = () => {
    const requiredFields = ['name', 'email', 'phone', 'street', 'city', 'state', 'pincode', 'mainLocation'];
    const missingFields = requiredFields.filter(field => !userInfo[field]);

    if (missingFields.length > 0) {
      setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return false;
    }

    if (captchaInput !== captcha) {
      setError('Invalid captcha. Please try again.');
      generateCaptcha();
      setCaptchaInput('');
      return false;
    }

    return true;
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve();
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError('');

      const orderData = {
        items: [{
          medicineId: medicine._id,
          quantity: quantity
        }],
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

      if (paymentMethod === 'razorpay') {
        await loadRazorpayScript();

        const options = {
          key: REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_YOUR_KEY_ID',
          amount: Math.round((medicine.price * quantity) * 100),
          currency: 'INR',
          name: 'HealthCare Pharmacy',
          description: `Purchase: ${medicine.name}`,
          order_id: data.razorpayOrder.id,
          handler: async (response) => {
            try {
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
                // alert('Order placed successfully! You will receive an email confirmation.');
                setShowCongratulations(true);
                
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
        // Cash On Delevery order
        // alert('Order placed successfully! You will receive an email confirmation.');
        setShowCongratulations(true);
       
      }

    } catch (error) {
      console.error('Error placing order:', error);
      setError(error.message || 'Error placing order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getDeliveryDate = () => {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 5);
    return deliveryDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!medicine) {
    return (
      <div className="min-h-screen pt-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No product selected</h2>
            <button
              onClick={() => navigate('/medicine-store')}
              className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600"
            >
              Back to Store
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 ">
          <button
            onClick={() => navigate('/medicine-store')}
            className="flex cursor-pointer items-center gap-2 text-gray-600 hover:text-blue-800 mb-4"
          >
            <FaArrowLeft />
            Back to Store
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Buy Now</h1>
          <p className="text-gray-600">Complete your purchase</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8  ">
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
            
            <div className="flex items-center gap-4 mb-6">
              <img
                src={`${BASE_URL}/${medicine.image}`}
                alt={medicine.name}
                className="w-20 h-20 object-cover rounded-lg"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/80x80?text=No+Image';
                }}
              />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{medicine.name}</h3>
                <p className="text-gray-600 text-sm">{medicine.category}</p>
                <p className="text-gray-600 text-sm">Quantity: {quantity}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-600">₹{medicine.price}</p>
              </div>
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{medicine.price * quantity}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery:</span>
                <span className="text-green-600">Free</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total:</span>
                <span className="text-green-600">₹{medicine.price * quantity}</span>
              </div>
            </div>

            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <FaTruck className="text-blue-600" />
                <span className="font-semibold text-blue-800">Free Delivery</span>
              </div>
              <p className="text-blue-700">Get it by {getDeliveryDate()}</p>
            </div>
          </div>

          {/* User Information Form */}
          <div className="bg-white rounded-lg shadow-xl p-6 w-full">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Delivery Information</h2>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form className="space-y-4 !w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
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

              {/* Payment Method */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
                <div className="space-y-3">
                  <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="razorpay"
                      checked={paymentMethod === 'razorpay'}
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
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Verification</h3>
                <div className="flex items-center  justify-between gap-x-4">
                  <div className="bg-gray-100 p-3 px-10 rounded-lg font-mono text-lg tracking-wider">
                    {captcha}
                  </div>
                  <div
                    
                    onClick={generateCaptcha}
                    className="text-blue-600 bg-blue-200  hover:text-blue-800   px-5 cursor-pointer  "
                  >
                    Refresh
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="Enter the code above"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent mt-2"
                />
              </div>

              {/* Place Order Button */}
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={loading}
                className="w-full !shadow-none !bg-orange-500 text-white py-3 rounded-lg hover:!bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold transition-colors"
              >
                {loading ? 'Processing...' : `Place Order - ₹${medicine.price * quantity}`}
              </button>
            </form>
          </div>
          
        </div>
      </div>
      {/* Congratulations Modal */}
      {showCongratulations && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-md flex items-center justify-center">        {/* <div className='fixed inset-0 bg-black    bg-opacity-50 flex items-center justify-center -z-[10] blur-xl '></div> */}
            <div className="bg-white rounded-2xl shadow-black  shadow-2xl p-8 max-w-md w-full mx-4 text-center">
              <div className="mb-6">
                <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <FaGift className="text-4xl text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">🎉 Congratulations!</h2>
                <p className="text-gray-600 mb-4">
                  Your order has been confirmed and is being processed. You'll receive updates as your order progresses.
                </p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 text-green-800 mb-2">
                    <FaEnvelope />
                    <span className="font-medium">Order confirmation email sent!</span>
                  </div>
                  <p className="text-sm text-green-700">
                    Check your email for order details and tracking information.
                  </p>
                </div>
              </div>
 

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => {
                      setShowCongratulations(false);
                      navigate('/medicine-store'); // or wherever your store is
                    }}
                    className="flex-1 cursor-pointer bg-white border border-green-600 text-green-600 py-3 rounded-lg hover:bg-green-50 transition-colors font-semibold"
                  >
                    Continue Shopping
                  </button>

                  <button
                    onClick={() => {
                      setShowCongratulations(false);
                      navigate('/my-orders');
                    }}
                    className="flex-1 bg-green-600 cursor-pointer text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                  >
                    View My Orders
                  </button>
                </div>

            </div>
          </div>
        )}
    </div>
  );
};

export default BuyNow; 