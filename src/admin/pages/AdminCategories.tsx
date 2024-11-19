import React, { useState } from 'react';
import { Plus, Tag } from 'lucide-react';
import { useAdminCategories } from '../hooks/useAdminCategories';
import CategoryForm from '../components/categories/CategoryForm';
import CategoryList from '../components/categories/CategoryList';
import DeleteConfirmationModal from '../components/common/DeleteConfirmationModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { AdminCategory } from '../types';

const AdminCategories: React.FC = () => {
  const [categoryType, setCategoryType] = useState<'product' | 'blog'>('product');
  const { categories, loading, error: fetchError, saveCategory, deleteCategory, refreshCategories } = useAdminCategories(categoryType);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<AdminCategory | null>(null);
  const [error, setError] = useState<string | null>(fetchError);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSubmit = async (data: Omit<AdminCategory, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await saveCategory(data);
      setShowForm(false);
      setEditingCategory(null);
      await refreshCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save category');
    }
  };

  const handleDelete = async () => {
    if (!categoryToDelete?.id || isDeleting) return;

    try {
      setIsDeleting(true);
      setError(null);
      await deleteCategory(categoryToDelete.id);
      setCategoryToDelete(null);
      await refreshCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete category');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Categories</h1>
          <div className="flex rounded-lg overflow-hidden">
            <button
              onClick={() => setCategoryType('product')}
              className={`px-4 py-2 text-sm font-medium ${
                categoryType === 'product'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Products
            </button>
            <button
              onClick={() => setCategoryType('blog')}
              className={`px-4 py-2 text-sm font-medium ${
                categoryType === 'blog'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Blog Posts
            </button>
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Category
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      <CategoryList
        categories={categories}
        onEdit={setEditingCategory}
        onDelete={setCategoryToDelete}
      />

      {(showForm || editingCategory) && (
        <CategoryForm
          category={editingCategory}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingCategory(null);
          }}
          type={categoryType}
        />
      )}

      <DeleteConfirmationModal
        isOpen={!!categoryToDelete}
        title="Delete Category"
        message={`Are you sure you want to delete ${categoryToDelete?.name}? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setCategoryToDelete(null)}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default AdminCategories;