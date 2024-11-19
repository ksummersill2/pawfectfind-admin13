-- Add scheduling fields to blog_posts table
ALTER TABLE public.blog_posts 
ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published'));

-- Create index for scheduled posts
CREATE INDEX IF NOT EXISTS idx_blog_posts_scheduled_for ON public.blog_posts(scheduled_for)
WHERE status = 'scheduled';

-- Create function to automatically publish scheduled posts
CREATE OR REPLACE FUNCTION publish_scheduled_posts()
RETURNS void AS $$
BEGIN
  UPDATE blog_posts
  SET 
    status = 'published',
    published_at = scheduled_for,
    updated_at = NOW()
  WHERE 
    status = 'scheduled' 
    AND scheduled_for <= NOW();
END;
$$ LANGUAGE plpgsql;

-- Create a cron job to check for scheduled posts every minute
SELECT cron.schedule(
  'publish-scheduled-posts',
  '* * * * *', -- Every minute
  'SELECT publish_scheduled_posts()'
);