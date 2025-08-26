import React from 'react';
import { Phone, Bot, CheckCircle, XCircle, Settings, BarChart3, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AssistantSignupForm from '../components/AssistantSignupForm';
import { useAssistantStatus } from '../hooks/useAssistantStatus';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const { hasAssistant, assistantId, isLoading, error, refreshStatus } = useAssistantStatus();

  const handleAssistantCreated = (newAssistantId: string) => {
    console.log('Assistant created:', newAssistantId);
    refreshStatus();
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back, {user?.name || user?.email}! Manage your AI assistant and clinic operations.
        </p>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Assistant Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">AI Assistant</p>
              <p className="text-2xl font-bold text-gray-900">
                {isLoading ? '...' : hasAssistant ? 'Active' : 'Inactive'}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              hasAssistant ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              {hasAssistant ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <Bot className="w-6 h-6 text-gray-400" />
              )}
            </div>
          </div>
          {assistantId && (
            <p className="text-xs text-gray-500 mt-2">ID: {assistantId.slice(0, 8)}...</p>
          )}
        </div>

        {/* Plan Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Current Plan</p>
              <p className="text-2xl font-bold text-gray-900 capitalize">
                {user?.plan || 'Free'}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Settings className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Phone Connection */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Phone Status</p>
              <p className="text-2xl font-bold text-gray-900">
                {user?.phoneNumber ? 'Connected' : 'Not Connected'}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              user?.phoneNumber ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              <Phone className={`w-6 h-6 ${user?.phoneNumber ? 'text-green-600' : 'text-gray-400'}`} />
            </div>
          </div>
        </div>

        {/* Analytics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Calls</p>
              <p className="text-2xl font-bold text-gray-900">
                {user?.plan ? '247' : '0'}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Assistant Management */}
        <div className="space-y-6">
          {!hasAssistant ? (
            <AssistantSignupForm />
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <h3 className="text-xl font-semibold text-gray-900">Assistant Active</h3>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4 mb-6">
                <p className="text-green-800 font-medium">Your AI assistant is ready to handle calls!</p>
                <p className="text-green-700 text-sm mt-1">
                  Assistant ID: <code className="bg-green-100 px-2 py-1 rounded text-xs">{assistantId}</code>
                </p>
              </div>

              <div className="space-y-4">
                <Link
                  to="/settings"
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Settings className="w-5 h-5" />
                  <span>Manage Assistant Settings</span>
                </Link>
                
                <button
                  onClick={refreshStatus}
                  className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? 'Refreshing...' : 'Refresh Status'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h3>
          
          <div className="space-y-4">
            <Link
              to="/analytics"
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <BarChart3 className="w-6 h-6 text-purple-600" />
              <div>
                <p className="font-medium text-gray-900">View Analytics</p>
                <p className="text-sm text-gray-600">Track call performance and metrics</p>
              </div>
            </Link>

            <Link
              to="/appointments"
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Calendar className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-medium text-gray-900">Manage Appointments</p>
                <p className="text-sm text-gray-600">View and manage booked appointments</p>
              </div>
            </Link>
  );
}
            <Link
              to="/settings"
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Settings className="w-6 h-6 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900">Settings</p>
                <p className="text-sm text-gray-600">Configure your assistant and preferences</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}
    </div>