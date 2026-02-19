-- Add author and page_names for Framer-style sidebar
ALTER TABLE website_templates
  ADD COLUMN IF NOT EXISTS author text,
  ADD COLUMN IF NOT EXISTS page_names text[] DEFAULT '{}';
