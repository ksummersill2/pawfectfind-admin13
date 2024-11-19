import React from 'react';
import { Edit2, Trash2, CheckCircle2 } from 'lucide-react';
import { AdminBreedForm } from '../../types';

interface BreedListProps {
  breeds: AdminBreedForm[];
  onEdit: (breed: AdminBreedForm) => void;
  onDelete: (breed: AdminBreedForm) => void;
  selectedBreeds: string[];
  onSelectBreed: (breedId: string) => void;
  onSelectAll: () => void;
}

const BreedList: React.FC<BreedListProps> = ({
  breeds,
  onEdit,
  onDelete,
  selectedBreeds,
  onSelectBreed,
  onSelectAll
}) => {
  const allSelected = breeds.length > 0 && selectedBreeds.length === breeds.length;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3">
        <div className="flex items-center">
          <div className="w-8">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
              checked={allSelected}
              onChange={onSelectAll}
            />
          </div>
          <div className="flex-1 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
            Breed
          </div>
          <div className="hidden sm:block w-32 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
            Variations
          </div>
          <div className="w-20 sm:w-24"></div>
        </div>
      </div>

      {/* Breed List */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {breeds.map((breed) => (
          <div 
            key={breed.id} 
            className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="px-4 py-3">
              {/* Mobile Layout */}
              <div className="sm:hidden space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                      checked={selectedBreeds.includes(breed.id!)}
                      onChange={() => onSelectBreed(breed.id!)}
                    />
                    <h3 className="ml-3 font-medium text-gray-900 dark:text-white">
                      {breed.name}
                    </h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onEdit(breed)}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Edit breed"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(breed)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete breed"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 pl-8">
                  {breed.description}
                </p>
                <div className="pl-8">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {breed.size_variations?.length || 0} variations
                  </span>
                </div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden sm:flex items-center">
                <div className="w-8">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                    checked={selectedBreeds.includes(breed.id!)}
                    onChange={() => onSelectBreed(breed.id!)}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {breed.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                    {breed.description}
                  </p>
                </div>
                <div className="w-32">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {breed.size_variations?.length || 0} variations
                  </span>
                </div>
                <div className="w-24 flex justify-end space-x-2">
                  <button
                    onClick={() => onEdit(breed)}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    title="Edit breed"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(breed)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Delete breed"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {breeds.length === 0 && (
          <div className="px-6 py-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">No breeds found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BreedList;