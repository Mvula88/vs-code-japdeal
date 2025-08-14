-- Create storage buckets for car images
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES 
  ('car-images', 'car-images', true, false, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']),
  ('car-thumbnails', 'car-thumbnails', true, false, 2097152, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']),
  ('documents', 'documents', false, false, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  avif_autodetection = EXCLUDED.avif_autodetection,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Policies for car-images bucket (public read, authenticated upload)
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'car-images');

CREATE POLICY "Authenticated users can upload images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'car-images' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can update their images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'car-images' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can delete their images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'car-images' 
    AND auth.role() = 'authenticated'
  );

-- Policies for car-thumbnails bucket (public read, authenticated upload)
CREATE POLICY "Public Access Thumbnails" ON storage.objects
  FOR SELECT USING (bucket_id = 'car-thumbnails');

CREATE POLICY "Authenticated users can upload thumbnails" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'car-thumbnails' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can update thumbnails" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'car-thumbnails' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can delete thumbnails" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'car-thumbnails' 
    AND auth.role() = 'authenticated'
  );

-- Policies for documents bucket (private, only owner and admin access)
CREATE POLICY "Users can view own documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documents' 
    AND (auth.uid() = owner OR is_admin())
  );

CREATE POLICY "Users can upload documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'documents' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update own documents" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'documents' 
    AND (auth.uid() = owner OR is_admin())
  );

CREATE POLICY "Users can delete own documents" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'documents' 
    AND (auth.uid() = owner OR is_admin())
  );

-- Function to generate unique file names
CREATE OR REPLACE FUNCTION generate_unique_filename(original_name text)
RETURNS text AS $$
DECLARE
  extension text;
  base_name text;
  unique_name text;
BEGIN
  -- Extract extension
  extension := split_part(original_name, '.', array_length(string_to_array(original_name, '.'), 1));
  
  -- Generate unique name with timestamp and random string
  unique_name := concat(
    extract(epoch from now())::bigint,
    '_',
    substr(md5(random()::text), 1, 8),
    '.',
    extension
  );
  
  RETURN unique_name;
END;
$$ LANGUAGE plpgsql;

-- Function to get storage URL
CREATE OR REPLACE FUNCTION get_storage_url(bucket text, file_path text)
RETURNS text AS $$
BEGIN
  RETURN concat(
    current_setting('app.settings.supabase_url', true),
    '/storage/v1/object/public/',
    bucket,
    '/',
    file_path
  );
END;
$$ LANGUAGE plpgsql;