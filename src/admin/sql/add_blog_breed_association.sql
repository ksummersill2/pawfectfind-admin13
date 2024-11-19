-- Create blog_breed_associations table
CREATE TABLE IF NOT EXISTS public.blog_breed_associations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blog_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
    breed_id UUID REFERENCES dog_breeds(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(blog_id, breed_id)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_blog_breed_associations_blog_id ON public.blog_breed_associations(blog_id);
CREATE INDEX IF NOT EXISTS idx_blog_breed_associations_breed_id ON public.blog_breed_associations(breed_id);

-- Add RLS policies
ALTER TABLE public.blog_breed_associations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON public.blog_breed_associations
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.blog_breed_associations
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON public.blog_breed_associations
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON public.blog_breed_associations
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create updated_at trigger
CREATE TRIGGER update_blog_breed_associations_updated_at
    BEFORE UPDATE ON public.blog_breed_associations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();