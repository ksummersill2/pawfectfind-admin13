import React from 'react';
import { AlertCircle } from 'lucide-react';
import { AdminBreedCharacteristics } from '../../types';

interface BreedCharacteristicsFormProps {
  characteristics: AdminBreedCharacteristics;
  onChange: (characteristics: AdminBreedCharacteristics) => void;
  errors?: {
    male_height?: string;
    male_weight?: string;
    female_height?: string;
    female_weight?: string;
    height?: string;
    weight?: string;
  };
  disabled?: boolean;
  gender: 'male' | 'female';
}

const BreedCharacteristicsForm: React.FC<BreedCharacteristicsFormProps> = ({
  characteristics,
  onChange,
  errors = {},
  disabled = false,
  gender
}) => {
  const handleChange = (field: keyof AdminBreedCharacteristics, value: any) => {
    onChange({
      ...characteristics,
      gender,
      [field]: value
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Min Height (cm)
          </label>
          <input
            type="number"
            value={characteristics.min_height_cm || 0}
            onChange={(e) => handleChange('min_height_cm', Number(e.target.value))}
            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
            disabled={disabled}
            min="0"
            step="0.1"
          />
          {errors.height && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.height}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Max Height (cm)
          </label>
          <input
            type="number"
            value={characteristics.max_height_cm || 0}
            onChange={(e) => handleChange('max_height_cm', Number(e.target.value))}
            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
            disabled={disabled}
            min="0"
            step="0.1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Min Weight (kg)
          </label>
          <input
            type="number"
            value={characteristics.min_weight_kg || 0}
            onChange={(e) => handleChange('min_weight_kg', Number(e.target.value))}
            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
            disabled={disabled}
            min="0"
            step="0.1"
          />
          {errors.weight && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.weight}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Max Weight (kg)
          </label>
          <input
            type="number"
            value={characteristics.max_weight_kg || 0}
            onChange={(e) => handleChange('max_weight_kg', Number(e.target.value))}
            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
            disabled={disabled}
            min="0"
            step="0.1"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Life Expectancy (years)
        </label>
        <input
          type="number"
          value={characteristics.life_expectancy_years || 0}
          onChange={(e) => handleChange('life_expectancy_years', Number(e.target.value))}
          className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
          disabled={disabled}
          min="0"
          step="0.1"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Energy Level (1-10)
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={characteristics.energy_level || 5}
            onChange={(e) => handleChange('energy_level', Number(e.target.value))}
            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
            disabled={disabled}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Grooming Needs (1-10)
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={characteristics.grooming_needs || 5}
            onChange={(e) => handleChange('grooming_needs', Number(e.target.value))}
            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
            disabled={disabled}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Shedding Level (1-10)
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={characteristics.shedding_level || 5}
            onChange={(e) => handleChange('shedding_level', Number(e.target.value))}
            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
            disabled={disabled}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Trainability (1-10)
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={characteristics.trainability || 5}
            onChange={(e) => handleChange('trainability', Number(e.target.value))}
            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
            disabled={disabled}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Barking Level (1-10)
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={characteristics.barking_level || 5}
            onChange={(e) => handleChange('barking_level', Number(e.target.value))}
            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
            disabled={disabled}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Exercise Needs (minutes/day)
          </label>
          <input
            type="number"
            value={characteristics.exercise_needs_minutes || 60}
            onChange={(e) => handleChange('exercise_needs_minutes', Number(e.target.value))}
            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
            disabled={disabled}
            min="0"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Dietary Needs
          </label>
          <textarea
            value={characteristics.dietary_needs || ''}
            onChange={(e) => handleChange('dietary_needs', e.target.value)}
            rows={3}
            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
            disabled={disabled}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Health Issues (one per line)
          </label>
          <textarea
            value={characteristics.health_issues?.join('\n') || ''}
            onChange={(e) => handleChange('health_issues', e.target.value.split('\n').filter(Boolean))}
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
            value={characteristics.care_instructions || ''}
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
            value={characteristics.special_considerations || ''}
            onChange={(e) => handleChange('special_considerations', e.target.value)}
            rows={3}
            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
            disabled={disabled}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={characteristics.good_with_children || false}
            onChange={(e) => handleChange('good_with_children', e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            disabled={disabled}
          />
          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
            Good with Children
          </span>
        </label>

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={characteristics.good_with_other_dogs || false}
            onChange={(e) => handleChange('good_with_other_dogs', e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            disabled={disabled}
          />
          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
            Good with Other Dogs
          </span>
        </label>

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={characteristics.good_with_strangers || false}
            onChange={(e) => handleChange('good_with_strangers', e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            disabled={disabled}
          />
          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
            Good with Strangers
          </span>
        </label>
      </div>
    </div>
  );
};

export default BreedCharacteristicsForm;