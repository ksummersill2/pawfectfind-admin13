-- Create blog_posts table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content TEXT NOT NULL,
    excerpt TEXT,
    cover_image TEXT,
    author_id UUID REFERENCES auth.users(id) NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    tags TEXT[] DEFAULT '{}'::TEXT[],
    meta_description TEXT,
    meta_keywords TEXT[] DEFAULT '{}'::TEXT[],
    category_id UUID REFERENCES categories(id)
);

-- Add status constraint if it doesn't exist
DO $$ BEGIN
    ALTER TABLE public.blog_posts 
    ADD CONSTRAINT blog_posts_status_check 
    CHECK (status IN ('draft', 'published'));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add indexes if they don't exist
DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS blog_posts_author_id_idx ON public.blog_posts(author_id);
    CREATE INDEX IF NOT EXISTS blog_posts_status_idx ON public.blog_posts(status);
    CREATE INDEX IF NOT EXISTS blog_posts_published_at_idx ON public.blog_posts(published_at);
    CREATE INDEX IF NOT EXISTS blog_posts_slug_idx ON public.blog_posts(slug);
    CREATE INDEX IF NOT EXISTS blog_posts_category_id_idx ON public.blog_posts(category_id);
END $$;

-- Enable RLS if not already enabled
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Create or replace function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger if it doesn't exist
DO $$ BEGIN
    CREATE TRIGGER update_blog_posts_updated_at
        BEFORE UPDATE ON public.blog_posts
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Drop existing policies safely
DO $$ BEGIN
    DROP POLICY IF EXISTS "Enable read access for all users" ON public.blog_posts;
    DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.blog_posts;
    DROP POLICY IF EXISTS "Enable update for post authors only" ON public.blog_posts;
    DROP POLICY IF EXISTS "Enable delete for post authors only" ON public.blog_posts;
END $$;

-- Create new policies
CREATE POLICY "Enable read access for all users" ON public.blog_posts
    FOR SELECT USING (
        status = 'published' OR 
        auth.uid() = author_id
    );

CREATE POLICY "Enable insert for authenticated users only" ON public.blog_posts
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for post authors only" ON public.blog_posts
    FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Enable delete for post authors only" ON public.blog_posts
    FOR DELETE USING (auth.uid() = author_id);