import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { AdminArticle } from '../types';

export const useAdminArticles = () => {
  const [articles, setArticles] = useState<AdminArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setArticles(data || []);
    } catch (err) {
      console.error('Error fetching articles:', err);
      setError('Failed to load articles');
    } finally {
      setLoading(false);
    }
  };

  const saveArticle = async (article: AdminArticle): Promise<void> => {
    try {
      const timestamp = new Date().toISOString();
      
      if (article.id) {
        const { error } = await supabase
          .from('articles')
          .update({
            ...article,
            updated_at: timestamp
          })
          .eq('id', article.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('articles')
          .insert([{
            ...article,
            created_at: timestamp,
            updated_at: timestamp
          }]);

        if (error) throw error;
      }

      await fetchArticles();
    } catch (err) {
      console.error('Error saving article:', err);
      throw new Error('Failed to save article');
    }
  };

  const deleteArticle = async (articleId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', articleId);

      if (error) throw error;
      await fetchArticles();
    } catch (err) {
      console.error('Error deleting article:', err);
      throw new Error('Failed to delete article');
    }
  };

  return {
    articles,
    loading,
    error,
    saveArticle,
    deleteArticle,
    refreshArticles: fetchArticles
  };
};

export default useAdminArticles;