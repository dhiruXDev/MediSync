import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../shared/UserContext';

const RoleBasedRedirect = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (token && user) {
      // Redirect based on user role
      if (user.role === 'doctor') {
        navigate('/doctor-dashboard', { replace: true });
      } else if (user.role === 'patient') {
        navigate('/patient-dashboard', { replace: true });
      } else if (user.role === 'seller') {
        navigate('/seller-dashboard', { replace: true });
      } else if (user.role === 'admin') {
        navigate('/admin-dashboard', { replace: true });
      } else {
        // If role is not recognized, redirect to login
        navigate('/login', { replace: true });
      }
    } else {
      // If no token or user, stay on home page
      navigate('/', { replace: true });
    }
  }, [user, token, navigate]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
};

export default RoleBasedRedirect; 