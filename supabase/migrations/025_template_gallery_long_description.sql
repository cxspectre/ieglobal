-- Add Framer-style gallery and rich description support

ALTER TABLE website_templates
  ADD COLUMN IF NOT EXISTS gallery_urls text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS long_description text,
  ADD COLUMN IF NOT EXISTS features text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS author text,
  ADD COLUMN IF NOT EXISTS page_names text[] DEFAULT '{}';
