-- Case studies / work projects for public website (admin-managed)
CREATE TABLE case_studies (
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

CREATE TRIGGER case_studies_updated_at BEFORE UPDATE ON case_studies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_case_studies_slug ON case_studies(slug);
CREATE INDEX idx_case_studies_date ON case_studies(date DESC);
CREATE INDEX idx_case_studies_featured ON case_studies(featured);

ALTER TABLE case_studies ENABLE ROW LEVEL SECURITY;

-- Public can read all case studies (for website display)
CREATE POLICY "Anyone can view case studies" ON case_studies FOR SELECT USING (true);

-- Only admin/employee can insert, update, delete
CREATE POLICY "Employees can manage case studies" ON case_studies FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'employee'))
);

COMMENT ON TABLE case_studies IS 'Case studies / work projects displayed on the public website';

-- Storage bucket for case study cover images (create via Dashboard if not exists: name=case-studies, public=true)
-- Storage policies for case-studies bucket (run in SQL editor after creating bucket):
-- INSERT INTO storage.buckets (id, name, public) VALUES ('case-studies', 'case-studies', true);
-- CREATE POLICY "Anyone can view case study images" ON storage.objects FOR SELECT USING (bucket_id = 'case-studies');
-- CREATE POLICY "Employees can upload case study images" ON storage.objects FOR INSERT WITH CHECK (
--   bucket_id = 'case-studies' AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'employee'))
-- );
-- CREATE POLICY "Employees can delete case study images" ON storage.objects FOR DELETE USING (
--   bucket_id = 'case-studies' AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'employee'))
-- );
