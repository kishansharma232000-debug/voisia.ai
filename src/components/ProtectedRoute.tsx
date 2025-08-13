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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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