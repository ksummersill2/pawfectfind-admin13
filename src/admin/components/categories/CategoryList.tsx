import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { AdminCategory } from '../../types';

interface CategoryListProps {
  categories: AdminCategory[];
  onEdit: (category: AdminCategory) => void;
  onDelete: (category: AdminCategory) => void;
}

const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  onEdit,
  onDelete
}) => {
  const renderIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent ? <IconComponent className="w-6 h-6" /> : null;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {categories.map((category) => (
        <div
          key={category.id}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center mr-3">
                <span className="text-blue-600 dark:text-blue-400">
                  {renderIcon(category.icon)}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {category.description}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => onEdit(category)}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                title="Edit category"
              >
                <Edit2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => onDelete(category)}
                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                title="Delete category"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CategoryList;