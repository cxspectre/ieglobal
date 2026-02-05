-- Create case_studies table for admin-managed work projects on the website
-- Run this in Supabase SQL Editor BEFORE case-studies-storage.sql

CREATE TABLE IF NOT EXISTS case_studies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  client TEXT NOT NULL,
  industry TEXT NOT NULL,
  services JSONB DEFAULT '[]'::jsonb,
  challenge TEXT NOT NULL,
  outcome TEXT,
  metrics JSONB DEFAULT '[]'::jsonb,
  cover_image_url TEXT,
  content TEXT NOT NULL DEFAULT '',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_case_studies_slug ON case_studies(slug);
CREATE INDEX IF NOT EXISTS idx_case_studies_date ON case_studies(date DESC);
CREATE INDEX IF NOT EXISTS idx_case_studies_featured ON case_studies(featured);

ALTER TABLE case_studies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view case studies" ON case_studies;
CREATE POLICY "Anyone can view case studies" ON case_studies FOR SELECT USING (true);

DROP POLICY IF EXISTS "Employees can manage case studies" ON case_studies;
CREATE POLICY "Employees can manage case studies" ON case_studies FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'employee'))
);

-- Trigger for updated_at (requires update_updated_at() from initial schema)
DROP TRIGGER IF EXISTS case_studies_updated_at ON case_studies;
CREATE TRIGGER case_studies_updated_at BEFORE UPDATE ON case_studies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

COMMENT ON TABLE case_studies IS 'Case studies / work projects displayed on the public website';
