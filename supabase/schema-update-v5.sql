-- Add separate logo fields for header, footer, and admin

ALTER TABLE company_settings
  ADD COLUMN IF NOT EXISTS header_logo_url TEXT,
  ADD COLUMN IF NOT EXISTS footer_logo_url TEXT,
  ADD COLUMN IF NOT EXISTS admin_logo_url TEXT;
