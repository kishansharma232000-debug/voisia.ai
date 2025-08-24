import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface AssistantStatus {
  hasAssistant: boolean;
  assistantId: string | null;
  createdAt: string | null;
  isLoading: boolean;
  error: string | null;
}

export function useAssistantStatus() {
  const { user } = useAuth();
  const [status, setStatus] = useState<AssistantStatus>({
    hasAssistant: false,
    assistantId: null,
    createdAt: null,
    isLoading: true,
    error: null,
  });

  const checkAssistantStatus = async () => {
    if (!user) {
      setStatus(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      setStatus(prev => ({ ...prev, isLoading: true, error: null }));

      const { data, error } = await supabase
        .from('users_meta')
        .select('assistant_id, assistant_created_at')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        throw error;
      }

      setStatus({
        hasAssistant: !!(data?.assistant_id),
        assistantId: data?.assistant_id || null,
        createdAt: data?.assistant_created_at || null,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      console.error('Error checking assistant status:', err);
      setStatus(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to check assistant status',
      }));
    }
  };

  const refreshStatus = () => {
    checkAssistantStatus();
  };

  useEffect(() => {
    checkAssistantStatus();
  }, [user]);

  return {
    ...status,
    refreshStatus,
  };
}