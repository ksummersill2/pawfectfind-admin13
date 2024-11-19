import React, { useState } from 'react';
import { RefreshCw, AlertCircle, CheckCircle, Settings } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminSupabase } from '../../../lib/supabase/client';
import { generateAffiliateLink } from '../../../lib/amazonAffiliateLink';
import { formatCurrency } from '../../../utils/formatters';

interface VerificationSummary {
  totalProducts: number;
  priceUpdates: number;
  linkUpdates: number;
  unavailable: number;
  errors: number;
}

interface VerificationResult {
  id: string;
  name: string;
  status: 'valid' | 'invalid' | 'price_changed' | 'link_updated';
  oldPrice?: number;
  newPrice?: number;
  error?: string;
}

const ProductVerificationButton: React.FC = () => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [results, setResults] = useState<VerificationResult[]>([]);
  const [summary, setSummary] = useState<VerificationSummary>({
    totalProducts: 0,
    priceUpdates: 0,
    linkUpdates: 0,
    unavailable: 0,
    errors: 0
  });
  const [showResults, setShowResults] = useState(false);
  const [autoUpdate, setAutoUpdate] = useState(true);
  const queryClient = useQueryClient();

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, price }: { id: string; price: number }) => {
      const { error } = await adminSupabase
        .from('products')
        .update({ price })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });

  const verifyProduct = async (product: any) => {
    try {
      const asinMatch = product.affiliate_link?.match(/\/([A-Z0-9]{10})(?:[/?]|$)/);
      if (!asinMatch) {
        return {
          id: product.id,
          name: product.name,
          status: 'invalid' as const,
          error: 'Invalid Amazon link format'
        };
      }

      const asin = asinMatch[1];
      
      const response = await fetch(
        `https://real-time-amazon-data.p.rapidapi.com/product-details?asin=${asin}&country=US`,
        {
          headers: {
            'x-rapidapi-key': import.meta.env.VITE_RAPID_API_KEY,
            'x-rapidapi-host': 'real-time-amazon-data.p.rapidapi.com'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch product details');
      }

      const data = await response.json();
      
      if (!data.data || data.data.not_found || !data.data.product_title) {
        return {
          id: product.id,
          name: product.name,
          status: 'invalid' as const,
          error: 'Product no longer exists on Amazon'
        };
      }

      const priceStr = data.data.product_price || data.data.current_price;
      if (!priceStr) {
        return {
          id: product.id,
          name: product.name,
          status: 'invalid' as const,
          error: 'Could not determine product price'
        };
      }

      const newPrice = parseFloat(priceStr.replace(/[^0-9.]/g, ''));
      const oldPrice = product.price;
      const properAffiliateLink = generateAffiliateLink(data.data.product_url || `https://www.amazon.com/dp/${asin}`);
      let status: VerificationResult['status'] = 'valid';
      
      // Check if link needs updating
      if (properAffiliateLink !== product.affiliate_link) {
        await adminSupabase
          .from('products')
          .update({ affiliate_link: properAffiliateLink })
          .eq('id', product.id);
        status = 'link_updated';
      }

      // Check if price needs updating
      const priceThreshold = 0.01;
      const priceDifference = Math.abs(newPrice - oldPrice);

      if (priceDifference > priceThreshold) {
        if (autoUpdate) {
          await updateProductMutation.mutateAsync({ id: product.id, price: newPrice });
          status = 'price_changed';
        }
      }

      return {
        id: product.id,
        name: product.name,
        status,
        oldPrice,
        newPrice: priceDifference > priceThreshold ? newPrice : undefined
      };
    } catch (err) {
      console.error('Error verifying product:', err);
      return {
        id: product.id,
        name: product.name,
        status: 'invalid' as const,
        error: err instanceof Error ? err.message : 'Failed to verify product'
      };
    }
  };

  const handleVerification = async () => {
    setIsVerifying(true);
    setResults([]);
    setShowResults(true);
    setSummary({
      totalProducts: 0,
      priceUpdates: 0,
      linkUpdates: 0,
      unavailable: 0,
      errors: 0
    });

    try {
      const { data: products, error } = await adminSupabase
        .from('products')
        .select('*')
        .eq('affiliate_type', 'amazon');

      if (error) throw error;

      const batchSize = 5;
      let currentSummary = {
        totalProducts: products.length,
        priceUpdates: 0,
        linkUpdates: 0,
        unavailable: 0,
        errors: 0
      };

      for (let i = 0; i < products.length; i += batchSize) {
        const batch = products.slice(i, i + batchSize);
        const batchResults = await Promise.all(batch.map(verifyProduct));
        
        // Update summary
        batchResults.forEach(result => {
          if (result.status === 'price_changed') currentSummary.priceUpdates++;
          if (result.status === 'link_updated') currentSummary.linkUpdates++;
          if (result.status === 'invalid') {
            if (result.error?.includes('no longer exists')) {
              currentSummary.unavailable++;
            } else {
              currentSummary.errors++;
            }
          }
        });

        setSummary(currentSummary);
        setResults(prev => [...prev, ...batchResults]);
        
        if (i + batchSize < products.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    } catch (err) {
      console.error('Error during verification:', err);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={handleVerification}
          disabled={isVerifying}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isVerifying ? 'animate-spin' : ''}`} />
          {isVerifying ? 'Verifying...' : 'Verify Products'}
        </button>
        <button
          onClick={() => setShowResults(true)}
          className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          title="Verification Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {showResults && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl my-8">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Product Verification
                </h2>
                <button
                  onClick={() => setShowResults(false)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <span className="sr-only">Close</span>
                  ×
                </button>
              </div>

              {/* Settings */}
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={autoUpdate}
                    onChange={(e) => setAutoUpdate(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Automatically update prices when changes are detected
                  </span>
                </label>
              </div>

              {/* Verification Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="text-sm text-blue-600 dark:text-blue-400">Total Products</div>
                  <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {summary.totalProducts}
                  </div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <div className="text-sm text-yellow-600 dark:text-yellow-400">Price Updates</div>
                  <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                    {summary.priceUpdates}
                  </div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <div className="text-sm text-purple-600 dark:text-purple-400">Link Updates</div>
                  <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                    {summary.linkUpdates}
                  </div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                  <div className="text-sm text-red-600 dark:text-red-400">Unavailable</div>
                  <div className="text-2xl font-bold text-red-700 dark:text-red-300">
                    {summary.unavailable}
                  </div>
                </div>
              </div>

              {/* Status Messages */}
              <div className="space-y-2 mb-6">
                {isVerifying && (
                  <div className="flex items-center text-blue-600 dark:text-blue-400">
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Verifying products...
                  </div>
                )}
                {!isVerifying && summary.totalProducts > 0 && (
                  <>
                    {summary.priceUpdates > 0 && (
                      <div className="flex items-center text-yellow-600 dark:text-yellow-400">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Updated {summary.priceUpdates} product prices
                      </div>
                    )}
                    {summary.linkUpdates > 0 && (
                      <div className="flex items-center text-purple-600 dark:text-purple-400">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Fixed {summary.linkUpdates} affiliate links
                      </div>
                    )}
                    {summary.unavailable > 0 && (
                      <div className="flex items-center text-red-600 dark:text-red-400">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        {summary.unavailable} products are no longer available
                      </div>
                    )}
                    {summary.errors > 0 && (
                      <div className="flex items-center text-red-600 dark:text-red-400">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        {summary.errors} errors occurred during verification
                      </div>
                    )}
                    {summary.priceUpdates === 0 && summary.linkUpdates === 0 && 
                     summary.unavailable === 0 && summary.errors === 0 && (
                      <div className="flex items-center text-green-600 dark:text-green-400">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        All products are up to date
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setShowResults(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductVerificationButton;