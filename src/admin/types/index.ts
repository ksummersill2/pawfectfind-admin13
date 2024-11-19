// Update the AdminCategory interface
export interface AdminCategory {
  id?: string;
  name: string;
  description: string;
  icon: string;
  type?: 'product' | 'blog';
  created_at?: string;
  updated_at?: string;
}

export interface AdminBreedForm {
  id?: string;
  name: string;
  description: string;
  size_variations: AdminBreedSizeVariation[];
}

export interface AdminBreedSizeVariation {
  id?: string;
  size_category: 'small' | 'medium' | 'large' | 'giant';
  size_description: string;
  image: string | null;
  shared_characteristics: boolean;
  dietary_needs: string | null;
  health_issues: string[];
  care_instructions: string | null;
  special_considerations: string | null;
  male_characteristics: AdminBreedCharacteristics;
  female_characteristics: AdminBreedCharacteristics;
}

export interface AdminBreedCharacteristics {
  id?: string;
  gender: 'male' | 'female';
  min_height_cm: number;
  max_height_cm: number;
  min_weight_kg: number;
  max_weight_kg: number;
  life_expectancy_years: number;
  energy_level: number;
  grooming_needs: number;
  shedding_level: number;
  trainability: number;
  barking_level: number;
  good_with_children: boolean;
  good_with_other_dogs: boolean;
  good_with_strangers: boolean;
  exercise_needs_minutes: number;
  dietary_needs: string | null;
  health_issues: string[];
  care_instructions: string | null;
  special_considerations: string | null;
}

export interface AdminBreedLifeStage {
  id?: string;
  gender: 'male' | 'female' | 'both';
  stage_name: 'puppy' | 'adult' | 'senior';
  start_age_months: number;
  end_age_months: number | null;
  average_weight_kg: number;
  min_weight_kg: number;
  max_weight_kg: number;
  average_height_cm: number | null;
  min_height_cm: number | null;
  max_height_cm: number | null;
  low_activity_multiplier: number;
  medium_activity_multiplier: number;
  high_activity_multiplier: number;
  very_high_activity_multiplier: number;
  base_calories_per_kg: number;
}

export interface AdminFormErrors {
  name?: string;
  description?: string;
  size_variations?: {
    size_category?: string;
    size_description?: string;
    characteristics?: {
      male_height?: string;
      male_weight?: string;
      female_height?: string;
      female_weight?: string;
      height?: string;
      weight?: string;
    };
  }[];
  submit?: string;
}