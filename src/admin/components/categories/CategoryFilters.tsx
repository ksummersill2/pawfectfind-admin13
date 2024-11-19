import React from 'react';
import { Hash } from 'lucide-react';

interface CategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  const categories = [
    { id: 'all', name: 'All Posts' },
    { id: 'general', name: 'General Discussion' },
    { id: 'advice', name: 'Advice' },
    { id: 'training', name: 'Training Tips' },
    { id: 'health', name: 'Health & Wellness' },
    { id: 'products', name: 'Product Reviews' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Categories
      </h3>
      <div className="space-y-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${
              selectedCategory === category.id
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Hash className="w-4 h-4 mr-2" />
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
