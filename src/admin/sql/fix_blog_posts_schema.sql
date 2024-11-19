-- First ensure the categories table has UUID ids
ALTER TABLE public.categories 
ALTER COLUMN id TYPE UUID USING (gen_random_uuid());

-- Add category_id column to blog_posts if it doesn't exist
ALTER TABLE public.blog_posts 
ADD COLUMN IF NOT EXISTS category_id UUID;

-- Drop any existing foreign key constraint
ALTER TABLE public.blog_posts 
DROP CONSTRAINT IF EXISTS blog_posts_category_id_fkey;

-- Add the foreign key constraint
ALTER TABLE public.blog_posts 
ADD CONSTRAINT blog_posts_category_id_fkey 
FOREIGN KEY (category_id) 
REFERENCES categories(id);

-- Create index for category_id
DROP INDEX IF EXISTS idx_blog_posts_category_id;
CREATE INDEX idx_blog_posts_category_id ON public.blog_posts(category_id);

-- Drop old category column if it exists
ALTER TABLE public.blog_posts 
DROP COLUMN IF EXISTS category;

-- Add type column to categories if it doesn't exist
ALTER TABLE public.categories
ADD COLUMN IF NOT EXISTS type TEXT CHECK (type IN ('blog', 'product')) DEFAULT 'product';

-- Create index on categories type
CREATE INDEX IF NOT EXISTS idx_categories_type ON public.categories(type);

-- Update existing categories to have proper type
UPDATE public.categories
SET type = 'product'
WHERE type IS NULL;

-- Insert default blog categories if needed
INSERT INTO public.categories (id, name, description, icon, type)
VALUES 
  (gen_random_uuid(), 'General', 'General blog posts', 'FileText', 'blog'),
  (gen_random_uuid(), 'News', 'News and updates', 'Newspaper', 'blog'),
  (gen_random_uuid(), 'Tips & Tricks', 'Helpful tips and tricks', 'Lightbulb', 'blog'),
  (gen_random_uuid(), 'Product Reviews', 'Product reviews and recommendations', 'Star', 'blog')
ON CONFLICT DO NOTHING;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';