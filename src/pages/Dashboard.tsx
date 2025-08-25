import React, { useState } from 'react';
import { Phone, Calendar, Clock, Play, TrendingUp, Users, CheckCircle, Lock, CreditCard, Power } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import CreateAssistantButton from '../components/CreateAssistantButton';
import { useAssistantStatus } from '../hooks/useAssistantStatus';
import CreateAssistantButton from '../components/CreateAssistantButton';
import { useAssistantStatus } from '../hooks/useAssistantStatus';
import CreateAssistantButton from '../components/CreateAssistantButton';
import { useAssistantStatus } from '../hooks/useAssistantStatus';

export default function Dashboard() {
  const { user, updateAssistantStatus } = useAuth();
  const { hasAssistant, assistantId, refreshStatus } = useAssistantStatus();
  const { hasAssistant, assistantId, refreshStatus } = useAssistantStatus();
  const { hasAssistant, assistantId, refreshStatus } = useAssistantStatus();
  const [isLoading, setIsLoading] = useState(false);

  // Check if user has an active plan
  const hasActivePlan = user?.plan !== null;
  const isAssistantActive = user?.assistantActive || false;

  const handleAssistantCreated = (newAssistantId: string) => {
    refreshStatus();
    // Could also show a success toast here
  };

  const handleAssistantCreated = (newAssistantId: string) => {
    refreshStatus();
    // Could also show a success toast here
  };

  const handleAssistantCreated = (newAssistantId: string) => {
    refreshStatus();
    // Could also show a success toast here
  };

  const handleToggleAssistant = async () => {
    if (!hasActivePlan) return;
    
    setIsLoading(true);
    try {
      await updateAssistantStatus(!isAssistantActive);
    } catch (error) {
      console.error('Failed to update assistant status:', error);
      // Could add error toast here
    } finally {
      setIsLoading(false);
    }
  };

  const stats = [
    {
      title: 'Total Calls This Month',
      value: hasActivePlan ? '127' : '0',
      change: '+12%',
      icon: Phone,
      color: hasActivePlan ? 'bg-blue-500' : 'bg-gray-400'
    },
    {
      title: 'Appointments Booked',
      value: hasActivePlan ? '89' : '0',
      change: '+8%',
      icon: Calendar,
      color: hasActivePlan ? 'bg-green-500' : 'bg-gray-400'
    },
    {
      title: 'Last Call Received',
      value: hasActivePlan ? '2 hours ago' : 'No calls',
      change: hasActivePlan ? 'Active' : 'Inactive',
      icon: Clock,
      color: hasActivePlan ? 'bg-orange-500' : 'bg-gray-400'
    }
  ];

  const recentCalls = [
    {
      id: 1,
      caller: 'Jennifer Martinez',
      type: 'Appointment Booking',
      time: '2:34 PM',
      status: 'Completed',
      service: 'Dental Cleaning'
    },
    {
      id: 2,
      caller: 'Michael Chen',
      type: 'Appointment Booking',
      time: '1:15 PM',
      status: 'Completed',
      service: 'Consultation'
    },
    {
      id: 3,
      caller: 'Sarah Williams',
      type: 'General Inquiry',
      time: '11:42 AM',
      status: 'Completed',
      service: 'Hours & Location'
    }
  ];

  return (
    <div>
      {/* Plan Activation Notice */}
      {!hasActivePlan && (
        <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <Lock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-yellow-800">Activate VoisiaAI</h3>
              <p className="text-yellow-700">Please choose a plan to activate your AI assistant.</p>
            </div>
          </div>
          <button className="inline-flex items-center space-x-2 bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 transition-colors font-semibold">
            <CreditCard className="w-5 h-5" />
            <span>Contact Sales</span>
          </button>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-gray-600 mt-2">
          {hasActivePlan 
            ? "Here's how your AI assistant is performing" 
            : "Activate your plan to start using VoisiaAI"
          }
        </p>
      </div>

      {/* AI Assistant Toggle */}
      <div className="mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
              hasActivePlan && hasAssistant && isAssistantActive ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              <Power className={`w-10 h-10 ${
                hasActivePlan && hasAssistant && isAssistantActive ? 'text-green-600' : 'text-gray-400'
              }`} />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Voice Assistant</h2>
            <p className="text-gray-600 mb-6">
              {hasActivePlan 
                ? (hasAssistant 
                    ? (isAssistantActive ? 'Your AI assistant is active and ready to handle calls' : 'Click to activate your AI assistant')
                    : 'Create your AI assistant to start handling calls'
                ? (hasAssistant 
                    ? (isAssistantActive ? 'Your AI assistant is active and ready to handle calls' : 'Click to activate your AI assistant')
                    : 'Create your AI assistant to start handling calls'
                  )
                : 'Please choose a plan to activate your AI assistant'
              }
            </p>
            
            {hasAssistant && (
              <div className="flex items-center justify-center mb-6">
                <button
                  onClick={handleToggleAssistant}
                  disabled={!hasActivePlan || isLoading}
                  className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    hasActivePlan && isAssistantActive 
                      ? 'bg-green-600' 
                      : hasActivePlan 
                      ? 'bg-gray-200' 
                      : 'bg-gray-200 cursor-not-allowed opacity-50'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      hasActivePlan && isAssistantActive ? 'translate-x-9' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className={`ml-4 text-sm font-medium ${
                  hasActivePlan && isAssistantActive ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {isLoading ? 'Updating...' : (hasActivePlan && isAssistantActive ? 'Active' : 'Inactive')}
                </span>
              </div>
            )}

            {!hasAssistant && hasActivePlan && (
              <div className="mb-6">
                <CreateAssistantButton 
                  onAssistantCreated={handleAssistantCreated}
                  businessName={user?.clinicName || ''}
                />
              </div>
            )}

            {!hasActivePlan && (
              <div className="mb-6">
                <button className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                  <span>Contact Sales to Activate</span>
                </button>
              </div>
            )}

            {hasAssistant && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="font-semibold text-blue-800">Assistant ID</p>
                  <p className="text-blue-600 font-mono text-xs">{assistantId?.slice(0, 8)}...</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="font-semibold text-green-800">Calendar</p>
                  <p className="text-green-600">{user?.googleConnected ? 'Connected' : 'Setup required'}</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-3">
                  <p className="font-semibold text-purple-800">Plan</p>
                  <p className="text-purple-600 capitalize">{user?.plan || 'None'}</p>
                </div>
              </div>
            )}

            {!hasAssistant && hasActivePlan && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="font-semibold text-blue-800">Phone Number</p>
                  <p className="text-blue-600">{user?.phoneNumber || 'Not connected'}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="font-semibold text-green-800">Calendar</p>
                  <p className="text-green-600">{user?.googleConnected ? 'Connected' : 'Setup required'}</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-3">
                  <p className="font-semibold text-purple-800">Plan</p>
                  <p className="text-purple-600 capitalize">{user?.plan || 'None'}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Assistant Status Card - Only show if user has active plan */}
      {hasActivePlan && (
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Assistant Status</h3>
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                hasAssistant ? 'bg-green-100' : 'bg-gray-100'
              }`}>
            {hasAssistant && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="font-semibold text-blue-800">Assistant ID</p>
                  {hasAssistant ? '✅ Assistant Created' : '❌ Assistant Not Created'}
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="font-semibold text-green-800">Calendar</p>
                  <p className="text-green-600">{user?.googleConnected ? 'Connected' : 'Setup required'}</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-3">
                  <p className="font-semibold text-purple-800">Plan</p>
                  <p className="text-purple-600 capitalize">{user?.plan || 'None'}</p>
                </div>
              </div>
            )}

            {!hasAssistant && hasActivePlan && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="font-semibold text-blue-800">Phone Number</p>
                  <p className="text-blue-600">{user?.phoneNumber || 'Not connected'}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="font-semibold text-green-800">Calendar</p>
                  <p className="text-green-600">{user?.googleConnected ? 'Connected' : 'Setup required'}</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-3">
                  <p className="font-semibold text-purple-800">Plan</p>
                  <p className="text-purple-600 capitalize">{user?.plan || 'None'}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Legacy AI Assistant Toggle - Remove this section since we moved it above */}
      {false && (
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            {hasAssistant && (
              <div className="flex items-center justify-center mb-6">
                <button
                  onClick={handleToggleAssistant}
                  disabled={!hasActivePlan || isLoading}
                  className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${!hasActivePlan ? 'opacity-60' : ''}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className={`text-sm font-medium ${hasActivePlan ? 'text-green-600' : 'text-gray-400'}`}>
                  {stat.change}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                    ? `Assistant ID: ${assistantId?.slice(0, 12)}...`
              </div>
            </div>
            {!hasActivePlan && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Lock className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Calls */}
        <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${!hasActivePlan ? 'opacity-60' : ''}`}>
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">Recent Calls</h3>
          </div>
          <div className="p-6">
            {hasActivePlan ? (
              <div className="space-y-4">
                {recentCalls.map((call) => (
                  <div key={call.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{call.caller}</p>
                        <p className="text-sm text-gray-600">{call.service}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{call.time}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-xs text-green-600">{call.status}</span>
                        {user?.plan === 'business' && (
                          <button className="text-blue-600 hover:text-blue-700">
                            <Play className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Activate your plan to see call history</p>
              </div>
            )}
          </div>
        </div>

        {/* Performance Overview */}
        <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${!hasActivePlan ? 'opacity-60' : ''}`}>
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">Performance Overview</h3>
          </div>
          <div className="p-6">
            {hasActivePlan ? (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">Call Success Rate</span>
                    <span className="text-sm text-gray-600">94%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '94%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">Booking Conversion</span>
                    <span className="text-sm text-gray-600">78%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">Average Call Duration</span>
                    <span className="text-sm text-gray-600">2m 45s</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2 text-green-600 mb-2">
                    <TrendingUp className="w-5 h-5" />
                    <span className="font-semibold">All metrics trending up!</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Your AI assistant is performing exceptionally well. Booking rates have increased 12% this month.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Activate your plan to see performance metrics</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={`mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 ${!hasActivePlan ? 'opacity-60' : ''}`}>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            className={`bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow text-left ${!hasActivePlan ? 'cursor-not-allowed' : ''}`}
            disabled={!hasActivePlan}
          >
            <Phone className="w-8 h-8 text-blue-600 mb-2" />
            <p className="font-semibold text-gray-900">Test Call Flow</p>
            <p className="text-sm text-gray-600">Call your number to test AI</p>
          </button>
          
          <button 
            className={`bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow text-left ${!hasActivePlan ? 'cursor-not-allowed' : ''}`}
            disabled={!hasActivePlan}
          >
            <Calendar className="w-8 h-8 text-green-600 mb-2" />
            <p className="font-semibold text-gray-900">View Calendar</p>
            <p className="text-sm text-gray-600">Check upcoming appointments</p>
          </button>
          
          <button 
            className={`bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow text-left ${!hasActivePlan ? 'cursor-not-allowed' : ''}`}
            disabled={!hasActivePlan}
          >
            <TrendingUp className="w-8 h-8 text-purple-600 mb-2" />
            <p className="font-semibold text-gray-900">Analytics Report</p>
            <p className="text-sm text-gray-600">Download monthly report</p>
          </button>
          
          <button 
            className={`bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow text-left ${!hasActivePlan ? 'cursor-not-allowed' : ''}`}
            disabled={!hasActivePlan}
          >
            <Users className="w-8 h-8 text-orange-600 mb-2" />
            <p className="font-semibold text-gray-900">Add Team Member</p>
            <p className="text-sm text-gray-600">Invite staff to dashboard</p>
          </button>
        </div>
        {!hasActivePlan && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-xl">
            <div className="text-center">
              <Lock className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 font-medium">Upgrade your plan to unlock features</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}