-- =============================================
-- LAGMED - Schema Update V2: Brands & Reviews
-- Run this in the Supabase SQL Editor
-- =============================================

-- =============================================
-- BRANDS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS brands (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE IF EXISTS brands ENABLE ROW LEVEL SECURITY;

-- Public read
DROP POLICY IF EXISTS "Public can read brands" ON brands;
CREATE POLICY "Public can read brands" ON brands
  FOR SELECT USING (true);

-- Admin full access
DROP POLICY IF EXISTS "Admin full access brands" ON brands;
CREATE POLICY "Admin full access brands" ON brands
  FOR ALL USING (auth.role() = 'authenticated');

-- Index
CREATE INDEX IF NOT EXISTS idx_brands_sort ON brands(sort_order);

-- =============================================
-- REVIEWS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  company TEXT,
  rating INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL DEFAULT '',
  comment_ar TEXT,
  comment_fr TEXT,
  image_url TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Backward-compatible columns for existing review tables
ALTER TABLE IF EXISTS reviews ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES products(id) ON DELETE SET NULL;
ALTER TABLE IF EXISTS reviews ADD COLUMN IF NOT EXISTS comment TEXT;
ALTER TABLE IF EXISTS reviews ADD COLUMN IF NOT EXISTS comment_ar TEXT;
ALTER TABLE IF EXISTS reviews ADD COLUMN IF NOT EXISTS comment_fr TEXT;
ALTER TABLE IF EXISTS reviews ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE IF EXISTS reviews ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- Data migration from older review schemas
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'reviews' AND column_name = 'text'
  ) THEN
    EXECUTE 'UPDATE reviews SET comment = text WHERE comment IS NULL AND text IS NOT NULL';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'reviews' AND column_name = 'is_approved'
  ) THEN
    EXECUTE 'UPDATE reviews SET status = CASE WHEN is_approved THEN ''approved'' ELSE ''pending'' END WHERE status IS NULL';
  END IF;
END
$$;

-- Enable RLS
ALTER TABLE IF EXISTS reviews ENABLE ROW LEVEL SECURITY;

-- Public can read approved reviews
DROP POLICY IF EXISTS "Public can read approved reviews" ON reviews;
CREATE POLICY "Public can read approved reviews" ON reviews
  FOR SELECT USING (status = 'approved');

-- Public can insert reviews (anyone can submit)
DROP POLICY IF EXISTS "Public can submit reviews" ON reviews;
CREATE POLICY "Public can submit reviews" ON reviews
  FOR INSERT WITH CHECK (true);

-- Admin full access
DROP POLICY IF EXISTS "Admin full access reviews" ON reviews;
CREATE POLICY "Admin full access reviews" ON reviews
  FOR ALL USING (auth.role() = 'authenticated');

-- Index
CREATE INDEX IF NOT EXISTS idx_reviews_status_created ON reviews(status, created_at DESC);

-- =============================================
-- ADD image_url TO CATEGORIES (if not exists)
-- =============================================
ALTER TABLE IF EXISTS categories ADD COLUMN IF NOT EXISTS image_url TEXT;
