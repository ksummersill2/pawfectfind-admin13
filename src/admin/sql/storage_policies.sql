-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies safely
DO $$ BEGIN
    DROP POLICY IF EXISTS "Public Access Blog Images" ON storage.objects;
    DROP POLICY IF EXISTS "Allow authenticated users to upload blog images" ON storage.objects;
    DROP POLICY IF EXISTS "Allow authenticated users to update blog images" ON storage.objects;
    DROP POLICY IF EXISTS "Allow authenticated users to delete blog images" ON storage.objects;
END $$;

-- Create new policies
CREATE POLICY "Public Access Blog Images" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'blog-images');

CREATE POLICY "Allow authenticated users to upload blog images" ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'blog-images' 
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "Allow authenticated users to update blog images" ON storage.objects
    FOR UPDATE
    USING (
        bucket_id = 'blog-images'
        AND auth.role() = 'authenticated'
    )
    WITH CHECK (
        bucket_id = 'blog-images'
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "Allow authenticated users to delete blog images" ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'blog-images'
        AND auth.role() = 'authenticated'
    );