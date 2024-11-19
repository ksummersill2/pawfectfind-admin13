import { useState, useEffect } from 'react';
import { adminSupabase } from '../../lib/supabase/client';
import { AdminBreedForm } from '../types';

export const useBreeds = () => {
  const [breeds, setBreeds] = useState<AdminBreedForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBreeds = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await adminSupabase
        .from('dog_breeds')
        .select(`
          *,
          size_variations:breed_size_variations(
            *,
            male_characteristics:breed_characteristics(*)
          )
        `)
        .order('name');

      if (fetchError) throw fetchError;
      setBreeds(data || []);
    } catch (err) {
      console.error('Error fetching breeds:', err);
      setError('Failed to load breeds. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const deleteBreed = async (breedId: string): Promise<boolean> => {
    try {
      // First delete related characteristics
      const { error: charError } = await adminSupabase
        .from('breed_characteristics')
        .delete()
        .eq('breed_id', breedId);

      if (charError) throw charError;

      // Then delete size variations
      const { error: varError } = await adminSupabase
        .from('breed_size_variations')
        .delete()
        .eq('breed_id', breedId);

      if (varError) throw varError;

      // Finally delete the breed
      const { error: deleteError } = await adminSupabase
        .from('dog_breeds')
        .delete()
        .eq('id', breedId);

      if (deleteError) throw deleteError;

      // Update local state
      setBreeds(prev => prev.filter(breed => breed.id !== breedId));
      return true;
    } catch (err) {
      console.error('Error deleting breed:', err);
      setError('Failed to delete breed. Please try again later.');
      return false;
    }
  };

  useEffect(() => {
    fetchBreeds();
  }, []);

  return {
    breeds,
    loading,
    error,
    refreshBreeds: fetchBreeds,
    deleteBreed
  };
};

export default useBreeds;