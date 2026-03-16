-- =============================================
-- ADD MISSING TABLES: BRANDS, STORES, REVIEWS
-- =============================================

-- =============================================
-- BRANDS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS brands (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL DEFAULT '',
  name_fr TEXT NOT NULL DEFAULT '',
  logo_url TEXT,
  website_url TEXT,
  description TEXT,
  description_ar TEXT,
  description_fr TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add sort_order column if it's missing (for existing tables)
ALTER TABLE brands ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- =============================================
-- STORES TABLE (Boutiques)
-- =============================================
CREATE TABLE IF NOT EXISTS stores (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL DEFAULT '',
  name_fr TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL,
  city_ar TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL,
  address_ar TEXT NOT NULL DEFAULT '',
  phone TEXT,
  email TEXT,
  image_url TEXT,
  google_maps_url TEXT,
  is_headquarters BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- REVIEWS TABLE (Testimonials)
-- =============================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  company TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  comment_ar TEXT,
  comment_fr TEXT,
  image_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_brands_name ON brands(name);
CREATE INDEX IF NOT EXISTS idx_stores_city ON stores(city);
CREATE INDEX IF NOT EXISTS idx_stores_sort ON stores(sort_order);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_created ON reviews(created_at DESC);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ policies
DROP POLICY IF EXISTS "Public can read brands" ON brands;
CREATE POLICY "Public can read brands" ON brands
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can read stores" ON stores;
CREATE POLICY "Public can read stores" ON stores
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can read approved reviews" ON reviews;
CREATE POLICY "Public can read approved reviews" ON reviews
  FOR SELECT USING (status = 'approved');

-- PUBLIC INSERT for reviews (anyone can submit)
DROP POLICY IF EXISTS "Public can submit reviews" ON reviews;
CREATE POLICY "Public can submit reviews" ON reviews
  FOR INSERT WITH CHECK (true);

-- ADMIN (authenticated) full access
DROP POLICY IF EXISTS "Admin full access brands" ON brands;
CREATE POLICY "Admin full access brands" ON brands
  FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin full access stores" ON stores;
CREATE POLICY "Admin full access stores" ON stores
  FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin full access reviews" ON reviews;
CREATE POLICY "Admin full access reviews" ON reviews
  FOR ALL USING (auth.role() = 'authenticated');
