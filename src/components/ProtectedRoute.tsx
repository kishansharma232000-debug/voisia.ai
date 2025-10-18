import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user is logged in but hasn't connected their clinic, redirect to onboarding
  // Exception: allow access to the onboarding page itself
  if (user && !user.clinicConnected && location.pathname !== '/clinic-onboarding') {
    return <Navigate to="/clinic-onboarding" replace />;
  }

  // If user has connected clinic but is trying to access onboarding, redirect to dashboard
  if (user && user.clinicConnected && location.pathname === '/clinic-onboarding') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}