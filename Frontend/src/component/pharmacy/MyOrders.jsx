import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../shared/UserContext';
import { FaEye, FaTruck, FaCheckCircle, FaTimesCircle, FaClock, FaArrowLeft, FaStar, FaGift, FaEnvelope } from 'react-icons/fa';
import { BASE_URL } from '../../utils/Data';
import OrderStatusNotification from '../shared/OrderStatusNotification';
import toast from 'react-hot-toast';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [statusNotification, setStatusNotification] = useState(null);
  const [previousOrders, setPreviousOrders] = useState([]);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading ,setCancelLoading] =useState(false);
  const user = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user.user) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [user, navigate]);

  // // Set up automatic refresh for real-time order updates
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     fetchOrders();
  //   }, 15000); // Refresh every 15 seconds for more responsive updates

  //   return () => clearInterval(interval);
  // }, []);

  const fetchOrders = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const response = await fetch(`${BASE_URL}/orders/my-orders`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      const newOrders = data.orders || [];
      
      // Check for status changes and show notifications
      if (previousOrders.length > 0 && newOrders.length > 0) {
        newOrders.forEach(newOrder => {
          const oldOrder = previousOrders.find(o => o._id === newOrder._id);
          if (oldOrder && oldOrder.status !== newOrder.status) {
            setStatusNotification(newOrder);
          }
        });
      }
      
      setOrders(newOrders);
      setPreviousOrders(newOrders);
      
      // Set the first order as selected by default
      if (newOrders.length > 0) {
        setSelectedOrder(newOrders[0]);
      }
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };


  
  const handleCancelOrder = async () => {
    setCancelLoading(true);
     if (!cancelReason.trim()) {
      //DO here
      toast.error('Please provide a reason for cancellation');
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/orders/${selectedOrder._id}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ reason: cancelReason })
      });

      if (response.ok) {
        setCancelLoading(false);
        toast.success('Order cancelled successfully');
        setShowCancelModal(false);
        setSelectedOrder(null);
        setCancelReason('');
        fetchOrders();
      } else {
        const data = await response.json();
        setCancelLoading(false);
        toast.error(data.message || 'Failed to cancel order');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      setCancelLoading(false);
      toast.error('Error cancelling order');
    }
  };



  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDeliveryStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'in_transit': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered': return <FaCheckCircle className="text-green-600" />;
      case 'cancelled': return <FaTimesCircle className="text-red-600" />;
      case 'shipped':
      case 'in_transit': return <FaTruck className="text-blue-600" />;
      default: return <FaClock className="text-yellow-600" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getOrderStatusSteps = (order) => {
    const steps = [
      { key: 'pending', label: 'Order Placed', description: 'Your order has been successfully placed and is awaiting confirmation.' },
      { key: 'confirmed', label: 'Order Confirmed', description: 'Your order has been confirmed and is being processed.' },
      { key: 'processing', label: 'Processing', description: 'Your order is being prepared for shipment.' },
      { key: 'shipped', label: 'shipped', description: 'Your order has been shipped and is on its way to you.' },
      { key: 'delivered', label: 'Delivered', description: 'Your order has been successfully delivered!' }
    ];

    const currentStepIndex = steps.findIndex(step => step.key === order.status);
    
    return steps.map((step, index) => ({
      ...step,
      isCompleted: index <= currentStepIndex,
      isCurrent: index === currentStepIndex,
      isCancelled: order.status === 'cancelled'
    }));
  };
// Changes Happen hee 
  const handleOrderSelect = (order) => {
    setSelectedOrder(order);
    if (order.status === 'confirmed' && !showCongratulations) {
       // setShowCongratulations(true);
      // sendOrderConfirmationEmail(order);
    }
  };

  
  const handlePrint = () => {
      const printContents = document.getElementById('print-section').innerHTML;
      const originalContents = document.body.innerHTML;

      document.body.innerHTML = printContents;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload(); // Optional: reload to restore event bindings
};



  if (loading) {
    return (
      <div className="min-h-screen pt-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      {/* Status Change Notification */}
      {statusNotification && (
        <OrderStatusNotification
          order={statusNotification}
          onClose={() => setStatusNotification(null)}
        />
      )}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex cursor-pointer items-center gap-2 text-gray-600 hover:text-blue-800 mb-4"
          >
            <FaArrowLeft />
            Back to Dashboard
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2   ">My Orders</h1>
              <p className="text-gray-600">Track your medicine orders and deliveries</p>
              {lastUpdate && (
                <p className="text-sm text-gray-500 mt-1">
                  Last updated: {lastUpdate.toLocaleTimeString()}
                </p>
              )}
            </div>
            <button
              onClick={() => fetchOrders(true)}
              disabled={refreshing}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {refreshing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <FaEye className="text-sm" />
              )}
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-md p-8">
              <FaTruck className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No Orders Yet</h2>
              <p className="text-gray-600 mb-6">You haven't placed any orders yet.</p>
              <button
                onClick={() => navigate('/medicine-store')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
              >
                Browse Medicines
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Side - Order History */}
            <div className="lg:col-span-1">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order History</h2>
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order._id}
                    className={`bg-white rounded-lg shadow-md p-4 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                      selectedOrder?._id === order._id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                    }`}
                    onClick={() => handleOrderSelect(order)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">
                        Order #{order._id.slice(-8)}
                      </h3>
                      <div className="flex items-center gap-2">
                        {refreshing && (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                        )}
                        <span className={`text-xs px-2 py-1 rounded ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {formatDate(order.createdAt)}
                    </p>
                    <p className="text-lg font-bold text-green-600">₹{order.totalAmount}</p>
                    <div className="flex items-center gap-2 mt-2">
                      {getStatusIcon(order.status)}
                      <span className="text-xs text-gray-500">
                        {order.items.length} item{order.items.length > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side - Order Details */}
            <div className="lg:col-span-2">
              {selectedOrder ? (
                <div id='print-section' className="bg-white rounded-lg shadow-md overflow-hidden">
                  {/* Order Header */}
                  <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                          Order #{selectedOrder._id.slice(-8)}
                        </h2>
                        <p className="text-gray-600">Placed on {formatDate(selectedOrder.createdAt)}</p>
                        <p className="text-gray-600">
                          Estimated Delivery: {formatDate(selectedOrder.estimatedDelivery)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-green-600">₹{selectedOrder.totalAmount}</p>
                        <div className="flex items-center gap-2 mt-2">
                          {getStatusIcon(selectedOrder.status)}
                          <span className={`text-sm px-3 py-1 rounded ${getStatusColor(selectedOrder.status)}`}>
                            {selectedOrder.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Status Timeline */}
                  {/* {selectedOrder.status !== 'cancelled' && (
                    <div className="p-6 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status</h3>
                      <div className="space-y-4">
                        {getOrderStatusSteps(selectedOrder).map((step, index) => (
                          <div key={step.key} className="flex items-start gap-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                              step.isCompleted 
                                ? 'bg-green-500 text-white' 
                                : step.isCurrent 
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-gray-200 text-gray-500'
                            }`}>
                              {step.isCompleted ? <FaCheckCircle className="w-4 h-4" /> : index + 1}
                            </div>
                            <div className="flex-1">
                              <h4 className={`font-medium ${
                                step.isCompleted ? 'text-green-600' : 
                                step.isCurrent ? 'text-blue-600' : 'text-gray-500'
                              }`}>
                                {step.label}
                              </h4>
                              <p className="text-sm text-gray-600">{step.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )} */}
                  {selectedOrder.status !== 'cancelled' && (
  <div className="p-6 border-b border-gray-200">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status</h3>

    <div className="relative ml-5 space-y-10">
      {getOrderStatusSteps(selectedOrder).map((step, index, stepsArray) => {
        const isCompleted = step.isCompleted;
        const isCurrent = step.isCurrent;
        const isLast = index === stepsArray.length - 1;

        return (
          <div key={step.key} className="flex items-start gap-4 relative">
            {/* Vertical line */}
            {!isLast && (
              <div
                className={`absolute left-4 top-8 h-full w-0.5 ${
                  isCompleted
                    ? 'bg-green-500'
                    : 'border-l-2 border-dotted border-gray-400'
                }`}
              ></div>
            )}

            {/* Circle */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium z-10 ${
                isCompleted
                  ? 'bg-green-500 text-white'
                  : isCurrent
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-500'
              }`}
            >
              {isCompleted ? <FaCheckCircle className="w-4 h-4" /> : index + 1}
            </div>

            {/* Step Info */}
            <div className="flex-1">
              <h4
                className={`font-medium ${
                  isCompleted
                    ? 'text-green-600'
                    : isCurrent
                      ? 'text-blue-600'
                      : 'text-gray-500'
                }`}
              >
                {step.label}
              </h4>
              <p className="text-sm text-gray-600">{step.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  </div>
                 )}


                  {/* Order Items */}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
                    <div className="space-y-4">
                      {selectedOrder.items.map((item, index) => (
                        <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                          <img
                            src={`${BASE_URL}/${item.medicineId?.image}`}
                            alt={item.medicineId?.name}
                            className="w-16 h-16 object-cover rounded"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/64x64?text=No+Image';
                            }}
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{item.medicineId?.name}</h4>
                            <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                            <p className="text-sm text-gray-600">₹{item.price} each</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-lg">₹{item.price * item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div className="p-6 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Address</h3>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-gray-900">
                        {selectedOrder.deliveryAddress.street}, {selectedOrder.deliveryAddress.city}
                      </p>
                      <p className="text-gray-600">
                        {selectedOrder.deliveryAddress.state} - {selectedOrder.deliveryAddress.pincode}
                      </p>
                      <p className="text-gray-600">Phone: {selectedOrder.deliveryAddress.phone}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-6 border-t border-gray-200">
                    <div className="flex gap-4">
                      {selectedOrder.status !== 'cancelled' && selectedOrder.status !== 'delivered' && (
                        <button
                          onClick={() => setShowCancelModal(true)}
                          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Cancel Order
                        </button>
                      )}
                      <button
                        onClick={handlePrint}
                        className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        Print Order
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <FaEye className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select an Order</h3>
                  <p className="text-gray-600">Choose an order from the left to view its details</p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-md flex items-center justify-center">        {/* <div className='fixed inset-0 bg-black    bg-opacity-50 flex items-center justify-center -z-[10] blur-xl '></div> */}
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full relative">
            <button 
              className="absolute top-2 right-2 text-gray-500 !text-2xl cursor-pointer hover:text-gray-700" 
              onClick={() => {
                setShowCancelModal(false);
                setSelectedOrder(null);
                setCancelReason('');
              }}
            >
              &times;
            </button>
            <h3 className="text-lg font-semibold mb-4">Cancel Order</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to cancel order #{selectedOrder?._id.slice(-8)}?
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for cancellation *
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Please provide a reason for cancelling this order..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows="3"
                required
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setSelectedOrder(selectedOrder);
                  setCancelReason('');
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={!cancelReason.trim() || cancelLoading}   
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
               { cancelLoading ? "Canceling..." : "Cancel Order" }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrders; 