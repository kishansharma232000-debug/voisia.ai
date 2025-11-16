import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { IndustryType, IndustrySettings } from '../types/industry';

interface User {
  id: string;
  name: string;
  email: string;
  clinicName?: string;
  phoneNumber?: string;
  clinicConnected?: boolean;
  plan: string | null;
  assistantActive?: boolean;
  googleConnected?: boolean;
  timezone?: string;
  language?: string;
  voiceStyle?: string;
  hasVapiAssistant?: boolean;
  industryType?: IndustryType;
  industrySettings?: IndustrySettings;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: any) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateAssistantStatus: (active: boolean) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserMeta = async (userId: string, timeoutMs: number = 5000) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const { data, error } = await supabase
        .from('users_meta')
        .select('clinic_name, phone_number, clinic_connected, plan, assistant_active, google_connected, industry_type, industry_settings')
        .eq('id', userId)
        .maybeSingle();

      clearTimeout(timeoutId);

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user meta:', error);
        return null;
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Timeout or error fetching user meta:', error);
      return null;
    }
  };

  const createUserObject = (supabaseUser: any, userMeta: any = null) => {
    return {
      id: supabaseUser.id,
      name: supabaseUser.email?.split('@')[0] || 'User',
      email: supabaseUser.email || '',
      clinicName: userMeta?.clinic_name,
      phoneNumber: userMeta?.phone_number,
      clinicConnected: userMeta?.clinic_connected || false,
      plan: userMeta?.plan || null,
      assistantActive: userMeta?.assistant_active || false,
      googleConnected: userMeta?.google_connected || false,
      timezone: 'America/New_York',
      language: 'English',
      voiceStyle: 'Friendly',
      hasVapiAssistant: false,
      industryType: userMeta?.industry_type || 'clinic',
      industrySettings: userMeta?.industry_settings || {}
    };
  };

  const loadUserMetaInBackground = async (userId: string) => {
    const userMeta = await fetchUserMeta(userId);
    setUser(prev => {
      if (!prev || prev.id !== userId) return prev;
      return {
        ...prev,
        clinicName: userMeta?.clinic_name || prev.clinicName,
        phoneNumber: userMeta?.phone_number || prev.phoneNumber,
        clinicConnected: userMeta?.clinic_connected || prev.clinicConnected,
        plan: userMeta?.plan || prev.plan,
        assistantActive: userMeta?.assistant_active || prev.assistantActive,
        googleConnected: userMeta?.google_connected || prev.googleConnected,
        industryType: userMeta?.industry_type || prev.industryType,
        industrySettings: userMeta?.industry_settings || prev.industrySettings
      };
    });
  };

  const refreshUser = async () => {
    const { data: { user: supabaseUser } } = await supabase.auth.getUser();
    if (supabaseUser) {
      const basicUser = createUserObject(supabaseUser);
      setUser(basicUser);
      loadUserMetaInBackground(supabaseUser.id);
    }
  };

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const basicUser = createUserObject(session.user);
          setUser(basicUser);
          loadUserMetaInBackground(session.user.id);
        }
      } catch (error) {
        console.error('Error loading session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        (async () => {
          if (event === 'SIGNED_OUT' || !session?.user) {
            setUser(null);
            localStorage.removeItem('voisiaai-auth');
            if (event === 'SIGNED_OUT') {
              window.location.href = '/login?message=Session+expired.+Please+log+in+again.';
            }
          } else if (session?.user) {
            const basicUser = createUserObject(session.user);
            setUser(basicUser);
            loadUserMetaInBackground(session.user.id);
          }
        })();
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    let lastError = null;

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          lastError = error;
          continue;
        }

        return;
      } catch (error: any) {
        lastError = error;

        if (attempt === 0 && error?.message?.includes('fetch failed')) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue;
        }
        throw error;
      }
    }

    if (lastError) throw lastError;
  };

  const signup = async (userData: any) => {
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
    });

    if (error) {
      if (error.message?.includes('already registered') ||
          error.message?.includes('User already exists')) {
        const dupError = new Error('An account with this email already exists. Please log in instead.');
        (dupError as any).code = 'USER_EXISTS';
        throw dupError;
      }
      throw error;
    }
  };

  const updateAssistantStatus = async (active: boolean) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('users_meta')
        .upsert({
          id: user.id,
          assistant_active: active,
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      // Update local user state
      const updatedUser = { ...user, assistantActive: active };
      setUser(updatedUser);
    } catch (error) {
      console.error('Error updating assistant status:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
    setUser(null);
    localStorage.removeItem('voisiaai-auth');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, refreshUser, updateAssistantStatus, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}