import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { CJProduct } from '../../types/cjProduct';
import { BreedSelect } from '../common';
import { adminSupabase } from '../../../lib/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface CJProductDetailsModalProps {
  product: CJProduct;
  onClose: () => void;
  onImport: (product: any) => Promise<void>;
}

const CJProductDetailsModal: React.FC<CJProductDetailsModalProps> = ({
  product,
  onClose,
  onImport
}) => {
  const [formData, setFormData] = useState({
    description: product.description || product.name,
    category_id: '',
    breedRecommendations: [] as Array<{
      breed_id: string;
      recommendation_strength: number;
      recommendation_reason: string;
    }>,
    lifeStages: {
      suitable_for_puppy: false,
      suitable_for_adult: true,
      suitable_for_senior: false,
      min_age_months: 0,
      max_age_months: null as number | null
    },
    sizeSuitability: {
      suitable_for_small: false,
      suitable_for_medium: false,
      suitable_for_large: false,
      suitable_for_giant: false,
      min_weight_kg: null as number | null,
      max_weight_kg: null as number | null
    },
    healthBenefits: [{
      health_condition_id: '',
      benefit_description: ''
    }],
    features: [''],
    ingredients: [''],
    safetyWarnings: ['']
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await adminSupabase
        .from('categories')
        .select('id, name')
        .eq('type', 'product')
        .order('name');

      if (error) throw error;
      return data;
    }
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.category_id) {
      newErrors.category_id = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || isSubmitting) return;

    try {
      setIsSubmitting(true);

      const importData = {
        name: product.name,
        description: formData.description,
        price: product.price,
        rating: 0,
        rating_count: 0,
        popularity: 0,
        discount: 0,
        vendor: product.advertiser_name,
        image: product.image_url,
        category_id: formData.category_id,
        tags: [],
        affiliate_type: 'cj',
        affiliate_link: product.buy_url,
        is_black_friday: false,
        black_friday_price: null,
        ingredients: formData.ingredients.filter(Boolean),
        features: formData.features.filter(Boolean),
        safety_warnings: formData.safetyWarnings.filter(Boolean),
        life_stages: formData.lifeStages,
        size_suitability: formData.sizeSuitability,
        breed_recommendations: formData.breedRecommendations,
        health_benefits: formData.healthBenefits.filter(b => b.health_condition_id && b.benefit_description)
      };

      await onImport(importData);
    } catch (err) {
      console.error('Error importing product:', err);
      setErrors(prev => ({
        ...prev,
        submit: 'Failed to import product'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const addBreedRecommendation = () => {
    setFormData(prev => ({
      ...prev,
      breedRecommendations: [
        ...prev.breedRecommendations,
        {
          breed_id: '',
          recommendation_strength: 5,
          recommendation_reason: ''
        }
      ]
    }));
  };

  const updateBreedRecommendation = (index: number, field: string, value: any) => {
    const newRecommendations = [...formData.breedRecommendations];
    newRecommendations[index] = {
      ...newRecommendations[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      breedRecommendations: newRecommendations
    }));
  };

  const removeBreedRecommendation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      breedRecommendations: prev.breedRecommendations.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl my-8">
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-start">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Import Product Details
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                disabled={isSubmitting}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.description}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                disabled={isSubmitting}
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.category_id && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.category_id}
                </p>
              )}
            </div>

            {/* Life Stages */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Life Stages</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.lifeStages.suitable_for_puppy}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        lifeStages: {
                          ...prev.lifeStages,
                          suitable_for_puppy: e.target.checked
                        }
                      }))}
                      className="rounded border-gray-300"
                      disabled={isSubmitting}
                    />
                    <span className="ml-2">Suitable for Puppies</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.lifeStages.suitable_for_adult}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        lifeStages: {
                          ...prev.lifeStages,
                          suitable_for_adult: e.target.checked
                        }
                      }))}
                      className="rounded border-gray-300"
                      disabled={isSubmitting}
                    />
                    <span className="ml-2">Suitable for Adults</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.lifeStages.suitable_for_senior}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        lifeStages: {
                          ...prev.lifeStages,
                          suitable_for_senior: e.target.checked
                        }
                      }))}
                      className="rounded border-gray-300"
                      disabled={isSubmitting}
                    />
                    <span className="ml-2">Suitable for Seniors</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Size Suitability */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Size Suitability</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.sizeSuitability.suitable_for_small}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        sizeSuitability: {
                          ...prev.sizeSuitability,
                          suitable_for_small: e.target.checked
                        }
                      }))}
                      className="rounded border-gray-300"
                      disabled={isSubmitting}
                    />
                    <span className="ml-2">Suitable for Small Dogs</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.sizeSuitability.suitable_for_medium}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        sizeSuitability: {
                          ...prev.sizeSuitability,
                          suitable_for_medium: e.target.checked
                        }
                      }))}
                      className="rounded border-gray-300"
                      disabled={isSubmitting}
                    />
                    <span className="ml-2">Suitable for Medium Dogs</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.sizeSuitability.suitable_for_large}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        sizeSuitability: {
                          ...prev.sizeSuitability,
                          suitable_for_large: e.target.checked
                        }
                      }))}
                      className="rounded border-gray-300"
                      disabled={isSubmitting}
                    />
                    <span className="ml-2">Suitable for Large Dogs</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.sizeSuitability.suitable_for_giant}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        sizeSuitability: {
                          ...prev.sizeSuitability,
                          suitable_for_giant: e.target.checked
                        }
                      }))}
                      className="rounded border-gray-300"
                      disabled={isSubmitting}
                    />
                    <span className="ml-2">Suitable for Giant Dogs</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Breed Recommendations */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Breed Recommendations
                </h3>
                <button
                  type="button"
                  onClick={addBreedRecommendation}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  disabled={isSubmitting}
                >
                  Add Breed
                </button>
              </div>
              
              <div className="space-y-4">
                {formData.breedRecommendations.map((rec, index) => (
                  <div key={index} className="flex gap-4 items-start">
                    <div className="flex-1 space-y-2">
                      <BreedSelect
                        value={rec.breed_id}
                        onChange={(breedId) => updateBreedRecommendation(index, 'breed_id', breedId)}
                        placeholder="Select breed"
                      />
                      <select
                        value={rec.recommendation_strength}
                        onChange={(e) => updateBreedRecommendation(index, 'recommendation_strength', parseInt(e.target.value))}
                        className="w-full rounded-lg border-gray-300"
                        disabled={isSubmitting}
                      >
                        {[1, 2, 3, 4, 5].map(n => (
                          <option key={n} value={n}>
                            {n} - {n === 1 ? 'Not Recommended' : n === 5 ? 'Highly Recommended' : `${n}/5`}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={rec.recommendation_reason}
                        onChange={(e) => updateBreedRecommendation(index, 'recommendation_reason', e.target.value)}
                        placeholder="Reason for recommendation"
                        className="w-full rounded-lg border-gray-300"
                        disabled={isSubmitting}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeBreedRecommendation(index)}
                      className="px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                      disabled={isSubmitting}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {errors.submit && (
              <div className="text-sm text-red-600 flex items-center justify-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.submit}
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Importing...' : 'Import Product'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CJProductDetailsModal;