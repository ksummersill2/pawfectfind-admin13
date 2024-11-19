import React from 'react';
import { Search } from 'lucide-react';
import { BreedSelect } from '../common';

interface ProductFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedBreed: string;
  onBreedChange: (breedId: string) => void;
  isSearching?: boolean;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
  searchQuery,
  onSearchChange,
  selectedBreed,
  onBreedChange,
  isSearching = false
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search products..."
          className="w-full pl-10 pr-4 py-2 border rounded-lg dark:border-gray-600 dark:bg-gray-700"
          disabled={isSearching}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Filter by Breed
        </label>
        <BreedSelect
          value={selectedBreed}
          onChange={onBreedChange}
          placeholder="All Breeds"
        />
      </div>
    </div>
  );
};

export default ProductFilters;