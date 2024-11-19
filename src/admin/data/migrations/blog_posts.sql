CREATE TABLE public.blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content TEXT NOT NULL,
    excerpt TEXT,
    cover_image TEXT,
    author_id UUID REFERENCES auth.users(id),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    published_at TIMESTAMP WITH TIME ZONE,
    tags TEXT[] DEFAULT '{}',
    meta_title TEXT,
    meta_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    reading_time_minutes INTEGER,
    likes_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    featured BOOLEAN DEFAULT false,
    allow_comments BOOLEAN DEFAULT true
);

-- Add indexes for better query performance
CREATE INDEX blog_posts_author_id_idx ON public.blog_posts(author_id);
CREATE INDEX blog_posts_status_idx ON public.blog_posts(status);
CREATE INDEX blog_posts_published_at_idx ON public.blog_posts(published_at);
CREATE INDEX blog_posts_slug_idx ON public.blog_posts(slug);

-- Add RLS policies
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read published posts
CREATE POLICY "Allow public read access to published posts" ON public.blog_posts
    FOR SELECT
    USING (status = 'published' OR auth.role() = 'authenticated');

-- Allow authenticated users to create posts
CREATE POLICY "Allow authenticated users to create posts" ON public.blog_posts
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Allow users to update their own posts
CREATE POLICY "Allow users to update own posts" ON public.blog_posts
    FOR UPDATE
    USING (auth.uid() = author_id);

-- Allow users to delete their own posts
CREATE POLICY "Allow users to delete own posts" ON public.blog_posts
    FOR DELETE
    USING (auth.uid() = author_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_blog_posts_updated_at
    BEFORE UPDATE ON public.blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();