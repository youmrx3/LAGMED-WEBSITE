-- Add multi-datasheet support to products

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS datasheets JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Backfill the new JSON field from the existing single datasheet URL when present.
UPDATE products
SET datasheets = jsonb_build_array(
  jsonb_build_object(
    'name', 'Datasheet',
    'url', datasheet_url,
    'type', NULL,
    'size', NULL
  )
)
WHERE datasheet_url IS NOT NULL
  AND COALESCE(datasheets, '[]'::jsonb) = '[]'::jsonb;
