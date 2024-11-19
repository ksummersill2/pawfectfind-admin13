import React from 'react';
import { AlertCircle } from 'lucide-react';
import { AdminBreedSizeVariation, AdminFormErrors } from '../../types';
import BreedCharacteristicsForm from './BreedCharacteristicsForm';

interface BreedSizeVariationFormProps {
  variation: AdminBreedSizeVariation;
  onChange: (variation: AdminBreedSizeVariation) => void;
  errors?: AdminFormErrors['size_variations'];
  disabled?: boolean;
}

const defaultCharacteristics = {
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
  dietary_needs: '',
  health_issues: [],
  care_instructions: '',
  special_considerations: ''
};

const BreedSizeVariationForm: React.FC<BreedSizeVariationFormProps> = ({
  variation,
  onChange,
  errors,
  disabled
}) => {
  const handleChange = (field: keyof AdminBreedSizeVariation, value: any) => {
    onChange({
      ...variation,
      [field]: value
    });
  };

  const handleMaleCharacteristicsChange = (characteristics: any) => {
    onChange({
      ...variation,
      male_characteristics: {
        ...characteristics,
        gender: 'male'
      }
    });
  };

  const handleFemaleCharacteristicsChange = (characteristics: any) => {
    onChange({
      ...variation,
      female_characteristics: {
        ...characteristics,
        gender: 'female'
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Size Category
          </label>
          <select
            value={variation.size_category}
            onChange={(e) => handleChange('size_category', e.target.value)}
            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
            disabled={disabled}
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
            <option value="giant">Giant</option>
          </select>
          {errors?.size_category && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.size_category}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Size Description
          </label>
          <input
            type="text"
            value={variation.size_description || ''}
            onChange={(e) => handleChange('size_description', e.target.value)}
            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
            disabled={disabled}
          />
          {errors?.size_description && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.size_description}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Image URL
        </label>
        <input
          type="url"
          value={variation.image || ''}
          onChange={(e) => handleChange('image', e.target.value)}
          className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
          disabled={disabled}
        />
        {variation.image && (
          <img 
            src={variation.image} 
            alt="Size variation" 
            className="mt-2 max-w-xs rounded-lg"
          />
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Health Issues (one per line)
        </label>
        <textarea
          value={variation.health_issues?.join('\n') || ''}
          onChange={(e) => handleChange('health_issues', e.target.value.split('\n').filter(Boolean))}
          rows={3}
          className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
          disabled={disabled}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Dietary Needs
        </label>
        <textarea
          value={variation.dietary_needs || ''}
          onChange={(e) => handleChange('dietary_needs', e.target.value)}
          rows={3}
          className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
          disabled={disabled}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Care Instructions
        </label>
        <textarea
          value={variation.care_instructions || ''}
          onChange={(e) => handleChange('care_instructions', e.target.value)}
          rows={3}
          className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
          disabled={disabled}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Special Considerations
        </label>
        <textarea
          value={variation.special_considerations || ''}
          onChange={(e) => handleChange('special_considerations', e.target.value)}
          rows={3}
          className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
          disabled={disabled}
        />
      </div>

      <div className="border-t dark:border-gray-700 pt-6">
        <label className="flex items-center mb-4">
          <input
            type="checkbox"
            checked={variation.shared_characteristics || false}
            onChange={(e) => handleChange('shared_characteristics', e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            disabled={disabled}
          />
          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
            Use same characteristics for male and female
          </span>
        </label>

        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Male Characteristics
            </h4>
            <BreedCharacteristicsForm
              characteristics={variation.male_characteristics || defaultCharacteristics}
              onChange={handleMaleCharacteristicsChange}
              errors={errors?.characteristics}
              disabled={disabled}
              gender="male"
            />
          </div>

          {!variation.shared_characteristics && (
            <div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Female Characteristics
              </h4>
              <BreedCharacteristicsForm
                characteristics={variation.female_characteristics || defaultCharacteristics}
                onChange={handleFemaleCharacteristicsChange}
                errors={errors?.characteristics}
                disabled={disabled}
                gender="female"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BreedSizeVariationForm;