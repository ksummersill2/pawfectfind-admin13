import React, { useMemo } from 'react';
import { X, ExternalLink, Star, DollarSign, Tag, Dog, Package, Calendar, AlertCircle, CheckCircle, HelpCircle } from 'lucide-react';
import { AdminProduct } from '../../types';
import { formatCurrency } from '../../../utils/formatters';
import { useQuery } from '@tanstack/react-query';
import { adminSupabase } from '../../../lib/supabase/client';
import { generateAffiliateLink } from '../../../lib/amazonAffiliateLink';

interface ProductQuickViewProps {
  product: AdminProduct;
  onClose: () => void;
}

interface AffiliateLinkStatus {
  hasCorrectDomain: boolean;
  hasCorrectTag: boolean;
  isCorrectFormat: boolean;
  expectedLink: string;
}

const ProductQuickView: React.FC<ProductQuickViewProps> = ({ product, onClose }) => {
  const { data: breeds = [] } = useQuery({
    queryKey: ['breeds'],
    queryFn: async () => {
      const { data, error } = await adminSupabase
        .from('dog_breeds')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  const getBreedName = (breedId: string) => {
    return breeds.find(b => b.id === breedId)?.name || breedId;
  };

  const affiliateLinkStatus = useMemo(() => {
    if (product.affiliate_type !== 'amazon' || !product.affiliate_link) {
      return null;
    }

    const status: AffiliateLinkStatus = {
      hasCorrectDomain: product.affiliate_link.includes('amazon.com'),
      hasCorrectTag: product.affiliate_link.includes('tag=pawfectfind-20'),
      isCorrectFormat: false,
      expectedLink: ''
    };

    // Generate the expected link format
    status.expectedLink = generateAffiliateLink(product.affiliate_link);
    status.isCorrectFormat = product.affiliate_link === status.expectedLink;

    return status;
  }, [product.affiliate_link, product.affiliate_type]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl relative">
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 p-1 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <div className="overflow-y-auto max-h-[90vh]">
          {/* Product Header */}
          <div className="flex gap-6 p-4 sm:p-6 border-b dark:border-gray-700">
            <div className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {product.name}
              </h2>
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                  <Package className="w-3 h-3 mr-1" />
                  {product.vendor}
                </span>
                {product.rating > 0 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300">
                    <Star className="w-3 h-3 mr-1" />
                    {product.rating.toFixed(1)}
                  </span>
                )}
                {product.discount > 0 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300">
                    <DollarSign className="w-3 h-3 mr-1" />
                    {product.discount}% OFF
                  </span>
                )}
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(product.price)}
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="p-4 sm:p-6 border-b dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {product.description}
            </p>
          </div>

          {/* Tags */}
          {product.tags.length > 0 && (
            <div className="p-4 sm:p-6 border-b dark:border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <Tag className="w-4 h-4 text-gray-400" />
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tags
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Breed Recommendations */}
          {product.breed_recommendations && product.breed_recommendations.length > 0 && (
            <div className="p-4 sm:p-6 border-b dark:border-gray-700">
              <div className="flex items-center gap-2 mb-3">
                <Dog className="w-4 h-4 text-gray-400" />
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Breed Recommendations
                </h3>
              </div>
              <div className="space-y-3">
                {product.breed_recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {getBreedName(rec.breed_id)}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {rec.recommendation_reason}
                      </div>
                    </div>
                    <div className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">
                      {rec.recommendation_strength}/5
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Amazon Affiliate Link Verification */}
          {product.affiliate_type === 'amazon' && affiliateLinkStatus && (
            <div className="p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Amazon Affiliate Link Status
                </h3>
                <div className="relative group">
                  <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <p className="mb-1">✅ Green check: Requirement met</p>
                    <p>⚠️ Red alert: Needs attention</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {affiliateLinkStatus.hasCorrectDomain ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Amazon.com Domain
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {affiliateLinkStatus.hasCorrectTag ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Store ID (pawfectfind-20)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {affiliateLinkStatus.isCorrectFormat ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Link Format
                  </span>
                </div>
                {!affiliateLinkStatus.isCorrectFormat && (
                  <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                      Recommended Format:
                    </p>
                    <a
                      href={affiliateLinkStatus.expectedLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs break-all text-blue-600 dark:text-blue-300 hover:underline flex items-center gap-1"
                    >
                      {affiliateLinkStatus.expectedLink}
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Product Metadata */}
          <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-800/50">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Created</div>
                <div className="text-sm text-gray-900 dark:text-white flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(product.created_at).toLocaleDateString()}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Updated</div>
                <div className="text-sm text-gray-900 dark:text-white flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(product.updated_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductQuickView;