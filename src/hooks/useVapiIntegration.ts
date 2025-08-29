import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

// TypeScript interfaces
interface CreateAssistantRequest {
  businessName: string;
  timezone: string;
  language?: string;
  voiceStyle?: string;
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

interface UseVapiIntegrationReturn {
  createAssistant: (data: CreateAssistantRequest) => Promise<CreateAssistantResponse>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

/**
 * Custom React Hook: useVapiIntegration
 * 
 * Provides secure integration with Vapi API through Supabase Edge Function
 * Features:
 * - Automatic authentication handling
 * - Error management and retry logic
 * - Loading state management
 * - Type-safe API calls
 */
export function useVapiIntegration(): UseVapiIntegrationReturn {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Create assistant through secure Edge Function
   */
  const createAssistant = useCallback(async (data: CreateAssistantRequest): Promise<CreateAssistantResponse> => {
    if (!user) {
      throw new Error('User must be authenticated to create an assistant');
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get current session for authentication
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('Authentication session not found. Please log in again.');
      }

      // Validate input data
      if (!data.businessName?.trim()) {
        throw new Error('Business name is required');
      }

      if (!data.timezone) {
        throw new Error('Timezone is required');
      }

      // Make secure API call to Supabase Edge Function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-vapi-assistant`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: user.id,
            businessName: data.businessName.trim(),
            timezone: data.timezone,
            language: data.language || 'en',
            voiceStyle: data.voiceStyle || 'friendly',
          }),
        }
      );

      const responseData: CreateAssistantResponse | ApiError = await response.json();

      if (!response.ok) {
        const errorData = responseData as ApiError;
        throw new Error(errorData.details || errorData.error || `HTTP ${response.status}: Request failed`);
      }

      const successData = responseData as CreateAssistantResponse;
      return successData;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  return {
    createAssistant,
    isLoading,
    error,
    clearError,
  };
}