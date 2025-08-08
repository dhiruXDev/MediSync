import React, { useEffect, useState } from 'react';
import { FaUserMd, FaCalendarAlt, FaClock, FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaPlus, FaHistory, FaStethoscope, FaUser, FaBell, FaFileMedical, FaShoppingBag, FaTruck, FaCreditCard, FaMoneyBillWave, FaEye, FaStar } from 'react-icons/fa';
import PatientReports from '../reports/PatientReports';
import { BASE_URL } from '../../utils/Data';
import OrderStatusNotification from '../shared/OrderStatusNotification';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import ReviewSection from '../pharmacy/ReviewSection';
import RatingForm from '../RatingFeedBack/RatingForm';

const medicalReasons = [
  'General Consultation',
  'Fever/Flu',
  'Headache/Migraine',
  'Diabetes Management',
  'Blood Pressure Issues',
  'Skin Problems',
  'Mental Health',
  'Child Health',
  "Women's Health",
  'Heart Problems',
  'Orthopedic Issues',
  'Eye Problems',
  'Dental Issues',
  'Other'
];

const doctorSpecializations = [
  'General Physician',
  'Neurologist',
  'Endocrinologist',
  'Cardiologist',
  'Dermatologist',
  'Psychiatrist / Psychologist',
  'Pediatrician',
  "Gynecologist / Obstetrician",
  'Orthopedic Surgeon / Specialist',
  'Ophthalmologist',
  'Dentist / Dental Surgeon',
  'Other'
];

const problemToSpecialization = {
  'General Consultation': ['General Physician'],
  'Fever/Flu': ['General Physician'],
  'Headache/Migraine': ['Neurologist'],
  'Diabetes Management': ['Endocrinologist'],
  'Blood Pressure Issues': ['Cardiologist'],
  'Skin Problems': ['Dermatologist'],
  'Mental Health': ['Psychiatrist / Psychologist'],
  'Child Health': ['Pediatrician'],
  "Women's Health": ['Gynecologist / Obstetrician'],
  'Heart Problems': ['Cardiologist'],
  'Orthopedic Issues': ['Orthopedic Surgeon / Specialist'],
  'Eye Problems': ['Ophthalmologist'],
  'Dental Issues': ['Dentist / Dental Surgeon'],
  'Other': [
    'General Physician', 'Neurologist', 'Endocrinologist', 'Cardiologist',
    'Dermatologist', 'Psychiatrist / Psychologist', 'Pediatrician',
    "Gynecologist / Obstetrician", 'Orthopedic Surgeon / Specialist',
    'Ophthalmologist', 'Dentist / Dental Surgeon', 'Other'
  ]
};

const PatientDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({ doctorId: '', reason: '', specialization: '', scheduledTime: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('overview'); // 'overview', 'book', 'history', 'reports', 'orders'
  const [reports, setReports] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const token = localStorage.getItem('token');
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [doctorAvailability, setDoctorAvailability] = useState({});
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [showAllOrders, setShowAllOrders] = useState(false);
  const [refreshingOrders, setRefreshingOrders] = useState(false);
  const [lastOrderUpdate, setLastOrderUpdate] = useState(null);
  const [statusNotification, setStatusNotification] = useState(null);
  const [previousOrders, setPreviousOrders] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false); // 💡 pre-open if triggered
  const navigate = useNavigate();
  // When reason changes, auto-select specialization
  useEffect(() => {
    if (form.reason) {
      const specs = problemToSpecialization[form.reason] || [];
      setForm(f => ({ ...f, specialization: specs[0] || '' }));
    } else {
      setForm(f => ({ ...f, specialization: '' }));
    }
  }, [form.reason]);

  useEffect(() => {
    fetchData();
    fetchOrders(); // Also fetch orders on initial load
  }, [token, form.specialization]);

  useEffect(() => {
    if (view === 'orders' || view === 'overview') {
      console.log('View changed to:', view, '- fetching orders immediately'); // Debug log
      fetchOrders();
    }
  }, [view]);

  // Set up automatic refresh for real-time order updates
  useEffect(() => {
    console.log('Setting up automatic refresh for view:', view); // Debug log
    
    const interval = setInterval(() => {
      if (view === 'orders' || view === 'overview') {
        console.log('Auto-refreshing orders...'); // Debug log
        fetchOrders();
      }
    }, 100000); // Refresh every 10 seconds for more responsive updates

    return () => {
      console.log('Clearing automatic refresh interval'); // Debug log
      clearInterval(interval);
    };
  }, [view]);

  // Fetch notifications on mount and set up auto-refresh
  useEffect(() => {
    const fetchNotifications = () => {
      if (token) {
        console.log('Fetching notifications...'); // Debug log
        fetch(`${BASE_URL}/auth/notifications`, {
          headers: { Authorization: `Bearer ${token}` }
        })
          .then(res => res.json())
          .then(data => {
            console.log('Notifications received:', data.notifications?.length || 0); // Debug log
            setNotifications(data.notifications || []);
          })
          .catch(error => {
            console.error('Error fetching notifications:', error);
          });
      }
    };

    fetchNotifications();
    
    // Auto-refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    
    return () => clearInterval(interval);
  }, [token]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markNotificationAsRead = async (notificationId) => {
    try {
      await fetch(`${BASE_URL}/auth/notifications/mark-read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ notificationId })
      });
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleViewAvailability = async (doctorId) => {
    setSelectedDoctor(doctorId);
    setShowAvailabilityModal(true);
    const res = await fetch(`${BASE_URL}/auth/doctors/availability/${doctorId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setDoctorAvailability(data.availability || []);
  };

  const fetchData = async () => {
    try {
      // Fetch doctors based on selected specialization
      const doctorsUrl = form.specialization 
        ? `${BASE_URL}/auth/doctors/specialization/${encodeURIComponent(form.specialization)}`
        : `${BASE_URL}/auth/doctors`;
      
      const [doctorsRes, appointmentsRes, reportsRes] = await Promise.all([
        fetch(doctorsUrl),
        fetch(`${BASE_URL}/appointments/mine`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${BASE_URL}/reports/my-reports`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const doctorsData = await doctorsRes.json();
      const appointmentsData = await appointmentsRes.json();
      const reportsData = await reportsRes.json();

      setDoctors(doctorsData);
      setAppointments(appointmentsData);
      setReports(reportsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchOrders = async (showRefreshing = false) => {
    if (!token) return;

    try {
      if (showRefreshing) {
        setRefreshingOrders(true);
      } else {
        setLoadingOrders(true);
      }
      
      console.log('Fetching orders...'); // Debug log
      
      const response = await fetch(`${BASE_URL}/orders/my-orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
       
      const newOrders = data.orders || [];
 
      // Check for status changes and show notifications
      if (previousOrders.length > 0 && newOrders.length > 0) {
        newOrders.forEach(newOrder => {
          const oldOrder = previousOrders.find(o => o._id === newOrder._id);
          if (oldOrder && oldOrder.status !== newOrder.status) {
             setStatusNotification(newOrder);
            
            // Also show an alert for immediate feedback
            toast.success(`Order #${newOrder._id.slice(-8)} status updated from ${oldOrder.status} to ${newOrder.status}!`);
          }
        });
      }
      
      setOrders(newOrders);
      setPreviousOrders(newOrders);
      setLastOrderUpdate(new Date());
      
      console.log('Orders updated successfully'); // Debug log
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoadingOrders(false);
      setRefreshingOrders(false);
    }
  };

  const handleCancelOrder = async () => {
    // alert('');
    if (!cancelReason.trim()) {
      toast.error('Please provide a reason for cancellation');
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/orders/${selectedOrder._id}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason: cancelReason })
      });

      if (response.ok) {
        toast.success('Order cancelled successfully');
        setShowCancelModal(false);
        setSelectedOrder(null);
        setCancelReason('');
        fetchOrders();
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to cancel order');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('Error cancelling order');
    }
  };

  const getOrderStatusStep = (status) => {
    const statusSteps = {
      'pending': 1,
      'confirmed': 2,
      'processing': 3,
      'shipped': 4,
      'delivered': 5,
      'cancelled': 0
    };
    return statusSteps[status] || 0;
  };

  const getOrderStatusColor = (status) => {
    const colors = {
      'pending': 'text-yellow-600',
      'confirmed': 'text-blue-600',
      'processing': 'text-purple-600',
      'shipped': 'text-orange-600',
      'delivered': 'text-green-600',
      'cancelled': 'text-red-600'
    };
    return colors[status] || 'text-gray-600';
  };

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage('');
    setLoading(true);
    
    try {
      const res = await fetch(`${BASE_URL}/appointments/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      
      if (res.ok) {
        setMessage('Appointment requested successfully!');
        setForm({ doctorId: '', reason: '', specialization: '', scheduledTime: '' });
        fetchData(); // Refresh appointments
      } else {
        setMessage(data.message || 'Request failed');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter doctors based on selected specialization
  const filteredDoctors = form.specialization
    ? doctors.filter(doc => doc.specialization === form.specialization)
    : doctors;

  // Calculate statistics
  const pendingAppointments = appointments.filter(a => a.status === 'pending');
  const approvedAppointments = appointments.filter(a => a.status === 'approved');
  const todayAppointments = approvedAppointments.filter(a => {
    const today = new Date().toDateString();
    const appointmentDate = new Date(a.scheduledTime).toDateString();
    return today === appointmentDate;
  });

  const stats = [
    {
      title: 'Pending Requests',
      value: pendingAppointments.length,
      icon: <FaHourglassHalf className="text-2xl text-yellow-500" />,
      color: 'bg-yellow-50 border-yellow-200'
    },
    {
      title: 'Today\'s Appointments',
      value: todayAppointments.length,
      icon: <FaCalendarAlt className="text-2xl text-blue-500" />,
      color: 'bg-blue-50 border-blue-200'
    },
    {
      title: 'Confirmed Appointments',
      value: approvedAppointments.length,
      icon: <FaCheckCircle className="text-2xl text-green-500" />,
      color: 'bg-green-50 border-green-200'
    },
    {
      title: 'Active Orders',
      value: orders.filter(order => order.status !== 'cancelled').length,
      icon: <FaShoppingBag className="text-2xl text-orange-500" />,
      color: 'bg-orange-50 border-orange-200'
    }
  ];

  const statusStepsDetails = {
  pending: {
    label: "Order Placed",
    description: "Your order has been placed and is awaiting confirmation."
  },
  confirmed: {
    label: "Confirmed",
    description: "Your order has been confirmed and will be processed soon."
  },
  processing: {
    label: "Processing",
    description: "Your items are being prepared for shipment."
  },
  shipped: {
    label: "Shipped",
    description: "Your order is on the way."
  },
  delivered: {
    label: "Delivered",
    description: "Your order has been delivered. Thank you!"
  }
};


  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'declined': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const [triggerReview, setTriggerReview] = useState(false);
 
 
  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Status Change Notification */}
      {statusNotification && (
        <OrderStatusNotification
          order={statusNotification}
          onClose={() => setStatusNotification(null)}
        />
      )}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Patient Dashboard</h1>
            <p className="text-gray-600">View your appointments, reports, and more</p>
          </div>
          <div className="relative">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  console.log('Fetching notifications manually...'); // Debug log
                  fetch(`${BASE_URL}/auth/notifications`, {
                    headers: { Authorization: `Bearer ${token}` }
                  })
                    .then(res => res.json())
                    .then(data => {
                      console.log('Manual notifications received:', data.notifications?.length || 0); // Debug log
                      setNotifications(data.notifications || []);
                    })
                    .catch(error => {
                      console.error('Error fetching notifications:', error);
                    });
                }}
                className="text-gray-600 hover:text-blue-600 transition-colors"
                title="Refresh notifications"
              >
                {/* <FaBell className="text-lg" /> */}
              </button>
              <button onClick={() => setShowNotifications(v => !v)} className="relative">
                <FaBell className="text-2xl text-blue-600" />
                {unreadCount > 0 && <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full px-2">{unreadCount}</span>}
              </button>
            </div>
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                <div className="p-4 border-b font-semibold">Notifications</div>
                {notifications.length === 0 ? (
                  <div className="p-4 text-gray-500">No notifications</div>
                ) : notifications.map(n => (
                  <div 
                    key={n._id} 
                    className={`p-4 border-b cursor-pointer hover:bg-gray-100 transition-colors ${n.read ? 'bg-gray-50' : 'bg-blue-50'}`}
                    onClick={() => markNotificationAsRead(n._id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className={`text-sm ${n.read ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                          {n.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(n.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {!n.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full ml-2"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className={`${stat.color} border rounded-xl p-6 shadow-sm`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                {stat.icon}
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', name: 'Overview', icon: <FaUser /> },
                { id: 'book', name: 'Book Appointment', icon: <FaPlus /> },
                { id: 'history', name: 'Appointment History', icon: <FaHistory /> },
                { id: 'orders', name: 'My Orders', icon: <FaShoppingBag /> },
                { id: 'reports', name: 'Medical Reports', icon: <FaFileMedical /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setView(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    view === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {view === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Appointments */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <FaCalendarAlt className="mr-2 text-blue-500" />
                      Recent Appointments
                    </h3>
                    {appointments.slice(0, 3).map((app) => (
                      <div key={app._id} className="bg-white rounded-lg p-4 mb-3 shadow-sm">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{app.doctorId?.username}</p>
                            <p className="text-sm text-gray-600">{app.reason}</p>
                            <p className="text-xs text-gray-500">
                              {app.scheduledTime ? new Date(app.scheduledTime).toLocaleDateString() : 'No date set'}
                            </p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(app.status)}`}>
                            {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    ))}
                    {appointments.length === 0 && (
                      <p className="text-gray-500 text-center py-4">No appointments yet</p>
                    )}
                    {appointments.length > 3 && (
                      <button
                        onClick={() => setView('history')}
                        className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        View All Appointments
                      </button>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <FaPlus className="mr-2 text-green-500" />
                      Quick Actions
                    </h3>
                    <div className="space-y-3">
                      <button
                        onClick={() => setView('book')}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        <FaPlus className="inline mr-2" />
                        Book New Appointment
                      </button>
                      <button
                        onClick={() => setView('history')}
                        className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors font-medium"
                      >
                        <FaHistory className="inline mr-2" />
                        View All Appointments
                      </button>
                          <button
                          onClick={() => navigate('/my-orders')}
                          className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 transition-colors font-medium"
                        >
                          <FaShoppingBag className="inline mr-2" />
                          View My Orders
                        </button>
                      <button
                        onClick={() => {
                          // Test notification
                          const testOrder = {
                            _id: 'test12345678',
                            status: 'shipped',
                            totalAmount: 500
                          };
                          setStatusNotification(testOrder);
                          setTimeout(() => setStatusNotification(null), 5000);
                        }}
                        className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
                      >
                        <FaBell className="inline mr-2" />
                        Test Notification
                      </button>
                      {/* <button
                        onClick={() => {
                          // Test order status update
                          console.log('Testing order status update...');
                          const testOrders = [
                            {
                              _id: 'test12345678',
                              status: 'pending',
                              totalAmount: 500,
                              createdAt: new Date(),
                              items: [],
                              paymentMethod: 'cod',
                              paymentStatus: 'pending'
                            }
                          ];
                          setOrders(testOrders);
                          setPreviousOrders([]);
                          
                          // Simulate status change after 2 seconds
                          setTimeout(() => {
                            const updatedOrders = [
                              {
                                _id: 'test12345678',
                                status: 'confirmed',
                                totalAmount: 500,
                                createdAt: new Date(),
                                items: [],
                                paymentMethod: 'cod',
                                paymentStatus: 'pending'
                              }
                            ];
                            setOrders(updatedOrders);
                            setStatusNotification(updatedOrders[0]);
                            alert('Order status updated from pending to confirmed!');
                          }, 2000);
                        }}
                        className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                      >
                        <FaTruck className="inline mr-2" />
                        Test Status Update
                      </button> */}
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Recent Orders */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <FaShoppingBag className="mr-2 text-orange-500" />
                      Recent Orders
                    </h3>
                    {(() => {
                      const nonCancelledOrders = orders.filter(order => order.status !== 'cancelled');
                      const latestOrder = nonCancelledOrders[0];
                      
                      return (
                        
                        <>
                        
                          {latestOrder   ? (
                            <div className="bg-white rounded-lg p-4 shadow-sm">
                              <div className="flex items-center justify-between mb-3">
                                <div>
                                  <p className="font-medium text-gray-900">Order #{latestOrder._id.slice(-8)}</p>
                                  <p className="text-sm text-gray-600">
                                   Date:  {new Date(latestOrder.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                                
                                <div className="text-right">
                                  <p className="text-lg font-bold text-green-600">₹{latestOrder.totalAmount}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    {latestOrder.paymentMethod === 'cod' ? (
                                      <FaMoneyBillWave className="text-green-600" />
                                    ) : (
                                      <FaCreditCard className="text-blue-600" />
                                    )}
                                    <span className="text-sm text-gray-600">
                                      {latestOrder.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                                    </span>
                                  </div>
                                </div>
                              </div>
 
                              <div className="flex items-start gap-4 mt-4 bg-gray-50 p-3 rounded-lg">
                                    <img
                                      src={`${BASE_URL}/${latestOrder.items[0]?.medicineId?.image}`}
                                      alt={latestOrder.items[0]?.medicineId?.name || 'Medicine'}
                                      className="w-20 h-20 object-cover rounded-md border"
                                      onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/100x100?text=No+Image';
                                      }}
                                    />
                                    <div className="flex flex-col flex-1">
                                      <span className="font-semibold text-gray-900 text-base">
                                        {latestOrder.items[0]?.medicineId?.name || 'Unknown Product'}
                                      </span>
                                      <span className="text-sm text-gray-600 mb-1">
                                        Qty: {latestOrder.items[0]?.quantity}
                                      </span>
                                      <p className="text-sm text-gray-500 line-clamp-2">
                                        {latestOrder.items[0]?.medicineId?.description || 'No description available.'}
                                      </p>
                                    </div>
                              </div>

                              {/* Order Status Progress */}
                                  <div className="flex items-center justify-between relative mt-6 mb-3">
                                    {['pending', 'confirmed', 'processing', 'shipped', 'delivered'].map((step, index, array) => {
                                      const isCompleted = getOrderStatusStep(latestOrder.status) >= index + 1;
                                      const isLast = index === array.length - 1;

                                      return (
                                        <div key={step} className="flex-1 flex flex-col items-center relative">
                                          {/* Horizontal line to next step */}
                                          {!isLast && (
                                            <div
                                              className={`absolute top-3 left-1/2 h-1 ${
                                                getOrderStatusStep(latestOrder.status) > index + 1
                                                  ? 'bg-green-500'
                                                  : 'bg-gray-300'
                                              }`}
                                              style={{
                                                width: '100%',
                                                transform: 'translateX(0%)',
                                                zIndex: 0
                                              }}
                                            ></div>
                                          )}

                                          {/* Step Circle */}
                                          <div
                                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10 ${
                                              isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                                            }`}
                                          >
                                            {index + 1}
                                          </div>

                                          {/* Step Label */}
                                          <span className="text-xs mt-2 capitalize text-gray-700">
                                            {step.replace('_', ' ')}
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>

                              
                              {/* Payment Status */}
                              <div className="p-2 bg-blue-50 rounded-lg">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-gray-700">Payment Status:</span>
                                  <span className={`text-sm font-medium ${
                                    latestOrder.paymentStatus === 'completed' ? 'text-green-600' : 'text-yellow-600'
                                  }`}>
                                    {latestOrder.paymentStatus === 'completed' ? 'Payment Done' : 'Amount Due'}
                                  </span>
                                </div>
                              </div>

                                    { (latestOrder.status === 'cancelled' || latestOrder.status === 'delivered' ) &&  latestOrder?.items[0]?.medicineId?.totalReviews == 0 &&(
                                        <div className=' w-full flex justify-end'>
                                        <button
                                          onClick={()=>setShowReviewForm((prev)=>!prev)}
                                          className="  w-fit  flex items-center gap-x-2  mt-4 bg-blue-600 text-white py-2 px-4   hover:bg-blue-700 transition-colors text-sm"
                                        >
                                        <FaStar /> Rate the Product
                                        </button>

                                  </div>
                                     )}

                                    { (latestOrder.status === 'cancelled' || latestOrder.status === 'delivered')  &&  latestOrder?.items[0]?.medicineId?.totalReviews >= 1 &&(
                                            <div className=' w-full flex justify-end'>
                                            <button
                                              onClick={()=>setShowReviewForm((prev)=>!prev)}
                                              className="  w-fit  flex items-center gap-x-2  mt-4 bg-blue-600 text-white py-2 px-4   hover:bg-blue-700 transition-colors text-sm"
                                            >
                                            <FaStar /> Update Review
                                            </button>

                                      </div>
                                
                                    )}
                                    { showReviewForm &&  ( 
                                                    <RatingForm medicineId ={latestOrder?.items[0]?.medicineId._id} />
                                    )}                             
                            </div>
                          ) : (
                            <p className="text-gray-500 text-center py-4">No active orders yet</p>
                          )}
                          
                          {latestOrder&& (
                            <div className=' w-full flex justify-center'>
                            <button
                              onClick={() => window.location.href = '/my-orders'}
                              className="  w-fit   mt-4 bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors text-sm"
                            >
                              View All Orders
                            </button>

                             </div>
                          )}


                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}

            {/* Book Appointment Tab */}
            {view === 'book' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Book New Appointment</h3>
                <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
                  <div>
                    <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                      Medical Problem
                    </label>
                    <select
                      id="reason"
                      name="reason"
                      value={form.reason}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    >
                      <option value="">Select Medical Problem</option>
                      {medicalReasons.map((reason, idx) => (
                        <option key={idx} value={reason}>{reason}</option>
                      ))}
                    </select>
                  </div>

                  {form.specialization && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Recommended Specialization
                      </label>
                      <div className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                        {form.specialization}
                      </div>
                    </div>
                  )}

                  {form.specialization && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Available Doctors
                      </label>
                      <div className="bg-gray-50 rounded-lg p-4">
                        {filteredDoctors.length === 0 ? (
                          <p className="text-gray-500">No doctors available for this specialization</p>
                        ) : (
                          <div className="space-y-2">
                            {filteredDoctors.map(doc => (
                              <div key={doc._id} className="flex items-center justify-between bg-white p-3 rounded-lg">
                                <div>
                                  <p className="font-medium text-gray-900">{doc.username}</p>
                                  <p className="text-sm text-gray-600">{doc.specialization}</p>
                                </div>
                                <span className="text-sm text-gray-500">{doc.experience} years exp.</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div>
                    <label htmlFor="doctorId" className="block text-sm font-medium text-gray-700 mb-2">
                      Select Doctor
                    </label>
                    <select
                      id="doctorId"
                      name="doctorId"
                      value={form.doctorId}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    >
                      <option value="">Select Doctor</option>
                      {filteredDoctors.map(doc => (
                        <option key={doc._id} value={doc._id}>
                          {doc.username} - {doc.specialization}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="scheduledTime" className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Date & Time
                    </label>
                    <input
                      id="scheduledTime"
                      type="datetime-local"
                      name="scheduledTime"
                      value={form.scheduledTime}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-green-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loading ? 'Requesting Appointment...' : 'Request Appointment'}
                  </button>

                  {message && (
                    <div className={`px-4 py-3 rounded-lg text-sm ${
                      message.includes('successfully') 
                        ? 'bg-green-50 border border-green-200 text-green-700'
                        : 'bg-red-50 border border-red-200 text-red-700'
                    }`}>
                      {message}
                    </div>
                  )}
                </form>
              </div>
            )}

            {/* Appointment History Tab */}
            {view === 'history' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Appointment History</h3>
                {appointments.length === 0 ? (
                  <div className="text-center py-12">
                    <FaCalendarAlt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
                    <p className="text-gray-600">You haven't made any appointment requests yet</p>
                    <button
                      onClick={() => setView('book')}
                      className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Book Your First Appointment
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {appointments.map((app) => (
                      <div key={app._id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-3">
                              <FaUserMd className="text-gray-400 mr-2" />
                              <h4 className="font-semibold text-gray-900">{app.doctorId?.username}</h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Reason:</span> {app.reason}
                              </div>
                              <div>
                                <span className="font-medium">Scheduled Time:</span> {app.scheduledTime ? new Date(app.scheduledTime).toLocaleString() : 'Not set'}
                              </div>
                              <div>
                                <span className="font-medium">Status:</span> 
                                <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getStatusColor(app.status)}`}>
                                  {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* My Orders Tab */}
 
            {/* My Orders Tab */}
            {view === 'orders' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <h3 className="text-lg font-semibold text-gray-900">My Orders</h3>
                    {refreshingOrders && (
                      <div className="flex items-center gap-2 text-blue-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span className="text-sm">Auto-refreshing...</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {lastOrderUpdate && (
                      <span className="text-sm text-gray-500">
                        Last updated: {lastOrderUpdate.toLocaleTimeString()}
                      </span>
                    )}
                    <button
                      onClick={() => {
                        console.log('Manual refresh clicked');
                        fetchOrders(true);
                      }}
                      disabled={refreshingOrders}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 text-sm font-medium"
                    >
                      {refreshingOrders ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Refreshing...</span>
                        </>
                      ) : (
                        <>
                          <FaEye className="text-sm" />
                          <span>Refresh Orders</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Orders Content */}
                {loadingOrders ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your orders...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12">
                    <FaShoppingBag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                    <p className="text-gray-600">You haven't placed any orders yet</p>
                    <button
                      onClick={() => navigate('/pharmacy')}
                      className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Start Shopping
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.slice(0, showAllOrders ? orders.length : 5).map((order) => (
                      <div key={order._id} className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                        {/* Order Header */}
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">
                              Order #{order._id.slice(-8)}
                            </h4>
                            <p className="text-sm text-gray-600">
                              Placed on {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-green-600">₹{order.totalAmount}</p>
                            <div className="flex items-center gap-2 mt-1">
                              {order.paymentMethod === 'cod' ? (
                                <FaMoneyBillWave className="text-green-600" />
                              ) : (
                                <FaCreditCard className="text-blue-600" />
                              )}
                              <span className="text-sm text-gray-600">
                                {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Order Status Progress */}
                        {order.status !== 'cancelled' && (
                          <div className="mb-6">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-sm font-medium text-gray-700">Order Status</span>
                              <span className={`text-sm font-medium ${getOrderStatusColor(order.status)}`}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </span>
                            </div>
                            
                            <div className="flex items-center justify-between relative mt-6 mb-3">
                              {['pending', 'confirmed', 'processing', 'shipped', 'delivered'].map((step, index, array) => {
                                const isCompleted = getOrderStatusStep(order.status) >= index + 1;
                                const isLast = index === array.length - 1;

                                return (
                                  <div key={step} className="flex-1 flex flex-col items-center relative">
                                    {/* Horizontal line to next step */}
                                    {!isLast && (
                                      <div
                                        className={`absolute top-3 left-1/2 h-1 ${
                                          getOrderStatusStep(order.status) > index + 1
                                            ? 'bg-green-500'
                                            : 'bg-gray-300'
                                        }`}
                                        style={{
                                          width: '100%',
                                          transform: 'translateX(0%)',
                                          zIndex: 0
                                        }}
                                      ></div>
                                    )}

                                    {/* Step Circle */}
                                    <div
                                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10 ${
                                        isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                                      }`}
                                    >
                                      {index + 1}
                                    </div>

                                    {/* Step Label */}
                                    <span className="text-xs mt-2 capitalize text-gray-700">
                                      {step.replace('_', ' ')}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>

                            {statusStepsDetails[order.status] && (
                              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                <p className="text-sm font-medium text-blue-900">
                                  {statusStepsDetails[order.status].label}
                                </p>
                                <p className="text-sm text-blue-700">
                                  {statusStepsDetails[order.status].description}
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Cancelled Order Status */}
                        {order.status === 'cancelled'  &&(
                          <div className="mb-6">
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <FaTimesCircle className="text-red-600" />
                                <span className="font-medium text-red-900">Order Cancelled</span>
                              </div>
                              {order.cancellationReason && (
                                <p className="text-sm text-red-700">
                                  Reason: {order.cancellationReason}
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Order Items */}
                        {order.items && order.items.length > 0 && (
                          <div className="mb-4">
                            <h5 className="font-medium text-gray-900 mb-2">Items ({order.items.length})</h5>
                            {/* <div className="space-y-2">
                              {order.items.map((item, index) => (
                                <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                                  <div>
                                    <p className="font-medium text-gray-900">{item.name}</p>
                                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                  </div>
                                  <p className="font-medium text-gray-900">₹{item.price * item.quantity}</p>
                                </div>
                              ))}
                            </div> */}
                            <div className="space-y-2">
                                  {order.items.map((item, index) => (
                                    <div
                                      key={index}
                                      className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                                    >
                                      {/* Medicine Image */}
                                      <img
                                        src={`${BASE_URL}/${item.medicineId?.image}`}
                                        alt={item.medicineId?.name || 'Medicine Image'}
                                        className="w-14 h-14 rounded object-cover"
                                        onError={(e) => {
                                          e.target.src = 'https://via.placeholder.com/56x56?text=No+Image';
                                        }}
                                      />

                                      {/* Medicine Details */}
                                      <div className="flex-1">
                                        <h4 className="text-sm font-semibold text-gray-900 mb-1">
                                          {item.medicineId?.name || 'Unknown Medicine'}
                                        </h4>
                                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                                        <p className="text-sm text-gray-600">₹{item.price} each</p>
                                      </div>

                                      {/* Total Price */}
                                      <div className="text-right">
                                        <p className="font-medium text-gray-900">
                                          ₹{item.price * item.quantity}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                            </div>

                          </div>
                        )}

                        {/* Payment Status */}
                        {
                          order.status === 'cancelled' && 
                              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700">Payment Status:</span>
                                <span className={`text-sm font-medium ${
                                  order.paymentStatus === 'completed' ? 'text-green-600' : 'text-yellow-600'
                                }`}>
                                  {order.paymentMethod === 'cod'  ?   'No Payment Required' : 'Refunded' }
                                </span>
                              </div>
                            </div> 
                        }
                        {
                          order.status !== 'cancelled' && 
                              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700">Payment Status:</span>
                                <span className={`text-sm font-medium ${
                                  order.paymentStatus === 'completed' ? 'text-green-600' : 'text-yellow-600'
                                }`}>
                                  {order.status === 'confirmed'  || order.status === 'delivered'  ?  'Payment Done' :  'Amount Due'  }
                                </span>
                              </div>
                            </div>
                        }

                               {( order.status === 'cancelled' || order.status === 'delivered' ) &&  order?.items[0]?.medicineId?.totalReviews == 0 &&(
                                        <div className=' w-full flex justify-end'>
                                        <button
                                          onClick={()=>setShowReviewForm((prev)=>!prev)}
                                          className="  w-fit  flex items-center gap-x-2  mt-4 bg-blue-600 text-white py-2 px-4   hover:bg-blue-700 transition-colors text-sm"
                                        >
                                        <FaStar /> Rate the Product
                                        </button>

                                  </div>
                                  )}

                                 { (order.status === 'cancelled' || order.status === 'delivered'  )&&  order?.items[0]?.medicineId?.totalReviews >= 1 &&(
                                        <div className=' w-full flex justify-end'>
                                        <button
                                          onClick={()=>setShowReviewForm((prev)=>!prev)}
                                          className="  w-fit  flex items-center gap-x-2  mt-4 bg-blue-600 text-white py-2 px-4   hover:bg-blue-700 transition-colors text-sm"
                                        >
                                        <FaStar /> Update Review
                                        </button>

                                  </div>
                        
                                 )}
                                  { 
                                    showReviewForm && ( 
                                                    <RatingForm medicineId ={order?.items[0]?.medicineId._id} />
                                    )
                                  }
                        

                        {/* Order Actions */}
                        <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                          {order.status !== 'delivered' && order.status !== 'cancelled' && (
                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                setShowCancelModal(true);
                              }}
                              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                            >
                              <FaTimesCircle className="inline mr-2" />
                              Cancel Order
                            </button>
                          )}
                          
                          {order.status === 'shipped' && (
                            <button onClick={()=>navigate('/my-orders')} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                              <FaTruck className="inline mr-2" />
                              Track Order
                            </button>
                          )}
                          
                         {order.status === 'delivered' && order.items.length > 0 && (
                              <button
                                onClick={() => navigate(`/product/${order.items[0]?.medicineId?._id}`)}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                              >
                                <FaCheckCircle className="inline mr-2" />
                                Reorder
                              </button>
                            )}
                        </div>
                      </div>
                    ))}

                    {/* Show More/Less Button */}
                    {orders.length > 5 && (
                      <div className="text-center">
                        <button
                          onClick={() => setShowAllOrders(!showAllOrders)}
                          className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium"
                        >
                          {showAllOrders ? 'Show Less' : `Show All Orders (${orders.length})`}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Medical Reports Tab */}
            {view === 'reports' && (
              <PatientReports />
            )}
          </div>
        </div>
      </div>
      {/* Doctor Availability Modal */}
      {showAvailabilityModal && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-md flex items-center justify-center">        {/* <div className='fixed inset-0 bg-black    bg-opacity-50 flex items-center justify-center -z-[10] blur-xl '></div> */}
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full relative">
            <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={() => setShowAvailabilityModal(false)}>&times;</button>
            <h3 className="text-lg font-semibold mb-4">Doctor Availability</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr>
                    <th className="px-2 py-1 text-left">Day</th>
                    <th className="px-2 py-1 text-left">Slots</th>
                  </tr>
                </thead>
                <tbody>
                  {doctorAvailability && doctorAvailability.length > 0 ? doctorAvailability.map(dayObj => (
                    <tr key={dayObj.day}>
                      <td className="px-2 py-1 font-medium">{dayObj.day}</td>
                      <td className="px-2 py-1">{dayObj.slots.join(', ')}</td>
                    </tr>
                  )) : <tr><td colSpan="2" className="text-gray-500">No availability set</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-md flex items-center justify-center">        {/* <div className='fixed inset-0 bg-black    bg-opacity-50 flex items-center justify-center -z-[10] blur-xl '></div> */}
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full relative">
            <button 
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" 
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
                  setSelectedOrder(null);
                  setCancelReason('');
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={!cancelReason.trim()}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Cancel Order
              </button>
            </div>
          </div>
        </div>
      )}
      


    </div>
  );
};

export default PatientDashboard;
