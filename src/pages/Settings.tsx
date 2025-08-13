import React, { useState } from 'react';
import { Clock, Users, CreditCard, Bell, Shield, Trash2, Plus, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Settings() {
  const { user } = useAuth();
  const hasActivePlan = user?.plan !== null;

  const [clinicHours, setClinicHours] = useState({
    monday: { open: '09:00', close: '17:00', closed: false },
    tuesday: { open: '09:00', close: '17:00', closed: false },
    wednesday: { open: '09:00', close: '17:00', closed: false },
    thursday: { open: '09:00', close: '17:00', closed: false },
    friday: { open: '09:00', close: '17:00', closed: false },
    saturday: { open: '09:00', close: '15:00', closed: false },
    sunday: { open: '10:00', close: '14:00', closed: true }
  });

  const [services, setServices] = useState([
    'Dental Cleaning',
    'Consultation',
    'Teeth Whitening',
    'Root Canal',
    'Dental Checkup',
    'Crown & Bridge',
    'Orthodontics'
  ]);

  const [newService, setNewService] = useState('');

  const handleHoursChange = (day: string, field: string, value: string | boolean) => {
    setClinicHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const addService = () => {
    if (newService.trim()) {
      setServices([...services, newService.trim()]);
      setNewService('');
    }
  };

  const removeService = (service: string) => {
    setServices(services.filter(s => s !== service));
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
              <p className="text-yellow-700">Activate a plan to access settings and customize your AI assistant.</p>
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
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your clinic settings and preferences</p>
      </div>

      <div className="space-y-8">
        {/* Clinic Hours */}
        <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${!hasActivePlan ? 'opacity-60' : ''}`}>
          <div className="flex items-center space-x-3 mb-6">
            <Clock className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-semibold text-gray-900">Clinic Hours</h3>
          </div>
          
          {hasActivePlan ? (
            <div className="space-y-4">
              {Object.entries(clinicHours).map(([day, hours]) => (
                <div key={day} className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={!hours.closed}
                        onChange={(e) => handleHoursChange(day, 'closed', !e.target.checked)}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 font-medium text-gray-900 capitalize w-20">{day}</span>
                    </label>
                  </div>
                  
                  {!hours.closed ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="time"
                        value={hours.open}
                        onChange={(e) => handleHoursChange(day, 'open', e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                      <span className="text-gray-500">to</span>
                      <input
                        type="time"
                        value={hours.close}
                        onChange={(e) => handleHoursChange(day, 'close', e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  ) : (
                    <span className="text-gray-500 text-sm">Closed</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Activate your plan to configure clinic hours</p>
            </div>
          )}
        </div>

        {/* Services */}
        <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${!hasActivePlan ? 'opacity-60' : ''}`}>
          <div className="flex items-center space-x-3 mb-6">
            <Users className="w-6 h-6 text-green-600" />
            <h3 className="text-xl font-semibold text-gray-900">Available Services</h3>
          </div>
          
          {hasActivePlan ? (
            <div className="space-y-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newService}
                  onChange={(e) => setNewService(e.target.value)}
                  placeholder="Add new service..."
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && addService()}
                />
                <button
                  onClick={addService}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {services.map((service, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                    <span className="text-gray-900">{service}</span>
                    <button
                      onClick={() => removeService(service)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Activate your plan to manage services</p>
            </div>
          )}
        </div>

        {/* Voice Assistant Settings */}
        {hasActivePlan && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Users className="w-6 h-6 text-purple-600" />
              <h3 className="text-xl font-semibold text-gray-900">Voice Assistant Settings</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assistant Voice Style
                </label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="friendly">Friendly</option>
                  <option value="formal">Formal</option>
                  <option value="energetic">Energetic</option>
                </select>
              </div>

              <div>
                <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
                  Language
                </label>
                <select id="language" name="language" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="english">English</option>
                  <option value="spanish">Spanish</option>
                  <option value="french">French</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timezone
                </label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="america/new_york">Eastern Time</option>
                  <option value="america/chicago">Central Time</option>
                  <option value="america/denver">Mountain Time</option>
                  <option value="america/los_angeles">Pacific Time</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Team Members */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Users className="w-6 h-6 text-purple-600" />
              <h3 className="text-xl font-semibold text-gray-900">Team Members</h3>
            </div>
            <button 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
              disabled={!hasActivePlan}
            >
              <Plus className="w-4 h-4" />
              <span>Add Member</span>
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">
                    {user?.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{user?.name}</p>
                  <p className="text-sm text-gray-600">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">Owner</span>
              </div>
            </div>
          </div>
        </div>

        {/* Current Plan */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <CreditCard className="w-6 h-6 text-orange-600" />
            <h3 className="text-xl font-semibold text-gray-900">Current Plan</h3>
          </div>
          
          {hasActivePlan ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900 capitalize">{user?.plan} Plan</p>
                <p className="text-gray-600">
                  {user?.plan === 'starter' && '$99/month • 100 calls/month'}
                  {user?.plan === 'pro' && '$149/month • 300 calls/month'}
                  {user?.plan === 'business' && '$199/month • Unlimited calls/month'}
                </p>
                <p className="text-sm text-gray-500 mt-2">Next billing date: February 10, 2025</p>
              </div>
              <Link
                to="/pricing"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Upgrade Plan
              </Link>
            </div>
          ) : (
            <div className="text-center py-8">
              <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium mb-4">No active plan</p>
              <Link
                to="/pricing"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Choose Plan
              </Link>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${!hasActivePlan ? 'opacity-60' : ''}`}>
          <div className="flex items-center space-x-3 mb-6">
            <Bell className="w-6 h-6 text-yellow-600" />
            <h3 className="text-xl font-semibold text-gray-900">Notification Preferences</h3>
          </div>
          
          {hasActivePlan ? (
            <div className="space-y-4">
              {[
                { id: 'new-booking', label: 'New appointment bookings', description: 'Get notified when AI books a new appointment' },
                { id: 'missed-calls', label: 'Missed or failed calls', description: 'Alert when calls cannot be handled' },
                { id: 'daily-summary', label: 'Daily summary reports', description: 'Receive daily performance summary' },
                { id: 'system-updates', label: 'System updates & maintenance', description: 'Important system notifications' }
              ].map((notification) => (
                <div key={notification.id} className="flex items-start justify-between py-3 border-b border-gray-100">
                  <div>
                    <p className="font-medium text-gray-900">{notification.label}</p>
                    <p className="text-sm text-gray-600">{notification.description}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Activate your plan to configure notifications</p>
            </div>
          )}
        </div>

        {/* Security */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Shield className="w-6 h-6 text-red-600" />
            <h3 className="text-xl font-semibold text-gray-900">Security</h3>
          </div>
          
          <div className="space-y-4">
            <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <p className="font-medium text-gray-900">Change Password</p>
              <p className="text-sm text-gray-600">Update your account password</p>
            </button>
            
            <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <p className="font-medium text-gray-900">Two-Factor Authentication</p>
              <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
            </button>
            
            <button className="w-full text-left p-4 border border-red-200 rounded-lg hover:bg-red-50 transition-colors text-red-600">
              <p className="font-medium">Delete Account</p>
              <p className="text-sm">Permanently delete your VoisiaAI account and all data</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}