import React from 'react';
import { Edit2, Trash2, ExternalLink, Play } from 'lucide-react';
import { BreedVideo } from '../../types/video';
import { useQuery } from '@tanstack/react-query';
import { adminSupabase } from '../../../lib/supabase/client';

interface VideoListProps {
  videos: BreedVideo[];
  onEdit: (video: BreedVideo) => void;
  onDelete: (video: BreedVideo) => void;
}

const VideoList: React.FC<VideoListProps> = ({
  videos,
  onEdit,
  onDelete
}) => {
  const { data: breedMap } = useQuery({
    queryKey: ['breeds-map'],
    queryFn: async () => {
      const { data, error } = await adminSupabase
        .from('dog_breeds')
        .select('id, name');
      
      if (error) throw error;
      
      return Object.fromEntries(
        (data || []).map(breed => [breed.id, breed.name])
      );
    }
  });

  if (!videos || videos.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
        <p className="text-gray-500 dark:text-gray-400">No videos found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.map((video) => (
        <div
          key={video.id}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
        >
          <div className="relative aspect-video">
            <img
              src={video.thumbnail_url}
              alt={video.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <a
                href={video.youtube_url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-black/50 p-4 rounded-full hover:bg-black/75 transition-colors"
              >
                <Play className="w-8 h-8 text-white" />
              </a>
            </div>
          </div>
          
          <div className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                {video.title}
              </h3>
              <div className="flex space-x-2 ml-2">
                <button
                  onClick={() => onEdit(video)}
                  className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                  title="Edit video"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(video)}
                  className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                  title="Delete video"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {video.description}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 rounded-full">
                {video.category}
              </span>
              {breedMap && video.breed_id && (
                <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300 rounded-full">
                  {breedMap[video.breed_id]}
                </span>
              )}
              {video.is_featured && (
                <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 rounded-full">
                  Featured
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default VideoList;