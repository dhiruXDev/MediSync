import React, { useState, useEffect } from 'react';
import { useUser } from '../shared/UserContext';
import { Link } from 'react-router-dom';
import { FaUser, FaEnvelope, FaUserMd, FaCalendarAlt, FaClock, FaEdit, FaStar, FaGraduationCap, FaIdCard } from 'react-icons/fa';

const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?name=User&background=random';

function Profile() {

  const { user, login } = useUser();
  const [form, setForm] = useState({
    username: user?.username || '',
    avatar: user?.avatar || '',
    specialization: user?.specialization || '',
    experience: user?.experience || '',
    age: user?.age || '',
  });
  const [message, setMessage] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Fetch all user details on mount
  useEffect(() => {
    const fetchUserDetails = async () => {
      setLoadingProfile(true);
      const token = localStorage.getItem('token');
      if (!token) return setLoadingProfile(false);
      try {
        const res = await fetch(`${BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && data.user) {
          login(data.user); // Update context
          setForm({
            username: data.user.username || '',
            avatar: data.user.avatar || '',
            specialization: data.user.specialization || '',
            experience: data.user.experience || '',
            age: data.user.age || '',
          });
        }
      } catch (err) {
        // Optionally handle error
      }
      setLoadingProfile(false);
    };
    fetchUserDetails();
    // eslint-disable-next-line
  }, []);
 console.log("user",user)
  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md">
            <FaUser className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
            <p className="text-gray-600 mb-4">Please log in to view your profile.</p>
            <Link to="/login" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Determine which avatar to show
  const avatarUrl = user.avatar && user.avatar.trim() !== '' ? user.avatar : DEFAULT_AVATAR;

  // Format date utility
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-12">
            <div className="flex flex-col md:flex-row items-center">
              {/* Avatar Section */}
              <div className="relative mb-6 md:mb-0 md:mr-8">
                <div className="relative">
                  <img
                    src={avatarUrl}
                    alt="User Avatar"
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2 border-2 border-white">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* User Info Section */}
              <div className="text-center md:text-left text-white">
                <h1 className="text-3xl font-bold mb-2">{user.username}</h1>
                <div className="flex items-center justify-center md:justify-start mb-3 text-white  ">
                  <span className='!text-white    '> {roleInfo.icon}</span>
                  <span className="ml-2 text-lg ">{roleInfo.label}</span>
                </div>
                <div className="flex items-center justify-center md:justify-start text-white">
                  <FaEnvelope className="mr-2 text-white" />
                  <span>{user.email}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <FaUser className="mr-3 text-blue-600" />
                Basic Information
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center">
                    <FaUser className="text-gray-400 mr-3" />
                    <span className="text-gray-600">Username</span>
                  </div>
                  <span className="font-medium text-gray-900">{user.username}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center">
                    <FaEnvelope className="text-gray-400 mr-3" />
                    <span className="text-gray-600">Email</span>
                  </div>
                  <span className="font-medium text-gray-900">{user.email}</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center">
                    <FaIdCard className="text-gray-400 mr-3" />
                    <span className="text-gray-600">Role</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${roleInfo.color}`}>
                    {roleInfo.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Doctor Specific Information */}
            {user.role === 'doctor' && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <FaUserMd className="mr-3 text-blue-600" />
                  Professional Information
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div className="flex items-center">
                      <FaGraduationCap className="text-gray-400 mr-3" />
                      <span className="text-gray-600">Specialization</span>
                    </div>
                    <span className="font-medium text-gray-900">{user.specialization || 'Not specified'}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div className="flex items-center">
                      <FaClock className="text-gray-400 mr-3" />
                      <span className="text-gray-600">Experience</span>
                    </div>
                    <span className="font-medium text-gray-900">
                      {user.experience ? `${user.experience} years` : 'Not specified'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center">
                      <FaCalendarAlt className="text-gray-400 mr-3" />
                      <span className="text-gray-600">Age</span>
                    </div>
                    <span className="font-medium text-gray-900">
                      {user.age ? `${user.age} years old` : 'Not specified'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Account Information */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <FaCalendarAlt className="mr-3 text-blue-600" />
                Account Information
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600">Member Since</span>
                  <span className="font-medium text-gray-900">{formatDate(user.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-gray-600">Last Updated</span>
                  <span className="font-medium text-gray-900">{formatDate(user.updatedAt)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link to="/profile/edit" className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center">
                  <FaEdit className="mr-2" />
                  Edit Profile
                </Link>
                {user.role === 'doctor' && (
                  <Link to="/blog" className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center">
                    <FaUserMd className="mr-2" />
                    Write Blog
                  </Link>
                )}
                <Link to= { user.role === "admin" ? "/admin-dashboard" : user.role === "patent" ? "/patient-dashboard" : user.role === "seller" ? '/seller-dashboard': "/doctor-dashboard"}  className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center">
                  <FaUser className="mr-2" />
                  Dashboard
                </Link>
              </div>
            </div>

            {/* Profile Stats */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Account Status</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    Active
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Verification</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    Verified
                  </span>
                </div>
                {user.role === 'doctor' && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">License Status</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      Valid
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact</h3>
              <div className="space-y-3">
                <div className="flex items-center text-gray-600">
                  <FaEnvelope className="mr-3 text-blue-600" />
                  <span className="text-sm">{user.email}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <FaUser className="mr-3 text-blue-600" />
                  <span className="text-sm">Available for consultations</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;