import React from 'react';
import { ArticleCategory } from '../../types/article';
import { BreedSelect } from '../common';

interface ArticleFiltersProps {
  selectedBreed: string;
  selectedCategory: string;
  onBreedChange: (breedId: string) => void;
  onCategoryChange: (category: string) => void;
}

const categories: ArticleCategory[] = [
  'training',
  'health',
  'nutrition',
  'behavior',
  'grooming',
  'lifestyle'
];

const ArticleFilters: React.FC<ArticleFiltersProps> = ({
  selectedBreed,
  selectedCategory,
  onBreedChange,
  onCategoryChange
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 space-y-4">
      <div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Filter by Breed
        </h3>
        <BreedSelect
          value={selectedBreed}
          onChange={onBreedChange}
          placeholder="All Breeds"
        />
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Filter by Category
        </h3>
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default ArticleFilters;