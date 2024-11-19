import { useState, useEffect } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase/client';
import { ADMIN_EMAILS } from '../../lib/constants';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        
        setSession(session);
        setUser(session?.user ?? null);
      } catch (err) {
        console.error('Error getting session:', err);
        setError(err instanceof Error ? err.message : 'Failed to get session');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      setIsLoading(true);

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) {
        if (signInError instanceof AuthError) {
          switch (signInError.status) {
            case 400:
              throw new Error('Invalid email or password');
            case 422:
              throw new Error('Email and password are required');
            case 429:
              throw new Error('Too many login attempts. Please try again later');
            default:
              throw new Error('Failed to sign in. Please try again');
          }
        }
        throw signInError;
      }

      // Verify the user is an admin
      if (!data.user?.email || !ADMIN_EMAILS.includes(data.user.email)) {
        await supabase.auth.signOut();
        throw new Error('Unauthorized access');
      }

      return data;
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign in');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setError(null);
      setIsLoading(true);
      
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;
      
      setUser(null);
      setSession(null);
    } catch (err) {
      console.error('Logout error:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign out');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    session,
    isLoading,
    error,
    login,
    logout,
    isAdmin: user?.email ? ADMIN_EMAILS.includes(user.email) : false
  };
};

export default useAuth;