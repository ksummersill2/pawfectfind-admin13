import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { adminSupabase } from '../../lib/supabase/client';
import { useAdminProducts } from '../hooks/useAdminProducts';
import { mapCsvToProduct, validateProduct } from '../utils/cjImport';
import ImportProgress from '../components/cj/ImportProgress';
import CJProductList from '../components/cj/CJProductList';
import ProductDetailsModal from '../components/products/ProductDetailsModal';
import { useNotification } from '../hooks/useNotification';
import Notification from '../components/common/Notification';
import type { CJProduct } from '../types/cjProduct';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const CJImport: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importProgress, setImportProgress] = useState(0);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [products, setProducts] = useState<CJProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<CJProduct | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const { saveProduct } = useAdminProducts();
  const { notification, showNotification, hideNotification } = useNotification();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const { data, error: fetchError } = await adminSupabase
        .from('cj_temp_products')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setProducts(data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load imported products');
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setImportProgress(0);
    setError(null);
    setImportStatus('Starting import process...');

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const { data, errors } = results;
          if (errors.length > 0) {
            throw new Error('CSV parsing failed: ' + errors[0].message);
          }

          setImportStatus(`Found ${data.length} products to import`);
          const total = data.length;
          let processed = 0;
          let hasErrors = false;

          for (const row of data) {
            try {
              setImportStatus(`Processing product ${processed + 1} of ${total}`);
              const mappedProduct = mapCsvToProduct(row);
              
              const validationError = validateProduct(mappedProduct);
              if (validationError) {
                throw new Error(validationError);
              }

              const { error: insertError } = await adminSupabase
                .from('cj_temp_products')
                .insert([mappedProduct as CJProduct]);

              if (insertError) {
                throw new Error(`Database error: ${insertError.message}`);
              }

              processed++;
              setImportProgress(Math.round((processed / total) * 100));
            } catch (err) {
              const errorMessage = err instanceof Error ? err.message : 'Unknown error';
              console.error('Error importing product:', err);
              hasErrors = true;
              setError(`Error importing product: ${errorMessage}`);
              
              const shouldContinue = window.confirm(
                `An error occurred while importing a product.\n\n` +
                `Error: ${errorMessage}\n\n` +
                `Would you like to continue importing the remaining products?`
              );
              
              if (!shouldContinue) {
                throw new Error('Import cancelled by user');
              }
            }
          }

          await fetchProducts();
          if (!hasErrors) {
            showNotification('success', 'Products imported successfully!');
          }
        } catch (err) {
          console.error('Import error:', err);
          showNotification('error', 'Failed to import products. Please try again.');
        } finally {
          setLoading(false);
          setImportProgress(0);
          setImportStatus(null);
        }
      },
      error: (error) => {
        console.error('CSV parsing error:', error);
        showNotification('error', 'Failed to parse CSV file');
        setLoading(false);
        setImportStatus(null);
      }
    });
  };

  const handleImport = async (productData: any) => {
    try {
      const success = await saveProduct(productData);
      if (success) {
        // Update imported status in CJ temp products
        const { error: updateError } = await adminSupabase
          .from('cj_temp_products')
          .update({ imported: true })
          .eq('catalog_id', selectedProduct?.catalog_id);

        if (updateError) throw updateError;

        showNotification('success', 'Product imported successfully!');
        setShowDetailsModal(false);
        setSelectedProduct(null);
        
        // Refresh the product list
        await fetchProducts();
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
          Import CJ Affiliate Products
        </h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Upload CSV File
          </label>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-500 dark:text-gray-400
              file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100
              dark:file:bg-blue-900/50 dark:file:text-blue-200"
            disabled={loading}
          />
        </div>

        <ImportProgress
          loading={loading}
          error={error}
          importStatus={importStatus}
          importProgress={importProgress}
          showSuccess={showSuccess}
        />
      </div>

      <CJProductList
        products={products}
        loading={loadingProducts}
        onImport={(product) => {
          setSelectedProduct(product);
          setShowDetailsModal(true);
        }}
      />

      {showDetailsModal && selectedProduct && (
        <ProductDetailsModal
          product={{
            asin: selectedProduct.catalog_id,
            product_title: selectedProduct.name,
            product_price: selectedProduct.price.toString(),
            product_original_price: selectedProduct.retail_price?.toString() || null,
            product_star_rating: '0',
            product_num_ratings: 0,
            product_photo: selectedProduct.image_url,
            product_url: selectedProduct.buy_url,
            description: selectedProduct.description
          }}
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

export default CJImport;