import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../shared/UserContext';
import { FaPlus, FaEdit, FaTrash, FaEye, FaTruck, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { BASE_URL } from '../../utils/Data';
import toast from 'react-hot-toast';

const SellerDashboard = () => {
  const [medicines, setMedicines] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('medicines');
  const [showAddMedicine, setShowAddMedicine] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [orderFilter, setOrderFilter] = useState('active'); // 'active' or 'cancelled'
  const[updateStateus,setUpdateStateus] =useState(false);
  const  user  = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.user || user?.user?.role !== 'seller') {
      navigate('/login');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchMedicines(),
        fetchOrders()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMedicines = async () => {
    try {
      const response = await fetch(`${BASE_URL}/medicines/seller/my-medicines`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setMedicines(data.medicines || []);
    } catch (error) {
      console.error('Error fetching medicines:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${BASE_URL}/orders/seller/my-orders`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleDeleteMedicine = async (medicineId) => {
    if (!window.confirm('Are you sure you want to delete this medicine?')) {
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/medicines/${medicineId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setMedicines(medicines.filter(medicine => medicine._id !== medicineId));
        toast.success('Medicine deleted successfully');
      } else {
        toast.error('Failed to delete medicine');
      }
    } catch (error) {
      console.error('Error deleting medicine:', error);
      toast.error('Error deleting medicine');
    }
  };

  const updateOrderStatus = async (orderId, status, deliveryStatus) => {
    // Check if order is cancelled
    
    const toastId = toast.loading("Updating Status...");
    const order = orders.find(o => o._id === orderId);
    if (order && order.status === 'cancelled') {
      toast.dismiss(toastId);
      toast.error('Cannot update status of cancelled orders');
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status, deliveryStatus ,trackingNumber:orderId })
      });

      if (response.ok) {
        fetchOrders(); // Refresh orders
        toast.dismiss(toastId);
        toast.success('Order status updated successfully');
      } else {
        toast.dismiss(toastId);
        toast.error('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.dismiss(toastId);
      toast.error('Error updating order status');
    }
    toast.dismiss(toastId);
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

  const getFilteredOrders = () => {
    if (orderFilter === 'cancelled') {
      return orders.filter(order => order.status === 'cancelled');
    } else {
      return orders.filter(order => order.status !== 'cancelled');
    }
  };

  const getOrderCounts = () => {
    const activeOrders = orders.filter(order => order.status !== 'cancelled');
    const cancelledOrders = orders.filter(order => order.status === 'cancelled');
    return { active: activeOrders.length, cancelled: cancelledOrders.length };
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Seller Dashboard</h1>
          <p className="text-gray-600">Manage your medicines and orders</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Medicines</h3>
            <p className="text-3xl font-bold text-blue-600">{medicines.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Orders</h3>
            <p className="text-3xl font-bold text-green-600">{orders.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Pending Orders</h3>
            <p className="text-3xl font-bold text-yellow-600">
              {orders.filter(order => order.status === 'pending').length}
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('medicines')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'medicines'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Medicines
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'orders'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Orders
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'medicines' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">My Medicines</h2>
                  <button
                    onClick={() => navigate('/add-medicine')}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    <FaPlus />
                    Add Medicine
                  </button>
                </div>

                {medicines.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg mb-4">No medicines added yet</p>
                    <button
                      onClick={() => navigate('/add-medicine')}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Add Your First Medicine
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {medicines.map((medicine) => (
                      <div key={medicine._id} className="bg-gray-50 rounded-lg p-4">
                        <img
                          src={`${BASE_URL}/${medicine.image}`}
                          alt={medicine.name}
                          className="w-full h-48 object-cover rounded-lg mb-4"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                          }}
                        />
                        <h3 className="font-semibold text-lg mb-2">{medicine.name}</h3>
                        <p className="text-gray-600 text-sm mb-2">{medicine.description}</p>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-lg font-bold text-green-600">₹{medicine.price}</span>
                          <span className="text-sm text-gray-500">Stock: {medicine.stock}</span>
                        </div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {medicine.category}
                          </span>
                          {medicine.requiresPrescription && (
                            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                              Prescription Required
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`/edit-medicine/${medicine._id}`)}
                            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                          >
                            <FaEdit />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteMedicine(medicine._id)}
                            className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
                          >
                            <FaTrash />
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'orders' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">My Orders</h2>
                
                {/* Order Filter Tabs */}
                <div className="flex gap-4 mb-6">
                  <button
                    onClick={() => setOrderFilter('active')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      orderFilter === 'active'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Active Orders ({getOrderCounts().active})
                  </button>
                  <button
                    onClick={() => setOrderFilter('cancelled')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      orderFilter === 'cancelled'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Cancelled Orders ({getOrderCounts().cancelled})
                  </button>
                </div>
                
                {getFilteredOrders().length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">
                      {orderFilter === 'cancelled' ? 'No cancelled orders' : 'No active orders'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {getFilteredOrders().map((order) => (
                      <div key={order._id} className="bg-gray-50 rounded-lg p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-semibold text-lg">Order #{order._id.slice(-8)}</h3>
                            <p className="text-gray-600">Customer: {order.userId?.username}</p>
                            <p className="text-gray-600">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-lg">₹{order.totalAmount}</p>
                            <span className={`text-xs px-2 py-1 rounded ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </div>
                        </div>

                        <div className="mb-4">
                          <h4 className="font-medium mb-2">Items:</h4>
                          <div className="space-y-2">
                            {order.items
                              .filter(item => item.sellerId === user.user.id)
                              .map((item, index) => (
                                <div key={index} className="flex justify-between items-center bg-white p-3 rounded">
                                  <div>
                                    <p className="font-medium">{item.medicineId?.name}</p>
                                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                                  </div>
                                  <p className="font-semibold">₹{item.price * item.quantity}</p>
                                </div>
                              ))}
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="flex gap-2">
                            <span className={`text-xs px-2 py-1 rounded ${getDeliveryStatusColor(order.deliveryStatus)}`}>
                              {order.deliveryStatus}
                            </span>
                            {order.trackingNumber && (
                              <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                                Track: {order.trackingNumber}
                              </span>
                            )}
                            {order.status === 'cancelled' && (
                              <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                                Cancelled
                              </span>
                            )}
                          </div>
                          
                          {order.status !== 'cancelled' && (
                            <div className="flex gap-2">
                             <select
                                    value={order.status}
                                    onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                                    className="text-xs border border-gray-300 rounded px-2 py-1"
                                  >
                                    <option value="pending">Pending</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="processing">Processing</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="delivered">Delivered</option>
                                  </select>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard; 