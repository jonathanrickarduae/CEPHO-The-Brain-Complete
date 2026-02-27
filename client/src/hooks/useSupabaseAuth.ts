import { supabase } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

export function useSupabaseAuth() {
  // BYPASS AUTH FOR DEVELOPMENT - Always return authenticated user
  const mockUser = {
    id: 'dev-user',
    email: 'dev@cepho.ai',
    aud: 'authenticated',
    role: 'authenticated',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    app_metadata: {},
    user_metadata: {},
  } as User;

  return {
    user: mockUser,
    session: { user: mockUser } as Session,
    loading: false,
    isAuthenticated: true,
    signIn: async () => ({ data: null, error: null }),
    signUp: async () => ({ data: null, error: null }),
    signOut: async () => ({ error: null }),
  };
}
