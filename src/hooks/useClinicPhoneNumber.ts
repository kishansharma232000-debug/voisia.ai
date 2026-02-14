import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface ClinicNumber {
  id: string;
  user_id: string;
  telnyx_number: string;
  telnyx_number_id: string;
  status: 'active' | 'inactive';
  created_at: string;
}

export function useClinicPhoneNumber(userId?: string) {
  const [clinicNumber, setClinicNumber] = useState<ClinicNumber | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClinicNumber = async (uid: string) => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('clinic_numbers')
        .select('*')
        .eq('user_id', uid)
        .maybeSingle();

      if (fetchError) throw fetchError;
      setClinicNumber(data);
    } catch (err: any) {
      console.error('Error fetching clinic number:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchClinicNumber(userId);
    }
  }, [userId]);

  const purchasePhoneNumber = async (uid: string) => {
    try {
      setLoading(true);
      setError(null);

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/buy-telnyx-number`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${anonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: uid }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to purchase phone number');
      }

      const result = await response.json();

      if (result.success) {
        await fetchClinicNumber(uid);
      }

      return result;
    } catch (err: any) {
      console.error('Error purchasing phone number:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePhoneNumberStatus = async (status: 'active' | 'inactive') => {
    if (!clinicNumber) return;

    try {
      setLoading(true);
      setError(null);

      const { error: updateError } = await supabase
        .from('clinic_numbers')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', clinicNumber.id);

      if (updateError) throw updateError;

      setClinicNumber({ ...clinicNumber, status });
    } catch (err: any) {
      console.error('Error updating phone number status:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    clinicNumber,
    loading,
    error,
    purchasePhoneNumber,
    updatePhoneNumberStatus,
    refetch: fetchClinicNumber,
  };
}
