import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminSupabase } from '../../../lib/supabase/client';
import { Dog } from 'lucide-react';

interface BreedSelectorProps {
  selectedBreeds: string[];
  onBreedSelect: (breedIds: string[]) => void;
  disabled?: boolean;
}

const BreedSelector: React.FC<BreedSelectorProps> = ({
  selectedBreeds,
  onBreedSelect,
  disabled
}) => {
  const { data: breeds = [], isLoading } = useQuery({
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

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Select Target Breed
      </label>
      <div className="relative">
        <Dog className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <select
          value={selectedBreeds[0] || ''}
          onChange={(e) => onBreedSelect([e.target.value])}
          className="w-full pl-10 pr-4 py-2 border rounded-lg dark:border-gray-600 dark:bg-gray-700"
          disabled={disabled || isLoading}
        >
          <option value="">Select a breed</option>
          {breeds.map((breed) => (
            <option key={breed.id} value={breed.id}>
              {breed.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default BreedSelector;