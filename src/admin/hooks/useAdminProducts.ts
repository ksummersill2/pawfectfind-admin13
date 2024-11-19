import { useState, useEffect } from 'react';
import { adminSupabase } from '../../lib/supabase/client';
import { AdminProduct } from '../types';

export const useAdminProducts = () => {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await adminSupabase
        .from('products')
        .select(`
          *,
          product_breed_recommendations (
            breed_id,
            recommendation_strength,
            recommendation_reason
          )
        `)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      
      // Transform the data to match the AdminProduct type
      const transformedData = data?.map(product => ({
        ...product,
        breed_recommendations: product.product_breed_recommendations
      })) || [];
      
      setProducts(transformedData);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const saveProduct = async (productData: any): Promise<boolean> => {
    try {
      const timestamp = new Date().toISOString();
      
      // Extract data for related tables
      const { 
        breed_recommendations,
        life_stages,
        size_suitability,
        health_benefits,
        ...mainProductData
      } = productData;

      // Start a transaction by inserting/updating the main product first
      const { data: product, error: productError } = await adminSupabase
        .from('products')
        .upsert([{
          ...mainProductData,
          updated_at: timestamp,
          created_at: mainProductData.id ? undefined : timestamp
        }])
        .select()
        .single();

      if (productError) throw productError;

      // Handle breed recommendations
      if (breed_recommendations?.length > 0) {
        // First delete existing recommendations
        const { error: deleteError } = await adminSupabase
          .from('product_breed_recommendations')
          .delete()
          .eq('product_id', product.id);

        if (deleteError) throw deleteError;

        // Then insert new recommendations
        const breedRecsData = breed_recommendations.map((rec: any) => ({
          product_id: product.id,
          breed_id: rec.breed_id,
          recommendation_strength: rec.recommendation_strength || 5,
          recommendation_reason: rec.recommendation_reason || '',
          created_at: timestamp,
          updated_at: timestamp
        }));

        const { error: breedRecsError } = await adminSupabase
          .from('product_breed_recommendations')
          .insert(breedRecsData);

        if (breedRecsError) throw breedRecsError;
      }

      // Handle life stages if provided
      if (life_stages) {
        const { error: lifeStagesError } = await adminSupabase
          .from('product_life_stages')
          .upsert([{
            product_id: product.id,
            suitable_for_puppy: life_stages.suitable_for_puppy || false,
            suitable_for_adult: life_stages.suitable_for_adult || true,
            suitable_for_senior: life_stages.suitable_for_senior || false,
            min_age_months: life_stages.min_age_months || null,
            max_age_months: life_stages.max_age_months || null,
            created_at: timestamp,
            updated_at: timestamp
          }]);

        if (lifeStagesError) throw lifeStagesError;
      }

      // Handle size suitability if provided
      if (size_suitability) {
        const { error: sizeError } = await adminSupabase
          .from('product_size_suitability')
          .upsert([{
            product_id: product.id,
            suitable_for_small: size_suitability.suitable_for_small || false,
            suitable_for_medium: size_suitability.suitable_for_medium || false,
            suitable_for_large: size_suitability.suitable_for_large || false,
            suitable_for_giant: size_suitability.suitable_for_giant || false,
            min_weight_kg: size_suitability.min_weight_kg || null,
            max_weight_kg: size_suitability.max_weight_kg || null,
            created_at: timestamp,
            updated_at: timestamp
          }]);

        if (sizeError) throw sizeError;
      }

      // Handle health benefits if provided
      if (health_benefits?.length > 0) {
        const healthBenefitsData = health_benefits
          .filter((benefit: any) => benefit.health_condition_id && benefit.benefit_description)
          .map((benefit: any) => ({
            product_id: product.id,
            health_condition_id: benefit.health_condition_id,
            benefit_description: benefit.benefit_description,
            created_at: timestamp,
            updated_at: timestamp
          }));

        if (healthBenefitsData.length > 0) {
          const { error: healthBenefitsError } = await adminSupabase
            .from('product_health_benefits')
            .insert(healthBenefitsData);

          if (healthBenefitsError) throw healthBenefitsError;
        }
      }

      await fetchProducts();
      return true;
    } catch (err) {
      console.error('Error saving product:', err);
      throw err;
    }
  };

  const deleteProduct = async (productId: string): Promise<boolean> => {
    try {
      // Delete related records first
      await Promise.all([
        adminSupabase
          .from('product_life_stages')
          .delete()
          .eq('product_id', productId),
        adminSupabase
          .from('product_size_suitability')
          .delete()
          .eq('product_id', productId),
        adminSupabase
          .from('product_breed_recommendations')
          .delete()
          .eq('product_id', productId),
        adminSupabase
          .from('product_health_benefits')
          .delete()
          .eq('product_id', productId)
      ]);

      // Then delete the main product
      const { error } = await adminSupabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
      
      setProducts(prevProducts => 
        prevProducts.filter(product => product.id !== productId)
      );
      
      return true;
    } catch (err) {
      console.error('Error deleting product:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete product');
      return false;
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    error,
    saveProduct,
    deleteProduct,
    refreshProducts: fetchProducts
  };
};

export default useAdminProducts;