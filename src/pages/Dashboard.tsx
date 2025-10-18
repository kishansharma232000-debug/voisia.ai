import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAssistantStatus } from '../hooks/useAssistantStatus';
import { Building2, Phone, BarChart3, Settings } from 'lucide-react';
import LoadingSkeleton from '../components/LoadingSkeleton';

export default function Dashboard() {
  const { user } = useAuth();
  const { hasAssistant, loading } = useAssistantStatus();

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="mt-2 text-gray-600">
            Welcome back, {user?.email}! Manage your AI assistant and clinic settings.
          </p>
        </div>

        {/* Assistant Status Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Phone className="h-8 w-8 text-indigo-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    AI Assistant Status
                  </dt>
                  <dd className="flex items-center text-lg font-medium text-gray-900">
                    {hasAssistant ? (
                      <span className="text-green-600">✅ Assistant Active</span>
                    ) : (
                      <span className="text-red-600">❌ No Assistant</span>
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* Clinic Info Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Building2 className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Clinic Management
                    </dt>
                    <dd className="text-sm text-gray-900">
                      Manage your clinic settings and information
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <a href="#" className="font-medium text-indigo-700 hover:text-indigo-900">
                  View settings
                </a>
              </div>
            </div>
          </div>

          {/* Analytics Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BarChart3 className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Analytics
                    </dt>
                    <dd className="text-sm text-gray-900">
                      View call analytics and performance metrics
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <a href="#" className="font-medium text-indigo-700 hover:text-indigo-900">
                  View analytics
                </a>
              </div>
            </div>
          </div>

          {/* Settings Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Settings className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Account Settings
                    </dt>
                    <dd className="text-sm text-gray-900">
                      Manage your account and preferences
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <a href="#" className="font-medium text-indigo-700 hover:text-indigo-900">
                  Manage settings
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}