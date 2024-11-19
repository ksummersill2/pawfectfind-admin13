import React from 'react';
import { AdminBreedLifeStage } from '../../types';

interface BreedLifeStageFormProps {
  stage: AdminBreedLifeStage;
  onChange: (stage: AdminBreedLifeStage) => void;
  disabled?: boolean;
}

const BreedLifeStageForm: React.FC<BreedLifeStageFormProps> = ({
  stage,
  onChange,
  disabled
}) => {
  const handleChange = (field: keyof AdminBreedLifeStage, value: any) => {
    onChange({
      ...stage,
      [field]: value
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Gender
          </label>
          <select
            value={stage.gender}
            onChange={(e) => handleChange('gender', e.target.value)}
            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
            disabled={disabled}
          >
            <option value="both">Both</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Stage
          </label>
          <select
            value={stage.stage_name}
            onChange={(e) => handleChange('stage_name', e.target.value)}
            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
            disabled={disabled}
          >
            <option value="puppy">Puppy</option>
            <option value="adult">Adult</option>
            <option value="senior">Senior</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Start Age (months)
          </label>
          <input
            type="number"
            value={stage.start_age_months}
            onChange={(e) => handleChange('start_age_months', parseInt(e.target.value))}
            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
            disabled={disabled}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            End Age (months)
          </label>
          <input
            type="number"
            value={stage.end_age_months || ''}
            onChange={(e) => handleChange('end_age_months', e.target.value ? parseInt(e.target.value) : null)}
            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
            disabled={disabled}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Average Weight (kg)
          </label>
          <input
            type="number"
            step="0.1"
            value={stage.average_weight_kg}
            onChange={(e) => handleChange('average_weight_kg', parseFloat(e.target.value))}
            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
            disabled={disabled}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Min Weight (kg)
          </label>
          <input
            type="number"
            step="0.1"
            value={stage.min_weight_kg}
            onChange={(e) => handleChange('min_weight_kg', parseFloat(e.target.value))}
            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
            disabled={disabled}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Max Weight (kg)
          </label>
          <input
            type="number"
            step="0.1"
            value={stage.max_weight_kg}
            onChange={(e) => handleChange('max_weight_kg', parseFloat(e.target.value))}
            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
            disabled={disabled}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Average Height (cm)
          </label>
          <input
            type="number"
            step="0.1"
            value={stage.average_height_cm || ''}
            onChange={(e) => handleChange('average_height_cm', e.target.value ? parseFloat(e.target.value) : null)}
            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
            disabled={disabled}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Min Height (cm)
          </label>
          <input
            type="number"
            step="0.1"
            value={stage.min_height_cm || ''}
            onChange={(e) => handleChange('min_height_cm', e.target.value ? parseFloat(e.target.value) : null)}
            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
            disabled={disabled}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Max Height (cm)
          </label>
          <input
            type="number"
            step="0.1"
            value={stage.max_height_cm || ''}
            onChange={(e) => handleChange('max_height_cm', e.target.value ? parseFloat(e.target.value) : null)}
            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
            disabled={disabled}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Base Calories per kg
          </label>
          <input
            type="number"
            value={stage.base_calories_per_kg}
            onChange={(e) => handleChange('base_calories_per_kg', parseInt(e.target.value))}
            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
            disabled={disabled}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-gray-900 dark:text-white">Activity Multipliers</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Low Activity
            </label>
            <input
              type="number"
              step="0.1"
              value={stage.low_activity_multiplier}
              onChange={(e) => handleChange('low_activity_multiplier', parseFloat(e.target.value))}
              className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
              disabled={disabled}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Medium Activity
            </label>
            <input
              type="number"
              step="0.1"
              value={stage.medium_activity_multiplier}
              onChange={(e) => handleChange('medium_activity_multiplier', parseFloat(e.target.value))}
              className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
              disabled={disabled}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              High Activity
            </label>
            <input
              type="number"
              step="0.1"
              value={stage.high_activity_multiplier}
              onChange={(e) => handleChange('high_activity_multiplier', parseFloat(e.target.value))}
              className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
              disabled={disabled}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Very High Activity
            </label>
            <input
              type="number"
              step="0.1"
              value={stage.very_high_activity_multiplier}
              onChange={(e) => handleChange('very_high_activity_multiplier', parseFloat(e.target.value))}
              className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
              disabled={disabled}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BreedLifeStageForm;