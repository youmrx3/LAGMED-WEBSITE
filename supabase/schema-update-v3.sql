-- Migration: Add notification fields to company_settings table
-- This adds the ability to configure notification email and WhatsApp number

ALTER TABLE company_settings 
ADD COLUMN IF NOT EXISTS notification_email TEXT,
ADD COLUMN IF NOT EXISTS notification_whatsapp TEXT;
