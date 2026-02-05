-- Case studies cover image storage bucket
-- Run this in Supabase SQL Editor after migration 013_case_studies.sql
-- Also create bucket "case-studies" in Storage dashboard (public, allow images)

-- Create bucket if not exists (Supabase)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'case-studies',
  'case-studies',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to view (public bucket)
CREATE POLICY "Anyone can view case study images"
ON storage.objects FOR SELECT
USING (bucket_id = 'case-studies');

-- Allow admin/employee to upload
CREATE POLICY "Employees can upload case study images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'case-studies'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'employee')
  )
);

-- Allow admin/employee to delete
CREATE POLICY "Employees can delete case study images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'case-studies'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'employee')
  )
);
