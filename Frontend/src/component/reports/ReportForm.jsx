import React, { useState, useEffect } from 'react';
import { FaUserMd, FaUser, FaCalendarAlt, FaStethoscope, FaPills, FaNotesMedical, FaThermometerHalf, FaHeartbeat, FaWeight, FaRuler, FaFileMedical, FaSave, FaTimes, FaEye, FaEdit } from 'react-icons/fa';
import { BASE_URL } from '../../utils/Data';

const ReportForm = ({ appointment, onClose, onReportSaved }) => {
  const [formData, setFormData] = useState({
    diagnosis: '',
    symptoms: '',
    treatment: '',
    prescription: '',
    recommendations: '',
    followUpRequired: false,
    followUpDate: '',
    severity: 'Medium',
    status: 'Active',
    notes: '',
    vitalSigns: {
      bloodPressure: '',
      heartRate: '',
      temperature: '',
      weight: '',
      height: ''
    },
    labResults: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [existingReport, setExistingReport] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (appointment) {
      checkExistingReport();
    }
  }, [appointment]);

  const checkExistingReport = async () => {
    try {
      const response = await fetch(`${BASE_URL}/reports/appointment/${appointment._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const report = await response.json();
        setExistingReport(report);
        setFormData({
          diagnosis: report.diagnosis || '',
          symptoms: report.symptoms || '',
          treatment: report.treatment || '',
          prescription: report.prescription || '',
          recommendations: report.recommendations || '',
          followUpRequired: report.followUpRequired || false,
          followUpDate: report.followUpDate ? new Date(report.followUpDate).toISOString().split('T')[0] : '',
          severity: report.severity || 'Medium',
          status: report.status || 'Active',
          notes: report.notes || '',
          vitalSigns: {
            bloodPressure: report.vitalSigns?.bloodPressure || '',
            heartRate: report.vitalSigns?.heartRate || '',
            temperature: report.vitalSigns?.temperature || '',
            weight: report.vitalSigns?.weight || '',
            height: report.vitalSigns?.height || ''
          },
          labResults: report.labResults || ''
        });
        setIsEditing(true);
      }
    } catch (error) {
      console.error('Error checking existing report:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('vitalSigns.')) {
      const vitalSign = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        vitalSigns: {
          ...prev.vitalSigns,
          [vitalSign]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }

    // Clear any previous messages when user starts typing
    if (message) {
      setMessage('');
      setMessageType('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setMessageType('');

    try {
      const url = isEditing 
        ? `${BASE_URL}/reports/${existingReport._id}`
        : `${BASE_URL}/reports/create`;
      
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          patientId: appointment.patientId._id,
          appointmentId: appointment._id,
          ...formData
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(isEditing ? 'Report updated successfully!' : 'Report created successfully!');
        setMessageType('success');
        if (onReportSaved) {
          onReportSaved(data.report);
        }
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setMessage(data.message || 'Failed to save report');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
      setMessageType('error');
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

  if (!appointment) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 md:p-8">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-7xl max-h-[95vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-5 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-white">
              <FaFileMedical className="mr-3 text-2xl" />
              <div>
                <h2 className="text-2xl font-bold">
                  {isEditing ? 'Edit Patient Report' : 'Create Patient Report'}
                </h2>
                <p className="text-blue-100 text-sm">
                  {appointment.patientId?.username} • {formatDate(appointment.scheduledTime)}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-200 transition-colors"
            >
              <FaTimes className="text-2xl" />
            </button>
          </div>
        </div>

        <div className='bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 md:p-8' >
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col p-0">
          {/* Appointment Info */}
          <div className="bg-gray-50 px-8 py-4 border-b">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center">
                <FaUser className="text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">
                  <strong>Patient:</strong> {appointment.patientId?.username}
                </span>
              </div>
              <div className="flex items-center">
                <FaCalendarAlt className="text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">
                  <strong>Date:</strong> {formatDate(appointment.scheduledTime)}
                </span>
              </div>
              <div className="flex items-center">
                <FaStethoscope className="text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">
                  <strong>Reason:</strong> {appointment.reason}
                </span>
              </div>
            </div>
          </div>

          {/* Message Display */}
          {message && (
            <div className={`m-8 p-4 rounded-lg ${
              messageType === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              <div className="flex items-center">
                {messageType === 'success' ? (
                  <FaSave className="mr-2 text-green-600" />
                ) : (
                  <FaTimes className="mr-2 text-red-600" />
                )}
                <span className="font-medium">{message}</span>
              </div>
            </div>
          )}

          {/* Main Form Sections */}
          <div className="flex-1 px-8 py-6 space-y-10">
            {/* Diagnosis & Symptoms */}
            <section>
              <div className="flex items-center mb-4">
                <FaNotesMedical className="mr-2 text-blue-500" />
                <h3 className="text-xl font-semibold text-gray-900">Diagnosis & Symptoms</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label htmlFor="diagnosis" className="block text-sm font-medium text-gray-700 mb-2">Diagnosis *</label>
                  <textarea
                    id="diagnosis"
                    name="diagnosis"
                    value={formData.diagnosis}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter the primary diagnosis..."
                  />
                </div>
                <div>
                  <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700 mb-2">Symptoms *</label>
                  <textarea
                    id="symptoms"
                    name="symptoms"
                    value={formData.symptoms}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Describe the symptoms observed..."
                  />
                </div>
              </div>
            </section>

            <hr className="my-4" />

            {/* Treatment & Prescription */}
            <section>
              <div className="flex items-center mb-4">
                <FaPills className="mr-2 text-green-500" />
                <h3 className="text-xl font-semibold text-gray-900">Treatment & Prescription</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label htmlFor="treatment" className="block text-sm font-medium text-gray-700 mb-2">Treatment Plan *</label>
                  <textarea
                    id="treatment"
                    name="treatment"
                    value={formData.treatment}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Describe the treatment plan..."
                  />
                </div>
                <div>
                  <label htmlFor="prescription" className="block text-sm font-medium text-gray-700 mb-2">Prescription</label>
                  <textarea
                    id="prescription"
                    name="prescription"
                    value={formData.prescription}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="List prescribed medications and dosages..."
                  />
                </div>
              </div>
            </section>

            <hr className="my-4" />

            {/* Recommendations & Notes */}
            <section>
              <div className="flex items-center mb-4">
                <FaUserMd className="mr-2 text-indigo-500" />
                <h3 className="text-xl font-semibold text-gray-900">Recommendations & Notes</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label htmlFor="recommendations" className="block text-sm font-medium text-gray-700 mb-2">Recommendations</label>
                  <textarea
                    id="recommendations"
                    name="recommendations"
                    value={formData.recommendations}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Lifestyle changes, diet recommendations, etc..."
                  />
                </div>
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Any additional observations or notes..."
                  />
                </div>
              </div>
            </section>

            <hr className="my-4" />

            {/* Vital Signs */}
            <section className="bg-blue-50 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <FaThermometerHalf className="mr-2 text-blue-600" />
                <h3 className="text-xl font-semibold text-gray-900">Vital Signs</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="bloodPressure" className="block text-sm font-medium text-gray-700 mb-2">Blood Pressure</label>
                  <input
                    id="bloodPressure"
                    name="vitalSigns.bloodPressure"
                    type="text"
                    value={formData.vitalSigns.bloodPressure}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 120/80 mmHg"
                  />
                </div>
                <div>
                  <label htmlFor="heartRate" className="block text-sm font-medium text-gray-700 mb-2">Heart Rate</label>
                  <input
                    id="heartRate"
                    name="vitalSigns.heartRate"
                    type="text"
                    value={formData.vitalSigns.heartRate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 72 bpm"
                  />
                </div>
                <div>
                  <label htmlFor="temperature" className="block text-sm font-medium text-gray-700 mb-2">Temperature</label>
                  <input
                    id="temperature"
                    name="vitalSigns.temperature"
                    type="text"
                    value={formData.vitalSigns.temperature}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 98.6°F"
                  />
                </div>
                <div>
                  <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-2">Weight</label>
                  <input
                    id="weight"
                    name="vitalSigns.weight"
                    type="text"
                    value={formData.vitalSigns.weight}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 70 kg"
                  />
                </div>
                <div>
                  <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-2">Height</label>
                  <input
                    id="height"
                    name="vitalSigns.height"
                    type="text"
                    value={formData.vitalSigns.height}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 170 cm"
                  />
                </div>
              </div>
            </section>

            <hr className="my-4" />

            {/* Lab Results */}
            <section className="bg-pink-50 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <FaEye className="mr-2 text-pink-500" />
                <h3 className="text-xl font-semibold text-gray-900">Lab Results</h3>
              </div>
              <textarea
                id="labResults"
                name="labResults"
                value={formData.labResults}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Enter any lab test results or pending tests..."
              />
            </section>

            <hr className="my-4" />

            {/* Severity, Status, Follow-up */}
            <section>
              <div className="flex items-center mb-4">
                <FaEdit className="mr-2 text-yellow-500" />
                <h3 className="text-xl font-semibold text-gray-900">Status & Follow-up</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <label htmlFor="severity" className="block text-sm font-medium text-gray-700 mb-2">Severity Level</label>
                  <select
                    id="severity"
                    name="severity"
                    value={formData.severity}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  >
                    <option value="Active">Active</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Under Observation">Under Observation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Follow-up Required</label>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="followUpRequired"
                        checked={formData.followUpRequired}
                        onChange={handleInputChange}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Yes</span>
                    </label>
                  </div>
                </div>
              </div>
              {formData.followUpRequired && (
                <div className="mt-4">
                  <label htmlFor="followUpDate" className="block text-sm font-medium text-gray-700 mb-2">Follow-up Date</label>
                  <input
                    id="followUpDate"
                    name="followUpDate"
                    type="date"
                    value={formData.followUpDate}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>
              )}
            </section>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200 px-8 pb-8 bg-white sticky bottom-0 z-10">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <FaSave className="mr-2" />
                  {isEditing ? 'Update Report' : 'Save Report'}
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white text-gray-700 py-3 px-6 rounded-lg border-2 border-gray-300 hover:bg-gray-50 transition-colors font-semibold flex items-center justify-center"
            >
              <FaTimes className="mr-2" />
              Cancel
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};

export default ReportForm; 