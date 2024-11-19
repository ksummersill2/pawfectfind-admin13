CREATE TABLE breed_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  breed_id UUID REFERENCES dog_breeds(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  published_date DATE NOT NULL,
  source TEXT NOT NULL,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT valid_category CHECK (
    category IN (
      'training',
      'health',
      'nutrition',
      'grooming',
      'behavior',
      'lifestyle',
      'care-tips',
      'breed-specific'
    )
  )
);