import { useState, useEffect } from 'react';
import { adminSupabase } from '../../lib/supabase/client';
import { Article, ArticleFormData } from '../types/article';

export const useArticles = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await adminSupabase
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

  const saveArticle = async (articleData: ArticleFormData): Promise<void> => {
    try {
      const timestamp = new Date().toISOString();
      
      if ('id' in articleData) {
        const { error } = await adminSupabase
          .from('articles')
          .update({
            ...articleData,
            updated_at: timestamp
          })
          .eq('id', (articleData as Article).id);

        if (error) throw error;
      } else {
        const { error } = await adminSupabase
          .from('articles')
          .insert([{
            ...articleData,
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
      const { error } = await adminSupabase
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

export default useArticles;