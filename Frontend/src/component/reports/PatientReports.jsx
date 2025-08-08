import React, { useState, useEffect } from 'react';
import { FaUserMd, FaCalendarAlt, FaStethoscope, FaPills, FaNotesMedical, FaThermometerHalf, FaHeartbeat,
FaWeight, FaRuler, FaFileMedical, FaEye, FaDownload, FaPrint, FaSearch, FaFilter ,FaTimes} from 'react-icons/fa';
import { useUser } from '../shared/UserContext';

const PatientReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');

  const token = localStorage.getItem('token');
  const { user } = useUser();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await fetch('http://localhost:8080/reports/my-reports', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Fetch response:', response);
      if (response.ok) {
        const data = await response.json();
        setReports(data);
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch reports', response.status, errorText);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-blue-100 text-blue-800';
      case 'Resolved': return 'bg-green-100 text-green-800';
      case 'Under Observation': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      report.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.doctorId?.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.symptoms.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === '' || report.status === filterStatus;
    const matchesSeverity = filterSeverity === '' || report.severity === filterSeverity;
    
    return matchesSearch && matchesStatus && matchesSeverity;
  });

  const handleViewReport = (report) => {
    setSelectedReport(report);
    setShowModal(true);
  };

  const handlePrintReport = (report) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Medical Report - ${report.patientId?.username}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .section { margin-bottom: 20px; }
            .section h3 { color: #2563eb; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
            .vital-signs { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; }
            .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
            .severity-low { background-color: #dcfce7; color: #166534; }
            .severity-medium { background-color: #fef3c7; color: #92400e; }
            .severity-high { background-color: #fed7aa; color: #c2410c; }
            .severity-critical { background-color: #fecaca; color: #991b1b; }
            .status-active { background-color: #dbeafe; color: #1e40af; }
            .status-resolved { background-color: #dcfce7; color: #166534; }
            .status-observation { background-color: #fef3c7; color: #92400e; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Medical Report</h1>
            <p><strong>Patient:</strong> ${(report.patientId?.username || user?.username) ?? 'N/A'} | <strong>Age:</strong> ${(report.patientId?.age ?? user?.age) ?? 'N/A'} | <strong>Email:</strong> ${(report.patientId?.email || user?.email) ?? 'N/A'}</p>
            <div style="margin-top: 10px;"><strong>Doctor:</strong> ${report.doctorId?.username} (${report.doctorId?.specialization})</div>
            <p><strong>Date:</strong> ${formatDate(report.createdAt)}</p>
          </div>
          
          <div class="section">
            <h3>Doctor Information</h3>
            <div class="info-grid">
              <div><strong>Doctor:</strong> ${report.doctorId?.username}</div>
              <div><strong>Specialization:</strong> ${report.doctorId?.specialization}</div>
            </div>
          </div>

          <div class="section">
            <h3>Diagnosis & Symptoms</h3>
            <div class="info-grid">
              <div>
                <strong>Diagnosis:</strong><br>
                ${report.diagnosis}
              </div>
              <div>
                <strong>Symptoms:</strong><br>
                ${report.symptoms}
              </div>
            </div>
          </div>

          <div class="section">
            <h3>Treatment & Prescription</h3>
            <div class="info-grid">
              <div>
                <strong>Treatment Plan:</strong><br>
                ${report.treatment}
              </div>
              <div>
                <strong>Prescription:</strong><br>
                ${report.prescription || 'No prescription'}
              </div>
            </div>
          </div>

          ${report.vitalSigns && Object.values(report.vitalSigns).some(v => v) ? `
          <div class="section">
            <h3>Vital Signs</h3>
            <div class="vital-signs">
              ${report.vitalSigns.bloodPressure ? `<div><strong>Blood Pressure:</strong> ${report.vitalSigns.bloodPressure}</div>` : ''}
              ${report.vitalSigns.heartRate ? `<div><strong>Heart Rate:</strong> ${report.vitalSigns.heartRate}</div>` : ''}
              ${report.vitalSigns.temperature ? `<div><strong>Temperature:</strong> ${report.vitalSigns.temperature}</div>` : ''}
              ${report.vitalSigns.weight ? `<div><strong>Weight:</strong> ${report.vitalSigns.weight}</div>` : ''}
              ${report.vitalSigns.height ? `<div><strong>Height:</strong> ${report.vitalSigns.height}</div>` : ''}
            </div>
          </div>
          ` : ''}

          ${report.recommendations ? `
          <div class="section">
            <h3>Recommendations</h3>
            <p>${report.recommendations}</p>
          </div>
          ` : ''}

          ${report.notes ? `
          <div class="section">
            <h3>Additional Notes</h3>
            <p>${report.notes}</p>
          </div>
          ` : ''}

          <div class="section">
            <h3>Report Status</h3>
            <div class="info-grid">
              <div>
                <strong>Severity:</strong> 
                <span class="badge severity-${report.severity.toLowerCase()}">${report.severity}</span>
              </div>
              <div>
                <strong>Status:</strong> 
                <span class="badge status-${report.status.toLowerCase().replace(' ', '-')}">${report.status}</span>
              </div>
            </div>
            ${report.followUpRequired ? `
            <div style="margin-top: 10px;">
              <strong>Follow-up Required:</strong> Yes<br>
              <strong>Follow-up Date:</strong> ${formatDate(report.followUpDate)}
            </div>
            ` : ''}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Medical Reports</h1>
          <p className="text-gray-600">View and manage your medical reports from healthcare providers</p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Resolved">Resolved</option>
              <option value="Under Observation">Under Observation</option>
            </select>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Severity</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
            <div className="text-sm text-gray-600 flex items-center">
              <FaFilter className="mr-2" />
              {filteredReports.length} reports found
            </div>
          </div>
        </div>

        {/* Reports List */}
        {filteredReports.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <FaFileMedical className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
            <p className="text-gray-600">
              {reports.length === 0 
                ? "You don't have any medical reports yet. Reports will appear here after your appointments."
                : "No reports match your current search criteria."
              }
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredReports.map((report) => (
              <div key={report._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                      <div>
                        <h2 className="text-lg text-gray-700 font-medium">
                          Patient: {(report.patientId?.username || user?.username) ?? 'N/A'}
                          {"   |   Age: "}{(report.patientId?.age ?? user?.age) ?? 'N/A'}
                          {"   |   Email: "}{(report.patientId?.email || user?.email) ?? 'N/A'}
                        </h2>
                      </div>
                      <div className="mt-2 md:mt-0 md:ml-8">
                        <span className="font-semibold text-gray-900">Doctor: {report.doctorId?.username}</span>
                        <p className="text-sm text-gray-600">{report.doctorId?.specialization}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">Created At: {formatDate(report.createdAt)}</p>

                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Diagnosis</h4>
                      <p className="text-gray-600 text-sm line-clamp-2">{report.diagnosis}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center">
                        <FaStethoscope className="text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600">
                          <strong>Status:</strong> 
                          <span className={`ml-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                            {report.status}
                          </span>
                        </span>
                      </div>
                      <div className="flex items-center">
                        <FaThermometerHalf className="text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600">
                          <strong>Severity:</strong> 
                          <span className={`ml-1 px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(report.severity)}`}>
                            {report.severity}
                          </span>
                        </span>
                      </div>
                      <div className="flex items-center">
                        <FaCalendarAlt className="text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600">
                          <strong>Appointment:</strong> {formatDate(report.appointmentId?.scheduledTime)}
                        </span>
                      </div>
                    </div>

                    {report.followUpRequired && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                        <div className="flex items-center">
                          <FaCalendarAlt className="text-yellow-600 mr-2" />
                          <span className="text-sm text-yellow-800">
                            <strong>Follow-up Required:</strong> {formatDate(report.followUpDate)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col space-y-2 ml-4">
                    <button
                      onClick={() => handleViewReport(report)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                    >
                      <FaEye className="mr-2" />
                      View
                    </button>
                    <button
                      onClick={() => handlePrintReport(report)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center"
                    >
                      <FaPrint className="mr-2" />
                      Print
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Report Detail Modal */}
        {showModal && selectedReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Medical Report</h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <FaTimes className="text-xl" />
                  </button>
                </div>

                {/* Patient Info */}
                <div className="bg-gray-100 rounded-lg p-4 mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">{selectedReport.patientId?.username}</h2>
                    <p className="text-sm text-gray-700 font-medium">
                      Patient: {(selectedReport.patientId?.username || user?.username) ?? 'N/A'}
                      {" | Age: "}{(selectedReport.patientId?.age ?? user?.age) ?? 'N/A'}
                      {" | Email: "}{(selectedReport.patientId?.email || user?.email) ?? 'N/A'}
                    </p>
                  </div>
                  <div className="mt-4 md:mt-0 md:ml-8">
                    <h3 className="font-semibold text-gray-900">Doctor: {selectedReport.doctorId?.username}</h3>
                    <p className="text-sm text-gray-600">{selectedReport.doctorId?.specialization}</p>
                  </div>
                </div>

                {/* Diagnosis & Symptoms */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <FaStethoscope className="mr-2 text-blue-600" />
                      Diagnosis
                    </h3>
                    <p className="text-gray-700 bg-gray-50 rounded-lg p-4">{selectedReport.diagnosis}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <FaNotesMedical className="mr-2 text-blue-600" />
                      Symptoms
                    </h3>
                    <p className="text-gray-700 bg-gray-50 rounded-lg p-4">{selectedReport.symptoms}</p>
                  </div>
                </div>

                {/* Treatment & Prescription */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Treatment Plan</h3>
                    <p className="text-gray-700 bg-gray-50 rounded-lg p-4">{selectedReport.treatment}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <FaPills className="mr-2 text-blue-600" />
                      Prescription
                    </h3>
                    <p className="text-gray-700 bg-gray-50 rounded-lg p-4">
                      {selectedReport.prescription || 'No prescription provided'}
                    </p>
                  </div>
                </div>

                {/* Vital Signs */}
                {selectedReport.vitalSigns && Object.values(selectedReport.vitalSigns).some(v => v) && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <FaThermometerHalf className="mr-2 text-blue-600" />
                      Vital Signs
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {selectedReport.vitalSigns.bloodPressure && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-sm font-medium text-gray-600">Blood Pressure</div>
                          <div className="text-gray-900">{selectedReport.vitalSigns.bloodPressure}</div>
                        </div>
                      )}
                      {selectedReport.vitalSigns.heartRate && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-sm font-medium text-gray-600">Heart Rate</div>
                          <div className="text-gray-900">{selectedReport.vitalSigns.heartRate}</div>
                        </div>
                      )}
                      {selectedReport.vitalSigns.temperature && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-sm font-medium text-gray-600">Temperature</div>
                          <div className="text-gray-900">{selectedReport.vitalSigns.temperature}</div>
                        </div>
                      )}
                      {selectedReport.vitalSigns.weight && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-sm font-medium text-gray-600">Weight</div>
                          <div className="text-gray-900">{selectedReport.vitalSigns.weight}</div>
                        </div>
                      )}
                      {selectedReport.vitalSigns.height && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-sm font-medium text-gray-600">Height</div>
                          <div className="text-gray-900">{selectedReport.vitalSigns.height}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {selectedReport.recommendations && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Recommendations</h3>
                    <p className="text-gray-700 bg-gray-50 rounded-lg p-4">{selectedReport.recommendations}</p>
                  </div>
                )}

                {/* Notes */}
                {selectedReport.notes && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Additional Notes</h3>
                    <p className="text-gray-700 bg-gray-50 rounded-lg p-4">{selectedReport.notes}</p>
                  </div>
                )}

                {/* Status & Follow-up */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-600">Status:</span>
                      <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedReport.status)}`}>
                        {selectedReport.status}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Severity:</span>
                      <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(selectedReport.severity)}`}>
                        {selectedReport.severity}
                      </span>
                    </div>
                    {selectedReport.followUpRequired && (
                      <div>
                        <span className="text-sm font-medium text-gray-600">Follow-up:</span>
                        <span className="ml-2 text-sm text-gray-900">{formatDate(selectedReport.followUpDate)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientReports; 