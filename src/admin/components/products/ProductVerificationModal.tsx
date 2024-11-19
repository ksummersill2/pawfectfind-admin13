import React from 'react';
import { X, AlertTriangle, CheckCircle, ExternalLink, DollarSign } from 'lucide-react';
import { useProductVerification } from '../../hooks/useProductVerification';
import { formatCurrency } from '../../../utils/formatters';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

interface ProductVerificationModalProps {
  onClose: () => void;
}

const ProductVerificationModal: React.FC<ProductVerificationModalProps> = ({ onClose }) => {
  const { 
    isVerifying,
    verificationResults,
    progress,
    removeProduct,
    updateProductPrice,
    markAsVerified
  } = useProductVerification();

  const handleRemove = async (productId: string) => {
    if (window.confirm('Are you sure you want to remove this product?')) {
      await removeProduct(productId);
    }
  };

  const handleUpdatePrice = async (productId: string, newPrice: number) => {
    await updateProductPrice(productId, newPrice);
  };

  const handleMarkVerified = async (productId: string) => {
    await markAsVerified(productId);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-3xl">
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Product Verification
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 max-h-[70vh] overflow-y-auto">
          {isVerifying ? (
            <div className="text-center py-8">
              <LoadingSpinner />
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                Verifying products... {progress.toFixed(0)}%
              </p>
            </div>
          ) : verificationResults.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                All products have been verified successfully!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {verificationResults.map((result) => (
                <div
                  key={result.productId}
                  className="border dark:border-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 flex-shrink-0">
                      <img
                        src={result.image}
                        alt={result.name}
                        className="w-full h-full object-contain rounded"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {result.name}
                      </h3>
                      
                      {result.exists === false ? (
                        <div className="mt-2 flex items-center text-red-600 dark:text-red-400">
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          Product no longer available
                        </div>
                      ) : result.priceChanged ? (
                        <div className="mt-2 space-y-2">
                          <div className="flex items-center text-amber-600 dark:text-amber-400">
                            <DollarSign className="w-4 h-4 mr-1" />
                            Price changed from {formatCurrency(result.currentPrice)} to {formatCurrency(result.newPrice)}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUpdatePrice(result.productId, result.newPrice)}
                              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                              Update Price
                            </button>
                            <button
                              onClick={() => handleMarkVerified(result.productId)}
                              className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                            >
                              Keep Current Price
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      {result.exists === false && (
                        <button
                          onClick={() => handleRemove(result.productId)}
                          className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductVerificationModal;