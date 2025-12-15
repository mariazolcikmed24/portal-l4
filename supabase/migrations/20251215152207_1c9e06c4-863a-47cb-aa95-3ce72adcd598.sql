-- Create storage bucket for case attachments
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'case-attachments', 
  'case-attachments', 
  false,
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
);

-- RLS policies for case-attachments bucket
-- Allow authenticated users to upload their own files
CREATE POLICY "Users can upload case attachments"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'case-attachments'
);

-- Allow users to view their own attachments
CREATE POLICY "Users can view case attachments"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'case-attachments'
);

-- Allow service role to access all files (for edge functions)
CREATE POLICY "Service role can access all case attachments"
ON storage.objects
FOR ALL
USING (
  bucket_id = 'case-attachments'
);