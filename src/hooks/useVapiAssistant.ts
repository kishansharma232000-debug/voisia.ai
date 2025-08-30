import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { CreateAssistantRequest, UpdateAssistantRequest } from '../types/vapi';

interface Assistant {
  id: string;
  user_id: string;
  vapi_assistant_id: string;
  business_name: string;
  timezone: string;
  created_at: string;
}

interface UseVapiAssistantReturn {
  assistant: Assistant | null;
  isLoading: boolean;
  error: string | null;
  createAssistant: (businessName: string, timezone: string) => Promise<void>;
  updateAssistant: (businessName: string, timezone: string) => Promise<void>;
  refreshAssistant: () => Promise<void>;
}

export function useVapiAssistant(): UseVapiAssistantReturn {
  const [assistant, setAssistant] = useState<Assistant | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchAssistant = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('assistants')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      setAssistant(data || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch assistant');
    } finally {
      setIsLoading(false);
    }
  };

  const createAssistant = async (businessName: string, timezone: string) => {
    if (!user) throw new Error('User not authenticated');

    // Validate inputs
    if (!businessName.trim()) {
      throw new Error('Business name is required');
    }
    if (businessName.trim().length < 2 || businessName.trim().length > 100) {
      throw new Error('Business name must be between 2 and 100 characters');
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      // Create assistant with calendar integration
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
            business_name: businessName,
            timezone: timezone,
            calendar_integration: true,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create assistant');
      }

      const result = await response.json();
      
      // Refresh assistant data
      await fetchAssistant();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create assistant');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateAssistant = async (businessName: string, timezone: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      setIsLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/update-vapi-assistant`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: user.id,
            business_name: businessName,
            timezone: timezone,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update assistant');
      }

      const result = await response.json();
      setAssistant(result.assistant);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update assistant');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAssistant = async () => {
    await fetchAssistant();
  };

  useEffect(() => {
    if (user) {
      fetchAssistant();
    }
  }, [user]);

  return {
    assistant,
    isLoading,
    error,
    createAssistant,
    updateAssistant,
    refreshAssistant,
  };
}