import React, { useState, useEffect } from 'react';
import { FaStar, FaUserMd, FaClock, FaBirthdayCake } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../../utils/Data';
import DoctorProfile from './DoctorProfilePage';
import { useUser } from '../shared/UserContext';

const DoctorsList = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const {user} =useUser();
  useEffect(() => {
    fetchDoctors();
  }, []);
  const navigate = useNavigate()

  const fetchDoctors = async () => {
    try {
      const response = await fetch(`${BASE_URL}/auth/doctors`, );
      if (!response.ok) {
        throw new Error('Failed to fetch doctors');
      }
      const data = await response.json();
      setDoctors(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter doctors based on search term and specialization
  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialization = selectedSpecialization === '' || doctor.specialization === selectedSpecialization;
    return matchesSearch && matchesSpecialization;
  });

  // Get unique specializations for filter dropdown
  const specializations = [...new Set(doctors.map(doctor => doctor.specialization))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading doctors...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error: {error}</p>
          <button 
            onClick={fetchDoctors}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50 py-8 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Available Doctors</h1>
          <p className="text-lg text-gray-600">Find and connect with qualified healthcare professionals</p>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search Input */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search Doctors
              </label>
              <input
                type="text"
                id="search"
                placeholder="Search by name or specialization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Specialization Filter */}
            <div>
              <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Specialization
              </label>
              <select
                id="specialization"
                value={selectedSpecialization}
                onChange={(e) => setSelectedSpecialization(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Specializations</option>
                {specializations.map((spec) => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredDoctors.length} of {doctors.length} doctors
          </p>
        </div>

        {/* Doctors Grid */}
        {filteredDoctors.length === 0 ? (
          <div className="text-center py-12">
            <FaUserMd className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No doctors found</h3>
            <p className="text-gray-600">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doctor) => (
              <div key={doctor._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                {/* Doctor Image */}
                <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                  <img
                    src={doctor.avatar || 'https://via.placeholder.com/200x200?text=Doctor'}
                    alt={doctor.username}
                    className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-lg"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/200x200?text=Doctor';
                    }}
                  />
                </div>

                {/* Doctor Info */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-semibold text-gray-900">{doctor.username}</h3>
                    <div className="flex items-center text-yellow-400">
                      <FaStar className="h-4 w-4" />
                      <span className="ml-1 text-sm text-gray-600">4.8</span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-600">
                      <FaUserMd className="h-4 w-4 mr-2 text-blue-500" />
                      <span className="text-sm">{doctor.specialization}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FaClock className="h-4 w-4 mr-2 text-green-500" />
                      <span className="text-sm">{doctor.experience} years experience</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FaBirthdayCake className="h-4 w-4 mr-2 text-purple-500" />
                      <span className="text-sm">{doctor.age} years old</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                                        <button   onClick={() => {
                                        if (user?.role === 'admin') {
                                          // Admin-specific behavior
                                          navigate('/admin-dashboard');
                                        } else if (user?.role === 'doctor') {
                                          // Optional: Prevent or inform
                                          alert("Doctors can't book appointments.");
                                        } else {
                                          // Regular patient behavior
                                          navigate('/patient-dashboard');
                                        }
                                      }} className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm font-medium">
                            <span>
                              {user?.role === 'admin' ? "Manage Appointments" : "Book Appointment"}
                            </span>
                    </button>

                    
                    <button onClick={()=>navigate("/view-profile-doctor")} className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors duration-200 text-sm font-medium">
                      View Profile
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
 
      </div>
    </div>

    
      
  );
};

export default DoctorsList; 