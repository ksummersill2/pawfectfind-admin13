import React, { useState } from 'react';
import { Edit2, Trash2, Tag, DollarSign, Dog, Eye } from 'lucide-react';
import { AdminProduct } from '../../types';
import { formatCurrency } from '../../../utils/formatters';
import { useQuery } from '@tanstack/react-query';
import { adminSupabase } from '../../../lib/supabase/client';
import ProductQuickView from './ProductQuickView';

interface ProductListProps {
  products: AdminProduct[];
  onEdit: (product: AdminProduct) => void;
  onDelete: (product: AdminProduct) => void;
}

const ProductList: React.FC<ProductListProps> = ({
  products,
  onEdit,
  onDelete
}) => {
  const [selectedProduct, setSelectedProduct] = useState<AdminProduct | null>(null);

  // Fetch all breeds for displaying names
  const { data: breeds } = useQuery({
    queryKey: ['breeds'],
    queryFn: async () => {
      const { data, error } = await adminSupabase
        .from('dog_breeds')
        .select('id, name');
      if (error) throw error;
      return data || [];
    }
  });

  const getBreedName = (breedId: string) => {
    return breeds?.find(b => b.id === breedId)?.name || breedId;
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
        <p className="text-gray-500 dark:text-gray-400">No products found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <div 
          key={product.id} 
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
        >
          {/* Product Image */}
          <div className="aspect-video relative">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.discount > 0 && (
              <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-sm font-medium">
                {product.discount}% OFF
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="p-4 space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">
                {product.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                {product.description}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-gray-400" />
                <span className="font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(product.price)}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Tag className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {product.category_id}
                </span>
              </div>
            </div>

            {/* Breed Recommendations */}
            {product.breed_recommendations && product.breed_recommendations.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                  <Dog className="w-4 h-4 mr-1" />
                  Recommended for:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {product.breed_recommendations.map((rec: any, index: number) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      title={`Recommendation: ${rec.recommendation_strength}/5 - ${rec.recommendation_reason}`}
                    >
                      {getBreedName(rec.breed_id)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {product.vendor}
                {product.affiliate_type === 'cj' && (
                  <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">
                    (CJ Affiliate)
                  </span>
                )}
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedProduct(product)}
                  className="p-2 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
                  title="View product details"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onEdit(product)}
                  className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  title="Edit product"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(product)}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Delete product"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Quick View Modal */}
      {selectedProduct && (
        <ProductQuickView
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
};

export default ProductList;