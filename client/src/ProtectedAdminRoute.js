import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { UserContext } from './UserContext';

const ProtectedAdminRoute = ({ children }) => {
  const { userInfo } = useContext(UserContext);
  const location = useLocation();

  if (!userInfo) {
    // User is not logged in, redirect to login
    return <Navigate to="/login" state={{ from: location }} />;
  }

  if (userInfo.role !== 'admin') {
    // User is not an admin, redirect to home or show an error
    return <Navigate to="/" />; // Or a custom "Unauthorized" page
  }

  // User is logged in and is an admin, render the protected component
  return children;
};

export default ProtectedAdminRoute;
