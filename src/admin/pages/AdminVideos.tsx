import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminSupabase } from '../../lib/supabase/client';
import { BreedVideo, VideoFormData } from '../types/video';
import VideoForm from '../components/videos/VideoForm';
import VideoList from '../components/videos/VideoList';
import VideoFilters from '../components/videos/VideoFilters';
import DeleteConfirmationModal from '../components/common/DeleteConfirmationModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminVideos: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingVideo, setEditingVideo] = useState<BreedVideo | null>(null);
  const [videoToDelete, setVideoToDelete] = useState<BreedVideo | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBreed, setSelectedBreed] = useState('');
  const [error, setError] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const { data: videos = [], isLoading } = useQuery({
    queryKey: ['videos', selectedBreed, searchQuery],
    queryFn: async () => {
      let query = adminSupabase
        .from('breed_videos')
        .select(`
          *,
          breed:dog_breeds(
            id,
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (selectedBreed) {
        query = query.eq('breed_id', selectedBreed);
      }

      if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as BreedVideo[];
    }
  });

  const createVideoMutation = useMutation({
    mutationFn: async (data: VideoFormData & { breed_id: string }) => {
      const videoId = data.youtube_url.match(/[?&]v=([^&]+)/)?.[1];
      if (!videoId) throw new Error('Invalid YouTube URL');

      const { error } = await adminSupabase
        .from('breed_videos')
        .insert([{
          ...data,
          video_id: videoId,
          thumbnail_url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      setShowForm(false);
    }
  });

  const updateVideoMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: VideoFormData }) => {
      const videoId = data.youtube_url.match(/[?&]v=([^&]+)/)?.[1];
      if (!videoId) throw new Error('Invalid YouTube URL');

      const { error } = await adminSupabase
        .from('breed_videos')
        .update({
          ...data,
          video_id: videoId,
          thumbnail_url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      setEditingVideo(null);
    }
  });

  const deleteVideoMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await adminSupabase
        .from('breed_videos')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      setVideoToDelete(null);
    }
  });

  const handleImportVideos = async (videos: VideoFormData[], breedId: string) => {
    try {
      for (const video of videos) {
        await createVideoMutation.mutateAsync({
          ...video,
          breed_id: breedId
        });
      }
    } catch (err) {
      console.error('Error importing videos:', err);
      setError('Failed to import videos');
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Videos</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Video
        </button>
      </div>

      <VideoFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedBreed={selectedBreed}
        onBreedChange={setSelectedBreed}
        isSearching={isLoading}
      />

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      <VideoList
        videos={videos}
        onEdit={setEditingVideo}
        onDelete={setVideoToDelete}
      />

      {(showForm || editingVideo) && (
        <VideoForm
          video={editingVideo}
          onSubmit={async (data) => {
            if (editingVideo) {
              await updateVideoMutation.mutateAsync({
                id: editingVideo.id,
                data
              });
            } else {
              await createVideoMutation.mutateAsync(data);
            }
          }}
          onCancel={() => {
            setShowForm(false);
            setEditingVideo(null);
          }}
          onImport={handleImportVideos}
        />
      )}

      <DeleteConfirmationModal
        isOpen={!!videoToDelete}
        title="Delete Video"
        message={`Are you sure you want to delete "${videoToDelete?.title}"? This action cannot be undone.`}
        onConfirm={() => videoToDelete?.id && deleteVideoMutation.mutate(videoToDelete.id)}
        onCancel={() => setVideoToDelete(null)}
      />
    </div>
  );
};

export default AdminVideos;