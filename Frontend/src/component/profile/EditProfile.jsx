import React, { useState } from 'react';
import { useUser } from '../shared/UserContext';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaUserMd, FaCalendarAlt, FaClock, FaEdit, FaGraduationCap, FaIdCard, FaSave, FaTimes, FaCamera, FaArrowLeft } from 'react-icons/fa';
import { BASE_URL } from '../../utils/Data';

const EditProfile = () => {
  const { user, login } = useUser();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: user?.username || '',
    avatar: user?.avatar || '',
    specialization: user?.specialization || '',
    experience: user?.experience || '',
    age: user?.age || '',
    phone: user?.phone || '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md">
            <FaUser className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
            <p className="text-gray-600 mb-4">Please log in to edit your profile.</p>
            <button
              onClick={() => navigate('/login')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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
      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        login(data.user); // Update context and localStorage
        setMessage('Profile updated successfully!');
        setMessageType('success');
        setTimeout(() => navigate('/profile'), 1500);
      } else {
        setMessage(data.message || 'Update failed');
        setMessageType('error');
      }
    } catch (err) {
      setMessage('Server error. Please try again.');
      setMessageType('error');
    }
    setLoading(false);
  };

  const handleCancel = () => {
    navigate('/profile');
  };

  // Get role display info
  const getRoleInfo = (role) => {
    switch (role) {
      case 'doctor':
        return { icon: <FaUserMd className="text-blue-600" />, label: 'Medical Doctor', color: 'bg-blue-100 text-blue-800' };
      case 'patient':
        return { icon: <FaUser className="text-green-600" />, label: 'Patient', color: 'bg-green-100 text-green-800' };
      case 'admin':
        return { icon: <FaIdCard className="text-purple-600" />, label: 'Administrator', color: 'bg-purple-100 text-purple-800' };
        case 'seller':
          return { icon: <FaUser className="text-white" />, label: 'Seller', color: 'bg-blue-100 text-blue-800' };
      default:
        return { icon: <FaUser className="text-gray-600" />, label: 'User', color: 'bg-gray-100 text-gray-800' };
    }
  };

  const roleInfo = getRoleInfo(user.role);
  const avatarUrl = form.avatar && form.avatar.trim() !== '' ? form.avatar : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(form.username || user.username) + '&background=random';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <button
              onClick={handleCancel}
              className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors"
            >
              <FaArrowLeft className="text-xl" />
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
          </div>
          <p className="text-gray-600">Update your personal and professional information</p>
        </div>

        {/* Current Profile Preview */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8  !w-full">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <FaUser className="mr-3 text-blue-600" />
            Current Profile
          </h2>
          <div className="flex items-center">
            <img
              src={avatarUrl}
              alt="Current Avatar"
              className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 mr-4"
            />
            <div>
              <h3 className="text-lg font-medium text-gray-900">{user.username}</h3>
              <p className="text-gray-600">{user.email}</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-1 ${roleInfo.color}`}>
                {roleInfo.label}
              </span>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden  !w-full">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <FaEdit className="mr-3" />
              Edit Information
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6 !w-full">
            {/* Avatar Section */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <FaCamera className="mr-3 text-blue-600" />
                Profile Picture
              </h3>
              <div className="flex items-center space-x-6">
                <img
                  src={avatarUrl}
                  alt="Avatar Preview"
                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
                />
                <div className="flex-1">
                  <label htmlFor="avatar" className="block text-sm font-medium text-gray-700 mb-2">
                    Avatar URL
                  </label>
                  <input
                    id="avatar"
                    name="avatar"
                    type="url"
                    value={form.avatar}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="https://example.com/your-avatar.jpg"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Enter a valid image URL for your profile picture
                  </p>
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Username *
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={form.username}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Enter your username"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  pattern="^\+91\d{10}$"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="e.g. +919876543210"
                />
              </div>

              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
                  Age
                </label>
                <input
                  id="age"
                  name="age"
                  type="number"
                  value={form.age}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Enter your age"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Email cannot be changed from this page
                </p>
              </div>
            </div>

            {/* Doctor Specific Fields */}
            {user.role === 'doctor' && (
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <FaUserMd className="mr-3 text-blue-600" />
                  Professional Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-2">
                      Specialization *
                    </label>
                    <input
                      id="specialization"
                      name="specialization"
                      type="text"
                      value={form.specialization}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="e.g., Cardiology, Pediatrics"
                    />
                  </div>

                  <div>
                    <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-2">
                      Experience (years) *
                    </label>
                    <input
                      id="experience"
                      name="experience"
                      type="number"
                      min="0"
                      max="50"
                      value={form.experience}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="5"
                    />
                  </div>

                  <div>
                    <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
                      Age *
                    </label>
                    <input
                      id="age"
                      name="age"
                      type="number"
                      min="18"
                      max="100"
                      value={form.age}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="30"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Message Display */}
            {message && (
              <div className={`p-4 rounded-lg ${
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

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
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
                    Save Changes
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 bg-white text-gray-700 py-3 px-6 rounded-lg border-2 border-gray-300 hover:bg-gray-50 transition-colors font-semibold flex items-center justify-center"
              >
                <FaTimes className="mr-2" />
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tips for a Great Profile</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="flex items-start">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <span>Use a clear, professional profile picture</span>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <span>Choose a username that's easy to remember</span>
            </div>
            {user.role === 'doctor' && (
              <>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Be specific about your medical specialization</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Accurately reflect your years of experience</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile; 