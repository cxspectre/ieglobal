-- Storage Policies for client-documents bucket
-- Run this in Supabase SQL Editor after creating the bucket

-- Policy 1: Allow anyone to upload to their own client folder
-- Note: This is permissive for now - tighten based on your auth setup
CREATE POLICY "Allow uploads to client-documents"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'client-documents'
);

-- Policy 2: Allow anyone to view files in client-documents
-- Note: This is permissive for now - tighten based on your auth setup
CREATE POLICY "Allow viewing client-documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'client-documents'
);

-- Policy 3: Allow employees to view all documents
CREATE POLICY "Allow employees to view all client documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'client-documents'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'employee')
  )
);

-- Policy 4: Allow employees to delete files
CREATE POLICY "Allow employees to delete client files"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'client-documents'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'employee')
  )
);

