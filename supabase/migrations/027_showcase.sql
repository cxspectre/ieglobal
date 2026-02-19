-- Showcase: 6 project slots for the secret /showcase page
-- Each slot has: project URL, short description, industry type
-- Managed by admin/employee in dashboard; public can view

CREATE TABLE IF NOT EXISTS showcase (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  sort_order int NOT NULL UNIQUE CHECK (sort_order >= 1 AND sort_order <= 6),
  project_url text NOT NULL,
  description text,
  industry_type text NOT NULL
);

-- Index for ordered listing
CREATE INDEX IF NOT EXISTS idx_showcase_sort_order ON showcase (sort_order);

ALTER TABLE showcase ENABLE ROW LEVEL SECURITY;

-- Public: anyone can view showcase items
CREATE POLICY "Public can view showcase"
  ON showcase
  FOR SELECT
  USING (true);

-- Admin + employee can do everything
CREATE POLICY "Admin and employee can manage showcase"
  ON showcase
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'employee')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'employee')
    )
  );
