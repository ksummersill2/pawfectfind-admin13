export type VideoCategory = 
  | 'training'
  | 'grooming'
  | 'health'
  | 'behavior'
  | 'lifestyle'
  | 'nutrition'
  | 'exercise'
  | 'puppy-care';

export interface BreedVideo {
  id: string;
  breed_id: string;
  title: string;
  description: string;
  youtube_url: string;
  video_id: string;
  thumbnail_url: string;
  category: VideoCategory;
  duration: string;
  channel_name: string;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface VideoFormData {
  title: string;
  description: string;
  youtube_url: string;
  category: VideoCategory;
  is_featured: boolean;
}