import React from 'react';

interface BreedTabsProps {
  activeTab: 'variations' | 'articles';
  onTabChange: (tab: 'variations' | 'articles') => void;
}

const BreedTabs: React.FC<BreedTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex space-x-4 mb-6">
      <button
        onClick={() => onTabChange('variations')}
        className={`px-4 py-2 rounded-lg text-sm font-medium ${
          activeTab === 'variations'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
        }`}
      >
        Size Variations
      </button>
      <button
        onClick={() => onTabChange('articles')}
        className={`px-4 py-2 rounded-lg text-sm font-medium ${
          activeTab === 'articles'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
        }`}
      >
        Articles
      </button>
    </div>
  );
};

export default BreedTabs;