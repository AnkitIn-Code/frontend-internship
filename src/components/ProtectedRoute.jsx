import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * ProtectedRoute component that verifies if the user is authenticated.
 * If not authenticated, redirects the user to /user-login while preserving
 * the intended destination in location state.
 */
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('authToken');
  const location = useLocation();

  if (!token) {
    return <Navigate to="/user-login" replace state={{ from: location }} />;
  }

  return children;
};

export default ProtectedRoute;
