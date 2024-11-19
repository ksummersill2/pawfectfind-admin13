-- Create product categories table
CREATE TABLE IF NOT EXISTS public.product_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create blog categories table
CREATE TABLE IF NOT EXISTS public.blog_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Migrate existing data from categories table to product_categories
INSERT INTO public.product_categories (id, name, description, icon, created_at, updated_at)
SELECT id, name, description, icon, created_at, updated_at
FROM public.categories;

-- Update foreign key references in products table
ALTER TABLE public.products
DROP CONSTRAINT IF EXISTS products_category_id_fkey,
ADD CONSTRAINT products_category_id_fkey 
FOREIGN KEY (category_id) 
REFERENCES public.product_categories(id);

-- Update foreign key references in blog_posts table
ALTER TABLE public.blog_posts
DROP CONSTRAINT IF EXISTS blog_posts_category_id_fkey,
ADD CONSTRAINT blog_posts_category_id_fkey 
FOREIGN KEY (category_id) 
REFERENCES public.blog_categories(id);

-- Add RLS policies for product categories
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON public.product_categories
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.product_categories
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON public.product_categories
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON public.product_categories
    FOR DELETE USING (auth.role() = 'authenticated');

-- Add RLS policies for blog categories
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON public.blog_categories
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.blog_categories
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON public.blog_categories
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON public.blog_categories
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_product_categories_updated_at
    BEFORE UPDATE ON public.product_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_categories_updated_at
    BEFORE UPDATE ON public.blog_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();