import React, { useState } from 'react';
import { Search, AlertCircle } from 'lucide-react';
import { useAmazonSearch } from '../hooks/useAmazonSearch';
import { useAdminProducts } from '../hooks/useAdminProducts';
import { ProductDetailsModal } from '../components/products';
import { AmazonProduct } from '../types';
import { LoadingSpinner } from '../../components/common';
import { useNotification } from '../hooks/useNotification';
import Notification from '../components/common/Notification';

const ProductImport: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<AmazonProduct | null>(null);
  const { loading, error, results, searchProducts } = useAmazonSearch();
  const { saveProduct } = useAdminProducts();
  const { notification, showNotification, hideNotification } = useNotification();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      searchProducts(searchTerm);
    }
  };

  const handleImport = async (productData: any) => {
    try {
      const success = await saveProduct(productData);
      if (success) {
        showNotification('success', 'Product imported successfully!');
        setShowDetailsModal(false);
        setSelectedProduct(null);
      } else {
        showNotification('error', 'Failed to import product. Please try again.');
      }
    } catch (err) {
      console.error('Error importing product:', err);
      showNotification('error', 'Failed to import product. Please try again.');
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Amazon Product Import
        </h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
        <form onSubmit={handleSearch} className="flex space-x-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Amazon pet products..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg dark:border-gray-600 dark:bg-gray-700"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !searchTerm.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {error && (
          <div className="flex items-center text-red-600 mb-4 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((product) => (
              <div
                key={product.asin}
                className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="aspect-square relative">
                  <img
                    src={product.product_photo}
                    alt={product.product_title}
                    className="w-full h-full object-contain p-4"
                  />
                </div>
                <div className="p-4 border-t dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 mb-2">
                    {product.product_title}
                  </h3>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {product.product_price}
                    </span>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500">
                        Rating: {product.product_star_rating} ({product.product_num_ratings})
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedProduct(product);
                      setShowDetailsModal(true);
                    }}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Import Product
                  </button>
                </div>
              </div>
            ))}

            {results.length === 0 && !loading && (
              <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
                {searchTerm ? 'No products found' : 'Search for products to import'}
              </div>
            )}
          </div>
        )}
      </div>

      {showDetailsModal && selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedProduct(null);
          }}
          onSelect={handleImport}
          isSelected={false}
        />
      )}

      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={hideNotification}
        />
      )}
    </div>
  );
};

export default ProductImport;