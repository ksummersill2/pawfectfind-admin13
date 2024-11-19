import React, { useState } from 'react';
import { AlertCircle, Plus, X } from 'lucide-react';
import { AdminProduct } from '../../types';
import { useCategories } from '../../hooks/useCategories';
import { BreedSelect } from '../common';
import ProductAIHelper from './ProductAIHelper';

interface ProductFormProps {
  initialData?: AdminProduct | null;
  onSubmit: (data: AdminProduct) => Promise<void>;
  onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState<AdminProduct>({
    id: initialData?.id || '',
    name: initialData?.name || '',
    description: initialData?.description || '',
    price: initialData?.price || 0,
    rating: initialData?.rating || 0,
    popularity: initialData?.popularity || 0,
    discount: initialData?.discount || 0,
    vendor: initialData?.vendor || '',
    image: initialData?.image || '',
    category_id: initialData?.category_id || '',
    tags: initialData?.tags || [],
    affiliate_type: initialData?.affiliate_type || null,
    affiliate_link: initialData?.affiliate_link || '',
    is_black_friday: initialData?.is_black_friday || false,
    black_friday_price: initialData?.black_friday_price || null,
    breed_recommendations: initialData?.breed_recommendations || [],
    features: initialData?.features || [],
    ingredients: initialData?.ingredients || [],
    safety_warnings: initialData?.safety_warnings || [],
    life_stages: initialData?.life_stages || {
      suitable_for_puppy: false,
      suitable_for_adult: true,
      suitable_for_senior: false,
      min_age_months: null,
      max_age_months: null
    },
    size_suitability: initialData?.size_suitability || {
      suitable_for_small: false,
      suitable_for_medium: false,
      suitable_for_large: false,
      suitable_for_giant: false,
      min_weight_kg: null,
      max_weight_kg: null
    }
  });

  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { categories, loading: categoriesLoading } = useCategories();

  const handleAIGenerate = (generatedData: any) => {
    setFormData(prev => ({
      ...prev,
      description: generatedData.enhanced_description || prev.description,
      category_id: generatedData.category_recommendation?.id || prev.category_id,
      life_stages: {
        ...prev.life_stages,
        ...generatedData.life_stages
      },
      size_suitability: {
        ...prev.size_suitability,
        ...generatedData.size_suitability
      },
      breed_recommendations: generatedData.breed_recommendations?.map((rec: any) => ({
        breed_id: rec.breed_id || '',
        recommendation_strength: rec.recommendation_strength || 5,
        recommendation_reason: rec.recommendation_reason || ''
      })) || prev.breed_recommendations,
      features: generatedData.features?.filter(Boolean) || prev.features,
      safety_warnings: generatedData.safety_warnings?.filter(Boolean) || prev.safety_warnings,
      ingredients: generatedData.ingredients?.main_ingredients?.filter(Boolean) || prev.ingredients,
      tags: [...new Set([
        ...prev.tags,
        ...(generatedData.features?.map((f: string) => f.toLowerCase().replace(/[^a-z0-9]+/g, '-')) || []),
        ...(generatedData.ingredients?.main_ingredients?.map((i: string) => i.toLowerCase().replace(/[^a-z0-9]+/g, '-')) || [])
      ])]
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim()) {
      const newTags = tagInput
        .toLowerCase()
        .split(',')
        .map(tag => tag.trim())
        .filter(Boolean);

      setFormData(prev => ({
        ...prev,
        tags: [...new Set([...prev.tags, ...newTags])]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.category_id) {
      newErrors.category_id = 'Category is required';
    }

    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'Valid price is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onSubmit(formData);
    } catch (err) {
      console.error('Error submitting product:', err);
      setErrors(prev => ({
        ...prev,
        submit: 'Failed to save product'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl my-8">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="flex justify-between items-start">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {initialData ? 'Edit Product' : 'Add Product'}
            </h2>
          </div>

          {!initialData && (
            <ProductAIHelper
              productName={formData.name}
              originalDescription={formData.description}
              onGenerate={handleAIGenerate}
              disabled={isSubmitting}
            />
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Product Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.name}
              </p>
            )}
          </div>

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Price
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                disabled={isSubmitting}
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.price}
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
                disabled={isSubmitting || categoriesLoading}
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
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 hover:text-blue-900 dark:hover:text-blue-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleTagKeyPress}
                placeholder="Enter tags (press Enter or comma to add)"
                className="flex-1 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                disabled={isSubmitting || !tagInput.trim()}
              >
                Add Tag
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Image URL
            </label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
              className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
              disabled={isSubmitting}
            />
            {formData.image && (
              <img
                src={formData.image}
                alt="Product preview"
                className="mt-2 h-32 object-contain rounded-lg"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Vendor
            </label>
            <input
              type="text"
              value={formData.vendor}
              onChange={(e) => setFormData(prev => ({ ...prev, vendor: e.target.value }))}
              className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Discount (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.discount}
                onChange={(e) => setFormData(prev => ({ ...prev, discount: parseInt(e.target.value) }))}
                className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Rating (0-5)
              </label>
              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={formData.rating}
                onChange={(e) => setFormData(prev => ({ ...prev, rating: parseFloat(e.target.value) }))}
                className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                disabled={isSubmitting}
              />
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
                onClick={() => setFormData(prev => ({
                  ...prev,
                  breed_recommendations: [
                    ...prev.breed_recommendations,
                    {
                      breed_id: '',
                      recommendation_strength: 5,
                      recommendation_reason: ''
                    }
                  ]
                }))}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                disabled={isSubmitting}
              >
                Add Breed
              </button>
            </div>
            
            <div className="space-y-4">
              {formData.breed_recommendations.map((rec, index) => (
                <div key={index} className="flex gap-4 items-start">
                  <div className="flex-1 space-y-2">
                    <BreedSelect
                      value={rec.breed_id}
                      onChange={(breedId) => {
                        const newRecs = [...formData.breed_recommendations];
                        newRecs[index].breed_id = breedId;
                        setFormData(prev => ({
                          ...prev,
                          breed_recommendations: newRecs
                        }));
                      }}
                      placeholder="Select breed"
                    />
                    <select
                      value={rec.recommendation_strength}
                      onChange={(e) => {
                        const newRecs = [...formData.breed_recommendations];
                        newRecs[index].recommendation_strength = parseInt(e.target.value);
                        setFormData(prev => ({
                          ...prev,
                          breed_recommendations: newRecs
                        }));
                      }}
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
                      onChange={(e) => {
                        const newRecs = [...formData.breed_recommendations];
                        newRecs[index].recommendation_reason = e.target.value;
                        setFormData(prev => ({
                          ...prev,
                          breed_recommendations: newRecs
                        }));
                      }}
                      placeholder="Reason for recommendation"
                      className="w-full rounded-lg border-gray-300"
                      disabled={isSubmitting}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newRecs = formData.breed_recommendations.filter((_, i) => i !== index);
                      setFormData(prev => ({
                        ...prev,
                        breed_recommendations: newRecs
                      }));
                    }}
                    className="px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                    disabled={isSubmitting}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Life Stages */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Life Stages</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.life_stages.suitable_for_puppy}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      life_stages: {
                        ...prev.life_stages,
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
                    checked={formData.life_stages.suitable_for_adult}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      life_stages: {
                        ...prev.life_stages,
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
                    checked={formData.life_stages.suitable_for_senior}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      life_stages: {
                        ...prev.life_stages,
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
                    checked={formData.size_suitability.suitable_for_small}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      size_suitability: {
                        ...prev.size_suitability,
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
                    checked={formData.size_suitability.suitable_for_medium}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      size_suitability: {
                        ...prev.size_suitability,
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
                    checked={formData.size_suitability.suitable_for_large}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      size_suitability: {
                        ...prev.size_suitability,
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
                    checked={formData.size_suitability.suitable_for_giant}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      size_suitability: {
                        ...prev.size_suitability,
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

          {/* Features */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Features</h3>
            <div className="space-y-2">
              {formData.features.map((feature, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => {
                      const newFeatures = [...formData.features];
                      newFeatures[index] = e.target.value;
                      setFormData(prev => ({ ...prev, features: newFeatures }));
                    }}
                    placeholder="Product feature"
                    className="flex-1 rounded-lg border-gray-300"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newFeatures = formData.features.filter((_, i) => i !== index);
                      setFormData(prev => ({ ...prev, features: newFeatures }));
                    }}
                    className="px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                    disabled={isSubmitting}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, features: [...prev.features, ''] }))}
                className="text-sm text-blue-600 hover:text-blue-700"
                disabled={isSubmitting}
              >
                + Add Feature
              </button>
            </div>
          </div>

          {/* Ingredients */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Ingredients</h3>
            <div className="space-y-2">
              {formData.ingredients.map((ingredient, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={ingredient}
                    onChange={(e) => {
                      const newIngredients = [...formData.ingredients];
                      newIngredients[index] = e.target.value;
                      setFormData(prev => ({ ...prev, ingredients: newIngredients }));
                    }}
                    placeholder="Product ingredient"
                    className="flex-1 rounded-lg border-gray-300"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newIngredients = formData.ingredients.filter((_, i) => i !== index);
                      setFormData(prev => ({ ...prev, ingredients: newIngredients }));
                    }}
                    className="px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                    disabled={isSubmitting}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, ingredients: [...prev.ingredients, ''] }))}
                className="text-sm text-blue-600 hover:text-blue-700"
                disabled={isSubmitting}
              >
                + Add Ingredient
              </button>
            </div>
          </div>

          {/* Safety Warnings */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Safety Warnings</h3>
            <div className="space-y-2">
              {formData.safety_warnings.map((warning, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={warning}
                    onChange={(e) => {
                      const newWarnings = [...formData.safety_warnings];
                      newWarnings[index] = e.target.value;
                      setFormData(prev => ({ ...prev, safety_warnings: newWarnings }));
                    }}
                    placeholder="Safety warning"
                    className="flex-1 rounded-lg border-gray-300"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newWarnings = formData.safety_warnings.filter((_, i) => i !== index);
                      setFormData(prev => ({ ...prev, safety_warnings: newWarnings }));
                    }}
                    className="px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                    disabled={isSubmitting}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, safety_warnings: [...prev.safety_warnings, ''] }))}
                className="text-sm text-blue-600 hover:text-blue-700"
                disabled={isSubmitting}
              >
                + Add Warning
              </button>
            </div>
          </div>

          {errors.submit && (
            <div className="text-sm text-red-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.submit}
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : (initialData ? 'Update Product' : 'Create Product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;