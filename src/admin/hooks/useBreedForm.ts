import { useState } from 'react';
import { adminSupabase } from '../../lib/supabase/client';
import { AdminBreedForm, AdminFormErrors, AdminBreedSizeVariation, AdminBreedCharacteristics } from '../types';

export const useBreedForm = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateUUID = (): string => {
    return crypto.randomUUID();
  };

  const saveBasicInfo = async (data: { 
    id?: string; 
    name: string; 
    description: string; 
  }): Promise<string> => {
    try {
      const timestamp = new Date().toISOString();
      const breedId = data.id || generateUUID();

      if (data.id) {
        // Update existing breed
        const { error: updateError } = await adminSupabase
          .from('dog_breeds')
          .update({
            name: data.name,
            description: data.description,
            updated_at: timestamp
          })
          .eq('id', data.id);

        if (updateError) throw updateError;
      } else {
        // Create new breed
        const { error: insertError } = await adminSupabase
          .from('dog_breeds')
          .insert([{
            id: breedId,
            name: data.name,
            description: data.description,
            created_at: timestamp,
            updated_at: timestamp
          }]);

        if (insertError) throw insertError;
      }

      return breedId;
    } catch (err) {
      console.error('Error saving breed basic info:', err);
      throw err;
    }
  };

  const saveCharacteristics = async (
    breedId: string, 
    sizeVariationId: string, 
    characteristics: AdminBreedCharacteristics
  ): Promise<void> => {
    try {
      const timestamp = new Date().toISOString();
      const { id, breed_id, size_variation_id, created_at, updated_at, ...characteristicsData } = characteristics;
      const charId = id || generateUUID();

      // First try to find existing characteristics
      const { data: existing } = await adminSupabase
        .from('breed_characteristics')
        .select('id')
        .eq('breed_id', breedId)
        .eq('size_variation_id', sizeVariationId)
        .eq('gender', characteristics.gender)
        .maybeSingle();

      if (existing?.id) {
        // Update existing characteristics
        const { error: updateError } = await adminSupabase
          .from('breed_characteristics')
          .update({
            ...characteristicsData,
            updated_at: timestamp
          })
          .eq('id', existing.id);

        if (updateError) throw updateError;
      } else {
        // Insert new characteristics
        const { error: insertError } = await adminSupabase
          .from('breed_characteristics')
          .insert([{
            id: charId,
            breed_id: breedId,
            size_variation_id: sizeVariationId,
            ...characteristicsData,
            created_at: timestamp,
            updated_at: timestamp
          }]);

        if (insertError) throw insertError;
      }
    } catch (err) {
      console.error('Error saving characteristics:', err);
      throw err;
    }
  };

  const saveSizeVariation = async (breedId: string, variation: AdminBreedSizeVariation): Promise<string> => {
    try {
      const timestamp = new Date().toISOString();
      const { id, male_characteristics, female_characteristics, ...variationData } = variation;
      const variationId = id || generateUUID();

      // Save or update size variation
      if (id) {
        const { error: updateError } = await adminSupabase
          .from('breed_size_variations')
          .update({
            ...variationData,
            updated_at: timestamp
          })
          .eq('id', id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await adminSupabase
          .from('breed_size_variations')
          .insert([{
            id: variationId,
            breed_id: breedId,
            ...variationData,
            created_at: timestamp,
            updated_at: timestamp
          }]);

        if (insertError) throw insertError;
      }

      // Save male characteristics
      await saveCharacteristics(breedId, variationId, {
        ...male_characteristics,
        breed_id: breedId,
        size_variation_id: variationId,
        gender: 'male'
      });

      // Save female characteristics if not shared
      if (!variation.shared_characteristics) {
        await saveCharacteristics(breedId, variationId, {
          ...female_characteristics,
          breed_id: breedId,
          size_variation_id: variationId,
          gender: 'female'
        });
      }

      return variationId;
    } catch (err) {
      console.error('Error saving size variation:', err);
      throw err;
    }
  };

  const deleteSizeVariation = async (variationId: string): Promise<void> => {
    try {
      // First delete related characteristics
      const { error: charError } = await adminSupabase
        .from('breed_characteristics')
        .delete()
        .eq('size_variation_id', variationId);

      if (charError) throw charError;

      // Then delete the size variation
      const { error: varError } = await adminSupabase
        .from('breed_size_variations')
        .delete()
        .eq('id', variationId);

      if (varError) throw varError;
    } catch (err) {
      console.error('Error deleting size variation:', err);
      throw err;
    }
  };

  const validateBreedForm = (data: AdminBreedForm): AdminFormErrors | null => {
    const errors: AdminFormErrors = {};

    if (!data.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!data.description.trim()) {
      errors.description = 'Description is required';
    }

    if (data.size_variations.length === 0) {
      errors.size_variations = [{ submit: 'At least one size variation is required' }];
    }

    return Object.keys(errors).length > 0 ? errors : null;
  };

  return {
    loading,
    error,
    saveBasicInfo,
    saveSizeVariation,
    deleteSizeVariation,
    validateBreedForm
  };
};

export default useBreedForm;