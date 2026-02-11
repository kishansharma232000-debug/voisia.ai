import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAssistantStatus } from '../hooks/useAssistantStatus';
import { Building2, Phone, BarChart3, Settings, ArrowRight, Activity, Zap, Users, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import LoadingSkeleton from '../components/LoadingSkeleton';

export default function Dashboard() {
  const { user } = useAuth();
  const { hasAssistant, loading } = useAssistantStatus();

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
          Welcome back, {user?.name.split(' ')[0]}!
        </h1>
        <p className="text-gray-600 text-lg">
          Manage your AI assistant, clinic operations, and track performance
        </p>
      </div>

      {/* Assistant Status Card */}
      <div className="mb-8 p-6 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <Phone className="h-8 w-8 text-white" />
            </div>
            <div>
              <p className="text-blue-100 text-sm font-medium">AI Assistant Status</p>
              <p className="text-white text-xl font-bold">
                {hasAssistant ? '✓ Active & Ready' : '• Waiting for Setup'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-sm font-semibold ${hasAssistant ? 'text-green-300' : 'text-yellow-300'}`}>
              {hasAssistant ? 'Connected' : 'Setup Required'}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="p-6 rounded-xl bg-white border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">Active</span>
          </div>
          <h3 className="text-gray-900 font-semibold mb-1">Plan Status</h3>
          <p className="text-gray-600 text-sm mb-4">
            {user?.plan ? `You're on the ${user.plan.charAt(0).toUpperCase() + user.plan.slice(1)} plan` : 'No active plan'}
          </p>
        </div>

        <div className="p-6 rounded-xl bg-white border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Zap className="h-6 w-6 text-orange-600" />
            </div>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">Ready</span>
          </div>
          <h3 className="text-gray-900 font-semibold mb-1">Getting Started</h3>
          <p className="text-gray-600 text-sm mb-4">
            Set up your phone and calendar to get started
          </p>
        </div>
      </div>

      {/* Main Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Clinic Management */}
        <Link
          to="/industry-settings"
          className="group p-6 rounded-xl bg-white border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg group-hover:from-blue-200 transition-colors">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 translate-x-0 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="text-gray-900 font-semibold text-lg mb-2">Clinic Management</h3>
          <p className="text-gray-600 text-sm mb-4">
            Configure clinic details, hours, and industry settings
          </p>
          <div className="inline-flex items-center text-blue-600 text-sm font-medium group-hover:text-blue-700">
            Configure <ArrowRight className="h-4 w-4 ml-1" />
          </div>
        </Link>

        {/* Connect Phone */}
        <Link
          to="/connect-phone"
          className="group p-6 rounded-xl bg-white border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-green-100 to-green-50 rounded-lg group-hover:from-green-200 transition-colors">
              <Phone className="h-6 w-6 text-green-600" />
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 translate-x-0 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="text-gray-900 font-semibold text-lg mb-2">Connect Phone</h3>
          <p className="text-gray-600 text-sm mb-4">
            Set up your phone number and AI voice assistant
          </p>
          <div className="inline-flex items-center text-blue-600 text-sm font-medium group-hover:text-blue-700">
            Connect <ArrowRight className="h-4 w-4 ml-1" />
          </div>
        </Link>

        {/* Analytics */}
        <Link
          to="/analytics"
          className="group p-6 rounded-xl bg-white border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-50 rounded-lg group-hover:from-purple-200 transition-colors">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 translate-x-0 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="text-gray-900 font-semibold text-lg mb-2">Analytics</h3>
          <p className="text-gray-600 text-sm mb-4">
            Track calls, bookings, and performance metrics
          </p>
          <div className="inline-flex items-center text-blue-600 text-sm font-medium group-hover:text-blue-700">
            View analytics <ArrowRight className="h-4 w-4 ml-1" />
          </div>
        </Link>

        {/* Google Calendar */}
        <Link
          to="/google-calendar"
          className="group p-6 rounded-xl bg-white border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-red-100 to-red-50 rounded-lg group-hover:from-red-200 transition-colors">
              <Users className="h-6 w-6 text-red-600" />
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 translate-x-0 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="text-gray-900 font-semibold text-lg mb-2">Google Calendar</h3>
          <p className="text-gray-600 text-sm mb-4">
            Integrate with your Google Calendar for seamless booking
          </p>
          <div className="inline-flex items-center text-blue-600 text-sm font-medium group-hover:text-blue-700">
            Connect <ArrowRight className="h-4 w-4 ml-1" />
          </div>
        </Link>

        {/* Booking History */}
        <Link
          to="/booking-history"
          className="group p-6 rounded-xl bg-white border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-amber-100 to-amber-50 rounded-lg group-hover:from-amber-200 transition-colors">
              <TrendingUp className="h-6 w-6 text-amber-600" />
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 translate-x-0 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="text-gray-900 font-semibold text-lg mb-2">Booking History</h3>
          <p className="text-gray-600 text-sm mb-4">
            Review all bookings and appointments made
          </p>
          <div className="inline-flex items-center text-blue-600 text-sm font-medium group-hover:text-blue-700">
            View history <ArrowRight className="h-4 w-4 ml-1" />
          </div>
        </Link>

        {/* Settings */}
        <Link
          to="/settings"
          className="group p-6 rounded-xl bg-white border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-slate-100 to-slate-50 rounded-lg group-hover:from-slate-200 transition-colors">
              <Settings className="h-6 w-6 text-slate-600" />
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 translate-x-0 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="text-gray-900 font-semibold text-lg mb-2">Account Settings</h3>
          <p className="text-gray-600 text-sm mb-4">
            Manage your account, password, and preferences
          </p>
          <div className="inline-flex items-center text-blue-600 text-sm font-medium group-hover:text-blue-700">
            Configure <ArrowRight className="h-4 w-4 ml-1" />
          </div>
        </Link>
      </div>
    </div>
  );
}