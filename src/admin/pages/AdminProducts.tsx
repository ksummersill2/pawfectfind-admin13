import React, { useState, Suspense } from 'react';
import { Plus, Upload, Download, ShoppingBag, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAdminProducts } from '../hooks/useAdminProducts';
import { useProductSearch } from '../hooks/useProductSearch';
import { AdminProduct } from '../types';
import { ProductForm, ProductList, ProductFilters } from '../components/products';
import { DeleteConfirmationModal } from '../components/common';
import { ActionMenu, ActionDropdown } from '../components/common';
import { LoadingSpinner } from '../../components/common';
import { PrintfulApp } from '../../components';
import ErrorBoundary from '../../components/ErrorBoundary';
import Papa from 'papaparse';
import ProductVerificationButton from '../components/products/ProductVerificationButton';

const AdminProducts: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [productToDelete, setProductToDelete] = useState<AdminProduct | null>(null);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const { 
    products, 
    loading, 
    error: fetchError, 
    saveProduct, 
    deleteProduct, 
    refreshProducts 
  } = useAdminProducts();

  const { 
    searchQuery, 
    setSearchQuery, 
    selectedBreed, 
    setSelectedBreed, 
    searchResults,
    isSearching,
    error: searchError
  } = useProductSearch(products);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setImporting(true);
    setImportProgress(0);
    setError(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const { data, errors } = results;
          if (errors.length > 0) {
            throw new Error('CSV parsing failed: ' + errors[0].message);
          }

          const total = data.length;
          let processed = 0;
          let hasErrors = false;

          for (const row of data) {
            try {
              await saveProduct(row);
              processed++;
              setImportProgress(Math.round((processed / total) * 100));
            } catch (err) {
              console.error('Error importing product:', err);
              const errorMessage = err instanceof Error ? err.message : 'Unknown error';
              setError(`Error importing ${row.name}: ${errorMessage}`);
              hasErrors = true;
              
              const shouldContinue = window.confirm(
                `An error occurred while importing ${row.name}.\n\n` +
                `Error: ${errorMessage}\n\n` +
                `Would you like to continue importing the remaining products?`
              );
              
              if (!shouldContinue) {
                throw new Error('Import cancelled by user');
              }
            }
          }

          await refreshProducts();
          if (!hasErrors) {
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
          }
        } catch (err) {
          console.error('Import error:', err);
          setError(err instanceof Error ? err.message : 'Failed to import products');
        } finally {
          setImporting(false);
          setImportProgress(0);
        }
      },
      error: (error) => {
        console.error('CSV parsing error:', error);
        setError('Failed to parse CSV file');
        setImporting(false);
      }
    });
  };

  const handleDelete = async () => {
    if (!productToDelete?.id) return;

    try {
      const success = await deleteProduct(productToDelete.id);
      if (success) {
        setProductToDelete(null);
      }
    } catch (err) {
      console.error('Error deleting product:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete product');
    }
  };

  const importActions = [
    {
      label: 'Import CSV',
      icon: <Upload className="w-4 h-4" />,
      isFileInput: true,
      onFileSelect: handleFileUpload
    },
    {
      label: 'Import from Amazon',
      icon: <ShoppingBag className="w-4 h-4" />,
      onClick: () => navigate('/admin/import')
    },
    {
      label: 'Download Template',
      icon: <Download className="w-4 h-4" />,
      href: '/src/admin/data/product-template.csv',
      download: true
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Products</h1>
        
        {/* Mobile Actions */}
        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
          <ProductVerificationButton />
          
          <div className="flex-1 sm:flex-none flex justify-end gap-3">
            <ActionDropdown
              trigger={
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  <span className="hidden sm:inline">Import</span>
                  <Menu className="w-4 h-4" />
                </button>
              }
              items={importActions}
            />
            
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Product</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>
      </div>

      <ProductFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedBreed={selectedBreed}
        onBreedChange={setSelectedBreed}
        isSearching={isSearching}
      />

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      {showSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
          Import completed successfully
        </div>
      )}

      {importing && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative">
          <div className="flex items-center justify-between mb-1">
            <span>Importing products...</span>
            <span>{importProgress}%</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${importProgress}%` }}
            />
          </div>
        </div>
      )}

      <ProductList
        products={searchResults}
        onEdit={setEditingProduct}
        onDelete={setProductToDelete}
      />

      {(showForm || editingProduct) && (
        <ProductForm
          initialData={editingProduct}
          onSubmit={async (data) => {
            const success = await saveProduct(data);
            if (success) {
              setShowForm(false);
              setEditingProduct(null);
            }
          }}
          onCancel={() => {
            setShowForm(false);
            setEditingProduct(null);
          }}
        />
      )}

      <DeleteConfirmationModal
        isOpen={!!productToDelete}
        title="Delete Product"
        message={`Are you sure you want to delete ${productToDelete?.name}? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setProductToDelete(null)}
      />

      {/* Printful Integration */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Printful Products
        </h2>
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner />}>
            <PrintfulApp className="w-full h-[600px] border border-gray-200 dark:border-gray-700 rounded-lg" />
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default AdminProducts;