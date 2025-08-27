import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Homepage from './pages/Homepage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ClinicOnboarding from './pages/ClinicOnboarding';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import GoogleCalendar from './pages/GoogleCalendar';
import ConnectPhone from './pages/ConnectPhone';
import BookingHistory from './pages/BookingHistory';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/clinic-onboarding" element={
          <ProtectedRoute>
            <ClinicOnboarding />
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/connect-phone" element={
          <ProtectedRoute>
            <DashboardLayout>
              <ConnectPhone />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/google-calendar" element={
          <ProtectedRoute>
            <DashboardLayout>
              <GoogleCalendar />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/booking-history" element={
          <ProtectedRoute>
            <DashboardLayout>
              <BookingHistory />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/appointments" element={
          <ProtectedRoute>
            <DashboardLayout>
              <div className="text-center py-16">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Appointments</h1>
                <p className="text-gray-600">Appointment management coming soon...</p>
              </div>
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/call-logs" element={
          <ProtectedRoute>
            <DashboardLayout>
              <div className="text-center py-16">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Call Logs</h1>
                <p className="text-gray-600">Call logs coming soon...</p>
              </div>
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/analytics" element={
          <ProtectedRoute>
            <DashboardLayout>
              <Analytics />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <DashboardLayout>
              <Settings />
            </DashboardLayout>
          </ProtectedRoute>
        } />
      </Routes>
    </AuthProvider>
  );
}

export default App;