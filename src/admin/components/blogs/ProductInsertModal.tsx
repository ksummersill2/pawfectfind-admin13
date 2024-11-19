import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { adminSupabase } from '../../../lib/supabase/client';
import { formatCurrency } from '../../../utils/formatters';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
}

interface ProductInsertModalProps {
  onSelect: (html: string) => void;
  onClose: () => void;
}

const ProductInsertModal: React.FC<ProductInsertModalProps> = ({ onSelect, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', searchQuery],
    queryFn: async () => {
      const query = adminSupabase
        .from('products')
        .select('id, name, description, price, image')
        .order('name');

      if (searchQuery) {
        query.ilike('name', `%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Product[];
    }
  });

  const handleProductSelect = (product: Product) => {
    // Create a compact product card with minimal styling
    const productHtml = `
      <div class="blog-product-card" style="
        display: inline-block;
        width: 200px;
        margin: 8px;
        vertical-align: top;
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
      ">
        <div style="padding: 8px;">
          <div style="
            width: 100%;
            height: 120px;
            margin: 0 auto 8px;
            background: #f9fafb;
            border-radius: 4px;
            padding: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <img 
              src="${product.image}" 
              alt="${product.name}" 
              style="
                max-width: 100%;
                max-height: 100%;
                object-fit: contain;
              "
              loading="lazy"
            />
          </div>
          <div style="text-align: center;">
            <h3 style="
              font-size: 14px;
              font-weight: 500;
              color: #111827;
              margin: 0 0 4px;
              line-height: 1.2;
              max-height: 2.4em;
              overflow: hidden;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
            ">
              ${product.name}
            </h3>
            <div style="
              font-size: 14px;
              font-weight: 600;
              color: #2563eb;
              margin-bottom: 8px;
            ">
              ${formatCurrency(product.price)}
            </div>
            <a 
              href="/product/${product.id}" 
              style="
                display: inline-block;
                padding: 4px 12px;
                background: #2563eb;
                color: white;
                font-size: 12px;
                font-weight: 500;
                text-decoration: none;
                border-radius: 4px;
                transition: background-color 0.2s;
              "
              target="_blank" 
              rel="noopener noreferrer"
              onmouseover="this.style.backgroundColor='#1d4ed8'"
              onmouseout="this.style.backgroundColor='#2563eb'"
            >
              View Details
            </a>
          </div>
        </div>
      </div>
    `;

    onSelect(productHtml);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl">
        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Insert Product</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg dark:border-gray-600 dark:bg-gray-700"
            />
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {isLoading ? (
              <LoadingSpinner />
            ) : products.length > 0 ? (
              <div className="grid gap-4">
                {products.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleProductSelect(product)}
                    className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left w-full"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-16 h-16 object-contain rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-white truncate">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="text-blue-600 dark:text-blue-400 font-medium mt-1">
                        {formatCurrency(product.price)}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                {searchQuery ? 'No products found' : 'Search for products to insert'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductInsertModal;