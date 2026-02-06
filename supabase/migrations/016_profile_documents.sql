-- Profile documents: team member documents (contracts, agreements, etc.)
-- Uploaded on team detail page, visible on profile overview for the user

-- Table: profile_documents
CREATE TABLE profile_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  file_url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  uploaded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_profile_documents_profile_id ON profile_documents(profile_id);

-- RLS
ALTER TABLE profile_documents ENABLE ROW LEVEL SECURITY;

-- Team (admin, employee, partner) can view documents for any team member
CREATE POLICY "Team can view profile documents"
ON profile_documents FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role IN ('admin', 'employee', 'partner')
  )
);

-- Users can view their own documents (profile overview)
CREATE POLICY "Users can view own profile documents"
ON profile_documents FOR SELECT USING (profile_id = auth.uid());

-- Only admin and employee can manage (upload, delete)
CREATE POLICY "Admins and employees can insert profile documents"
ON profile_documents FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'employee'))
);

CREATE POLICY "Admins and employees can delete profile documents"
ON profile_documents FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'employee'))
);

-- Storage bucket for profile documents (private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-documents',
  'profile-documents',
  false,
  10485760,
  NULL
)
ON CONFLICT (id) DO NOTHING;

-- Storage: team (admin, employee) can upload to profile-documents
CREATE POLICY "Admins and employees can upload profile documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profile-documents'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'employee')
  )
);

-- Storage: team can view (download) profile documents
CREATE POLICY "Team can view profile documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'profile-documents'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'employee', 'partner')
  )
);

-- Users can view their own profile documents (profile_id in path: profile-id/filename)
CREATE POLICY "Users can view own profile documents storage"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'profile-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Storage: admin/employee can delete
CREATE POLICY "Admins and employees can delete profile documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'profile-documents'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'employee')
  )
);
