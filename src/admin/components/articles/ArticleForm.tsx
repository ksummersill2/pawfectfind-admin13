import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Article, ArticleFormData, ArticleCategory } from '../../types/article';
import ArticleDiscovery from './ArticleDiscovery';
import { useQuery } from '@tanstack/react-query';
import { adminSupabase } from '../../../lib/supabase/client';

interface ArticleFormProps {
  article?: Article | null;
  onSubmit: (data: ArticleFormData) => Promise<void>;
  onCancel: () => void;
  onImport: (articles: ArticleFormData[], breedId: string) => Promise<void>;
}

const categories: { value: ArticleCategory; label: string }[] = [
  { value: 'training', label: 'Training & Obedience' },
  { value: 'health', label: 'Health & Medical' },
  { value: 'nutrition', label: 'Diet & Nutrition' },
  { value: 'grooming', label: 'Grooming & Care' },
  { value: 'behavior', label: 'Behavior & Psychology' },
  { value: 'lifestyle', label: 'Lifestyle & Activities' }
];

const ArticleForm: React.FC<ArticleFormProps> = ({
  article,
  onSubmit,
  onCancel,
  onImport
}) => {
  const [formData, setFormData] = useState<ArticleFormData>({
    title: article?.title || '',
    url: article?.url || '',
    description: article?.description || '',
    category: article?.category || 'training',
    breed_id: article?.breed_id || '',
    tags: article?.tags || [],
    source: article?.source || '',
    published_date: article?.published_date || new Date().toISOString().split('T')[0],
    is_featured: article?.is_featured || false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch breed details if editing
  const { data: breed } = useQuery({
    queryKey: ['breed', article?.breed_id],
    queryFn: async () => {
      if (!article?.breed_id) return null;
      const { data, error } = await adminSupabase
        .from('dog_breeds')
        .select('id, name')
        .eq('id', article.breed_id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!article?.breed_id
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.url.trim()) {
      newErrors.url = 'URL is required';
    } else {
      try {
        new URL(formData.url);
      } catch {
        newErrors.url = 'Invalid URL format';
      }
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.source.trim()) {
      newErrors.source = 'Source is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onSubmit({
        ...formData,
        source: formData.source || new URL(formData.url).hostname.replace('www.', '')
      });
    } catch (err) {
      console.error('Error submitting article:', err);
      setErrors(prev => ({
        ...prev,
        submit: 'Failed to save article'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArticlesFound = async (articles: ArticleFormData[], breedId: string) => {
    try {
      setIsSubmitting(true);
      await onImport(articles, breedId);
      onCancel();
    } catch (err) {
      console.error('Error importing articles:', err);
      setErrors(prev => ({
        ...prev,
        submit: 'Failed to import articles'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl my-8">
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-start">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {article ? 'Edit Article' : 'Add Article'}
            </h2>
          </div>

          {article ? (
            breed && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Associated Breed: <span className="font-medium">{breed.name}</span>
                </p>
              </div>
            )
          ) : (
            <ArticleDiscovery
              onSelect={handleArticlesFound}
              disabled={isSubmitting}
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                disabled={isSubmitting}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.title}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                URL
              </label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                disabled={isSubmitting}
              />
              {errors.url && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.url}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                disabled={isSubmitting}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.description}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  category: e.target.value as ArticleCategory 
                }))}
                className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                disabled={isSubmitting}
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Source
              </label>
              <input
                type="text"
                value={formData.source}
                onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
                className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                disabled={isSubmitting}
                placeholder="e.g., AKC, PetMD, VetStreet"
              />
              {errors.source && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.source}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Published Date
              </label>
              <input
                type="date"
                value={formData.published_date}
                onChange={(e) => setFormData(prev => ({ ...prev, published_date: e.target.value }))}
                className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                disabled={isSubmitting}
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_featured"
                checked={formData.is_featured}
                onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                disabled={isSubmitting}
              />
              <label htmlFor="is_featured" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Feature this article
              </label>
            </div>

            {errors.submit && (
              <div className="text-sm text-red-600 flex items-center justify-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.submit}
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : (article ? 'Update Article' : 'Add Article')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ArticleForm;