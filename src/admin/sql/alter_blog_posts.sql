-- Add category_id column with UUID type
ALTER TABLE blog_posts 
ADD COLUMN category_id UUID REFERENCES categories(id),
ADD COLUMN breed_ids UUID[] DEFAULT '{}';

-- Add meta_keywords column if it doesn't exist
ALTER TABLE blog_posts 
ADD COLUMN meta_keywords TEXT[] DEFAULT '{}';