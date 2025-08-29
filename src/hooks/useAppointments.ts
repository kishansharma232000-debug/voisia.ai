import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Appointment, AppointmentStats, AppointmentFilters } from '../types/appointments';

interface UseAppointmentsReturn {
  appointments: Appointment[];
  stats: AppointmentStats;
  isLoading: boolean;
  error: string | null;
  filters: AppointmentFilters;
  setFilters: (filters: AppointmentFilters) => void;
  refreshAppointments: () => Promise<void>;
  cancelAppointment: (appointmentId: string) => Promise<void>;
  markCompleted: (appointmentId: string) => Promise<void>;
}

/**
 * Custom React Hook: useAppointments
 * 
 * Manages appointment data with filtering, stats, and actions
 * Features:
 * - Real-time appointment fetching
 * - Filtering by status and date range
 * - Statistics calculation
 * - Appointment status updates
 * - Error handling and loading states
 */
export function useAppointments(): UseAppointmentsReturn {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<AppointmentStats>({
    total: 0,
    thisWeek: 0,
    thisMonth: 0,
    pending: 0,
    completed: 0,
    cancelled: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AppointmentFilters>({
    status: 'all',
    dateRange: 'all',
    search: '',
  });

  /**
   * Fetch appointments with filters
   */
  const fetchAppointments = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      let query = supabase
        .from('appointments')
        .select('*')
        .eq('user_id', user.id)
        .order('start_time', { ascending: false });

      // Apply status filter
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      // Apply date range filter
      if (filters.dateRange && filters.dateRange !== 'all') {
        const now = new Date();
        let startDate: Date;

        switch (filters.dateRange) {
          case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
          case 'week':
            startDate = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
            break;
          case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
          default:
            startDate = new Date(0);
        }

        query = query.gte('start_time', startDate.toISOString());
      }

      // Apply search filter
      if (filters.search) {
        query = query.or(`caller_name.ilike.%${filters.search}%,caller_number.ilike.%${filters.search}%`);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      setAppointments(data || []);
      calculateStats(data || []);

    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch appointments');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Calculate appointment statistics
   */
  const calculateStats = (appointmentData: Appointment[]) => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const newStats: AppointmentStats = {
      total: appointmentData.length,
      thisWeek: appointmentData.filter(apt => new Date(apt.start_time) >= weekAgo).length,
      thisMonth: appointmentData.filter(apt => new Date(apt.start_time) >= monthStart).length,
      pending: appointmentData.filter(apt => apt.status === 'booked').length,
      completed: appointmentData.filter(apt => apt.status === 'completed').length,
      cancelled: appointmentData.filter(apt => apt.status === 'cancelled').length,
    };

    setStats(newStats);
  };

  /**
   * Cancel an appointment
   */
  const cancelAppointment = async (appointmentId: string) => {
    if (!user) return;

    try {
      setError(null);

      const { error: updateError } = await supabase
        .from('appointments')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', appointmentId)
        .eq('user_id', user.id);

      if (updateError) {
        throw updateError;
      }

      // Refresh appointments
      await fetchAppointments();

    } catch (err) {
      console.error('Error cancelling appointment:', err);
      setError(err instanceof Error ? err.message : 'Failed to cancel appointment');
      throw err;
    }
  };

  /**
   * Mark appointment as completed
   */
  const markCompleted = async (appointmentId: string) => {
    if (!user) return;

    try {
      setError(null);

      const { error: updateError } = await supabase
        .from('appointments')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', appointmentId)
        .eq('user_id', user.id);

      if (updateError) {
        throw updateError;
      }

      // Refresh appointments
      await fetchAppointments();

    } catch (err) {
      console.error('Error marking appointment as completed:', err);
      setError(err instanceof Error ? err.message : 'Failed to update appointment');
      throw err;
    }
  };

  /**
   * Refresh appointments data
   */
  const refreshAppointments = async () => {
    await fetchAppointments();
  };

  // Fetch appointments when user or filters change
  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user, filters]);

  return {
    appointments,
    stats,
    isLoading,
    error,
    filters,
    setFilters,
    refreshAppointments,
    cancelAppointment,
    markCompleted,
  };
}