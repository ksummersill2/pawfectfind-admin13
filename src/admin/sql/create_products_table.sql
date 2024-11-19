-- Create products table with breed recommendations
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    rating NUMERIC(3,1) DEFAULT 0,
    popularity INTEGER DEFAULT 0,
    discount INTEGER DEFAULT 0,
    vendor TEXT NOT NULL,
    image TEXT NOT NULL,
    category_id UUID REFERENCES categories(id),
    tags TEXT[] DEFAULT '{}',
    affiliate_type TEXT CHECK (affiliate_type IN ('amazon', 'cj', null)),
    affiliate_link TEXT,
    is_black_friday BOOLEAN DEFAULT false,
    black_friday_price NUMERIC(10,2),
    life_stages JSONB DEFAULT '{
        "suitable_for_puppy": false,
        "suitable_for_adult": true,
        "suitable_for_senior": false,
        "min_age_months": null,
        "max_age_months": null
    }'::jsonb,
    size_suitability JSONB DEFAULT '{
        "suitable_for_small": false,
        "suitable_for_medium": false,
        "suitable_for_large": false,
        "suitable_for_giant": false,
        "min_weight_kg": null,
        "max_weight_kg": null
    }'::jsonb,
    breed_recommendations JSONB DEFAULT '[]'::jsonb,
    health_benefits JSONB DEFAULT '[]'::jsonb,
    ingredients TEXT[] DEFAULT '{}',
    features TEXT[] DEFAULT '{}',
    safety_warnings TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);