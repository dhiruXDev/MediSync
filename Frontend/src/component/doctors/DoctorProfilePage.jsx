import React from 'react';
import { FaUserMd, FaCalendarAlt, FaClinicMedical, FaEnvelope, FaPhoneAlt, FaMapMarkerAlt } from 'react-icons/fa';

const DoctorProfile = ( ) => {

    const doctor= [
  {
    id: 1,
    name: "Dr. Aryan Mehta",
    specialization: "Cardiologist",
    experience: 12,
    qualifications: "MBBS, MD (Cardiology)",
    hospitalName: "Apollo Hospital",
    location: "Mumbai",
    email: "aryan.mehta@apollo.com",
    phone: "+91-9876543210",
    image: "https://randomuser.me/api/portraits/men/75.jpg"
  },
  // Add more doctors here
];
  if (!doctor) {
    return (
      <div className="p-6 text-center text-gray-500">
        No doctor selected. Please select a doctor to view their profile.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mt-6">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Doctor Photo */}
        <div className="flex-shrink-0">
          <img
            src={doctor.image || 'https://via.placeholder.com/150'}
            alt="Doctor"
            className="w-48 h-48 rounded-full object-cover border-4 border-blue-600"
          />
        </div>

        {/* Doctor Info */}
        <div className="flex flex-col justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <FaUserMd className="text-blue-600" /> {doctor.name}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">{doctor.specialization}</p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Experience: {doctor.experience} years</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Qualifications: {doctor.qualifications}</p>
          </div>

          <div className="mt-4 space-y-2">
            <p className="flex items-center text-gray-600 dark:text-gray-300">
              <FaClinicMedical className="mr-2 text-blue-500" /> {doctor.hospitalName}
            </p>
            <p className="flex items-center text-gray-600 dark:text-gray-300">
              <FaMapMarkerAlt className="mr-2 text-blue-500" /> {doctor.location}
            </p>
            <p className="flex items-center text-gray-600 dark:text-gray-300">
              <FaEnvelope className="mr-2 text-blue-500" /> {doctor.email}
            </p>
            <p className="flex items-center text-gray-600 dark:text-gray-300">
              <FaPhoneAlt className="mr-2 text-blue-500" /> {doctor.phone}
            </p>
          </div>

          <div className="mt-6">
            <button className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
              Book Appointment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;
