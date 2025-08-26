import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import CreateAssistantButton from '../components/CreateAssistantButton';
import { useAssistantStatus } from '../hooks/useAssistantStatus';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { hasAssistant, loading, error, refetch } = useAssistantStatus();

  const handleAssistantCreated = () => {
    refetch();
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.email}
          </h1>
          <p className="text-gray-600">
            Manage your AI assistant and clinic settings from your dashboard.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Assistant Status Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              AI Assistant Status
            </h2>
            
            {loading ? (
              <div className="flex items-center text-gray-600">
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Checking status...
              </div>
            ) : error ? (
              <div className="flex items-center text-red-600">
                <XCircle className="w-5 h-5 mr-2" />
                Error loading status
              </div>
            ) : hasAssistant ? (
              <div className="flex items-center text-green-600 mb-4">
                <CheckCircle className="w-5 h-5 mr-2" />
                Assistant created
              </div>
            ) : (
              <div className="flex items-center text-red-600 mb-4">
                <XCircle className="w-5 h-5 mr-2" />
                Assistant not created
              </div>
            )}

            {!hasAssistant && !loading && (
              <CreateAssistantButton onSuccess={handleAssistantCreated} />
            )}
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <button className="w-full text-left px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                View Analytics
              </button>
              <button className="w-full text-left px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                Manage Settings
              </button>
              <button className="w-full text-left px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                Connect Phone
              </button>
            </div>
          </div>

          {/* Recent Activity Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Recent Activity
            </h2>
            <p className="text-gray-600 text-sm">
              No recent activity to display.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;