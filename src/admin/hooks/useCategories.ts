import { useState, useEffect } from 'react';
import { adminSupabase } from '../../lib/supabase/client';
import { AdminCategory } from '../types';

export const useCategories = () => {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await adminSupabase
        .from('categories')
        .select('*')
        .order('name');

      if (fetchError) throw fetchError;
      setCategories(data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    refreshCategories: fetchCategories
  };
};