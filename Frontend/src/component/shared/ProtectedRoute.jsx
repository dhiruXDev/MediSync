import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from './UserContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  let { user, login } = useUser();
  const location = useLocation();
  const token = localStorage.getItem('token');

  // Fallback: if user is missing but role is admin, reconstruct user
  if (!user) {
    const role = localStorage.getItem('role');
    if (role === 'admin') {
      user = { role: 'admin' };
      // Optionally set in context for the session
      if (typeof login === 'function') login(user);
    }
  }

  // If no token, redirect to login
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If no user data, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If specific roles are required and user's role is not allowed
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect based on user role
    if (user.role === 'doctor') {
      return <Navigate to="/doctor-dashboard" replace />;
    } else if (user.role === 'patient') {
      return <Navigate to="/patient-dashboard" replace />;
    } else {
      
      return <Navigate to="/login" replace />;
    }
  }

  return children;
};

export default ProtectedRoute; 