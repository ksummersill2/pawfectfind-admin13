-- Add category_id to blog_posts table
ALTER TABLE public.blog_posts 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id);

-- Remove old category column if it exists
ALTER TABLE public.blog_posts 
DROP COLUMN IF EXISTS category;

-- Update indexes
CREATE INDEX IF NOT EXISTS blog_posts_category_id_idx ON public.blog_posts(category_id);

-- Add type column to categories table to distinguish between blog and product categories
ALTER TABLE public.categories
ADD COLUMN IF NOT EXISTS type TEXT CHECK (type IN ('blog', 'product')) DEFAULT 'product';

-- Update existing categories to have proper type
UPDATE public.categories
SET type = 'product'
WHERE type IS NULL;