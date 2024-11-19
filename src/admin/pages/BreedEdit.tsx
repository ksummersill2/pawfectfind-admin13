import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { adminSupabase } from '../../lib/supabase/client';
import { useBreedForm } from '../hooks/useBreedForm';
import { AdminBreedForm } from '../types';
import BreedForm from '../components/breeds/BreedForm';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const BreedEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { saveBasicInfo, saveSizeVariation, deleteSizeVariation } = useBreedForm();

  const [formData, setFormData] = useState<AdminBreedForm>({
    name: '',
    description: '',
    size_variations: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id && id !== 'new') {
      fetchBreed();
    } else {
      setLoading(false);
    }
  }, [id]);

  const fetchBreed = async () => {
    try {
      const { data: breed, error: breedError } = await adminSupabase
        .from('dog_breeds')
        .select(`
          *,
          size_variations:breed_size_variations(
            *,
            male_characteristics:breed_characteristics(*),
            female_characteristics:breed_characteristics(*)
          )
        `)
        .eq('id', id)
        .single();

      if (breedError) throw breedError;
      if (!breed) throw new Error('Breed not found');

      // Process size variations to ensure proper structure
      const processedVariations = breed.size_variations.map((variation: any) => {
        const maleChar = variation.male_characteristics.find((c: any) => c.gender === 'male');
        const femaleChar = variation.female_characteristics.find((c: any) => c.gender === 'female');
        
        return {
          id: variation.id,
          size_category: variation.size_category,
          size_description: variation.size_description,
          image: variation.image,
          shared_characteristics: !femaleChar,
          dietary_needs: variation.dietary_needs,
          health_issues: variation.health_issues || [],
          care_instructions: variation.care_instructions,
          special_considerations: variation.special_considerations,
          male_characteristics: maleChar || {
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
          female_characteristics: femaleChar || {
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
        };
      });

      setFormData({
        id: breed.id,
        name: breed.name,
        description: breed.description,
        size_variations: processedVariations
      });
    } catch (err) {
      console.error('Error fetching breed:', err);
      setError('Failed to load breed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: AdminBreedForm) => {
    try {
      setSaving(true);
      setError(null);

      // First save basic breed information
      const breedId = await saveBasicInfo({
        id: id === 'new' ? undefined : id,
        name: data.name,
        description: data.description
      });

      // Delete any removed size variations
      if (id !== 'new') {
        const currentVariationIds = data.size_variations
          .map(v => v.id)
          .filter((id): id is string => id !== undefined);

        const { data: existingVariations } = await adminSupabase
          .from('breed_size_variations')
          .select('id')
          .eq('breed_id', id);

        const existingIds = existingVariations?.map(v => v.id) || [];
        const removedIds = existingIds.filter(id => !currentVariationIds.includes(id));

        for (const variationId of removedIds) {
          await deleteSizeVariation(variationId);
        }
      }

      // Save each size variation
      await Promise.all(
        data.size_variations.map(variation =>
          saveSizeVariation(breedId, variation)
        )
      );

      navigate('/admin/breeds');
    } catch (err) {
      console.error('Error saving breed:', err);
      setError('Failed to save breed');
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {id === 'new' ? 'Add Breed' : 'Edit Breed'}
        </h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        </div>
      )}

      <BreedForm
        initialData={formData}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/admin/breeds')}
      />
    </div>
  );
};

export default BreedEdit;