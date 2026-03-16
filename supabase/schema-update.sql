-- =============================================
-- LAGMED - Additional Schema: Stores & Image Settings
-- Run this in the Supabase SQL Editor
-- =============================================

-- =============================================
-- STORES / BOUTIQUES TABLE
-- =============================================
CREATE TABLE stores (
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
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Public can read stores" ON stores
  FOR SELECT USING (true);

-- Admin full access
CREATE POLICY "Admin full access stores" ON stores
  FOR ALL USING (auth.role() = 'authenticated');

-- Index
CREATE INDEX idx_stores_sort ON stores(sort_order);

-- =============================================
-- ADD IMAGE FIELDS TO COMPANY_SETTINGS
-- =============================================
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS hero_image_1 TEXT;
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS hero_image_2 TEXT;
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS hero_image_3 TEXT;
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS about_image_main TEXT;
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS about_image_small TEXT;
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS cta_image TEXT;
