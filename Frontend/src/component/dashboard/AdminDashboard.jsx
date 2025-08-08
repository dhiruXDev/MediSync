import React, { useEffect, useState } from 'react';
import { FaUserShield, FaClipboardList, FaComments, FaCalendarCheck, FaSyncAlt, FaUserMd, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { BASE_URL } from '../../utils/Data';

const AdminDashboard = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [reports, setReports] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState({ open: false, type: '' });
  const [globalStats, setGlobalStats] = useState({ totalAppointments: 0, totalReports: 0, totalFeedbacks: 0 });
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [doctors, setDoctors] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceError, setAttendanceError] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDoctorFeedback, setSelectedDoctorFeedback] = useState('');
  const [selectedDoctorReport, setSelectedDoctorReport] = useState('');
  const [selectedDoctorAppointment, setSelectedDoctorAppointment] = useState('');
  const [patientSearch, setPatientSearch] = useState("");
  const [doctorSearch, setDoctorSearch] = useState("");

  const fetchAttendance = async () => {
    setAttendanceLoading(true);
    setAttendanceError('');
    try {
      const token = localStorage.getItem('token');
      const [attendanceRes, doctorsRes] = await Promise.all([
        fetch(`${BASE_URL}/auth/doctors/attendance/all`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${BASE_URL}/auth/doctors`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      const attendanceData = attendanceRes.ok ? await attendanceRes.json() : { records: {} };
      const doctorsData = doctorsRes.ok ? await doctorsRes.json() : [];
      setAttendanceRecords(attendanceData.records || {});
      setDoctors(doctorsData);
    } catch (err) {
      setAttendanceError('Failed to fetch attendance records.');
    } finally {
      setAttendanceLoading(false);
    }
  };

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const [feedbackRes, reportsRes, appointmentsRes, statsRes] = await Promise.all([
          fetch(`${BASE_URL}/feedback`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${BASE_URL}/reports`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${BASE_URL}/appointments/all`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${BASE_URL}/global-stats`)
        ]);
        const feedbackData = feedbackRes.ok ? await feedbackRes.json() : [];
        const reportsData = reportsRes.ok ? await reportsRes.json() : [];
        const appointmentsData = appointmentsRes.ok ? await appointmentsRes.json() : [];
        const statsData = statsRes.ok ? await statsRes.json() : null;
        setFeedbacks(feedbackData);
        setReports(reportsData);
        setAppointments(appointmentsData);
        if (statsData && statsData.totalAppointments !== undefined) setGlobalStats(statsData);
      } catch (err) {
        setError('Failed to fetch admin data.');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
    fetchAttendance();
  }, []);

  const getDoctorName = (doctorId) => {
    const doc = doctors.find(d => d._id === doctorId);
    return doc ? doc.username : doctorId;
  };

  const filteredAttendanceRecords = selectedDoctor
    ? { [selectedDoctor]: attendanceRecords[selectedDoctor] || [] }
    : attendanceRecords;

  // Filtered data by patient and doctor name
  const filterByPatientAndDoctor = (arr, patientField = 'patientId', doctorField = 'doctorId') =>
    arr.filter(item => {
      let patientMatch = true;
      let doctorMatch = true;
      if (patientSearch.trim() !== "") {
        const patient = item[patientField];
        let name = "";
        if (patient && typeof patient === 'object' && patient.username) name = patient.username;
        else if (typeof patient === 'string') name = patient;
        patientMatch = name.toLowerCase().includes(patientSearch.trim().toLowerCase());
      }
      if (doctorSearch.trim() !== "") {
        const doctor = item[doctorField];
        let name = "";
        if (doctor && typeof doctor === 'object' && doctor.username) name = doctor.username;
        else if (typeof doctor === 'string') name = doctor;
        doctorMatch = name.toLowerCase().includes(doctorSearch.trim().toLowerCase());
      }
      return patientMatch && doctorMatch;
    });

  const filteredFeedbacks = filterByPatientAndDoctor(feedbacks);
  const filteredReports = filterByPatientAndDoctor(reports);
  const filteredAppointments = filterByPatientAndDoctor(appointments);

  // Dashboard summary counts
  const totalFeedbacks = globalStats.totalFeedbacks || feedbacks.length;
  const totalAppointments = globalStats.totalAppointments || appointments.length;
  const totalReports = globalStats.totalReports || reports.length;

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FaUserShield className="text-3xl text-blue-600" />
            <span className="text-3xl font-bold text-gray-900">Admin Dashboard</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-700 font-medium">Admin</span>
            <span className="inline-flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full border-2 border-blue-400">
              <FaUserShield className="text-blue-700 text-xl" />
            </span>
          </div>
        </div>

        {/* Search Inputs */}
        <div className="mb-8 flex items-center gap-4">
          <input
            type="text"
            value={patientSearch}
            onChange={e => setPatientSearch(e.target.value)}
            placeholder="Search by patient name..."
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 w-72"
          />
          <input
            type="text"
            value={doctorSearch}
            onChange={e => setDoctorSearch(e.target.value)}
            placeholder="Search by doctor name..."
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 w-72"
          />
        </div>

        {/* Dashboard Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 shadow-sm flex flex-col items-center">
            <FaComments className="text-3xl text-yellow-500 mb-2" />
            <div className="text-3xl font-bold text-gray-900">{totalFeedbacks}</div>
            <div className="text-lg font-medium text-gray-600 mt-1">Total Feedbacks</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 shadow-sm flex flex-col items-center">
            <FaCalendarCheck className="text-3xl text-blue-500 mb-2" />
            <div className="text-3xl font-bold text-gray-900">{totalAppointments}</div>
            <div className="text-lg font-medium text-gray-600 mt-1">Total Appointments</div>
          </div>
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 shadow-sm flex flex-col items-center">
            <FaClipboardList className="text-3xl text-indigo-500 mb-2" />
            <div className="text-3xl font-bold text-gray-900">{totalReports}</div>
            <div className="text-lg font-medium text-gray-600 mt-1">Total Reports</div>
          </div>
        </div>

        {/* Attendance Section */}
        <section className="bg-white rounded-2xl shadow-xl p-8 mb-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <h2 className="text-2xl font-bold flex items-center gap-2 text-blue-700">
              <FaUserMd className="text-blue-500" /> All Doctors' Attendance Records
            </h2>
            <div className="flex flex-col md:flex-row md:items-center gap-2">
              <button
                onClick={fetchAttendance}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 font-semibold flex items-center gap-2"
                disabled={attendanceLoading}
              >
                <FaSyncAlt className={attendanceLoading ? 'animate-spin' : ''} />
                {attendanceLoading ? 'Refreshing...' : 'Get All Attendance Records'}
              </button>
              <div>
                <label htmlFor="doctorFilter" className="mr-2 font-medium text-gray-700">Filter by Doctor:</label>
                <select
                  id="doctorFilter"
                  value={selectedDoctor}
                  onChange={e => setSelectedDoctor(e.target.value)}
                  className="px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">All Doctors</option>
                  {doctors.map(doc => (
                    <option key={doc._id} value={doc._id}>{doc.username}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          {attendanceError && <div className="text-red-600 mb-2">{attendanceError}</div>}
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full text-sm bg-white rounded-xl">
              <thead className="sticky top-0 bg-blue-100 z-10">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-blue-700">Doctor</th>
                  <th className="px-4 py-3 text-left font-semibold text-blue-700">Date</th>
                  <th className="px-4 py-3 text-left font-semibold text-blue-700">Present</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(filteredAttendanceRecords).length === 0 ? (
                  <tr><td colSpan={3} className="text-center py-4">No attendance records found.</td></tr>
                ) : (
                  Object.entries(filteredAttendanceRecords).map(([doctorId, records]) =>
                    records.length === 0 ? (
                      <tr key={doctorId}><td className="px-4 py-2">{getDoctorName(doctorId)}</td><td colSpan={2}>No records</td></tr>
                    ) : (
                      records.map((rec, idx) => (
                        <tr key={doctorId + '-' + idx} className="hover:bg-blue-50 transition-colors">
                          <td className="px-4 py-2 font-medium flex items-center gap-2">
                            <FaUserMd className="text-blue-400" /> {getDoctorName(doctorId)}
                          </td>
                          <td className="px-4 py-2">{new Date(rec.date).toLocaleDateString()}</td>
                          <td className="px-4 py-2">
                            {rec.present ? (
                              <span className="inline-flex items-center gap-1 text-green-600 font-semibold"><FaCheckCircle /> Yes</span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-red-500 font-semibold"><FaTimesCircle /> No</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )
                  )
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* All Feedbacks Section */}
        <section className="bg-white rounded-2xl shadow-xl p-8 mb-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
            <h2 className="text-2xl font-bold flex items-center gap-2 text-blue-700">
              <FaComments className="text-blue-500" /> All Patient Feedbacks
            </h2>
          </div>
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full text-sm bg-white rounded-xl">
              <thead className="sticky top-0 bg-blue-100 z-10">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-blue-700">Patient</th>
                  <th className="px-4 py-3 text-left font-semibold text-blue-700">Doctor</th>
                  <th className="px-4 py-3 text-left font-semibold text-blue-700">Type</th>
                  <th className="px-4 py-3 text-left font-semibold text-blue-700">Reason</th>
                  <th className="px-4 py-3 text-left font-semibold text-blue-700">Message</th>
                  <th className="px-4 py-3 text-left font-semibold text-blue-700">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredFeedbacks.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-4">No feedbacks found.</td></tr>
                ) : filteredFeedbacks.map(fb => (
                  <tr key={fb._id} className="hover:bg-blue-50 transition-colors">
                    <td className="px-4 py-2">{fb.patientId?.username || '-'}</td>
                    <td className="px-4 py-2">{fb.doctorId?.username || '-'}</td>
                    <td className="px-4 py-2 capitalize">{fb.type}</td>
                    <td className="px-4 py-2">{fb.reason}</td>
                    <td className="px-4 py-2">{fb.message || '-'}</td>
                    <td className="px-4 py-2">{new Date(fb.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* All Reports Section */}
        <section className="bg-white rounded-2xl shadow-xl p-8 mb-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
            <h2 className="text-2xl font-bold flex items-center gap-2 text-purple-700">
              <FaClipboardList className="text-purple-500" /> All Reports
            </h2>
          </div>
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full text-sm bg-white rounded-xl">
              <thead className="sticky top-0 bg-purple-100 z-10">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-purple-700">Patient</th>
                  <th className="px-4 py-3 text-left font-semibold text-purple-700">Doctor</th>
                  <th className="px-4 py-3 text-left font-semibold text-purple-700">Diagnosis</th>
                  <th className="px-4 py-3 text-left font-semibold text-purple-700">Severity</th>
                  <th className="px-4 py-3 text-left font-semibold text-purple-700">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-purple-700">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-4">No reports found.</td></tr>
                ) : filteredReports.map(rp => (
                  <tr key={rp._id} className="hover:bg-purple-50 transition-colors">
                    <td className="px-4 py-2">{rp.patientId?.username || '-'}</td>
                    <td className="px-4 py-2">{rp.doctorId?.username || '-'}</td>
                    <td className="px-4 py-2">{rp.diagnosis}</td>
                    <td className="px-4 py-2">{rp.severity}</td>
                    <td className="px-4 py-2">{rp.status}</td>
                    <td className="px-4 py-2">{new Date(rp.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* All Appointments Section */}
        <section className="bg-white rounded-2xl shadow-xl p-8 mb-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
            <h2 className="text-2xl font-bold flex items-center gap-2 text-green-700">
              <FaCalendarCheck className="text-green-500" /> All Appointments
            </h2>
          </div>
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full text-sm bg-white rounded-xl">
              <thead className="sticky top-0 bg-green-100 z-10">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-green-700">Patient</th>
                  <th className="px-4 py-3 text-left font-semibold text-green-700">Doctor</th>
                  <th className="px-4 py-3 text-left font-semibold text-green-700">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-green-700">Reason</th>
                  <th className="px-4 py-3 text-left font-semibold text-green-700">Scheduled Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-4">No appointments found.</td></tr>
                ) : filteredAppointments.map(app => (
                  <tr key={app._id} className="hover:bg-green-50 transition-colors">
                    <td className="px-4 py-2">{app.patientId?.username || '-'}</td>
                    <td className="px-4 py-2">{app.doctorId?.username || '-'}</td>
                    <td className="px-4 py-2 capitalize">{app.status}</td>
                    <td className="px-4 py-2">{app.reason}</td>
                    <td className="px-4 py-2">{new Date(app.scheduledTime).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard; 