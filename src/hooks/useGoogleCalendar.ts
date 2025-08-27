import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface GoogleCalendarStatus {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  calendarInfo: {
    email?: string;
    name?: string;
    lastSync?: string;
  } | null;
}

/**
 * Custom React Hook: useGoogleCalendar
 * 
 * Manages Google Calendar integration with OAuth flow
 * Features:
 * - OAuth authentication with Google
 * - Connection status management
 * - Database updates for connection state
 * - Error handling and loading states
 */
export function useGoogleCalendar() {
  const { user, refreshUser } = useAuth();
  const [status, setStatus] = useState<GoogleCalendarStatus>({
    isConnected: !!user?.googleConnected,
    isConnecting: false,
    error: null,
    calendarInfo: null,
  });

  /**
   * Initiate Google Calendar connection via OAuth
   */
  const connectCalendar = async () => {
    if (!user) {
      setStatus(prev => ({ ...prev, error: 'User must be authenticated' }));
      return;
    }

    try {
      setStatus(prev => ({ ...prev, isConnecting: true, error: null }));

      // Initiate Google OAuth flow
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          scopes: 'https://www.googleapis.com/auth/calendar',
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        throw error;
      }

      // OAuth flow initiated successfully
      // The actual connection will be handled in the OAuth callback
      
    } catch (err) {
      console.error('Error connecting Google Calendar:', err);
      setStatus(prev => ({
        ...prev,
        isConnecting: false,
        error: err instanceof Error ? err.message : 'Failed to connect Google Calendar',
      }));
    }
  };

  /**
   * Disconnect Google Calendar
   */
  const disconnectCalendar = async () => {
    if (!user) return;

    try {
      setStatus(prev => ({ ...prev, error: null }));

      // Update database to mark as disconnected
      const { error } = await supabase
        .from('users_meta')
        .upsert({
          id: user.id,
          google_connected: false,
          google_refresh_token: null,
          google_calendar_id: null,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        throw error;
      }

      // Update local state
      setStatus(prev => ({
        ...prev,
        isConnected: false,
        calendarInfo: null,
      }));

      // Refresh user data
      await refreshUser();

    } catch (err) {
      console.error('Error disconnecting Google Calendar:', err);
      setStatus(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to disconnect Google Calendar',
      }));
    }
  };

  /**
   * Handle OAuth callback and update connection status
   */
  const handleOAuthCallback = async () => {
    if (!user) return;

    try {
      // Get the current session which should include Google tokens
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('No valid session found');
      }

      // Check if we have Google provider token
      const googleProvider = session.user.app_metadata?.providers?.includes('google');
      
      if (googleProvider) {
        // Update database to mark as connected
        const { error } = await supabase
          .from('users_meta')
          .upsert({
            id: user.id,
            google_connected: true,
            google_refresh_token: session.provider_refresh_token,
            updated_at: new Date().toISOString(),
          });

        if (error) {
          throw error;
        }

        // Update local state
        setStatus(prev => ({
          ...prev,
          isConnected: true,
          isConnecting: false,
          calendarInfo: {
            email: session.user.email,
            name: session.user.user_metadata?.full_name,
            lastSync: new Date().toLocaleString(),
          },
        }));

        // Refresh user data
        await refreshUser();
      }

    } catch (err) {
      console.error('Error handling OAuth callback:', err);
      setStatus(prev => ({
        ...prev,
        isConnecting: false,
        error: err instanceof Error ? err.message : 'Failed to complete Google Calendar connection',
      }));
    }
  };

  /**
   * Clear error state
   */
  const clearError = () => {
    setStatus(prev => ({ ...prev, error: null }));
  };

  // Update connection status when user changes
  useEffect(() => {
    if (user) {
      setStatus(prev => ({
        ...prev,
        isConnected: !!user.googleConnected,
      }));

      // Check if we just completed OAuth flow
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('code') && !user.googleConnected) {
        handleOAuthCallback();
      }
    }
  }, [user]);

  return {
    ...status,
    connectCalendar,
    disconnectCalendar,
    clearError,
  };
}