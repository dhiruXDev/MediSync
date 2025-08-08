import React, { useState } from 'react';
import { FaTimes, FaCalendarAlt, FaClock, FaUserMd, FaComments } from 'react-icons/fa';
import { BASE_URL } from '../../utils/Data';

const BookingModal = ({ isOpen, onClose, doctor, onBookingSuccess }) => {
  const [formData, setFormData] = useState({
    scheduledDate: '',
    scheduledTime: '',
    reason: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to book an appointment');
        setLoading(false);
        return;
      }

      const role = localStorage.getItem('role');
      if (role !== 'patient') {
        setError('Only patients can book appointments');
        setLoading(false);
        return;
      }

      const scheduledDateTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`);
      
      if (scheduledDateTime <= new Date()) {
        setError('Please select a future date and time');
        setLoading(false);
        return;
      }

      const response = await fetch(`${BASE_URL}/appointments/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          doctorId: doctor._id,
          reason: formData.reason,
          scheduledTime: scheduledDateTime.toISOString(),
          specialization: doctor.specialization
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to book appointment');
      }

      setFormData({
        scheduledDate: '',
        scheduledTime: '',
        reason: ''
      });

      onClose();
      if (onBookingSuccess) {
        onBookingSuccess(data);
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Book Appointment</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 border-b bg-gray-50">
          <div className="flex items-center space-x-4">
            <img
              src={doctor.avatar || 'https://via.placeholder.com/60x60?text=Doctor'}
              alt={doctor.username}
              className="h-15 w-15 rounded-full object-cover"
            />
            <div>
              <h3 className="font-semibold text-gray-900">{doctor.username}</h3>
              <p className="text-sm text-gray-600">{doctor.specialization}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="scheduledDate" className="block text-sm font-medium text-gray-700 mb-2">
              Appointment Date
            </label>
            <input
              type="date"
              id="scheduledDate"
              name="scheduledDate"
              value={formData.scheduledDate}
              onChange={handleInputChange}
              min={today}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="scheduledTime" className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Time
            </label>
            <select
              id="scheduledTime"
              name="scheduledTime"
              value={formData.scheduledTime}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a time</option>
              <option value="09:00">9:00 AM</option>
              <option value="10:00">10:00 AM</option>
              <option value="11:00">11:00 AM</option>
              <option value="12:00">12:00 PM</option>
              <option value="14:00">2:00 PM</option>
              <option value="15:00">3:00 PM</option>
              <option value="16:00">4:00 PM</option>
              <option value="17:00">5:00 PM</option>
            </select>
          </div>

          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Visit
            </label>
            <textarea
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              required
              rows="3"
              placeholder="Please describe your symptoms or reason for the appointment..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Booking...' : 'Book Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal; 