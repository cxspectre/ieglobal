-- Website templates for public browse + admin management
-- Admins/employees add templates; public can view published ones

CREATE TABLE IF NOT EXISTS website_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,

  name text NOT NULL,
  description text,
  category text NOT NULL,
  template_url text NOT NULL,
  thumbnail_url text,
  sort_order int NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true
);

-- Index for public listing
CREATE INDEX IF NOT EXISTS idx_website_templates_published_order
  ON website_templates (published, sort_order, created_at DESC)
  WHERE published = true;

ALTER TABLE website_templates ENABLE ROW LEVEL SECURITY;

-- Public: anyone can view published templates
CREATE POLICY "Public can view published website templates"
  ON website_templates
  FOR SELECT
  USING (published = true);

-- Admin + employee can view all
CREATE POLICY "Admin and employee can view all website templates"
  ON website_templates
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'employee')
    )
  );

-- Admin + employee can insert
CREATE POLICY "Admin and employee can insert website templates"
  ON website_templates
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'employee')
    )
  );

-- Admin + employee can update
CREATE POLICY "Admin and employee can update website templates"
  ON website_templates
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'employee')
    )
  );

-- Admin + employee can delete
CREATE POLICY "Admin and employee can delete website templates"
  ON website_templates
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'employee')
    )
  );
