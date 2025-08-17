import React, { useState } from 'react';
import { BarChart3, TrendingUp, Phone, Calendar, Clock, Users, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Analytics() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('month');

  const hasAnalyticsAccess = user?.plan === 'pro' || user?.plan === 'business';
  const hasActivePlan = user?.plan !== null;

  const stats = [
    { title: 'Total Calls', value: hasAnalyticsAccess ? '1,247' : '0', change: '+12%', color: 'text-blue-600' },
    { title: 'Successful Bookings', value: hasAnalyticsAccess ? '986' : '0', change: '+8%', color: 'text-green-600' },
    { title: 'Conversion Rate', value: hasAnalyticsAccess ? '79.1%' : '0%', change: '+3.2%', color: 'text-purple-600' },
    { title: 'Avg Call Duration', value: hasAnalyticsAccess ? '2m 45s' : '0s', change: '-5%', color: 'text-orange-600' }
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
              <p className="text-yellow-700">Upgrade to Pro or Business plan to access detailed analytics and insights.</p>
            </div>
          </div>
          <button className="inline-flex items-center space-x-2 bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 transition-colors font-semibold">
            <span>Contact Sales</span>
          </button>
        </div>
      )}

      {/* Starter Plan Notice */}
      {user?.plan === 'starter' && (
        <div className="mb-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-blue-800">Analytics Upgrade Required</h3>
              <p className="text-blue-700">Upgrade to Pro or Business to access call analytics and detailed insights.</p>
            </div>
          </div>
          <button className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
            <span>Contact Sales</span>
          </button>
        </div>
      )}

      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-2">
              {hasAnalyticsAccess 
                ? "Track your AI assistant's performance and insights" 
                : "Upgrade to access detailed analytics"
              }
            </p>
          </div>
          <div className={`mt-4 sm:mt-0 ${!hasAnalyticsAccess ? 'opacity-50 pointer-events-none' : ''}`}>
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={!hasAnalyticsAccess}
            >
              <option value="week">Last 7 days</option>
              <option value="month">Last 30 days</option>
              <option value="quarter">Last 90 days</option>
              <option value="year">Last year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${!hasAnalyticsAccess ? 'opacity-60' : ''}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className={`text-sm font-medium ${hasAnalyticsAccess ? stat.color : 'text-gray-400'}`}>
                  {hasAnalyticsAccess ? stat.change : 'N/A'}
                </p>
              </div>
            </div>
            {!hasAnalyticsAccess && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Lock className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Calls Over Time Chart */}
        <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${!hasAnalyticsAccess ? 'opacity-60' : ''}`}>
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Calls Over Time</h3>
          {hasAnalyticsAccess ? (
            <>
              <div className="h-64 flex items-end justify-between space-x-2">
                {[42, 65, 38, 71, 55, 83, 91, 67, 74, 89, 95, 78, 84, 92].map((height, index) => (
                  <div key={index} className="flex-1 bg-blue-200 rounded-t" style={{ height: `${height}%` }}>
                    <div className="bg-blue-600 rounded-t w-full" style={{ height: '70%' }}></div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-sm text-gray-500 mt-4">
                <span>Jan 1</span>
                <span>Jan 15</span>
                <span>Jan 31</span>
              </div>
            </>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Analytics available with Pro/Business plans</p>
              </div>
            </div>
          )}
        </div>

        {/* Call Outcomes */}
        <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${!hasAnalyticsAccess ? 'opacity-60' : ''}`}>
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Call Outcomes</h3>
          {hasAnalyticsAccess ? (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">Successful Bookings</span>
                  <span className="text-sm text-gray-600">79%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-green-500 h-3 rounded-full" style={{ width: '79%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">Information Requests</span>
                  <span className="text-sm text-gray-600">15%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-blue-500 h-3 rounded-full" style={{ width: '15%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">Transferred to Staff</span>
                  <span className="text-sm text-gray-600">4%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-orange-500 h-3 rounded-full" style={{ width: '4%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">Missed/Failed</span>
                  <span className="text-sm text-gray-600">2%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-red-500 h-3 rounded-full" style={{ width: '2%' }}></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Call outcome analytics available with Pro/Business plans</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Peak Hours */}
        <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${!hasAnalyticsAccess ? 'opacity-60' : ''}`}>
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Peak Call Hours</h3>
          {hasAnalyticsAccess ? (
            <div className="space-y-4">
              {[
                { time: '9:00 AM - 10:00 AM', calls: 34, percentage: 85 },
                { time: '2:00 PM - 3:00 PM', calls: 28, percentage: 70 },
                { time: '11:00 AM - 12:00 PM', calls: 26, percentage: 65 },
                { time: '3:00 PM - 4:00 PM', calls: 22, percentage: 55 },
                { time: '10:00 AM - 11:00 AM', calls: 18, percentage: 45 }
              ].map((hour, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">{hour.time}</span>
                    <span className="text-sm text-gray-600">{hour.calls} calls</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${hour.percentage}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-sm">Peak hours data requires Pro/Business plan</p>
              </div>
            </div>
          )}
        </div>

        {/* Service Types */}
        <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${!hasAnalyticsAccess ? 'opacity-60' : ''}`}>
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Popular Services</h3>
          {hasAnalyticsAccess ? (
            <div className="space-y-4">
              {[
                { service: 'Dental Cleaning', bookings: 342, color: 'bg-blue-500' },
                { service: 'Consultation', bookings: 198, color: 'bg-green-500' },
                { service: 'Teeth Whitening', bookings: 156, color: 'bg-purple-500' },
                { service: 'Root Canal', bookings: 89, color: 'bg-orange-500' },
                { service: 'Dental Checkup', bookings: 67, color: 'bg-pink-500' }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                    <span className="text-sm font-medium text-gray-900">{item.service}</span>
                  </div>
                  <span className="text-sm text-gray-600">{item.bookings}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-sm">Service analytics requires Pro/Business plan</p>
              </div>
            </div>
          )}
        </div>

        {/* Performance Metrics */}
        <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${!hasAnalyticsAccess ? 'opacity-60' : ''}`}>
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Performance</h3>
          {hasAnalyticsAccess ? (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium">Response Time</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">1.2s</span>
                </div>
                <p className="text-xs text-green-600">Excellent - 0.3s faster than average</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium">Customer Satisfaction</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">4.8/5</span>
                </div>
                <p className="text-xs text-green-600">Based on post-call surveys</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-orange-600" />
                    <span className="text-sm font-medium">Avg Resolution Time</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">2m 45s</span>
                </div>
                <p className="text-xs text-orange-600">5s slower than last month</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-medium">Uptime</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">99.9%</span>
                </div>
                <p className="text-xs text-green-600">No outages this month</p>
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-sm">Performance metrics require Pro/Business plan</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}