-- First drop the existing foreign key constraint if it exists
ALTER TABLE public.blog_posts 
DROP CONSTRAINT IF EXISTS blog_posts_category_id_fkey;

-- Ensure categories table has UUID id
ALTER TABLE public.categories 
ALTER COLUMN id TYPE UUID USING (gen_random_uuid());

-- Now add the foreign key constraint back
ALTER TABLE public.blog_posts 
ALTER COLUMN category_id TYPE UUID USING (gen_random_uuid()),
ADD CONSTRAINT blog_posts_category_id_fkey 
FOREIGN KEY (category_id) 
REFERENCES categories(id);

-- Recreate indexes
DROP INDEX IF EXISTS idx_blog_posts_category_id;
CREATE INDEX idx_blog_posts_category_id ON public.blog_posts(category_id);

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';