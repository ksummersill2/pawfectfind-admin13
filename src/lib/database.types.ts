export interface Database {
  public: {
    Tables: {
      breed_characteristics: {
        Row: {
          id: string;
          breed_id: string;
          size_variation_id: string;
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
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          breed_id: string;
          size_variation_id: string;
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
          dietary_needs?: string | null;
          health_issues?: string[];
          care_instructions?: string | null;
          special_considerations?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          breed_id?: string;
          size_variation_id?: string;
          gender?: 'male' | 'female';
          min_height_cm?: number;
          max_height_cm?: number;
          min_weight_kg?: number;
          max_weight_kg?: number;
          life_expectancy_years?: number;
          energy_level?: number;
          grooming_needs?: number;
          shedding_level?: number;
          trainability?: number;
          barking_level?: number;
          good_with_children?: boolean;
          good_with_other_dogs?: boolean;
          good_with_strangers?: boolean;
          exercise_needs_minutes?: number;
          dietary_needs?: string | null;
          health_issues?: string[];
          care_instructions?: string | null;
          special_considerations?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      breed_size_variations: {
        Row: {
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
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          breed_id: string;
          size_category: 'small' | 'medium' | 'large' | 'giant';
          size_description: string;
          image?: string | null;
          shared_characteristics?: boolean;
          dietary_needs?: string | null;
          health_issues?: string[];
          care_instructions?: string | null;
          special_considerations?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          breed_id?: string;
          size_category?: 'small' | 'medium' | 'large' | 'giant';
          size_description?: string;
          image?: string | null;
          shared_characteristics?: boolean;
          dietary_needs?: string | null;
          health_issues?: string[];
          care_instructions?: string | null;
          special_considerations?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      dog_breeds: {
        Row: {
          id: string;
          name: string;
          description: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}