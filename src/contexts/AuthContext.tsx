import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

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

  const fetchUserMeta = async (userId: string) => {
    const { data, error } = await supabase
      .from('users_meta')
      .select('clinic_name, phone_number, clinic_connected, plan, assistant_active')
      .eq('id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error fetching user meta:', error);
      return null;
    }
    
    return data;
  };

  const createUserObject = async (supabaseUser: any) => {
    const userMeta = await fetchUserMeta(supabaseUser.id);
    
    return {
      id: supabaseUser.id,
      name: supabaseUser.email?.split('@')[0] || 'User',
      email: supabaseUser.email || '',
      clinicName: userMeta?.clinic_name,
      phoneNumber: userMeta?.phone_number,
      clinicConnected: userMeta?.clinic_connected || false,
      plan: userMeta?.plan || null,
      assistantActive: userMeta?.assistant_active || false,
      googleConnected: false,
      timezone: 'America/New_York',
      language: 'English',
      voiceStyle: 'Friendly'
    };
  };

  const refreshUser = async () => {
    const { data: { user: supabaseUser } } = await supabase.auth.getUser();
    if (supabaseUser) {
      const updatedUser = await createUserObject(supabaseUser);
      setUser(updatedUser);
    }
  };

  useEffect(() => {
    // Check for existing Supabase session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const userObj = await createUserObject(session.user);
        setUser(userObj);
      }
      setIsLoading(false);
    };
    
    getSession();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const userObj = await createUserObject(session.user);
          setUser(userObj);
        } else {
          setUser(null);
        }
      }
    );
    
    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    setIsLoading(false);
  };

  const signup = async (userData: any) => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
    });
    if (error) throw error;
    setIsLoading(false);
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

  const logout = () => {
    supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, refreshUser, updateAssistantStatus, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}