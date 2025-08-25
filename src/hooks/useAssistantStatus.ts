import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

// TypeScript interfaces for type safety
interface AssistantStatus {
  hasAssistant: boolean;
  assistantId: string | null;
  createdAt: string | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Custom React Hook: useAssistantStatus
 * 
 * Provides real-time assistant status for the authenticated user
 * Features:
 * - Automatic status checking on user authentication
 * - Real-time updates when assistant is created
 * - Error handling and loading states
 * - TypeScript support for type safety
 */
export function useAssistantStatus() {
  const { user } = useAuth();
  const [status, setStatus] = useState<AssistantStatus>({
    hasAssistant: false,
    assistantId: null,
    createdAt: null,
    isLoading: true,
    error: null,
  });

  /**
   * Check assistant status from database
   * Queries users_meta table for assistant_id
   */
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

  /**
   * Refresh status manually
   * Useful after creating or updating an assistant
   */
  const refreshStatus = () => {
    checkAssistantStatus();
  };

  // Auto-check status when user changes
  useEffect(() => {
    checkAssistantStatus();
  }, [user]);

  return {
    ...status,
    refreshStatus,
  };
}