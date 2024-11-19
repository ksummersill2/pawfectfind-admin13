import { useState, useEffect } from 'react';
import { adminSupabase } from '../../lib/supabase/client';
import { AdminCategory } from '../types';

export const useAdminCategories = (type: 'blog' | 'product' = 'product') => {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await adminSupabase
        .from('categories')
        .select('*')
        .eq('type', type)
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

  const saveCategory = async (category: Omit<AdminCategory, 'id' | 'created_at' | 'updated_at'>): Promise<void> => {
    try {
      const timestamp = new Date().toISOString();
      const categoryId = crypto.randomUUID();

      const { error } = await adminSupabase
        .from('categories')
        .insert([{
          id: categoryId,
          ...category,
          type,
          created_at: timestamp,
          updated_at: timestamp
        }]);

      if (error) throw error;
      await fetchCategories();
    } catch (err) {
      console.error('Error saving category:', err);
      throw new Error('Failed to save category');
    }
  };

  const deleteCategory = async (categoryId: string): Promise<boolean> => {
    try {
      const { error } = await adminSupabase
        .from('categories')
        .delete()
        .eq('id', categoryId)
        .eq('type', type);

      if (error) throw error;
      await fetchCategories();
      return true;
    } catch (err) {
      console.error('Error deleting category:', err);
      throw new Error('Failed to delete category');
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [type]);

  return {
    categories,
    loading,
    error,
    saveCategory,
    deleteCategory,
    refreshCategories: fetchCategories
  };
};

export default useAdminCategories;