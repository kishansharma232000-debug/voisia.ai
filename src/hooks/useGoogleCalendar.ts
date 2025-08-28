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

interface AvailabilitySlot {
  date: string;
  startTime: string;
  endTime: string;
  available: boolean;
}

interface CalendarEvent {
  date: string;
  time: string;
  duration: number;
  title: string;
  description?: string;
}

interface BookingResponse {
  success: boolean;
  event?: {
    id: string;
    title: string;
    start: string;
    end: string;
    htmlLink: string;
  };
  error?: string;
}

/**
 * Custom React Hook: useGoogleCalendar
 * 
 * Manages Google Calendar integration with OAuth flow and API calls
 * Features:
 * - OAuth authentication with Google
 * - Connection status management
 * - Token management and refresh
 * - Calendar availability checking
 * - Event booking functionality
 */
export function useGoogleCalendar() {
  const { user, refreshUser } = useAuth();
  const [status, setStatus] = useState<GoogleCalendarStatus>({
    isConnected: false,
    isConnecting: false,
    error: null,
    calendarInfo: null,
  });

  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  /**
   * Check if user has valid Google tokens
   */
  const checkConnectionStatus = async () => {
    if (!user) return;

    try {
      const { data: tokens, error } = await supabase
        .from('google_tokens')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      const isConnected = !!tokens && new Date(tokens.expiry_date) > new Date();
      
      setStatus(prev => ({
        ...prev,
        isConnected,
        calendarInfo: isConnected ? {
          email: user.email,
          name: user.name,
          lastSync: tokens?.updated_at ? new Date(tokens.updated_at).toLocaleString() : undefined,
        } : null,
      }));
    } catch (err) {
      console.error('Error checking connection status:', err);
      setStatus(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to check connection status',
      }));
    }
  };

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

      // Initiate Google OAuth flow with calendar scopes
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          scopes: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events',
          redirectTo: `${window.location.origin}/google-calendar`,
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
      // The actual token handling will be done in handleOAuthCallback
      
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
   * Handle OAuth callback and store tokens
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
      const providerToken = session.provider_token;
      const providerRefreshToken = session.provider_refresh_token;
      
      if (providerToken && providerRefreshToken) {
        // Calculate expiry date (Google tokens typically expire in 1 hour)
        const expiryDate = new Date(Date.now() + (3600 * 1000)); // 1 hour from now

        // Store tokens in database
        const { error: upsertError } = await supabase
          .from('google_tokens')
          .upsert({
            user_id: user.id,
            access_token: providerToken,
            refresh_token: providerRefreshToken,
            expiry_date: expiryDate.toISOString(),
          });

        if (upsertError) {
          throw upsertError;
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

        // Update users_meta table
        await supabase
          .from('users_meta')
          .upsert({
            id: user.id,
            google_connected: true,
            updated_at: new Date().toISOString(),
          });

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
   * Disconnect Google Calendar
   */
  const disconnectCalendar = async () => {
    if (!user) return;

    try {
      setStatus(prev => ({ ...prev, error: null }));

      // Delete tokens from database
      const { error } = await supabase
        .from('google_tokens')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      // Update users_meta table
      await supabase
        .from('users_meta')
        .upsert({
          id: user.id,
          google_connected: false,
          updated_at: new Date().toISOString(),
        });

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
   * Fetch available time slots
   */
  const fetchAvailability = async () => {
    if (!user || !status.isConnected) return;

    try {
      setIsLoadingAvailability(true);
      setStatus(prev => ({ ...prev, error: null }));

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/calendar/availability`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch availability');
      }

      const data = await response.json();
      setAvailability(data.availableSlots || []);

    } catch (err) {
      console.error('Error fetching availability:', err);
      setStatus(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to fetch availability',
      }));
    } finally {
      setIsLoadingAvailability(false);
    }
  };

  /**
   * Book a calendar event
   */
  const bookEvent = async (eventData: CalendarEvent): Promise<BookingResponse> => {
    if (!user || !status.isConnected) {
      return { success: false, error: 'Calendar not connected' };
    }

    try {
      setIsBooking(true);
      setStatus(prev => ({ ...prev, error: null }));

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/calendar/book`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(eventData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to book event');
      }

      const data = await response.json();
      
      // Refresh availability after booking
      await fetchAvailability();
      
      return data;

    } catch (err) {
      console.error('Error booking event:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to book event';
      setStatus(prev => ({ ...prev, error: errorMessage }));
      return { success: false, error: errorMessage };
    } finally {
      setIsBooking(false);
    }
  };

  /**
   * Clear error state
   */
  const clearError = () => {
    setStatus(prev => ({ ...prev, error: null }));
  };

  // Check connection status when user changes
  useEffect(() => {
    if (user) {
      checkConnectionStatus();

      // Check if we just completed OAuth flow
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('code') && !status.isConnected) {
        handleOAuthCallback();
      }
    }
  }, [user]);

  return {
    ...status,
    availability,
    isLoadingAvailability,
    isBooking,
    connectCalendar,
    disconnectCalendar,
    fetchAvailability,
    bookEvent,
    clearError,
    refreshStatus: checkConnectionStatus,
  };
}