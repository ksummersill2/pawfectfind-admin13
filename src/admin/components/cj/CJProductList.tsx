import React, { useState } from 'react';
import { ExternalLink, Plus, ChevronDown, ChevronUp, ImageOff } from 'lucide-react';
import { CJProduct } from '../../types/cjProduct';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import CJProductDetailsModal from './CJProductDetailsModal';

interface CJProductListProps {
  products: CJProduct[];
  loading: boolean;
  onImport: (product: CJProduct) => Promise<void>;
}

const FALLBACK_IMAGE = 'https://placehold.co/400x400?text=No+Image+Available';

const ProductCard: React.FC<{ 
  product: CJProduct; 
  onImport: (product: CJProduct) => Promise<void>;
}> = ({ product, onImport }) => {
  const [expanded, setExpanded] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="p-4">
        <div className="flex items-start gap-4">
          {imageError ? (
            <div className="w-24 h-24 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg">
              <ImageOff className="w-8 h-8 text-gray-400" />
            </div>
          ) : (
            <img
              src={product.image_url || FALLBACK_IMAGE}
              alt={product.name}
              onError={handleImageError}
              className="w-24 h-24 object-contain rounded-lg bg-gray-50 dark:bg-gray-700"
            />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
              {product.name}
            </h3>
            <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
              <span className="font-medium">${product.price.toFixed(2)}</span>
              {product.retail_price > product.price && (
                <span className="ml-2 line-through">
                  ${product.retail_price.toFixed(2)}
                </span>
              )}
            </div>
            <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {product.advertiser_name}
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            {expanded ? (
              <>
                <ChevronUp className="w-4 h-4 mr-1" />
                Less details
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-1" />
                More details
              </>
            )}
          </button>
          <div className="flex items-center gap-2">
            <a
              href={product.buy_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
            {!product.imported && (
              <button
                onClick={() => setShowImportModal(true)}
                className="flex items-center px-3 py-1.5 text-sm rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/50 dark:text-blue-400 dark:hover:bg-blue-900/70"
              >
                <Plus className="w-4 h-4 mr-1" />
                Import
              </button>
            )}
          </div>
        </div>

        {expanded && (
          <div className="mt-4 border-t dark:border-gray-700 pt-4 space-y-3">
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </h4>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {product.description || 'No description available'}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Category
              </h4>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {product.category}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Advertiser Details
              </h4>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                ID: {product.advertiser_id}
                <br />
                Name: {product.advertiser_name}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Product Status
              </h4>
              <div className="mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  product.in_stock
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400'
                }`}>
                  {product.in_stock ? 'In Stock' : 'Out of Stock'}
                </span>
                <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  product.imported
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-400'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-400'
                }`}>
                  {product.imported ? 'Imported' : 'Not Imported'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {showImportModal && (
        <CJProductDetailsModal
          product={{
            ...product,
            image_url: imageError ? FALLBACK_IMAGE : (product.image_url || FALLBACK_IMAGE)
          }}
          onClose={() => setShowImportModal(false)}
          onImport={onImport}
        />
      )}
    </div>
  );
};

const CJProductList: React.FC<CJProductListProps> = ({
  products,
  loading,
  onImport
}) => {
  if (loading) {
    return <LoadingSpinner />;
  }

  if (products.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          No products imported yet. Upload a CSV file to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:gap-6">
      {products.map((product) => (
        <ProductCard
          key={`${product.catalog_id}-${product.advertiser_id}`}
          product={product}
          onImport={onImport}
        />
      ))}
    </div>
  );
};

export default CJProductList;