-- Create breed_videos table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.breed_videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    breed_id UUID REFERENCES dog_breeds(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    youtube_url TEXT NOT NULL,
    video_id TEXT NOT NULL,
    thumbnail_url TEXT,
    category TEXT NOT NULL CHECK (category IN (
        'training',
        'grooming',
        'health',
        'behavior',
        'lifestyle',
        'nutrition',
        'exercise',
        'puppy-care'
    )),
    duration TEXT,
    channel_name TEXT,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    CONSTRAINT valid_youtube_url CHECK (youtube_url ~ '^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_-]+')
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_breed_videos_breed_id ON public.breed_videos(breed_id);
CREATE INDEX IF NOT EXISTS idx_breed_videos_category ON public.breed_videos(category);

-- Enable RLS
ALTER TABLE public.breed_videos ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable read access for all users" ON public.breed_videos
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.breed_videos
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON public.breed_videos
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON public.breed_videos
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_breed_videos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_breed_videos_updated_at
    BEFORE UPDATE ON public.breed_videos
    FOR EACH ROW
    EXECUTE FUNCTION update_breed_videos_updated_at();