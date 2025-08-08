import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUser } from '../shared/UserContext';
import { FaEye, FaTruck, FaCheckCircle, FaTimesCircle, FaClock, FaArrowLeft, FaStar, FaGift, FaEnvelope, FaMapMarkerAlt, FaPhone, FaCalendarAlt } from 'react-icons/fa';
import { BASE_URL } from '../../utils/Data';
import OrderStatusNotification from '../shared/OrderStatusNotification';
import toast from 'react-hot-toast';

const OrderTrackingDetails = () => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [statusNotification, setStatusNotification] = useState(null);
  const [previousOrder, setPreviousOrder] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [trackingHistory, setTrackingHistory] = useState([]);
  
  const user = useUser();
  const navigate = useNavigate();
  const { orderId } = useParams(); // Get order ID from URL params
  console.log("00",orderId ,localStorage.getItem('token'))
  useEffect(() => {
    if (!user.user) {
      navigate('/login');
      return;
    }
    fetchOrderDetails();
  }, [user, navigate, orderId]);

  // Set up automatic refresh for real-time order updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrderDetails(true);
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchOrderDetails = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      console.log("res")
      const response = await fetch(`${BASE_URL}/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      console.log("res",response)
      if(response.statusText == 'Unauthorized'        ){
         navigate('/my-orders');
      }
      if (!response.ok) {
        throw new Error('Order not found');
      }
      
      const data = await response.json();
      const newOrder = data.order;
      
      // Check for status changes and show notifications
      if (previousOrder && previousOrder.status !== newOrder.status) {
        setStatusNotification(newOrder);
      }
      
      setOrder(newOrder);
      setPreviousOrder(newOrder);
      setLastUpdate(new Date());
      
      // Fetch tracking history if available
      fetchTrackingHistory(orderId);
      
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchTrackingHistory = async (orderId) => {
    try {
      const response = await fetch(`${BASE_URL}/orders/${orderId}/tracking`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTrackingHistory(data.trackingHistory || []);
      }
    } catch (error) {
      console.error('Error fetching tracking history:', error);
    }
  };

  const handleCancelOrder = async () => {
    setCancelLoading(true);
    if (!cancelReason.trim()) {
      toast.error('Please provide a reason for cancellation');
      setCancelLoading(false);
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/orders/${order._id}/cancel`, {
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
        setCancelReason('');
        fetchOrderDetails();
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
      { key: 'shipped', label: 'Shipped', description: 'Your order has been shipped and is on its way to you.' },
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

  const handlePrint = () => {
    const printContents = document.getElementById('print-section').innerHTML;
    const originalContents = document.body.innerHTML;

    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
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
            onClick={() => navigate('/my-orders')}
            className="flex cursor-pointer items-center gap-2 text-gray-600 hover:text-blue-800 mb-4"
          >
            <FaArrowLeft />
            Back to My Orders
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Tracking</h1>
              <p className="text-gray-600">Track your order progress and delivery status</p>
              {lastUpdate && (
                <p className="text-sm text-gray-500 mt-1">
                  Last updated: {lastUpdate.toLocaleTimeString()}
                </p>
              )}
            </div>
            <button
              onClick={() => fetchOrderDetails(true)}
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

        {!order ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-md p-8">
              <FaTruck className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Order Not Found</h2>
              <p className="text-gray-600 mb-6">The order you're looking for doesn't exist or you don't have access to it.</p>
              <button
                onClick={() => navigate('/my-orders')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
              >
                View All Orders
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Side - Quick Info & Actions */}
            <div className="lg:col-span-1">
              {/* Order Summary Card */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order ID:</span>
                    <span className="font-medium">#{order._id.slice(-8)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="font-bold text-green-600">₹{order.totalAmount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`text-sm px-2 py-1 rounded ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Items:</span>
                    <span className="font-medium">{order.items.length} item{order.items.length > 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Info Card */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FaMapMarkerAlt className="text-blue-600" />
                  Delivery Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Address:</p>
                    <p className="font-medium text-gray-900">
                      {order.deliveryAddress.street}, {order.deliveryAddress.city}
                    </p>
                    <p className="text-gray-600">
                      {order.deliveryAddress.state} - {order.deliveryAddress.pincode}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaPhone className="text-gray-400" />
                    <span className="text-gray-600">{order.deliveryAddress.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt className="text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Expected Delivery:</p>
                      <p className="font-medium text-gray-900">{formatDate(order.estimatedDelivery)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
                <div className="space-y-3">
                  {order.status !== 'cancelled' && order.status !== 'delivered' && (
                    <button
                      onClick={() => setShowCancelModal(true)}
                      className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Cancel Order
                    </button>
                  )}
                  <button
                    onClick={handlePrint}
                    className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Print Order Details
                  </button>
                  <button
                    onClick={() => navigate('/contact-support')}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Contact Support
                  </button>
                </div>
              </div>
            </div>

            {/* Right Side - Detailed Order Information */}
            <div className="lg:col-span-2">
              <div id='print-section' className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Order Header */}
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        Order #{order._id.slice(-8)}
                      </h2>
                      <p className="text-gray-600">Placed on {formatDate(order.createdAt)}</p>
                      <p className="text-gray-600">
                        Estimated Delivery: {formatDate(order.estimatedDelivery)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-green-600">₹{order.totalAmount}</p>
                      <div className="flex items-center gap-2 mt-2 justify-end">
                        {getStatusIcon(order.status)}
                        <span className={`text-sm px-3 py-1 rounded ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Status Timeline */}
                {order.status !== 'cancelled' && (
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Order Progress</h3>
                    
                    <div className="relative ml-5 space-y-10">
                      {getOrderStatusSteps(order).map((step, index, stepsArray) => {
                        const isCompleted = step.isCompleted;
                        const isCurrent = step.isCurrent;
                        const isLast = index === stepsArray.length - 1;

                        return (
                          <div key={step.key} className="flex items-start gap-4 relative">
                            {/* Vertical line */}
                            {!isLast && (
                              <div
                                className={`absolute left-4 top-8 h-16 w-0.5 ${
                                  isCompleted
                                    ? 'bg-green-500'
                                    : 'border-l-2 border-dotted border-gray-400'
                                }`}
                              ></div>
                            )}

                            {/* Circle */}
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium z-10 shadow-sm ${
                                isCompleted
                                  ? 'bg-green-500 text-white'
                                  : isCurrent
                                    ? 'bg-blue-500 text-white animate-pulse'
                                    : 'bg-gray-200 text-gray-500'
                              }`}
                            >
                              {isCompleted ? <FaCheckCircle className="w-4 h-4" /> : index + 1}
                            </div>

                            {/* Step Info */}
                            <div className="flex-1 pb-2">
                              <h4
                                className={`font-semibold text-lg ${
                                  isCompleted
                                    ? 'text-green-600'
                                    : isCurrent
                                      ? 'text-blue-600'
                                      : 'text-gray-500'
                                }`}
                              >
                                {step.label}
                                {isCurrent && <span className="ml-2 text-sm bg-blue-100 text-blue-600 px-2 py-1 rounded">Current</span>}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                              {isCompleted && (
                                <p className="text-xs text-green-600 mt-1">✓ Completed</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Tracking History */}
                {trackingHistory.length > 0 && (
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Tracking History</h3>
                    <div className="space-y-3">
                      {trackingHistory.map((track, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{track.status}</p>
                            <p className="text-sm text-gray-600">{track.description}</p>
                            <p className="text-xs text-gray-500 mt-1">{formatDate(track.timestamp)}</p>
                            {track.location && (
                              <p className="text-xs text-gray-500">📍 {track.location}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Order Items */}
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
                  <div className="space-y-4">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <img
                          src={`${BASE_URL}/${item.medicineId?.image}`}
                          alt={item.medicineId?.name}
                          className="w-16 h-16 object-cover rounded-lg shadow-sm"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/64x64?text=No+Image';
                          }}
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{item.medicineId?.name}</h4>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                          <p className="text-sm text-gray-600">₹{item.price} per unit</p>
                          {item.medicineId?.manufacturer && (
                            <p className="text-xs text-gray-500">By: {item.medicineId.manufacturer}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-gray-900">₹{item.price * item.quantity}</p>
                          <p className="text-sm text-gray-500">Total</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Order Total Breakdown */}
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="text-gray-900">₹{order.subtotal || order.totalAmount}</span>
                      </div>
                      {order.deliveryFee && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Delivery Fee:</span>
                          <span className="text-gray-900">₹{order.deliveryFee}</span>
                        </div>
                      )}
                      {order.discount && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Discount:</span>
                          <span className="text-green-600">-₹{order.discount}</span>
                        </div>
                      )}
                      <div className="border-t pt-2 flex justify-between font-bold">
                        <span className="text-gray-900">Total:</span>
                        <span className="text-green-600 text-lg">₹{order.totalAmount}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="font-medium text-gray-900">
                          Payment Status: <span className="text-green-600">Confirmed</span>
                        </p>
                        <p className="text-sm text-gray-600">
                          Payment Method: {order.paymentMethod || 'Online Payment'}
                        </p>
                        {order.transactionId && (
                          <p className="text-sm text-gray-600">
                            Transaction ID: {order.transactionId}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-md flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full relative">
            <button 
              className="absolute top-2 right-2 text-gray-500 text-2xl cursor-pointer hover:text-gray-700" 
              onClick={() => {
                setShowCancelModal(false);
                setCancelReason('');
              }}
            >
              &times;
            </button>
            <h3 className="text-lg font-semibold mb-4">Cancel Order</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to cancel order #{order?._id.slice(-8)}?
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
                {cancelLoading ? "Canceling..." : "Cancel Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTrackingDetails;