-- =============================================
-- STORAGE BUCKETS SETUP FOR LAGMED
-- =============================================
-- Run this in Supabase SQL Editor to create storage buckets and set permissions

-- =============================================
-- CREATE STORAGE BUCKETS
-- =============================================
INSERT INTO storage.buckets (id, name, public) VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) VALUES ('datasheets', 'datasheets', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) VALUES ('company', 'company', true)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- STORAGE POLICIES - PUBLIC READ ACCESS
-- =============================================

-- Products bucket - public read
CREATE POLICY "Public read products bucket" ON storage.objects
  FOR SELECT USING (bucket_id = 'products');

-- Datasheets bucket - public read
CREATE POLICY "Public read datasheets bucket" ON storage.objects
  FOR SELECT USING (bucket_id = 'datasheets');

-- Company bucket - public read
CREATE POLICY "Public read company bucket" ON storage.objects
  FOR SELECT USING (bucket_id = 'company');

-- =============================================
-- STORAGE POLICIES - ADMIN UPLOAD/DELETE
-- =============================================

-- Products bucket - admin upload
CREATE POLICY "Admin upload to products" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'products' AND auth.role() = 'authenticated'
  );

-- Products bucket - admin delete
CREATE POLICY "Admin delete from products" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'products' AND auth.role() = 'authenticated'
  );

-- Datasheets bucket - admin upload
CREATE POLICY "Admin upload to datasheets" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'datasheets' AND auth.role() = 'authenticated'
  );

-- Datasheets bucket - admin delete
CREATE POLICY "Admin delete from datasheets" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'datasheets' AND auth.role() = 'authenticated'
  );

-- Company bucket - admin upload
CREATE POLICY "Admin upload to company" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'company' AND auth.role() = 'authenticated'
  );

-- Company bucket - admin delete
CREATE POLICY "Admin delete from company" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'company' AND auth.role() = 'authenticated'
  );
