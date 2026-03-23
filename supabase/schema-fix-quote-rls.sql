-- =============================================
-- FIX: quote_requests RLS for public quote submissions
-- Run this in Supabase SQL Editor (Production project)
-- =============================================

-- Ensure table exists and RLS is enabled
ALTER TABLE IF EXISTS quote_requests ENABLE ROW LEVEL SECURITY;

-- Remove potentially broken/old policies
DROP POLICY IF EXISTS "Public can submit quote requests" ON quote_requests;
DROP POLICY IF EXISTS "Admin full access quote requests" ON quote_requests;

-- Public insert policy for website users (anon + authenticated)
CREATE POLICY "Public can submit quote requests" ON quote_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Admin read/manage policy for dashboard users
CREATE POLICY "Admin full access quote requests" ON quote_requests
  FOR ALL
  TO authenticated
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Optional: explicit grants (safe if already granted)
GRANT INSERT ON TABLE quote_requests TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON TABLE quote_requests TO authenticated;
