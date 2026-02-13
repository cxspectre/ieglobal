-- Add slug for subdomain routing (consulting.ie-global.net)
-- Slug must be unique and url-safe (lowercase, alphanumeric, hyphens)

ALTER TABLE website_templates
  ADD COLUMN IF NOT EXISTS slug text UNIQUE;

-- Backfill slug from name for existing rows (lowercase, replace spaces with hyphens)
UPDATE website_templates
SET slug = lower(regexp_replace(regexp_replace(name, '\s+', '-', 'g'), '[^a-z0-9-]', '', 'g'))
WHERE slug IS NULL;

-- Make slug required for new templates (we'll enforce in app)
-- template_url will be derived: https://{slug}.ie-global.net

-- Storage bucket for template static files (HTML, CSS, JS, images)
-- Path: {slug}/index.html, {slug}/style.css, etc.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'website-templates',
  'website-templates',
  false,
  52428800,
  ARRAY['text/html', 'text/css', 'application/javascript', 'image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml', 'font/woff', 'font/woff2', 'application/json']
)
ON CONFLICT (id) DO NOTHING;

-- Admin + employee can upload/update/delete template files
CREATE POLICY "Admins and employees can upload template files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'website-templates'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'employee')
  )
);

CREATE POLICY "Admins and employees can update template files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'website-templates'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'employee')
  )
);

CREATE POLICY "Admins and employees can delete template files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'website-templates'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'employee')
  )
);

-- Public can read (so our proxy can fetch and serve with branded subdomain)
CREATE POLICY "Public can read template files"
ON storage.objects FOR SELECT
USING (bucket_id = 'website-templates');
