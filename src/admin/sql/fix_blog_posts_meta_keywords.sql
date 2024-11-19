-- Add meta_keywords column to blog_posts if it doesn't exist
ALTER TABLE public.blog_posts 
ADD COLUMN IF NOT EXISTS meta_keywords TEXT[] DEFAULT '{}';

-- Create index for meta_keywords
DROP INDEX IF EXISTS idx_blog_posts_meta_keywords;
CREATE INDEX idx_blog_posts_meta_keywords ON public.blog_posts USING GIN(meta_keywords);

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';