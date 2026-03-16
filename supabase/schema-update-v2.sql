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
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Public can read brands" ON brands
  FOR SELECT USING (true);

-- Admin full access
CREATE POLICY "Admin full access brands" ON brands
  FOR ALL USING (auth.role() = 'authenticated');

-- Index
CREATE INDEX idx_brands_sort ON brands(sort_order);

-- =============================================
-- REVIEWS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  company TEXT,
  role TEXT,
  rating INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  text TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Public can read approved reviews
CREATE POLICY "Public can read approved reviews" ON reviews
  FOR SELECT USING (is_approved = true);

-- Public can insert reviews (anyone can submit)
CREATE POLICY "Public can submit reviews" ON reviews
  FOR INSERT WITH CHECK (true);

-- Admin full access
CREATE POLICY "Admin full access reviews" ON reviews
  FOR ALL USING (auth.role() = 'authenticated');

-- Index
CREATE INDEX idx_reviews_approved ON reviews(is_approved, created_at DESC);

-- =============================================
-- ADD image_url TO CATEGORIES (if not exists)
-- =============================================
ALTER TABLE categories ADD COLUMN IF NOT EXISTS image_url TEXT;
