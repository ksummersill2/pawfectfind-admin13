import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { BreedVideo, VideoFormData, VideoCategory } from '../../types/video';
import VideoDiscovery from './VideoDiscovery';
import { useQuery } from '@tanstack/react-query';
import { adminSupabase } from '../../../lib/supabase/client';

interface VideoFormProps {
  video?: BreedVideo | null;
  onSubmit: (data: VideoFormData) => Promise<void>;
  onCancel: () => void;
  onImport: (videos: VideoFormData[], breedId: string) => Promise<void>;
}

const categories: { value: VideoCategory; label: string }[] = [
  { value: 'training', label: 'Training & Obedience' },
  { value: 'grooming', label: 'Grooming & Care' },
  { value: 'health', label: 'Health & Medical' },
  { value: 'behavior', label: 'Behavior & Psychology' },
  { value: 'lifestyle', label: 'Lifestyle & Activities' },
  { value: 'nutrition', label: 'Diet & Nutrition' },
  { value: 'exercise', label: 'Exercise & Activities' },
  { value: 'puppy-care', label: 'Puppy Care' }
];

const VideoForm: React.FC<VideoFormProps> = ({
  video,
  onSubmit,
  onCancel,
  onImport
}) => {
  const [formData, setFormData] = useState<VideoFormData>({
    title: video?.title || '',
    description: video?.description || '',
    youtube_url: video?.youtube_url || '',
    category: video?.category || 'training',
    is_featured: video?.is_featured || false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch breed details if editing
  const { data: breed } = useQuery({
    queryKey: ['breed', video?.breed_id],
    queryFn: async () => {
      if (!video?.breed_id) return null;
      const { data, error } = await adminSupabase
        .from('dog_breeds')
        .select('id, name')
        .eq('id', video.breed_id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!video?.breed_id
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.youtube_url.trim()) {
      newErrors.url = 'YouTube URL is required';
    } else {
      const videoIdRegex = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
      const match = formData.youtube_url.match(videoIdRegex);
      if (!match || match[7].length !== 11) {
        newErrors.url = 'Invalid YouTube URL';
      }
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onSubmit(formData);
    } catch (err) {
      console.error('Error submitting video:', err);
      setErrors(prev => ({
        ...prev,
        submit: 'Failed to save video'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVideosFound = async (videos: VideoFormData[], breedId: string) => {
    try {
      setIsSubmitting(true);
      await onImport(videos, breedId);
      onCancel();
    } catch (err) {
      console.error('Error importing videos:', err);
      setErrors(prev => ({
        ...prev,
        submit: 'Failed to import videos'
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
              {video ? 'Edit Video' : 'Add Video'}
            </h2>
          </div>

          {video ? (
            breed && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Associated Breed: <span className="font-medium">{breed.name}</span>
                </p>
              </div>
            )
          ) : (
            <VideoDiscovery
              onSelect={handleVideosFound}
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
                YouTube URL
              </label>
              <input
                type="url"
                value={formData.youtube_url}
                onChange={(e) => setFormData(prev => ({ ...prev, youtube_url: e.target.value }))}
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
                  category: e.target.value as VideoCategory 
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
                Feature this video
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
                {isSubmitting ? 'Saving...' : (video ? 'Update Video' : 'Add Video')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VideoForm;