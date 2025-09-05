import React, { useState, useEffect } from 'react';
import { Building2, Clock, Users, Settings, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  IndustryType, 
  IndustrySettings, 
  INDUSTRY_CONFIGS,
  ClinicSettings,
  RestaurantSettings,
  HotelSettings,
  SalonSettings,
  AgencySettings,
  OtherSettings
} from '../types/industry';

export default function IndustrySettings() {
  const { user, refreshUser } = useAuth();
  const [selectedIndustry, setSelectedIndustry] = useState<IndustryType>(user?.industryType || 'clinic');
  const [settings, setSettings] = useState<IndustrySettings>(INDUSTRY_CONFIGS[selectedIndustry].defaultSettings);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadUserSettings();
  }, [user]);

  const loadUserSettings = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('users_meta')
        .select('industry_type, industry_settings')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        const industryType = data.industry_type || 'clinic';
        setSelectedIndustry(industryType);
        
        if (data.industry_settings && Object.keys(data.industry_settings).length > 0) {
          setSettings(data.industry_settings);
        } else {
          setSettings(INDUSTRY_CONFIGS[industryType].defaultSettings);
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      setMessage({ type: 'error', text: 'Failed to load industry settings' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleIndustryChange = (industry: IndustryType) => {
    setSelectedIndustry(industry);
    setSettings(INDUSTRY_CONFIGS[industry].defaultSettings);
    setMessage(null);
  };

  const handleSettingsChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleBusinessHoursChange = (day: string, field: string, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: {
          ...prev.businessHours[day],
          [field]: value
        }
      }
    }));
  };

  const handleArrayChange = (key: string, index: number, value: string) => {
    setSettings(prev => {
      const array = [...(prev as any)[key]];
      array[index] = value;
      return {
        ...prev,
        [key]: array
      };
    });
  };

  const addArrayItem = (key: string, defaultValue: string | number = '') => {
    setSettings(prev => ({
      ...prev,
      [key]: [...(prev as any)[key], defaultValue]
    }));
  };

  const removeArrayItem = (key: string, index: number) => {
    setSettings(prev => ({
      ...prev,
      [key]: (prev as any)[key].filter((_: any, i: number) => i !== index)
    }));
  };

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('users_meta')
        .upsert({
          id: user.id,
          industry_type: selectedIndustry,
          industry_settings: settings,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      await refreshUser();
      setMessage({ type: 'success', text: 'Industry settings saved successfully!' });
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const renderIndustrySpecificSettings = () => {
    switch (selectedIndustry) {
      case 'clinic':
      case 'salon':
        const clinicSettings = settings as ClinicSettings;
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Types
              </label>
              {clinicSettings.serviceTypes.map((service, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={service}
                    onChange={(e) => handleArrayChange('serviceTypes', index, e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    onClick={() => removeArrayItem('serviceTypes', index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                onClick={() => addArrayItem('serviceTypes', 'New Service')}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                + Add Service Type
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Appointment Duration (minutes)
              </label>
              <input
                type="number"
                value={clinicSettings.appointmentDuration}
                onChange={(e) => handleSettingsChange('appointmentDuration', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                min="15"
                max="240"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {selectedIndustry === 'clinic' ? 'Staff Members' : 'Stylists'}
              </label>
              {clinicSettings.staffMembers.map((member, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={member}
                    onChange={(e) => handleArrayChange('staffMembers', index, e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    onClick={() => removeArrayItem('staffMembers', index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                onClick={() => addArrayItem('staffMembers', 'New Member')}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                + Add {selectedIndustry === 'clinic' ? 'Staff Member' : 'Stylist'}
              </button>
            </div>
          </div>
        );

      case 'restaurant':
        const restaurantSettings = settings as RestaurantSettings;
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Table Sizes
              </label>
              {restaurantSettings.tableSizes.map((size, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="number"
                    value={size}
                    onChange={(e) => handleArrayChange('tableSizes', index, parseInt(e.target.value))}
                    className="w-24 border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    min="1"
                    max="20"
                  />
                  <span className="text-gray-600">seats</span>
                  <button
                    onClick={() => removeArrayItem('tableSizes', index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                onClick={() => addArrayItem('tableSizes', 2)}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                + Add Table Size
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Reservation Duration (minutes)
              </label>
              <input
                type="number"
                value={restaurantSettings.reservationDuration}
                onChange={(e) => handleSettingsChange('reservationDuration', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                min="30"
                max="300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Party Size
              </label>
              <input
                type="number"
                value={restaurantSettings.maxPartySize}
                onChange={(e) => handleSettingsChange('maxPartySize', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                min="1"
                max="50"
              />
            </div>
          </div>
        );

      case 'hotel':
        const hotelSettings = settings as HotelSettings;
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Room Types
              </label>
              {hotelSettings.roomTypes.map((type, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={type}
                    onChange={(e) => handleArrayChange('roomTypes', index, e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    onClick={() => removeArrayItem('roomTypes', index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                onClick={() => addArrayItem('roomTypes', 'New Room Type')}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                + Add Room Type
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Check-in Time
                </label>
                <input
                  type="time"
                  value={hotelSettings.checkInTime}
                  onChange={(e) => handleSettingsChange('checkInTime', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Check-out Time
                </label>
                <input
                  type="time"
                  value={hotelSettings.checkOutTime}
                  onChange={(e) => handleSettingsChange('checkOutTime', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        );

      case 'agency':
        const agencySettings = settings as AgencySettings;
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Consultation Types
              </label>
              {agencySettings.consultationTypes.map((type, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={type}
                    onChange={(e) => handleArrayChange('consultationTypes', index, e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    onClick={() => removeArrayItem('consultationTypes', index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                onClick={() => addArrayItem('consultationTypes', 'New Consultation')}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                + Add Consultation Type
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Meeting Duration (minutes)
              </label>
              <input
                type="number"
                value={agencySettings.meetingDuration}
                onChange={(e) => handleSettingsChange('meetingDuration', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                min="15"
                max="240"
              />
            </div>
          </div>
        );

      case 'other':
        const otherSettings = settings as OtherSettings;
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Fields
              </label>
              <p className="text-sm text-gray-600 mb-4">
                Add custom fields specific to your business needs.
              </p>
              {Object.entries(otherSettings.customFields).map(([key, value], index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    placeholder="Field name"
                    value={key}
                    onChange={(e) => {
                      const newFields = { ...otherSettings.customFields };
                      delete newFields[key];
                      newFields[e.target.value] = value;
                      handleSettingsChange('customFields', newFields);
                    }}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Field value"
                    value={String(value)}
                    onChange={(e) => {
                      const newFields = { ...otherSettings.customFields };
                      newFields[key] = e.target.value;
                      handleSettingsChange('customFields', newFields);
                    }}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    onClick={() => {
                      const newFields = { ...otherSettings.customFields };
                      delete newFields[key];
                      handleSettingsChange('customFields', newFields);
                    }}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  const newFields = { ...otherSettings.customFields };
                  newFields[`field_${Date.now()}`] = '';
                  handleSettingsChange('customFields', newFields);
                }}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                + Add Custom Field
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Industry Settings</h1>
        <p className="text-gray-600 mt-2">Configure your business type and industry-specific settings</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center space-x-3 ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600" />
          )}
          <p className={message.type === 'success' ? 'text-green-700' : 'text-red-700'}>
            {message.text}
          </p>
        </div>
      )}

      <div className="space-y-8">
        {/* Industry Selection */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Building2 className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-semibold text-gray-900">Business Type</h3>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select your industry
            </label>
            <select
              value={selectedIndustry}
              onChange={(e) => handleIndustryChange(e.target.value as IndustryType)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {Object.entries(INDUSTRY_CONFIGS).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.displayName}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-2">
              This will customize your dashboard and AI assistant for your specific industry.
            </p>
          </div>
        </div>

        {/* Business Hours */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Clock className="w-6 h-6 text-green-600" />
            <h3 className="text-xl font-semibold text-gray-900">Business Hours</h3>
          </div>

          <div className="space-y-4">
            {Object.entries(settings.businessHours).map(([day, hours]) => (
              <div key={day} className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={!hours.closed}
                      onChange={(e) => handleBusinessHoursChange(day, 'closed', !e.target.checked)}
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
                      onChange={(e) => handleBusinessHoursChange(day, 'open', e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                    <span className="text-gray-500">to</span>
                    <input
                      type="time"
                      value={hours.close}
                      onChange={(e) => handleBusinessHoursChange(day, 'close', e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                ) : (
                  <span className="text-gray-500 text-sm">Closed</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Industry-Specific Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Settings className="w-6 h-6 text-purple-600" />
            <h3 className="text-xl font-semibold text-gray-900">
              {INDUSTRY_CONFIGS[selectedIndustry].displayName} Settings
            </h3>
          </div>

          {renderIndustrySpecificSettings()}
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Settings</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}