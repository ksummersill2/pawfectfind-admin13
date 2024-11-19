-- Add type column to existing categories table
ALTER TABLE public.categories
ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'product'
CHECK (type IN ('product', 'blog'));

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_categories_type ON public.categories(type);

-- Update RLS policies for categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.categories;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.categories;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.categories;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.categories;

CREATE POLICY "Enable read access for all users" ON public.categories
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.categories
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON public.categories
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON public.categories
    FOR DELETE USING (auth.role() = 'authenticated');

-- Update foreign key references in products table
ALTER TABLE public.products
DROP CONSTRAINT IF EXISTS products_category_id_fkey,
ADD CONSTRAINT products_category_id_fkey 
FOREIGN KEY (category_id) 
REFERENCES public.categories(id);

-- Update foreign key references in blog_posts table
ALTER TABLE public.blog_posts
DROP CONSTRAINT IF EXISTS blog_posts_category_id_fkey,
ADD CONSTRAINT blog_posts_category_id_fkey 
FOREIGN KEY (category_id) 
REFERENCES public.categories(id);