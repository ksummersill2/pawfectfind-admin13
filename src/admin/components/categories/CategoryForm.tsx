import React, { useState } from 'react';
import { AlertCircle, X } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { AdminCategory } from '../../types';

interface CategoryFormProps {
  category?: AdminCategory | null;
  onSubmit: (data: Omit<AdminCategory, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onCancel: () => void;
  type: 'product' | 'blog';
}

const CategoryForm: React.FC<CategoryFormProps> = ({
  category,
  onSubmit,
  onCancel,
  type
}) => {
  const [formData, setFormData] = useState<Omit<AdminCategory, 'id' | 'created_at' | 'updated_at'>>({
    name: category?.name || '',
    description: category?.description || '',
    icon: category?.icon || 'Package'
  });

  const [iconSearch, setIconSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const allIcons = Object.keys(LucideIcons).filter(
    (name) =>
      typeof (LucideIcons as any)[name] === 'function' &&
      name !== 'createLucideIcon' &&
      name !== 'default'
  );

  const filteredIcons = iconSearch
    ? allIcons.filter(
        (name) =>
          name.toLowerCase().includes(iconSearch.toLowerCase()) ||
          name
            .replace(/([A-Z])/g, ' $1')
            .toLowerCase()
            .includes(iconSearch.toLowerCase())
      )
    : allIcons;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.description.trim()) {
      setError('Name and description are required');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: formData.name.trim(),
        description: formData.description.trim(),
        icon: formData.icon || 'Package'
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent ? <IconComponent className="w-6 h-6" /> : null;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center p-4 overflow-y-auto z-50">
      <div className="relative bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl my-8">
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute -top-2 -right-2 p-1 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          disabled={isSubmitting}
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {category ? 'Edit Category' : `Add ${type === 'product' ? 'Product' : 'Blog'} Category`}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                rows={3}
                className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Icon
              </label>
              <div className="space-y-3">
                {/* Selected Icon Preview */}
                {formData.icon && (
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Selected:
                    </span>
                    {renderIcon(formData.icon)}
                    <span className="text-sm font-medium">{formData.icon}</span>
                  </div>
                )}

                {/* Icon Search */}
                <div className="relative">
                  <input
                    type="text"
                    value={iconSearch}
                    onChange={(e) => setIconSearch(e.target.value)}
                    placeholder="Search icons..."
                    className="w-full pl-10 pr-4 py-2 border rounded-lg dark:border-gray-600 dark:bg-gray-700"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Icon Grid */}
                <div className="border rounded-lg dark:border-gray-600">
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 p-2 max-h-48 overflow-y-auto">
                    {filteredIcons.length > 0 ? (
                      filteredIcons.map((iconName) => (
                        <button
                          key={iconName}
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({ ...prev, icon: iconName }))
                          }
                          className={`p-2 rounded-lg flex flex-col items-center justify-center gap-1 ${
                            formData.icon === iconName
                              ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                          title={iconName}
                          disabled={isSubmitting}
                        >
                          {renderIcon(iconName)}
                          <span className="text-xs truncate w-full text-center">
                            {iconName}
                          </span>
                        </button>
                      ))
                    ) : (
                      <div className="col-span-full text-center py-4 text-gray-500">
                        <p>No icons found matching "{iconSearch}"</p>
                        <p className="text-sm mt-1">
                          Try different keywords or partial terms
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : (category ? 'Update Category' : 'Create Category')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryForm;