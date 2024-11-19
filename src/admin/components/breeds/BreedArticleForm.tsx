import React, { useState } from 'react';
import { AlertCircle, Plus, X } from 'lucide-react';
import { ArticleFormData, ArticleCategory } from '../../types';

interface BreedArticleFormProps {
  initialData?: ArticleFormData;
  onSubmit: (data: ArticleFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const ARTICLE_CATEGORIES: { value: ArticleCategory; label: string }[] = [
  { value: 'training', label: 'Training & Obedience' },
  { value: 'health', label: 'Health & Medical' },
  { value: 'nutrition', label: 'Diet & Nutrition' },
  { value: 'grooming', label: 'Grooming & Care' },
  { value: 'behavior', label: 'Behavior & Psychology' },
  { value: 'lifestyle', label: 'Lifestyle & Activities' },
  { value: 'care-tips', label: 'General Care Tips' },
  { value: 'breed-specific', label: 'Breed-Specific Information' }
];

const BreedArticleForm: React.FC<BreedArticleFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false
}) => {
  const [formData, setFormData] = useState<ArticleFormData>(initialData || {
    title: '',
    url: '',
    description: '',
    category: 'breed-specific',
    tags: [],
    source: '',
    is_featured: false,
    published_date: new Date().toISOString().split('T')[0]
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tagInput, setTagInput] = useState('');

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
      await onSubmit(formData);
    } catch (err) {
      setErrors(prev => ({
        ...prev,
        submit: 'Failed to save article'
      }));
    }
  };

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Article Title
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            {ARTICLE_CATEGORIES.map(category => (
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
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Tags
        </label>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
            className="flex-1 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
            disabled={isSubmitting}
            placeholder="Enter tags and press Enter"
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            disabled={isSubmitting}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {formData.tags.map(tag => (
            <span
              key={tag}
              className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="ml-1 hover:text-blue-900 dark:hover:text-blue-100"
                disabled={isSubmitting}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Published Date
          </label>
          <input
            type="date"
            value={formData.published_date}
            onChange={(e) => setFormData(prev => ({ ...prev, published_date: e.target.value }))}
            className="rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
            disabled={isSubmitting}
          />
        </div>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.is_featured}
            onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            disabled={isSubmitting}
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Feature this article
          </span>
        </label>
      </div>

      {errors.submit && (
        <p className="text-sm text-red-600 flex items-center justify-center">
          <AlertCircle className="w-4 h-4 mr-1" />
          {errors.submit}
        </p>
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
          {isSubmitting ? 'Saving...' : (initialData ? 'Update Article' : 'Add Article')}
        </button>
      </div>
    </form>
  );
};

export default BreedArticleForm;