import { useState } from 'react';
import { AmazonProduct } from '../types';

const RAPID_API_KEY = import.meta.env.VITE_RAPID_API_KEY;
const RAPID_API_HOST = 'real-time-amazon-data.p.rapidapi.com';

export const useAmazonSearch = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<AmazonProduct[]>([]);

  const searchProducts = async (query: string) => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://${RAPID_API_HOST}/search?query=${encodeURIComponent(query)}&country=US&category=pet-supplies`,
        {
          headers: {
            'x-rapidapi-key': RAPID_API_KEY,
            'x-rapidapi-host': RAPID_API_HOST
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      
      if (data.status === 'OK' && data.data?.products) {
        setResults(data.data.products);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error searching Amazon products:', err);
      setError(err instanceof Error ? err.message : 'Failed to search products');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    results,
    searchProducts
  };
};

export default useAmazonSearch;