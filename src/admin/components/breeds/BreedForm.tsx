import React, { useState } from 'react';
import { AlertCircle, Plus, X } from 'lucide-react';
import { AdminBreedForm, AdminFormErrors, AdminBreedLifeStage } from '../../types';
import { useBreedForm } from '../../hooks/useBreedForm';
import BreedSizeVariationForm from './BreedSizeVariationForm';
import BreedLifeStageForm from './BreedLifeStageForm';
import BreedAIGenerator from './BreedAIGenerator';

interface BreedFormProps {
  initialData?: AdminBreedForm;
  onSubmit: (data: AdminBreedForm) => Promise<void>;
  onCancel: () => void;
}

const BreedForm: React.FC<BreedFormProps> = ({
  initialData,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState<AdminBreedForm>(initialData || {
    name: '',
    description: '',
    size_variations: []
  });
  const [lifeStages, setLifeStages] = useState<AdminBreedLifeStage[]>([]);
  const [errors, setErrors] = useState<AdminFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { validateBreedForm } = useBreedForm();
  const [activeTab, setActiveTab] = useState<number>(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const validationErrors = validateBreedForm(formData);
    if (validationErrors) {
      setErrors(validationErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(formData);
    } catch (err) {
      console.error('Error submitting breed:', err);
      setErrors({ submit: 'Failed to save breed' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAIGenerate = (generatedData: Partial<AdminBreedForm>) => {
    setFormData(prev => ({
      ...prev,
      description: generatedData.description || prev.description,
      size_variations: generatedData.size_variations || prev.size_variations
    }));
  };

  const addSizeVariation = () => {
    setFormData(prev => ({
      ...prev,
      size_variations: [
        ...prev.size_variations,
        {
          size_category: 'medium',
          size_description: '',
          image: null,
          shared_characteristics: true,
          dietary_needs: null,
          health_issues: [],
          care_instructions: null,
          special_considerations: null,
          male_characteristics: {
            gender: 'male',
            min_height_cm: 0,
            max_height_cm: 0,
            min_weight_kg: 0,
            max_weight_kg: 0,
            life_expectancy_years: 0,
            energy_level: 5,
            grooming_needs: 5,
            shedding_level: 5,
            trainability: 5,
            barking_level: 5,
            good_with_children: true,
            good_with_other_dogs: true,
            good_with_strangers: true,
            exercise_needs_minutes: 60,
            dietary_needs: null,
            health_issues: [],
            care_instructions: null,
            special_considerations: null
          },
          female_characteristics: {
            gender: 'female',
            min_height_cm: 0,
            max_height_cm: 0,
            min_weight_kg: 0,
            max_weight_kg: 0,
            life_expectancy_years: 0,
            energy_level: 5,
            grooming_needs: 5,
            shedding_level: 5,
            trainability: 5,
            barking_level: 5,
            good_with_children: true,
            good_with_other_dogs: true,
            good_with_strangers: true,
            exercise_needs_minutes: 60,
            dietary_needs: null,
            health_issues: [],
            care_instructions: null,
            special_considerations: null
          }
        }
      ]
    }));
    setActiveTab(formData.size_variations.length);
  };

  const handleSizeVariationChange = (updatedVariation: any, index: number) => {
    const newVariations = [...formData.size_variations];
    newVariations[index] = updatedVariation;
    
    setFormData(prev => ({
      ...prev,
      size_variations: newVariations
    }));
  };

  const removeSizeVariation = async (index: number) => {
    const variation = formData.size_variations[index];
    
    try {
      if (variation.id && initialData?.id) {
        await deleteSizeVariation(variation.id);
      }
      
      setFormData(prev => ({
        ...prev,
        size_variations: prev.size_variations.filter((_, i) => i !== index)
      }));
      
      setActiveTab(Math.max(0, activeTab - 1));
    } catch (err) {
      console.error('Error removing size variation:', err);
      setErrors(prev => ({
        ...prev,
        submit: 'Failed to remove size variation'
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Basic Information
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Breed Name
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

          {formData.name && (
            <BreedAIGenerator
              breedName={formData.name}
              onGenerate={handleAIGenerate}
              disabled={isSubmitting}
            />
          )}

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
        </div>
      </div>

      {/* Size Variations */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Size Variations
          </h3>
          <button
            type="button"
            onClick={addSizeVariation}
            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            disabled={isSubmitting}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Variation
          </button>
        </div>

        {formData.size_variations.length > 0 ? (
          <div>
            <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
              {formData.size_variations.map((variation, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setActiveTab(index)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                    activeTab === index
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {variation.size_category.charAt(0).toUpperCase() + variation.size_category.slice(1)}
                </button>
              ))}
            </div>

            <div className="relative border dark:border-gray-700 rounded-lg p-6">
              <button
                type="button"
                onClick={() => removeSizeVariation(activeTab)}
                className="absolute -top-3 -right-3 p-1 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>

              <BreedSizeVariationForm
                variation={formData.size_variations[activeTab]}
                onChange={(updatedVariation) => handleSizeVariationChange(updatedVariation, activeTab)}
                errors={errors.size_variations?.[activeTab]}
                disabled={isSubmitting}
              />
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 py-4">
            No size variations added yet. Click "Add Variation" to start.
          </p>
        )}
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
          {isSubmitting ? 'Saving...' : (initialData ? 'Update Breed' : 'Create Breed')}
        </button>
      </div>
    </form>
  );
};

export default BreedForm;