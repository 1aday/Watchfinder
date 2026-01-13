-- ============================================================================
-- Supabase Storage Setup for Watch Images
-- ============================================================================

-- Create storage bucket for watch images
INSERT INTO storage.buckets (id, name, public)
VALUES ('watch-images', 'watch-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for public read access
CREATE POLICY "Public read access for watch images"
ON storage.objects FOR SELECT
USING (bucket_id = 'watch-images');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload watch images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'watch-images' AND
  auth.role() = 'authenticated'
);

-- Allow authenticated users to delete their uploaded images
CREATE POLICY "Authenticated users can delete watch images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'watch-images' AND
  auth.role() = 'authenticated'
);

-- For now, allow service role to manage all images
CREATE POLICY "Service role full access to watch images"
ON storage.objects FOR ALL
USING (
  bucket_id = 'watch-images' AND
  auth.role() = 'service_role'
);
