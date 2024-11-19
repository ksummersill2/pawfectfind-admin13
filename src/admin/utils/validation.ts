import { AdminBreedForm, AdminFormErrors } from '../types';

export const validateBreedForm = (data: AdminBreedForm): AdminFormErrors | null => {
  const errors: AdminFormErrors = {};

  if (!data.name.trim()) {
    errors.name = 'Name is required';
  }

  if (!data.description.trim()) {
    errors.description = 'Description is required';
  }

  // Add more validation rules as needed

  return Object.keys(errors).length > 0 ? errors : null;
};

export const validateSizeVariation = (data: AdminBreedForm['size_variations'][0]): AdminFormErrors['size_variations'] | null => {
  const errors: AdminFormErrors['size_variations'] = {};

  if (!data.size_description.trim()) {
    errors.size_description = 'Size description is required';
  }

  // Add more validation rules as needed

  return Object.keys(errors).length > 0 ? errors : null;
};