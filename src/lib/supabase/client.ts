import { createClient } from '@supabase/supabase-js';
import type { Database } from '../database.types';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

// Validate required environment variables
if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file.'
  );
}

// Create regular client for user operations with session persistence
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storage: localStorage,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});

// Create admin client with service role for admin operations
export const adminSupabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storage: localStorage,
    storageKey: 'sb-admin-token',
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});

export { supabaseUrl, supabaseAnonKey, supabaseServiceKey };