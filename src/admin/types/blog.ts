export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  cover_image?: string;
  author_id: string;
  author_name?: string;
  status: 'draft' | 'scheduled' | 'published';
  scheduled_for?: string | null;
  published_at?: string;
  created_at: string;
  updated_at: string;
  tags: string[];
  category_id: string | null;
  meta_description?: string;
  meta_keywords?: string[];
  breed_ids?: string[];
  views_count: number;
  likes_count: number;
  featured: boolean;
  allow_comments: boolean;
}

export interface BlogFormData {
  title: string;
  content: string;
  excerpt?: string;
  cover_image?: string;
  tags: string[];
  category_id: string | null;
  meta_description?: string;
  meta_keywords?: string[];
  breed_ids?: string[];
  scheduled_for?: string | null;
  status?: 'draft' | 'scheduled' | 'published';
}