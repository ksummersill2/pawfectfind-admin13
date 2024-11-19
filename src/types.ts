export interface Dog {
  id: string;
  user_id: string;
  name: string;
  breed: string;
  age: number;
  weight: number;
  activity_level: number;
  image: string | null;
  health_conditions: string[];
  created_at: string;
  updated_at: string;
}

export interface DogProfile extends Dog {
  breed_details?: {
    size_category: string;
    life_expectancy: number;
    energy_level: number;
  };
}

export interface DogBreed {
  id: string;
  name: string;
  description: string;
  size_variations: BreedSizeVariation[];
  created_at?: string;
  updated_at?: string;
}

export interface BreedSizeVariation {
  id: string;
  breed_id: string;
  size_category: 'small' | 'medium' | 'large' | 'giant';
  size_description: string;
  image: string | null;
  shared_characteristics: boolean;
  dietary_needs: string | null;
  health_issues: string[];
  care_instructions: string | null;
  special_considerations: string | null;
  male_characteristics: BreedCharacteristics;
  female_characteristics: BreedCharacteristics;
}

export interface BreedCharacteristics {
  id?: string;
  breed_id: string;
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

export interface NavigationItem {
  path: string;
  icon: React.FC<{ className?: string }>;
  label: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  rating: number;
  popularity: number;
  discount: number;
  vendor: string;
  image: string;
  additional_images?: string[];
  category_id: string;
  tags: string[];
  affiliate_type?: 'amazon' | null;
  affiliate_link?: string;
  is_black_friday?: boolean;
  black_friday_price?: number;
  life_stages?: ProductLifeStages;
  size_suitability?: ProductSizeSuitability;
  health_benefits?: ProductHealthBenefit[];
  breed_recommendations?: BreedRecommendation[];
  ingredients?: string[];
  nutritional_info?: Record<string, any>;
  features?: string[];
  safety_warnings?: string[];
  activity_level_suitable?: [number, number];
}

export interface ProductLifeStages {
  suitable_for_puppy: boolean;
  suitable_for_adult: boolean;
  suitable_for_senior: boolean;
  min_age_months?: number;
  max_age_months?: number;
}

export interface ProductSizeSuitability {
  suitable_for_small: boolean;
  suitable_for_medium: boolean;
  suitable_for_large: boolean;
  suitable_for_giant: boolean;
  min_weight_kg?: number;
  max_weight_kg?: number;
}

export interface ProductHealthBenefit {
  health_condition_id: string;
  benefit_description: string;
}

export interface BreedRecommendation {
  breed_id: string;
  recommendation_strength: number;
  recommendation_reason: string;
}

export interface Review {
  id: number;
  productId: number;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  content: string;
  date: string;
  helpful: number;
  verified: boolean;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface FormErrors {
  size_category?: string;
  size_description?: string;
  image?: string;
  image_url?: string;
  submit?: string;
  characteristics?: {
    male_height?: string;
    male_weight?: string;
    female_height?: string;
    female_weight?: string;
    height?: string;
    weight?: string;
  };
}

export interface DatabaseBreedCharacteristics {
  id: string;
  breed_id: string;
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
  created_at?: string;
  updated_at?: string;
}