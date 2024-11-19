import { useState } from 'react';
import { adminSupabase } from '../../lib/supabase/client';
import { BreedArticle, ArticleFormData } from '../types';

export const useBreedArticles = (breedId: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchArticles = async (): Promise<BreedArticle[]> => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await adminSupabase
        .from('breed_articles')
        .select('*')
        .eq('breed_id', breedId)
        .order('is_featured', { ascending: false })
        .order('published_date', { ascending: false });

      if (fetchError) throw fetchError;
      return data || [];
    } catch (err) {
      console.error('Error fetching breed articles:', err);
      setError('Failed to load articles');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const saveArticle = async (data: ArticleFormData & { id?: string }): Promise<void> => {
    try {
      setLoading(true);
      const timestamp = new Date().toISOString();

      if (data.id) {
        const { error: updateError } = await adminSupabase
          .from('breed_articles')
          .update({
            ...data,
            updated_at: timestamp
          })
          .eq('id', data.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await adminSupabase
          .from('breed_articles')
          .insert([{
            ...data,
            breed_id: breedId,
            created_at: timestamp,
            updated_at: timestamp
          }]);

        if (insertError) throw insertError;
      }
    } catch (err) {
      console.error('Error saving article:', err);
      throw new Error('Failed to save article');
    } finally {
      setLoading(false);
    }
  };

  const deleteArticle = async (articleId: string): Promise<void> => {
    try {
      setLoading(true);
      const { error } = await adminSupabase
        .from('breed_articles')
        .delete()
        .eq('id', articleId);

      if (error) throw error;
    } catch (err) {
      console.error('Error deleting article:', err);
      throw new Error('Failed to delete article');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    fetchArticles,
    saveArticle,
    deleteArticle
  };
};

export default useBreedArticles;