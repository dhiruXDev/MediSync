import React, { useEffect, useState } from 'react';
import { FaUserMd, FaCalendarAlt, FaClock, FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaChartLine, FaBell, FaUser, FaFileMedical, FaPlus, FaEdit } from 'react-icons/fa';
import { useUser } from '../shared/UserContext';
import ReportForm from '../reports/ReportForm';
import { BASE_URL } from '../../utils/Data';

const DoctorDashboard = () => {
  const { user } = useUser();
  const token = localStorage.getItem('token');
  const [pendingRequests, setPendingRequests] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState('overview');
  const [showReportForm, setShowReportForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [attendance, setAttendance] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceMsg, setAttendanceMsg] = useState('');

  useEffect(() => {
    if (!user || !token) return;
    setLoading(true);
    Promise.all([
      fetch(`${BASE_URL}/appointments/requests`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`${BASE_URL}/appointments/doctor/all`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`${BASE_URL}/reports/my-reports`, { headers: { Authorization: `Bearer ${token}` } })
    ])
      .then(async ([reqRes, appRes, repRes]) => {
        if (!reqRes.ok || !appRes.ok || !repRes.ok) throw new Error('Failed to fetch some data');
        const [reqData, appData, repData] = await Promise.all([
          reqRes.json(), appRes.json(), repRes.json()
        ]);
        setPendingRequests(reqData);
        setAppointments(appData);
        setReports(repData);
        setError('');
      })
      .catch(e => setError(e.message || 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, [user, token]);

  // Fetch notifications on mount
  useEffect(() => {
    if (user && token) {
      fetch(`${BASE_URL}/auth/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setNotifications(data.notifications || []));
    }
  }, [user, token]);

  // Fetch attendance when Attendance tab is active
  useEffect(() => {
    if (view === 'attendance' && user?.role === 'doctor' && user._id && token) {
      setAttendanceLoading(true);
      fetch(`${BASE_URL}/auth/doctors/attendance/history/${user._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setAttendance(data.attendance || []))
        .finally(() => setAttendanceLoading(false));
    }
  }, [view, user, token]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAttendance = async () => {
    setAttendanceLoading(true);
    setAttendanceMsg('');
    try {
      const res = await fetch(`${BASE_URL}/auth/doctors/attendance`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setAttendance(data.attendance);
        setAttendanceMsg('Attendance marked for today!');
      } else {
        setAttendanceMsg(data.message || 'Failed to mark attendance');
      }
    } catch (e) {
      setAttendanceMsg('Network error');
    } finally {
      setAttendanceLoading(false);
    }
  };

  // Actions for appointments
  const handleAction = async (id, action, scheduledTime) => {
    let url = `${BASE_URL}/appointments/${id}/${action}`;
    let options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    };
    if (action === 'schedule') {
      options.body = JSON.stringify({ scheduledTime });
    }
    setLoading(true);
    try {
      const res = await fetch(url, options);
      if (!res.ok) throw new Error('Action failed');
      // Refresh data
      const [reqRes, appRes] = await Promise.all([
        fetch(`${BASE_URL}/appointments/requests`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${BASE_URL}/appointments/doctor/all`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setPendingRequests(await reqRes.json());
      setAppointments(await appRes.json());
      setError('');
    } catch (e) {
      setError(e.message || 'Failed to perform action');
    } finally {
      setLoading(false);
    }
  };

  // Actions for reports
  const handleDeleteReport = async (id) => {
    if (!window.confirm('Delete this report?')) return;
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/reports/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Delete failed');
      setReports(reports.filter(r => r._id !== id));
      setError('');
    } catch (e) {
      setError(e.message || 'Failed to delete report');
    } finally {
      setLoading(false);
    }
  };

  // Stats
  const approvedAppointments = appointments.filter(a => a.status === 'approved');
  const todayAppointments = approvedAppointments.filter(a => {
    const today = new Date().toDateString();
    const appointmentDate = new Date(a.scheduledTime).toDateString();
    return today === appointmentDate;
  });

  const stats = [
    {
      title: 'Pending Requests',
      value: pendingRequests.length,
      icon: <FaHourglassHalf className="text-2xl text-yellow-500" />, color: 'bg-yellow-50 border-yellow-200'
    },
    {
      title: "Today's Appointments",
      value: todayAppointments.length,
      icon: <FaCalendarAlt className="text-2xl text-blue-500" />, color: 'bg-blue-50 border-blue-200'
    },
    {
      title: 'Total Approved',
      value: approvedAppointments.length,
      icon: <FaCheckCircle className="text-2xl text-green-500" />, color: 'bg-green-50 border-green-200'
    },
    {
      title: 'Reports Created',
      value: reports.length,
      icon: <FaFileMedical className="text-2xl text-indigo-500" />, color: 'bg-indigo-50 border-indigo-200'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'declined': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleUpdateReport = (report) => {
    alert('Update report functionality coming soon!');
  };

  const handleWriteOrEditReport = (appointment) => {
    setSelectedAppointment(appointment);
    setShowReportForm(true);
  };
  const handleReportSaved = () => {
    // Refresh reports after saving
    fetch(`${BASE_URL}/reports/my-reports`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(repData => setReports(repData));
    setShowReportForm(false);
    setSelectedAppointment(null);
  };

  if (!user) return <div className="p-8 text-center text-red-600">User not loaded. Please log in.</div>;
  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Doctor Dashboard</h1>
            <p className="text-gray-600">Manage your appointments and patient requests</p>
          </div>
          <div className="relative">
            <button onClick={() => setShowNotifications(v => !v)} className="relative">
              <FaBell className="text-2xl text-blue-600" />
              {unreadCount > 0 && <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full px-2">{unreadCount}</span>}
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                <div className="p-4 border-b font-semibold">Notifications</div>
                {notifications.length === 0 ? (
                  <div className="p-4 text-gray-500">No notifications</div>
                ) : notifications.map(n => (
                  <div key={n._id} className={`p-4 border-b ${n.read ? 'bg-gray-50' : 'bg-blue-50'}`}>{n.message}</div>
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
                { id: 'overview', name: 'Overview', icon: <FaChartLine /> },
                { id: 'pending', name: 'Pending Requests', icon: <FaBell /> },
                { id: 'appointments', name: 'All Appointments', icon: <FaCalendarAlt /> },
                { id: 'reports', name: 'Reports', icon: <FaFileMedical /> },
                { id: 'attendance', name: 'Attendance', icon: <FaClock /> }
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
                  {/* Recent Pending Requests */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <FaBell className="mr-2 text-yellow-500" />
                      Recent Pending Requests
                    </h3>
                    {pendingRequests.slice(0, 3).map((req) => (
                      <div key={req._id} className="bg-white rounded-lg p-4 mb-3 shadow-sm">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{req.patientId?.username}</p>
                            <p className="text-sm text-gray-600">{req.reason}</p>
                          </div>
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                            Pending
                          </span>
                        </div>
                      </div>
                    ))}
                    {pendingRequests.length === 0 && (
                      <p className="text-gray-500 text-center py-4">No pending requests</p>
                    )}
                  </div>

                  {/* Today's Appointments */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <FaCalendarAlt className="mr-2 text-blue-500" />
                      Today's Appointments
                    </h3>
                    {todayAppointments.slice(0, 3).map((app) => (
                      <div key={app._id} className="bg-white rounded-lg p-4 mb-3 shadow-sm">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{app.patientId?.username}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(app.scheduledTime).toLocaleTimeString()}
                            </p>
                          </div>
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            Confirmed
                          </span>
                        </div>
                      </div>
                    ))}
                    {todayAppointments.length === 0 && (
                      <p className="text-gray-500 text-center py-4">No appointments today</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Pending Requests Tab */}
            {view === 'pending' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Appointment Requests</h3>
                {pendingRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <FaBell className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No pending requests</h3>
                    <p className="text-gray-600">All appointment requests have been processed</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingRequests.map((req) => (
                      <div key={req._id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-3">
                              <FaUser className="text-gray-400 mr-2" />
                              <h4 className="font-semibold text-gray-900">{req.patientId?.username}</h4>
                            </div>
                            <div className="space-y-2">
                              <p><span className="font-medium">Reason:</span> {req.reason}</p>
                              <p><span className="font-medium">Requested Time:</span> {req.scheduledTime ? new Date(req.scheduledTime).toLocaleString() : 'Not specified'}</p>
                              <p><span className="font-medium">Status:</span> 
                                <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                  Pending Review
                                </span>
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col space-y-2 ml-4">
                            <button
                              onClick={() => handleAction(req._id, 'approve')}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                            >
                              <FaCheckCircle className="inline mr-1" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleAction(req._id, 'decline')}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                            >
                              <FaTimesCircle className="inline mr-1" />
                              Decline
                            </button>
                            <div className="flex space-x-2">
                              <form onSubmit={e => { e.preventDefault(); handleAction(req._id, 'schedule', e.target.scheduledTime.value); e.target.reset(); }}>
                                <input name="scheduledTime" type="datetime-local" className="px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Select time" required />
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                                  <FaClock className="inline mr-1" />
                                  Schedule
                                </button>
                              </form>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* All Appointments Tab */}
            {view === 'appointments' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">All Appointments</h3>
                {appointments.length === 0 ? (
                  <div className="text-center py-12">
                    <FaCalendarAlt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
                    <p className="text-gray-600">You haven't received any appointment requests yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {appointments.map((app) => {
                      // Check if a report exists for this appointment
                      const reportExists = reports.some(r => r.appointmentId && r.appointmentId._id === app._id);
                      return (
                        <div key={app._id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center mb-2">
                                <FaUser className="text-gray-400 mr-2" />
                                <h4 className="font-semibold text-gray-900">{app.patientId?.username}</h4>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-2">
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
                            <div className="flex space-x-2">
                              {app.status === 'approved' && (
                                <button
                                  onClick={() => handleWriteOrEditReport(app)}
                                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center"
                                >
                                  <FaFileMedical className="mr-1" />
                                  {reportExists ? 'Edit Report' : 'Write Report'}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {/* Report Form Modal */}
                {showReportForm && selectedAppointment && (
                  <ReportForm
                    appointment={selectedAppointment}
                    onClose={() => { setShowReportForm(false); setSelectedAppointment(null); }}
                    onReportSaved={handleReportSaved}
                  />
                )}
              </div>
            )}

            {/* Reports Tab */}
            {view === 'reports' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">My Reports</h3>
                {reports.length === 0 ? (
                  <div className="text-center py-12">
                    <FaFileMedical className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
                    <p className="text-gray-600">You haven't created any patient reports yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reports.map((rep) => (
                      <div key={rep._id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <FaUser className="text-gray-400 mr-2" />
                              <h4 className="font-semibold text-gray-900">{rep.patientId?.username}</h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Diagnosis:</span> {rep.diagnosis}
                              </div>
                              <div>
                                <span className="font-medium">Created:</span> {new Date(rep.createdAt).toLocaleDateString()}
                              </div>
                              <div>
                                <span className="font-medium">Severity:</span> 
                                <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                                  rep.severity === 'Low' ? 'bg-green-100 text-green-800' :
                                  rep.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                  rep.severity === 'High' ? 'bg-orange-100 text-orange-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {rep.severity}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium">Status:</span> 
                                <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                                  rep.status === 'Active' ? 'bg-blue-100 text-blue-800' :
                                  rep.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {rep.status}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleUpdateReport(rep)}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center"
                            >
                              <FaEdit className="mr-1" />
                              Update
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Attendance Tab */}
            {view === 'attendance' && (
              <div className="bg-blue-50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FaClock className="mr-2 text-blue-500" />
                  Weekly Attendance
                </h3>
                <button
                  onClick={markAttendance}
                  disabled={attendanceLoading || attendance.some(a => new Date(a.date).toDateString() === new Date().toDateString() && a.present)}
                  className={`mb-4 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 ${attendanceLoading || attendance.some(a => new Date(a.date).toDateString() === new Date().toDateString() && a.present) ? 'bg-green-500 text-white opacity-70 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                >
                  {attendanceLoading ? (
                    'Marking...'
                  ) : attendance.some(a => new Date(a.date).toDateString() === new Date().toDateString() && a.present) ? (
                    <><span className="text-xl">✔️</span> Attendance Marked Today</>
                  ) : (
                    'Mark Attendance for Today'
                  )}
                </button>
                {attendanceMsg && <div className="mb-2 text-green-700 font-medium flex items-center gap-2"><span className="text-lg">✔️</span>{attendanceMsg}</div>}
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr>
                        <th className="px-2 py-1 text-left">Date</th>
                        <th className="px-2 py-1 text-left">Present</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...attendance].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 7).map((a, idx) => (
                        <tr key={idx}>
                          <td className="px-2 py-1">{new Date(a.date).toLocaleDateString()}</td>
                          <td className="px-2 py-1">{a.present ? 'Yes' : 'No'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;