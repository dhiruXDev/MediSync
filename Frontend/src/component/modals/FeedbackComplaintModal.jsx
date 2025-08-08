import React, { useState, useEffect } from 'react';
import { FaTimes, FaUserMd, FaCommentDots, FaExclamationCircle, FaSmile, FaFrown } from 'react-icons/fa';
import { useUser } from '../shared/UserContext';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../../utils/Data';

const FeedbackComplaintModal = ({ isOpen, onClose }) => {
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({
    doctorId: '',
    type: 'good',
    reason: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      fetchDoctors();
    }
  }, [isOpen]);

  const fetchDoctors = async () => {
    try {
      const res = await fetch(`${BASE_URL}/appointments/my-doctors`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDoctors(data);
      }
    } catch (err) {
      setDoctors([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${BASE_URL}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...form,
          patientId: user?._id
        })
      });
      if (res.ok) {
        setSuccess('Your feedback has been received!');
        setForm({ doctorId: '', type: 'good', reason: '', message: '' });
        setTimeout(() => {
          onClose();
          navigate('/');
        }, 1200);
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to submit.');
      }
    } catch (err) {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    
    <div className="fixed inset-0 z-50 flex items-center justify-center min-h-screen bg-black/30   bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full mx-4 p-8 flex flex-col items-center relative">
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors">
          <FaTimes className="h-5 w-5" />
        </button>
        {/* Header */}
        <div className="mb-6 w-full text-center">
          <h2 className="text-2xl font-bold text-blue-700 flex items-center justify-center gap-2">
            <FaCommentDots className="text-blue-500" /> Feedback Form
          </h2>
          <p className="text-gray-500 mt-1 text-sm">We value your feedback. Please let us know your experience.</p>
        </div>
        {/* Feedback Form */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
          {/* Doctor Select */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
            <select
              name="doctorId"
              value={form.doctorId}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 bg-white text-gray-800 text-base appearance-none transition-all duration-150 shadow-sm hover:border-blue-400 focus:border-blue-500"
            >
              <option value="">Choose a doctor</option>
              {doctors.map((doc) => (
                <option key={doc._id} value={doc._id}>{doc.username} ({doc.specialization})</option>
              ))}
            </select>
          </div>
          {/* Feedback Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <div className="flex gap-8 mt-3 items-center">
              <label className="flex items-center gap-3 cursor-pointer">
                <span className="relative">
                  <input
                    type="radio"
                    name="type"
                    value="good"
                    checked={form.type === 'good'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <span className={`w-6 h-6 inline-block rounded-full border-2 transition-all duration-200 ${form.type === 'good' ? 'border-green-500 bg-green-100' : 'border-gray-300 bg-white'}`}></span>
                  {form.type === 'good' && (
                    <span className="absolute left-1 top-1 w-4 h-4 bg-green-500 rounded-full"></span>
                  )}
                </span>
                <span className="text-green-700 font-semibold select-none">Good</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <span className="relative">
                  <input
                    type="radio"
                    name="type"
                    value="bad"
                    checked={form.type === 'bad'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <span className={`w-6 h-6 inline-block rounded-full border-2 transition-all duration-200 ${form.type === 'bad' ? 'border-red-500 bg-red-100' : 'border-gray-300 bg-white'}`}></span>
                  {form.type === 'bad' && (
                    <span className="absolute left-1 top-1 w-4 h-4 bg-red-500 rounded-full"></span>
                  )}
                </span>
                <span className="text-red-600 font-semibold select-none">Bad</span>
              </label>
            </div>
          </div>
          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
            <input
              name="reason"
              value={form.reason}
              onChange={handleChange}
              required
              placeholder="Why is your feedback good or bad?"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 bg-gray-50 text-gray-800"
            />
          </div>
          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Additional Message (optional)</label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              rows="3"
              placeholder="Add any extra details..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 bg-gray-50 text-gray-800"
            />
          </div>
          {/* Error/Success Messages */}
          {error && <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded text-center text-sm font-medium">{error}</div>}
          {success && <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-2 rounded text-center text-sm font-medium">{success}</div>}
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white text-gray-700 py-3 px-6 rounded-lg border-2 border-gray-300 hover:bg-gray-50 transition-colors font-semibold flex items-center justify-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackComplaintModal; 