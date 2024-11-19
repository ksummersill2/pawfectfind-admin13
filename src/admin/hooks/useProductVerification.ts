import { useState } from 'react';
import { adminSupabase } from '../../lib/supabase/client';

interface VerificationResult {
  productId: string;
  name: string;
  image: string;
  url: string;
  exists: boolean;
  currentPrice: number;
  newPrice: number;
  priceChanged: boolean;
}

export const useProductVerification = () => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResults, setVerificationResults] = useState<VerificationResult[]>([]);
  const [progress, setProgress] = useState(0);

  const verifyAmazonProduct = async (url: string): Promise<{ exists: boolean; price?: number }> => {
    try {
      const response = await fetch(`https://api.rainforestapi.com/request?api_key=${import.meta.env.VITE_RAINFOREST_API_KEY}&type=product&url=${encodeURIComponent(url)}`);
      
      if (!response.ok) {
        throw new Error('Failed to verify product');
      }

      const data = await response.json();
      
      return {
        exists: data.product !== null,
        price: data.product?.buybox_price ? parseFloat(data.product.buybox_price) : undefined
      };
    } catch (err) {
      console.error('Error verifying product:', err);
      return { exists: false };
    }
  };

  const startVerification = async () => {
    try {
      setIsVerifying(true);
      setVerificationResults([]);
      setProgress(0);

      // Fetch all Amazon products
      const { data: products, error } = await adminSupabase
        .from('products')
        .select('*')
        .eq('affiliate_type', 'amazon');

      if (error) throw error;

      const results: VerificationResult[] = [];
      
      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        const verification = await verifyAmazonProduct(product.affiliate_link);
        
        if (!verification.exists || (verification.price && Math.abs(verification.price - product.price) > 0.01)) {
          results.push({
            productId: product.id,
            name: product.name,
            image: product.image,
            url: product.affiliate_link,
            exists: verification.exists,
            currentPrice: product.price,
            newPrice: verification.price || product.price,
            priceChanged: verification.exists && verification.price !== undefined && Math.abs(verification.price - product.price) > 0.01
          });
        }

        setProgress((i + 1) / products.length * 100);
      }

      setVerificationResults(results);
    } catch (err) {
      console.error('Error during verification:', err);
    } finally {
      setIsVerifying(false);
    }
  };

  const removeProduct = async (productId: string) => {
    try {
      const { error } = await adminSupabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      setVerificationResults(prev => 
        prev.filter(result => result.productId !== productId)
      );
    } catch (err) {
      console.error('Error removing product:', err);
    }
  };

  const updateProductPrice = async (productId: string, newPrice: number) => {
    try {
      const { error } = await adminSupabase
        .from('products')
        .update({ price: newPrice })
        .eq('id', productId);

      if (error) throw error;

      setVerificationResults(prev => 
        prev.filter(result => result.productId !== productId)
      );
    } catch (err) {
      console.error('Error updating product price:', err);
    }
  };

  const markAsVerified = async (productId: string) => {
    setVerificationResults(prev => 
      prev.filter(result => result.productId !== productId)
    );
  };

  return {
    isVerifying,
    verificationResults,
    progress,
    startVerification,
    removeProduct,
    updateProductPrice,
    markAsVerified
  };
};

export default useProductVerification;