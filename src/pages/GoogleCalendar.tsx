import React, { useState } from 'react';
import { Calendar, CheckCircle, ExternalLink, RefreshCw, Lock, Clock, Play, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useGoogleCalendar } from '../hooks/useGoogleCalendar';

export default function GoogleCalendar() {
  const { user } = useAuth();
  const {
    isConnected,
    isConnecting,
    error,
    calendarInfo,
    availability,
    isLoadingAvailability,
    connectCalendar,
    disconnectCalendar,
    fetchAvailability,
    clearError,
  } = useGoogleCalendar();

  const hasActivePlan = user?.plan !== null;

  const handleConnect = () => {
    if (!hasActivePlan) return;
    clearError();
    connectCalendar();
  };

  const handleTestIntegration = () => {
    clearError();
    fetchAvailability();
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
          <button className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
            <span>Upgrade Plan</span>
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-8 bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="text-lg font-semibold text-red-800">Connection Error</h3>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
          <button
            onClick={clearError}
            className="mt-4 text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Dismiss
          </button>
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
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                Upgrade Plan
              </button>
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
                <p className="text-green-700 font-medium">{calendarInfo?.name || 'Primary Calendar'}</p>
                <p className="text-green-600 text-sm">{calendarInfo?.email}</p>
              </div>

              {/* Test Integration Button */}
              <button
                onClick={handleTestIntegration}
                disabled={isLoadingAvailability}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                {isLoadingAvailability ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Loading Availability...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    <span>Test Calendar Integration</span>
                  </>
                )}
              </button>

              {/* Available Slots Display */}
              {availability.length > 0 && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h5 className="font-semibold text-blue-800 mb-3">Next 5 Available Time Slots:</h5>
                  <div className="space-y-2">
                    {availability.slice(0, 5).map((slot, index) => (
                      <div key={index} className="flex items-center justify-between bg-white rounded p-3">
                        <div className="flex items-center space-x-3">
                          <Clock className="w-4 h-4 text-blue-600" />
                          <span className="font-medium text-gray-900">
                            {new Date(slot.date).toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </span>
                        </div>
                        <span className="text-blue-600 font-medium">
                          {slot.startTime} - {slot.endTime}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex space-x-4">
                <button
                  onClick={disconnectCalendar}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Disconnect
                </button>
                <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                  View in Google Calendar
                </button>
              </div>

              <div className="text-center text-sm text-gray-500">
                Last synced: {calendarInfo?.lastSync || 'Never'}
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