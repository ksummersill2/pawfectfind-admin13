import React, { useState } from 'react';
import { Search, Loader2, AlertCircle, ExternalLink, Play } from 'lucide-react';
import { VideoCategory, VideoFormData } from '../../types/video';
import { useQuery } from '@tanstack/react-query';
import { adminSupabase } from '../../../lib/supabase/client';
import { searchBreedVideos, getVideoDetails, determineVideoCategory } from '../../../lib/youtube';

interface VideoDiscoveryProps {
  onSelect: (videos: VideoFormData[], breedId: string) => void;
  disabled?: boolean;
}

const VideoDiscovery: React.FC<VideoDiscoveryProps> = ({
  onSelect,
  disabled
}) => {
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [discoveredVideos, setDiscoveredVideos] = useState<any[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<Set<string>>(new Set());
  const [selectedBreedId, setSelectedBreedId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: breeds = [] } = useQuery({
    queryKey: ['breeds'],
    queryFn: async () => {
      const { data, error } = await adminSupabase
        .from('dog_breeds')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  const findVideos = async (breedName: string, breedId: string) => {
    if (!breedName || isSearching) return;

    try {
      setIsSearching(true);
      setError(null);
      setSelectedBreedId(breedId);
      setDiscoveredVideos([]);
      setSelectedVideos(new Set());

      // First, get videos from YouTube API
      const youtubeVideos = await searchBreedVideos(breedName);
      
      // Process each video
      const processedVideos = await Promise.all(
        youtubeVideos.map(async (video) => {
          try {
            const videoId = video.id.videoId;
            
            // Get additional video details
            const details = await getVideoDetails(videoId);
            
            // Determine video category using AI
            const category = await determineVideoCategory(
              video.snippet.title,
              video.snippet.description
            );

            return {
              title: video.snippet.title,
              description: video.snippet.description,
              youtube_url: `https://www.youtube.com/watch?v=${videoId}`,
              video_id: videoId,
              thumbnail_url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
              category,
              channel_name: video.snippet.channelTitle,
              duration: details.duration,
              view_count: parseInt(details.viewCount),
              like_count: parseInt(details.likeCount),
              is_featured: false
            };
          } catch (err) {
            console.error('Error processing video:', err);
            return null;
          }
        })
      );

      // Filter out failed videos and sort by view count
      const validVideos = processedVideos
        .filter((v): v is NonNullable<typeof v> => v !== null)
        .sort((a, b) => b.view_count - a.view_count);

      if (validVideos.length === 0) {
        throw new Error('No valid videos found for this breed');
      }

      setDiscoveredVideos(validVideos);
      
      // Auto-select top videos
      const videoUrls = new Set(validVideos.slice(0, 5).map(video => video.youtube_url));
      setSelectedVideos(videoUrls);
    } catch (err) {
      console.error('Error discovering videos:', err);
      setError(err instanceof Error ? err.message : 'Failed to discover videos. Please try again.');
      setDiscoveredVideos([]);
      setSelectedVideos(new Set());
    } finally {
      setIsSearching(false);
    }
  };

  const toggleVideoSelection = (url: string) => {
    const newSelected = new Set(selectedVideos);
    if (newSelected.has(url)) {
      newSelected.delete(url);
    } else {
      newSelected.add(url);
    }
    setSelectedVideos(newSelected);
  };

  const handleImport = () => {
    if (selectedVideos.size === 0) return;

    const selectedVideoData = discoveredVideos
      .filter(video => selectedVideos.has(video.youtube_url))
      .map(video => ({
        title: video.title,
        description: video.description,
        youtube_url: video.youtube_url,
        video_id: video.video_id,
        thumbnail_url: video.thumbnail_url,
        category: video.category as VideoCategory,
        channel_name: video.channel_name,
        duration: video.duration,
        is_featured: false
      }));

    onSelect(selectedVideoData, selectedBreedId);
  };

  // Filter videos based on search query
  const filteredVideos = discoveredVideos.filter(video => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      video.title.toLowerCase().includes(query) ||
      video.description.toLowerCase().includes(query) ||
      video.channel_name.toLowerCase().includes(query) ||
      video.category.toLowerCase().includes(query)
    );
  });

  const formatDuration = (duration: string) => {
    // Convert ISO 8601 duration to readable format
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return duration;

    const hours = (match[1] || '').replace('H', '');
    const minutes = (match[2] || '').replace('M', '');
    const seconds = (match[3] || '').replace('S', '');

    const parts = [];
    if (hours) parts.push(hours.padStart(2, '0'));
    parts.push((minutes || '0').padStart(2, '0'));
    parts.push((seconds || '0').padStart(2, '0'));

    return parts.join(':');
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    }
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <select
          onChange={(e) => {
            const breed = breeds.find(b => b.id === e.target.value);
            if (breed) {
              findVideos(breed.name, breed.id);
            }
          }}
          className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
          disabled={disabled || isSearching}
        >
          <option value="">Select a breed to find videos</option>
          {breeds.map((breed) => (
            <option key={breed.id} value={breed.id}>
              {breed.name}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="text-sm text-red-600 flex items-center bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
          <AlertCircle className="w-4 h-4 mr-1" />
          {error}
        </div>
      )}

      {isSearching && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Searching for videos...</span>
          </div>
        </div>
      )}

      {discoveredVideos.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search videos..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg dark:border-gray-600 dark:bg-gray-700"
                />
              </div>
            </div>
            <button
              onClick={() => setSelectedVideos(new Set(discoveredVideos.map(v => v.youtube_url)))}
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              Select All
            </button>
          </div>

          <div className="grid gap-4">
            {filteredVideos.map((video) => (
              <div
                key={video.youtube_url}
                className={`p-4 rounded-lg border ${
                  selectedVideos.has(video.youtube_url)
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="relative w-48 h-27 flex-shrink-0">
                    <img
                      src={video.thumbnail_url}
                      alt={video.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Play className="w-12 h-12 text-white opacity-75" />
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1 rounded">
                      {formatDuration(video.duration)}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {video.title}
                      </h3>
                      <a
                        href={video.youtube_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {video.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 rounded-full">
                        {video.category}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {video.channel_name}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatViews(video.view_count)} views
                      </span>
                    </div>
                  </div>

                  <label className="flex items-center ml-4">
                    <input
                      type="checkbox"
                      checked={selectedVideos.has(video.youtube_url)}
                      onChange={() => toggleVideoSelection(video.youtube_url)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleImport}
              disabled={selectedVideos.size === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Import Selected Videos ({selectedVideos.size})
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoDiscovery;