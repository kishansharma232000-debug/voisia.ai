import React, { useState } from 'react';
import { Calendar, User, Clock, Phone, Play, Download, Filter, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function BookingHistory() {
  const { user } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState('all');

  const hasActivePlan = user?.plan !== null;

  const bookings = [
    {
      id: 1,
      callerName: 'Jennifer Martinez',
      phone: '+1 (555) 123-4567',
      service: 'Dental Cleaning',
      appointmentTime: '2025-01-15 2:00 PM',
      callTime: '2025-01-10 2:34 PM',
      duration: '2m 45s',
      status: 'Confirmed',
      hasRecording: user?.plan === 'business'
    },
    {
      id: 2,
      callerName: 'Michael Chen',
      phone: '+1 (555) 987-6543',
      service: 'Consultation',
      appointmentTime: '2025-01-16 10:00 AM',
      callTime: '2025-01-10 1:15 PM',
      duration: '3m 12s',
      status: 'Confirmed',
      hasRecording: user?.plan === 'business'
    },
    {
      id: 3,
      callerName: 'Sarah Williams',
      phone: '+1 (555) 456-7890',
      service: 'Root Canal',
      appointmentTime: '2025-01-17 9:30 AM',
      callTime: '2025-01-10 11:42 AM',
      duration: '4m 18s',
      status: 'Confirmed',
      hasRecording: user?.plan === 'business'
    },
    {
      id: 4,
      callerName: 'David Rodriguez',
      phone: '+1 (555) 321-0987',
      service: 'Teeth Whitening',
      appointmentTime: '2025-01-18 3:15 PM',
      callTime: '2025-01-09 4:22 PM',
      duration: '2m 58s',
      status: 'Confirmed',
      hasRecording: user?.plan === 'business'
    },
    {
      id: 5,
      callerName: 'Emily Johnson',
      phone: '+1 (555) 789-0123',
      service: 'Dental Checkup',
      appointmentTime: '2025-01-19 11:00 AM',
      callTime: '2025-01-09 3:15 PM',
      duration: '2m 33s',
      status: 'Confirmed',
      hasRecording: user?.plan === 'business'
    }
  ];

  const filters = [
    { id: 'all', label: 'All Bookings', count: bookings.length },
    { id: 'today', label: 'Today', count: 3 },
    { id: 'week', label: 'This Week', count: bookings.length },
    { id: 'month', label: 'This Month', count: bookings.length }
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Plan Required Notice */}
      {!hasActivePlan && (
        <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Lock className="w-6 h-6 text-yellow-600" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-800">Plan Required</h3>
              <p className="text-yellow-700">Upgrade your plan to access booking history and appointment management.</p>
            </div>
          </div>
          <button className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
            <span>Upgrade Plan</span>
          </button>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Booking History</h1>
        <p className="text-gray-600 mt-2">Track all appointments booked through your AI assistant</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Bookings</p>
              <p className="text-3xl font-bold text-gray-900">{hasActivePlan ? bookings.length : '0'}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">This Week</p>
              <p className="text-3xl font-bold text-gray-900">{hasActivePlan ? '12' : '0'}</p>
            </div>
            <Clock className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Call Time</p>
              <p className="text-3xl font-bold text-gray-900">{hasActivePlan ? '3m 12s' : '0s'}</p>
            </div>
            <Phone className="w-8 h-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Success Rate</p>
              <p className="text-3xl font-bold text-gray-900">{hasActivePlan ? '94%' : '0%'}</p>
            </div>
            <User className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${!hasActivePlan ? 'opacity-60' : ''}`}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-xl font-semibold text-gray-900">Recent Appointments</h3>
            <div className={`flex items-center space-x-3 mt-4 sm:mt-0 ${!hasActivePlan ? 'pointer-events-none' : ''}`}>
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select 
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                  disabled={!hasActivePlan}
                >
                  {filters.map(filter => (
                    <option key={filter.id} value={filter.id}>
                      {filter.label} ({filter.count})
                    </option>
                  ))}
                </select>
              </div>
              <button 
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                disabled={!hasActivePlan}
              >
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto relative">
          {hasActivePlan ? (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Appointment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Call Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{booking.callerName}</p>
                        <p className="text-sm text-gray-500">{booking.phone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900">{booking.service}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900">{booking.appointmentTime}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm text-gray-900">{booking.callTime}</p>
                        <p className="text-sm text-gray-500">Duration: {booking.duration}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        <button className="text-blue-600 hover:text-blue-900">
                          <Calendar className="w-4 h-4" />
                        </button>
                        {booking.hasRecording && (
                          <button className="text-green-600 hover:text-green-900" title="Play Recording">
                            <Play className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-16">
              <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium mb-4">Booking history requires an active plan</p>
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                Upgrade Plan
              </button>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className={`px-6 py-4 border-t border-gray-200 ${!hasActivePlan ? 'opacity-50' : ''}`}>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{hasActivePlan ? '1' : '0'}</span> to <span className="font-medium">{hasActivePlan ? bookings.length : '0'}</span> of{' '}
              <span className="font-medium">{hasActivePlan ? bookings.length : '0'}</span> results
            </p>
            <div className="flex items-center space-x-2">
              <button 
                className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50"
                disabled={!hasActivePlan}
              >
                Previous
              </button>
              <button 
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm disabled:opacity-50"
                disabled={!hasActivePlan}
              >
                1
              </button>
              <button 
                className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50"
                disabled={!hasActivePlan}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}