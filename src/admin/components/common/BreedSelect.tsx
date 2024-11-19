import React from 'react';
import { adminSupabase } from '../../../lib/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface BreedSelectProps {
  value?: string;
  onChange?: (value: string) => void;
  selectedBreeds?: string[];
  onBreedSelect?: (breeds: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const BreedSelect: React.FC<BreedSelectProps> = ({
  value,
  onChange,
  selectedBreeds,
  onBreedSelect,
  placeholder = 'Select breed',
  className = '',
  disabled = false
}) => {
  const { data: breeds = [], isLoading } = useQuery({
    queryKey: ['breeds'],
    queryFn: async () => {
      const { data, error } = await adminSupabase
        .from('dog_breeds')
        .select('id, name')
        .order('name');

      if (error) throw error;
      return data || [];
    }
  });

  // Handle single breed selection
  const handleSingleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  // Handle multiple breed selection
  const handleMultipleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onBreedSelect) {
      const options = Array.from(e.target.selectedOptions);
      const selectedValues = options.map(option => option.value);
      onBreedSelect(selectedValues);
    }
  };

  // Determine if we're in multiple selection mode
  const isMultiple = selectedBreeds !== undefined;

  return (
    <select
      value={isMultiple ? selectedBreeds : (value || '')}
      onChange={isMultiple ? handleMultipleSelect : handleSingleSelect}
      className={`w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 ${className}`}
      disabled={isLoading || disabled}
      multiple={isMultiple}
      size={isMultiple ? Math.min(breeds.length, 5) : undefined}
    >
      {!isMultiple && <option value="">{isLoading ? 'Loading breeds...' : placeholder}</option>}
      {breeds.map((breed) => (
        <option key={breed.id} value={breed.id}>
          {breed.name}
        </option>
      ))}
    </select>
  );
};

export default BreedSelect;