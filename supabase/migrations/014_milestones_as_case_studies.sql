-- Add case study columns to milestones so we can use it for work/portfolio projects
-- Case studies = milestones with project_id IS NULL

ALTER TABLE milestones ALTER COLUMN project_id DROP NOT NULL;

ALTER TABLE milestones ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
ALTER TABLE milestones ADD COLUMN IF NOT EXISTS summary TEXT;
ALTER TABLE milestones ADD COLUMN IF NOT EXISTS client TEXT;
ALTER TABLE milestones ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE milestones ADD COLUMN IF NOT EXISTS services JSONB DEFAULT '[]'::jsonb;
ALTER TABLE milestones ADD COLUMN IF NOT EXISTS challenge TEXT;
ALTER TABLE milestones ADD COLUMN IF NOT EXISTS outcome TEXT;
ALTER TABLE milestones ADD COLUMN IF NOT EXISTS metrics JSONB DEFAULT '[]'::jsonb;
ALTER TABLE milestones ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
ALTER TABLE milestones ADD COLUMN IF NOT EXISTS case_content TEXT DEFAULT '';
ALTER TABLE milestones ADD COLUMN IF NOT EXISTS case_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE milestones ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_milestones_slug ON milestones(slug) WHERE slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_milestones_case_study ON milestones(created_at DESC) WHERE project_id IS NULL;

COMMENT ON COLUMN milestones.case_content IS 'Markdown content for case study (when project_id IS NULL)';

-- RLS: Allow public to read case studies (milestones with project_id IS NULL)
CREATE POLICY "Anyone can view case study milestones" ON milestones FOR SELECT
  USING (project_id IS NULL);

-- Employees can manage case studies (the existing "Employees can manage milestones" policy already covers this)
