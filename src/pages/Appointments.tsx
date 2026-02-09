import React, { useState } from 'react';
import { Calendar, User, Clock, Phone, Filter, Search, MoreVertical, CheckCircle, X, Lock, RefreshCw, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useAppointments } from '../hooks/useAppointments';
import type { Appointment } from '../types/appointments';
import { INDUSTRY_CONFIGS } from '../types/industry';

export default function Appointments() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    appointments,
    stats,
    isLoading,
    error,
    filters,
    setFilters,
    refreshAppointments,
    cancelAppointment,
    markCompleted,
  } = useAppointments();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const hasActivePlan = user?.plan !== null;

  const handleUpgradeClick = () => {
    navigate('/pricing');
  };
  
  // Get industry-specific labels
  const industryConfig = INDUSTRY_CONFIGS[user?.industryType || 'clinic'];
  const appointmentLabel = industryConfig.appointmentLabel;
  const bookingLabel = industryConfig.bookingLabel;

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setFilters({ ...filters, search: value });
  };

  const handleStatusFilter = (status: string) => {
    setFilters({ ...filters, status: status as any });
  };

  const handleDateRangeFilter = (dateRange: string) => {
    setFilters({ ...filters, dateRange: dateRange as any });
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      setActionLoading(appointmentId);
      await cancelAppointment(appointmentId);
      setSelectedAppointment(null);
    } catch (error) {
      // Error is handled by the hook
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkCompleted = async (appointmentId: string) => {
    try {
      setActionLoading(appointmentId);
      await markCompleted(appointmentId);
      setSelectedAppointment(null);
    } catch (error) {
      // Error is handled by the hook
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'booked': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      }),
    };
  };

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  return (
    <div className="max-w-7xl mx-auto">

      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{appointmentLabel}</h1>
            <p className="text-gray-600 mt-2">Manage {appointmentLabel.toLowerCase()} booked through your AI assistant</p>
          </div>
          <button
            onClick={refreshAppointments}
            disabled={isLoading || !hasActivePlan}
            className="mt-4 sm:mt-0 inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-8 bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <X className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="text-lg font-semibold text-red-800">Error Loading Appointments</h3>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Appointments</p>
              <p className="text-3xl font-bold text-gray-900">{hasActivePlan ? stats.total : '0'}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">This Week</p>
              <p className="text-3xl font-bold text-gray-900">{hasActivePlan ? stats.thisWeek : '0'}</p>
            </div>
            <Clock className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-3xl font-bold text-gray-900">{hasActivePlan ? stats.pending : '0'}</p>
            </div>
            <User className="w-8 h-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-gray-900">{hasActivePlan ? stats.completed : '0'}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${!hasActivePlan ? 'opacity-60' : ''}`}>
        {/* Header with filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <h3 className="text-xl font-semibold text-gray-900">Recent {appointmentLabel}</h3>
            
            {hasActivePlan && (
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={`Search ${appointmentLabel.toLowerCase()}...`}
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={filters.status}
                  onChange={(e) => handleStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="booked">Booked</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                {/* Date Range Filter */}
                <select
                  value={filters.dateRange}
                  onChange={(e) => handleDateRangeFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Appointments Table */}
        <div className="overflow-x-auto">
          {hasActivePlan ? (
            <>
              {isLoading ? (
                <div className="text-center py-16">
                  <RefreshCw className="w-8 h-8 text-gray-400 mx-auto mb-4 animate-spin" />
                  <p className="text-gray-600">Loading appointments...</p>
                </div>
              ) : appointments.length === 0 ? (
                <div className="text-center py-16">
                  <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium mb-2">No {appointmentLabel.toLowerCase()} found</p>
                  <p className="text-gray-500 text-sm">
                    {filters.status !== 'all' || filters.dateRange !== 'all' || filters.search
                      ? 'Try adjusting your filters to see more results'
                      : `${appointmentLabel} booked through your AI assistant will appear here`
                    }
                  </p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Patient
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {appointments.map((appointment) => {
                      const { date, time } = formatDateTime(appointment.start_time);
                      const duration = Math.round((new Date(appointment.end_time).getTime() - new Date(appointment.start_time).getTime()) / (1000 * 60));
                      
                      return (
                        <tr key={appointment.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{appointment.caller_name}</p>
                              <p className="text-sm text-gray-500">{formatPhoneNumber(appointment.caller_number)}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{date}</p>
                              <p className="text-sm text-gray-500">{time}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className="text-sm text-gray-900">{duration} minutes</p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(appointment.status)}`}>
                              {appointment.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="relative">
                              <button
                                onClick={() => setSelectedAppointment(
                                  selectedAppointment === appointment.id ? null : appointment.id
                                )}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                                disabled={actionLoading === appointment.id}
                              >
                                <MoreVertical className="w-5 h-5" />
                              </button>
                              
                              {selectedAppointment === appointment.id && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                                  <div className="py-1">
                                    {appointment.status === 'booked' && (
                                      <>
                                        <button
                                          onClick={() => handleMarkCompleted(appointment.id)}
                                          disabled={actionLoading === appointment.id}
                                          className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-green-700 hover:bg-green-50 transition-colors disabled:opacity-50"
                                        >
                                          <CheckCircle className="w-4 h-4" />
                                          <span>Mark Completed</span>
                                        </button>
                                        <button
                                          onClick={() => handleCancelAppointment(appointment.id)}
                                          disabled={actionLoading === appointment.id}
                                          className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors disabled:opacity-50"
                                        >
                                          <X className="w-4 h-4" />
                                          <span>Cancel</span>
                                        </button>
                                      </>
                                    )}
                                    <a
                                      href={`https://calendar.google.com/calendar/event?eid=${appointment.event_id}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-blue-700 hover:bg-blue-50 transition-colors"
                                    >
                                      <Calendar className="w-4 h-4" />
                                      <span>View in Calendar</span>
                                    </a>
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </>
          ) : null}
        </div>

        {/* Pagination */}
        {hasActivePlan && appointments.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to <span className="font-medium">{appointments.length}</span> of{' '}
                <span className="font-medium">{stats.total}</span> results
              </p>
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50">
                  Previous
                </button>
                <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm">
                  1
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50">
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Upgrade CTA */}
      {!hasActivePlan && (
        <div className="mt-8 text-center p-8 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
          <Lock className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Manage Your Appointments</h3>
          <p className="text-gray-600 mb-6">Access appointment management, booking history, and track all bookings made through your AI assistant.</p>
          <button
            onClick={handleUpgradeClick}
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            <Zap className="w-5 h-5" />
            <span>Upgrade Plan to Unlock</span>
          </button>
        </div>
      )}

      {/* Quick Actions */}
      {hasActivePlan && (
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-blue-50 rounded-lg">
              <Calendar className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h4 className="font-semibold text-gray-900 mb-2">View Calendar</h4>
              <p className="text-gray-600 text-sm mb-4">Open your Google Calendar to see all {appointmentLabel.toLowerCase()}</p>
              <a
                href="https://calendar.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <Calendar className="w-4 h-4" />
                <span>Open Calendar</span>
              </a>
            </div>

            <div className="text-center p-6 bg-green-50 rounded-lg">
              <Phone className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h4 className="font-semibold text-gray-900 mb-2">Test Assistant</h4>
              <p className="text-gray-600 text-sm mb-4">Call your number to test the booking flow</p>
              <button className="inline-flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm">
                <Phone className="w-4 h-4" />
                <span>Test Call</span>
              </button>
            </div>

            <div className="text-center p-6 bg-purple-50 rounded-lg">
              <RefreshCw className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h4 className="font-semibold text-gray-900 mb-2">Sync Calendar</h4>
              <p className="text-gray-600 text-sm mb-4">Manually sync with Google Calendar</p>
              <button
                onClick={refreshAppointments}
                disabled={isLoading}
                className="inline-flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Sync Now</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}