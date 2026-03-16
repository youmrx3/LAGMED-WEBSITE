-- =============================================
-- LAGMED Medical Equipment - Supabase Database Schema
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- CATEGORIES TABLE
-- =============================================
CREATE TABLE categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL DEFAULT '',
  name_fr TEXT NOT NULL DEFAULT '',
  slug TEXT NOT NULL UNIQUE,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PRODUCTS TABLE
-- =============================================
CREATE TABLE products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL DEFAULT '',
  name_fr TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  description_ar TEXT NOT NULL DEFAULT '',
  description_fr TEXT NOT NULL DEFAULT '',
  specifications JSONB DEFAULT '{}',
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  brand TEXT NOT NULL DEFAULT '',
  price NUMERIC,
  is_new BOOLEAN DEFAULT false,
  is_best_seller BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  is_available BOOLEAN DEFAULT true,
  certifications TEXT[] DEFAULT '{}',
  datasheet_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PRODUCT IMAGES TABLE
-- =============================================
CREATE TABLE product_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0
);

-- =============================================
-- QUOTE REQUESTS TABLE
-- =============================================
CREATE TABLE quote_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  company TEXT,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- COMPANY SETTINGS TABLE (single row)
-- =============================================
CREATE TABLE company_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_name TEXT NOT NULL DEFAULT 'LAGMED',
  company_name_ar TEXT NOT NULL DEFAULT 'لاقمد',
  company_name_fr TEXT NOT NULL DEFAULT 'LAGMED',
  address TEXT NOT NULL DEFAULT 'Bordj Bou Arreridj, Algeria',
  address_ar TEXT NOT NULL DEFAULT 'برج بوعريريج، الجزائر',
  address_fr TEXT NOT NULL DEFAULT 'Bordj Bou Arreridj, Algérie',
  phone TEXT NOT NULL DEFAULT '',
  phone2 TEXT,
  email TEXT NOT NULL DEFAULT '',
  logo_url TEXT,
  about TEXT NOT NULL DEFAULT '',
  about_ar TEXT NOT NULL DEFAULT '',
  about_fr TEXT NOT NULL DEFAULT '',
  google_maps_url TEXT,
  facebook_url TEXT,
  instagram_url TEXT,
  linkedin_url TEXT,
  whatsapp_number TEXT,
  notification_email TEXT,
  notification_whatsapp TEXT
);

-- =============================================
-- INSERT DEFAULT COMPANY SETTINGS
-- =============================================
INSERT INTO company_settings (
  company_name, address, phone, email, about
) VALUES (
  'LAGMED',
  'Bordj Bou Arreridj, Algeria',
  '+213 XX XX XX XX',
  'contact@lagmed.dz',
  'Leading medical equipment supplier in Algeria, providing high-quality medical devices and equipment to healthcare facilities across the country.'
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_is_new ON products(is_new);
CREATE INDEX idx_products_is_best_seller ON products(is_best_seller);
CREATE INDEX idx_products_is_featured ON products(is_featured);
CREATE INDEX idx_product_images_product ON product_images(product_id);
CREATE INDEX idx_quote_requests_status ON quote_requests(status);
CREATE INDEX idx_quote_requests_created ON quote_requests(created_at DESC);
CREATE INDEX idx_categories_slug ON categories(slug);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ policies (anyone can read products, categories, settings)
CREATE POLICY "Public can read categories" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Public can read products" ON products
  FOR SELECT USING (true);

CREATE POLICY "Public can read product images" ON product_images
  FOR SELECT USING (true);

CREATE POLICY "Public can read company settings" ON company_settings
  FOR SELECT USING (true);

-- PUBLIC INSERT for quote requests (anyone can submit)
CREATE POLICY "Public can submit quote requests" ON quote_requests
  FOR INSERT WITH CHECK (true);

-- ADMIN (authenticated) full access
CREATE POLICY "Admin full access categories" ON categories
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access products" ON products
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access product images" ON product_images
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access quote requests" ON quote_requests
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access company settings" ON company_settings
  FOR ALL USING (auth.role() = 'authenticated');

-- =============================================
-- STORAGE BUCKETS
-- =============================================
-- Run these in the Supabase Dashboard SQL editor:

-- INSERT INTO storage.buckets (id, name, public) VALUES ('products', 'products', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('datasheets', 'datasheets', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('company', 'company', true);

-- Storage policies for public read
-- CREATE POLICY "Public read products bucket" ON storage.objects FOR SELECT USING (bucket_id = 'products');
-- CREATE POLICY "Public read datasheets bucket" ON storage.objects FOR SELECT USING (bucket_id = 'datasheets');
-- CREATE POLICY "Public read company bucket" ON storage.objects FOR SELECT USING (bucket_id = 'company');

-- Storage policies for admin upload
-- CREATE POLICY "Admin upload products" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'products' AND auth.role() = 'authenticated');
-- CREATE POLICY "Admin upload datasheets" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'datasheets' AND auth.role() = 'authenticated');
-- CREATE POLICY "Admin upload company" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'company' AND auth.role() = 'authenticated');
-- CREATE POLICY "Admin delete products" ON storage.objects FOR DELETE USING (bucket_id = 'products' AND auth.role() = 'authenticated');
-- CREATE POLICY "Admin delete datasheets" ON storage.objects FOR DELETE USING (bucket_id = 'datasheets' AND auth.role() = 'authenticated');
-- CREATE POLICY "Admin delete company" ON storage.objects FOR DELETE USING (bucket_id = 'company' AND auth.role() = 'authenticated');
