import { useState, useEffect, useMemo } from 'react';
import { AdminProduct } from '../types';

export const useProductSearch = (products: AdminProduct[]) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBreed, setSelectedBreed] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchResults = useMemo(() => {
    let filtered = [...products];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Filter by breed
    if (selectedBreed) {
      filtered = filtered.filter(product => 
        product.breed_recommendations?.some(rec => 
          typeof rec === 'object' && 'breed_id' in rec && rec.breed_id === selectedBreed
        )
      );
    }

    return filtered;
  }, [products, searchQuery, selectedBreed]);

  useEffect(() => {
    setError(null);
  }, [searchQuery, selectedBreed]);

  return {
    searchQuery,
    setSearchQuery,
    selectedBreed,
    setSelectedBreed,
    searchResults,
    isSearching,
    error
  };
};

export default useProductSearch;