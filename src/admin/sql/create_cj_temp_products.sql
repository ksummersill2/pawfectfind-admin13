-- Create temporary CJ products table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.cj_temp_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    catalog_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL DEFAULT 0,
    retail_price NUMERIC(10,2),
    image_url TEXT,
    buy_url TEXT NOT NULL,
    advertiser_name TEXT,
    advertiser_id TEXT,
    category TEXT,
    in_stock BOOLEAN DEFAULT true,
    currency TEXT DEFAULT 'USD',
    imported BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Add composite unique constraint
    UNIQUE(catalog_id, advertiser_id, name)
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_cj_temp_products_catalog_id ON public.cj_temp_products(catalog_id);
CREATE INDEX IF NOT EXISTS idx_cj_temp_products_advertiser_id ON public.cj_temp_products(advertiser_id);
CREATE INDEX IF NOT EXISTS idx_cj_temp_products_imported ON public.cj_temp_products(imported);
CREATE INDEX IF NOT EXISTS idx_cj_temp_products_name ON public.cj_temp_products(name);

-- Add RLS policies
ALTER TABLE public.cj_temp_products ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to manage temp products
CREATE POLICY "Allow authenticated users to manage temp products"
    ON public.cj_temp_products
    FOR ALL
    USING (auth.role() = 'authenticated');

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_cj_temp_products_updated_at ON public.cj_temp_products;
CREATE TRIGGER update_cj_temp_products_updated_at
    BEFORE UPDATE ON public.cj_temp_products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE public.cj_temp_products IS 'Temporary storage for CJ Affiliate products before import';
COMMENT ON COLUMN public.cj_temp_products.catalog_id IS 'CJ Affiliate catalog ID';
COMMENT ON COLUMN public.cj_temp_products.name IS 'Product name';
COMMENT ON COLUMN public.cj_temp_products.description IS 'Product description';
COMMENT ON COLUMN public.cj_temp_products.price IS 'Current price';
COMMENT ON COLUMN public.cj_temp_products.retail_price IS 'Original retail price';
COMMENT ON COLUMN public.cj_temp_products.image_url IS 'Product image URL';
COMMENT ON COLUMN public.cj_temp_products.buy_url IS 'Affiliate buy URL';
COMMENT ON COLUMN public.cj_temp_products.advertiser_name IS 'CJ advertiser name';
COMMENT ON COLUMN public.cj_temp_products.advertiser_id IS 'CJ advertiser ID';
COMMENT ON COLUMN public.cj_temp_products.category IS 'Product category';
COMMENT ON COLUMN public.cj_temp_products.in_stock IS 'Product availability status';
COMMENT ON COLUMN public.cj_temp_products.currency IS 'Price currency';
COMMENT ON COLUMN public.cj_temp_products.imported IS 'Flag indicating if product has been imported';

-- Grant necessary permissions
GRANT ALL ON public.cj_temp_products TO authenticated;