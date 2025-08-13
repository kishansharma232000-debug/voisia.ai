import React, { useState } from 'react';
import { Calendar, CheckCircle, ExternalLink, RefreshCw, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function GoogleCalendar() {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(!!user?.googleConnected);
  const [isConnecting, setIsConnecting] = useState(false);

  const hasActivePlan = user?.plan !== null;

  const handleConnect = async () => {
    if (!hasActivePlan) return;
    
    setIsConnecting(true);
    // Simulate Google OAuth flow
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsConnected(true);
    setIsConnecting(false);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
  };

  const calendarInfo = {
    name: 'Wilson Dental Care - Main Calendar',
    email: 'calendar@wilsondentalcare.com',
    lastSync: '2 minutes ago',
    eventsToday: 8,
    upcomingSlots: 12
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Plan Required Notice */}
      {!hasActivePlan && (
        <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Lock className="w-6 h-6 text-yellow-600" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-800">Plan Required</h3>
              <p className="text-yellow-700">Upgrade your plan to unlock Google Calendar integration.</p>
            </div>
          </div>
          <Link
            to="/pricing"
            className="inline-flex items-center space-x-2 bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 transition-colors font-semibold"
          >
            <span>Choose Plan</span>
          </Link>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Google Calendar Integration</h1>
        <p className="text-gray-600 mt-2">Connect your Google Calendar to enable real-time appointment booking</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Connection Status */}
        <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${!hasActivePlan ? 'opacity-60' : ''}`}>
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Calendar Connection</h3>
          
          {!hasActivePlan ? (
            <div className="text-center py-8">
              <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium mb-4">Calendar integration requires an active plan</p>
              <Link
                to="/pricing"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                View Plans
              </Link>
            </div>
          ) : !isConnected ? (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Not Connected</h4>
                <p className="text-gray-600 mb-6">Connect your Google Calendar to start booking real appointments</p>
              </div>

              <button
                onClick={handleConnect}
                disabled={isConnecting}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                {isConnecting ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <Calendar className="w-5 h-5" />
                    <span>Connect Google Calendar</span>
                  </>
                )}
              </button>
              
              <div className="text-center">
                <a href="#" className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm">
                  <ExternalLink className="w-4 h-4" />
                  <span>Learn about permissions we need</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 text-green-600 mb-4">
                <CheckCircle className="w-6 h-6" />
                <span className="font-semibold">Calendar Connected Successfully!</span>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <h5 className="font-semibold text-green-800 mb-2">Connected Calendar:</h5>
                <p className="text-green-700 font-medium">{calendarInfo.name}</p>
                <p className="text-green-600 text-sm">{calendarInfo.email}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{calendarInfo.eventsToday}</p>
                  <p className="text-sm text-blue-700">Events Today</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{calendarInfo.upcomingSlots}</p>
                  <p className="text-sm text-purple-700">Available Slots</p>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleDisconnect}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Disconnect
                </button>
                <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                  View in Google Calendar
                </button>
              </div>

              <div className="text-center text-sm text-gray-500">
                Last synced: {calendarInfo.lastSync}
              </div>
            </div>
          )}
        </div>

        {/* Setup Guide */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">How It Works</h3>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-semibold text-sm">1</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Real-time Availability</h4>
                <p className="text-gray-600 text-sm">VoisiaAI checks your calendar in real-time to show only available appointment slots to callers.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-semibold text-sm">2</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Instant Booking</h4>
                <p className="text-gray-600 text-sm">When a patient books an appointment, it's immediately added to your Google Calendar with all details.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-semibold text-sm">3</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Automatic Updates</h4>
                <p className="text-gray-600 text-sm">Any changes you make in Google Calendar are automatically reflected in VoisiaAI's availability.</p>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h5 className="font-semibold text-blue-800 mb-2">What we can access:</h5>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• View and create calendar events</li>
              <li>• Check availability in real-time</li>
              <li>• Add appointment details and patient info</li>
              <li>• Send calendar invitations to patients</li>
            </ul>
          </div>

          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h5 className="font-semibold text-gray-800 mb-2">Privacy & Security:</h5>
            <p className="text-gray-700 text-sm">
              We only access calendar data necessary for appointment booking. Your personal events and sensitive information remain private and secure.
            </p>
          </div>
        </div>
      </div>

      {/* Sync Status */}
      {hasActivePlan && isConnected && (
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Sync Status</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <p className="font-semibold text-gray-900">Connection</p>
              <p className="text-sm text-green-600">Active</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <RefreshCw className="w-6 h-6 text-green-600" />
              </div>
              <p className="font-semibold text-gray-900">Last Sync</p>
              <p className="text-sm text-green-600">2 min ago</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <p className="font-semibold text-gray-900">Events Synced</p>
              <p className="text-sm text-blue-600">127 total</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <ExternalLink className="w-6 h-6 text-purple-600" />
              </div>
              <p className="font-semibold text-gray-900">API Status</p>
              <p className="text-sm text-purple-600">Healthy</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}