import React, { useState } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { createApi } from 'unsplash-js';

interface ImageSearchProps {
  onSelect: (imageUrl: string) => void;
  onClose: () => void;
}

const unsplash = createApi({
  accessKey: import.meta.env.VITE_UNSPLASH_ACCESS_KEY,
  apiUrl: 'https://api.unsplash.com'
});

const ImageSearch: React.FC<ImageSearchProps> = ({ onSelect, onClose }) => {
  const [query, setQuery] = useState('');
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const searchImages = async (newSearch = false) => {
    if (!query.trim()) return;

    try {
      setLoading(true);
      setError(null);

      const searchPage = newSearch ? 1 : page;
      const result = await unsplash.search.getPhotos({
        query: query.trim(),
        page: searchPage,
        perPage: 20,
        orientation: 'landscape'
      });

      if (result.errors) {
        throw new Error(result.errors[0]);
      }

      const newImages = result.response.results;
      setHasMore(newImages.length === 20);
      
      if (newSearch) {
        setImages(newImages);
        setPage(2);
      } else {
        setImages(prev => [...prev, ...newImages]);
        setPage(prev => prev + 1);
      }
    } catch (err) {
      console.error('Error searching images:', err);
      setError('Failed to search images. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchImages(true);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight * 1.5 && !loading && hasMore) {
      searchImages();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl">
        <div className="p-4 border-b dark:border-gray-700">
          <form onSubmit={handleSearch} className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search Unsplash images..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg dark:border-gray-600 dark:bg-gray-700"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                'Search'
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-6 h-6" />
            </button>
          </form>
        </div>

        <div 
          className="p-4 max-h-[60vh] overflow-y-auto"
          onScroll={handleScroll}
        >
          {error && (
            <div className="text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {images.map((image) => (
              <button
                key={image.id}
                onClick={() => onSelect(image.urls.regular)}
                className="relative group aspect-video rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <img
                  src={image.urls.small}
                  alt={image.alt_description || 'Unsplash image'}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-sm font-medium">Select Image</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/75 text-white text-xs truncate">
                  by {image.user.name}
                </div>
              </button>
            ))}
          </div>

          {images.length === 0 && !loading && (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              {query ? 'No images found' : 'Search for images to get started'}
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          )}
        </div>

        <div className="p-4 border-t dark:border-gray-700 text-center text-sm text-gray-500 dark:text-gray-400">
          Photos provided by Unsplash
        </div>
      </div>
    </div>
  );
};

export default ImageSearch;