import React, { useState } from 'react';
import { Bot, Loader2, CheckCircle, AlertCircle, Building, Globe, Clock, Mic } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

// TypeScript interfaces for type safety
interface FormData {
  businessName: string;
  timezone: string;
  language: string;
  voiceStyle: string;
}

interface CreateAssistantResponse {
  success: boolean;
  assistant: {
    id: string;
    name: string;
    timezone: string;
  };
  assistantId: string;
  message: string;
}

interface ApiError {
  error: string;
  details?: string;
}

/**
 * AssistantSignupForm Component
 * 
 * Secure form for creating AI assistants through Supabase Edge Function
 * Features:
 * - Client-side validation
 * - Secure API communication (no exposed credentials)
 * - Loading states and error handling
 * - Success feedback with assistant details
 */
export default function AssistantSignupForm() {
  const { user } = useAuth();
  
  // Form state management
  const [formData, setFormData] = useState<FormData>({
    businessName: '',
    timezone: 'America/New_York',
    language: 'en',
    voiceStyle: 'friendly'
  });

  // UI state management
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [assistantId, setAssistantId] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Partial<FormData>>({});

  /**
   * Client-side form validation
   */
  const validateForm = (): boolean => {
    const errors: Partial<FormData> = {};

    // Business name validation
    if (!formData.businessName.trim()) {
      errors.businessName = 'Business name is required';
    } else if (formData.businessName.trim().length < 2) {
      errors.businessName = 'Business name must be at least 2 characters';
    } else if (formData.businessName.trim().length > 100) {
      errors.businessName = 'Business name must be less than 100 characters';
    }

    // Timezone validation
    if (!formData.timezone) {
      errors.timezone = 'Timezone is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Handle input changes with real-time validation
   */
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
    // Clear global error/success messages
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  /**
   * Submit form to Supabase Edge Function
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Authentication check
    if (!user) {
      setError('You must be logged in to create an assistant');
      return;
    }

    // Client-side validation
    if (!validateForm()) {
      setError('Please fix the validation errors above');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Get current session for authentication
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('Authentication session not found. Please log in again.');
      }

      // Make secure API call to Supabase Edge Function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/vapi-proxy`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            businessName: formData.businessName.trim(),
            timezone: formData.timezone,
            language: formData.language,
            voiceStyle: formData.voiceStyle,
          }),
        }
      );

      const data: CreateAssistantResponse | ApiError = await response.json();

      if (!response.ok) {
        const errorData = data as ApiError;
        throw new Error(errorData.details || errorData.error || `HTTP ${response.status}: Request failed`);
      }

      const successData = data as CreateAssistantResponse;
      
      // Handle success
      setSuccess(successData.message || 'Assistant created successfully!');
      setAssistantId(successData.assistantId);
      
      // Reset form
      setFormData({
        businessName: '',
        timezone: 'America/New_York',
        language: 'en',
        voiceStyle: 'friendly'
      });

    } catch (err) {
      console.error('Error creating assistant:', err);
      
      // Handle specific error types
      if (err instanceof Error) {
        if (err.message.includes('Rate limit')) {
          setError('Rate limit exceeded. Please try again in a few minutes.');
        } else if (err.message.includes('already exists')) {
          setError('You already have an assistant created.');
        } else if (err.message.includes('Authentication')) {
          setError('Authentication failed. Please log in again.');
        } else if (err.message.includes('Network')) {
          setError('Network error. Please check your connection and try again.');
        } else {
          setError(err.message);
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render if user is not authenticated
  if (!user) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <Bot className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-medium mb-4">Please log in to create an AI assistant</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Bot className="w-6 h-6 text-blue-600" />
        <h3 className="text-xl font-semibold text-gray-900">Create Your AI Assistant</h3>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <div>
            <p className="text-green-700 font-medium">{success}</p>
            {assistantId && (
              <p className="text-green-600 text-sm mt-1">
                Assistant ID: <code className="bg-green-100 px-2 py-1 rounded text-xs">{assistantId}</code>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Business Name */}
        <div>
          <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
            <Building className="w-4 h-4 inline mr-2" />
            Business Name *
          </label>
          <input
            id="businessName"
            type="text"
            value={formData.businessName}
            onChange={(e) => handleInputChange('businessName', e.target.value)}
            placeholder="Enter your business name"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
              validationErrors.businessName ? 'border-red-300' : 'border-gray-300'
            }`}
            disabled={isLoading}
            required
            maxLength={100}
          />
          {validationErrors.businessName && (
            <p className="text-red-600 text-sm mt-1">{validationErrors.businessName}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            This will be used as your assistant's name (2-100 characters)
          </p>
        </div>

        {/* Timezone */}
        <div>
          <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-2">
            <Globe className="w-4 h-4 inline mr-2" />
            Timezone *
          </label>
          <select
            id="timezone"
            value={formData.timezone}
            onChange={(e) => handleInputChange('timezone', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
              validationErrors.timezone ? 'border-red-300' : 'border-gray-300'
            }`}
            disabled={isLoading}
            required
          >
            <option value="America/New_York">Eastern Time (ET)</option>
            <option value="America/Chicago">Central Time (CT)</option>
            <option value="America/Denver">Mountain Time (MT)</option>
            <option value="America/Los_Angeles">Pacific Time (PT)</option>
            <option value="America/Phoenix">Arizona Time (MST)</option>
            <option value="America/Anchorage">Alaska Time (AKST)</option>
            <option value="Pacific/Honolulu">Hawaii Time (HST)</option>
            <option value="Europe/London">London (GMT)</option>
            <option value="Europe/Paris">Paris (CET)</option>
            <option value="Asia/Tokyo">Tokyo (JST)</option>
            <option value="Australia/Sydney">Sydney (AEDT)</option>
          </select>
          {validationErrors.timezone && (
            <p className="text-red-600 text-sm mt-1">{validationErrors.timezone}</p>
          )}
        </div>

        {/* Language */}
        <div>
          <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
            <Clock className="w-4 h-4 inline mr-2" />
            Language
          </label>
          <select
            id="language"
            value={formData.language}
            onChange={(e) => handleInputChange('language', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="it">Italian</option>
            <option value="pt">Portuguese</option>
          </select>
        </div>

        {/* Voice Style */}
        <div>
          <label htmlFor="voiceStyle" className="block text-sm font-medium text-gray-700 mb-2">
            <Mic className="w-4 h-4 inline mr-2" />
            Voice Style
          </label>
          <select
            id="voiceStyle"
            value={formData.voiceStyle}
            onChange={(e) => handleInputChange('voiceStyle', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
          >
            <option value="friendly">Friendly</option>
            <option value="professional">Professional</option>
            <option value="energetic">Energetic</option>
            <option value="calm">Calm</option>
            <option value="authoritative">Authoritative</option>
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !formData.businessName.trim()}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Creating Assistant...</span>
            </>
          ) : (
            <>
              <Bot className="w-5 h-5" />
              <span>Create My Assistant</span>
            </>
          )}
        </button>
      </form>

      {/* Security Notice */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-blue-800 text-sm">
          <strong>🔒 Secure:</strong> Your assistant is created using encrypted API calls. 
          All sensitive operations are handled securely on our backend servers.
        </p>
      </div>

      {/* Feature List */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-900 mb-3">Your AI Assistant will be able to:</h4>
        <ul className="text-gray-700 text-sm space-y-1">
          <li>• Answer calls 24/7 in your chosen language</li>
          <li>• Book appointments in real-time</li>
          <li>• Handle common customer inquiries</li>
          <li>• Sync with your calendar automatically</li>
          <li>• Provide professional customer service</li>
        </ul>
      </div>
    </div>
  );
}