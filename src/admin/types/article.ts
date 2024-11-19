export type ArticleCategory = 'training' | 'health' | 'nutrition' | 'behavior' | 'grooming' | 'lifestyle';

export interface Article {
  id: string;
  breed_id: string;
  title: string;
  url: string;
  description: string;
  category: ArticleCategory;
  tags: string[];
  published_date: string;
  source: string;
  is_featured: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ArticleFormData {
  title: string;
  url: string;
  description: string;
  category: ArticleCategory;
  breed_id: string;
  tags: string[];
  published_date: string;
  source: string;
  is_featured: boolean;
}