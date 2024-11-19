import React, { useState } from 'react';
import { Plus, Upload, Download, CheckCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminSupabase } from '../../lib/supabase/client';
import { Article, ArticleFormData } from '../types/article';
import { ArticleForm, ArticleList, ArticleFilters } from '../components/articles';
import { DeleteConfirmationModal } from '../components/common';
import ActionMenu from '../components/common/ActionMenu';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Papa from 'papaparse';

const AdminArticles: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [articleToDelete, setArticleToDelete] = useState<Article | null>(null);
  const [selectedBreed, setSelectedBreed] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['articles', selectedBreed, selectedCategory],
    queryFn: async () => {
      let query = adminSupabase
        .from('breed_articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (selectedBreed) {
        query = query.eq('breed_id', selectedBreed);
      }

      if (selectedCategory) {
        query = query.eq('category', selectedCategory);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Article[];
    }
  });

  const createArticleMutation = useMutation({
    mutationFn: async (data: ArticleFormData) => {
      const { error } = await adminSupabase
        .from('breed_articles')
        .insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      setShowForm(false);
    }
  });

  const updateArticleMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ArticleFormData }) => {
      const { error } = await adminSupabase
        .from('breed_articles')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      setEditingArticle(null);
    }
  });

  const deleteArticleMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await adminSupabase
        .from('breed_articles')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      setArticleToDelete(null);
    }
  });

  const handleImportArticles = async (articles: ArticleFormData[], breedId: string) => {
    try {
      setImporting(true);
      setError(null);

      for (const article of articles) {
        await createArticleMutation.mutateAsync({
          ...article,
          breed_id: breedId,
          tags: []
        });
      }

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error('Error importing articles:', err);
      setError('Failed to import articles');
    } finally {
      setImporting(false);
    }
  };

  const actions = [
    {
      label: 'Add Article',
      icon: <Plus className="w-4 h-4" />,
      onClick: () => setShowForm(true)
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Articles</h1>
        <ActionMenu actions={actions} />
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      {showSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" />
          Import completed successfully
        </div>
      )}

      {importing && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative">
          <div className="flex items-center justify-between mb-1">
            <span>Importing articles...</span>
            <span>{importProgress}%</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${importProgress}%` }}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <ArticleFilters
            selectedBreed={selectedBreed}
            selectedCategory={selectedCategory}
            onBreedChange={setSelectedBreed}
            onCategoryChange={setSelectedCategory}
          />
        </div>

        <div className="lg:col-span-3">
          <ArticleList
            articles={articles}
            onEdit={setEditingArticle}
            onDelete={setArticleToDelete}
          />
        </div>
      </div>

      {(showForm || editingArticle) && (
        <ArticleForm
          article={editingArticle}
          onSubmit={async (data) => {
            if (editingArticle) {
              await updateArticleMutation.mutateAsync({
                id: editingArticle.id,
                data
              });
            } else {
              await createArticleMutation.mutateAsync(data);
            }
          }}
          onCancel={() => {
            setShowForm(false);
            setEditingArticle(null);
          }}
          onImport={handleImportArticles}
        />
      )}

      <DeleteConfirmationModal
        isOpen={!!articleToDelete}
        title="Delete Article"
        message={`Are you sure you want to delete "${articleToDelete?.title}"? This action cannot be undone.`}
        onConfirm={() => articleToDelete?.id && deleteArticleMutation.mutate(articleToDelete.id)}
        onCancel={() => setArticleToDelete(null)}
      />
    </div>
  );
};

export default AdminArticles;