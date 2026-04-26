-- =============================================
-- LAGMED - Additional Schema: Stores & Image Settings
-- Run this in the Supabase SQL Editor
-- =============================================

-- =============================================
-- STORES / BOUTIQUES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS stores (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL DEFAULT '',
  name_fr TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL,
  city_ar TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  address_ar TEXT NOT NULL DEFAULT '',
  phone TEXT,
  image_url TEXT,
  google_maps_url TEXT,
  is_headquarters BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE IF EXISTS stores ENABLE ROW LEVEL SECURITY;

-- Public read
DROP POLICY IF EXISTS "Public can read stores" ON stores;
CREATE POLICY "Public can read stores" ON stores
  FOR SELECT USING (true);

-- Admin full access
DROP POLICY IF EXISTS "Admin full access stores" ON stores;
CREATE POLICY "Admin full access stores" ON stores
  FOR ALL USING (auth.role() = 'authenticated');

-- Index
CREATE INDEX IF NOT EXISTS idx_stores_sort ON stores(sort_order);

-- =============================================
-- ADD IMAGE FIELDS TO COMPANY_SETTINGS
-- =============================================
ALTER TABLE IF EXISTS company_settings ADD COLUMN IF NOT EXISTS hero_image_1 TEXT;
ALTER TABLE IF EXISTS company_settings ADD COLUMN IF NOT EXISTS hero_image_2 TEXT;
ALTER TABLE IF EXISTS company_settings ADD COLUMN IF NOT EXISTS hero_image_3 TEXT;
ALTER TABLE IF EXISTS company_settings ADD COLUMN IF NOT EXISTS about_image_main TEXT;
ALTER TABLE IF EXISTS company_settings ADD COLUMN IF NOT EXISTS about_image_small TEXT;
ALTER TABLE IF EXISTS company_settings ADD COLUMN IF NOT EXISTS cta_image TEXT;
