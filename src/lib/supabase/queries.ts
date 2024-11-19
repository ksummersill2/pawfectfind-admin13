import { supabase } from './client';

export const ensureProfile = async (userId: string, email: string, metadata?: any) => {
  try {
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    if (!existingProfile) {
      const { error: insertError } = await supabase
        .from('profiles')
        .insert([{
          id: userId,
          email,
          display_name: metadata?.full_name || metadata?.name || email.split('@')[0],
          avatar_url: metadata?.avatar_url || metadata?.picture,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (insertError) throw insertError;
    }

    return true;
  } catch (err) {
    console.error('Error ensuring profile:', err);
    return false;
  }
};

export const fetchFromSupabase = async <T>(
  query: Promise<{ data: T | null; error: any }>,
  retries = 3,
  delay = 1000
): Promise<T> => {
  let lastError;
  
  for (let i = 0; i < retries; i++) {
    try {
      const { data, error } = await query;
      
      if (error) throw error;
      if (!data) throw new Error('No data returned from Supabase query');
      
      return data;
    } catch (err) {
      lastError = err;
      console.error(`Supabase query attempt ${i + 1} failed:`, err);
      
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
        continue;
      }
      
      break;
    }
  }
  
  console.error('Supabase query failed after all retries:', lastError);
  throw lastError;
};

// Database functions
export const beginTransaction = async () => {
  return await supabase.rpc('begin_transaction');
};

export const commitTransaction = async () => {
  return await supabase.rpc('commit_transaction');
};

export const rollbackTransaction = async () => {
  return await supabase.rpc('rollback_transaction');
};