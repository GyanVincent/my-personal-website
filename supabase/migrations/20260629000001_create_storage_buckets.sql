-- Create storage buckets for file uploads

-- Create buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('avatars', 'avatars', true, 1048576, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('cv', 'cv', true, 5242880, ARRAY['application/pdf']),
  ('projects', 'projects', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('certificates', 'certificates', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']),
  ('blog', 'blog', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Grant public access for reading files
DROP POLICY IF EXISTS "Public read avatars" ON storage.objects;
CREATE POLICY "Public read avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
DROP POLICY IF EXISTS "Public read cv" ON storage.objects;
CREATE POLICY "Public read cv" ON storage.objects FOR SELECT USING (bucket_id = 'cv');
DROP POLICY IF EXISTS "Public read projects" ON storage.objects;
CREATE POLICY "Public read projects" ON storage.objects FOR SELECT USING (bucket_id = 'projects');
DROP POLICY IF EXISTS "Public read certificates" ON storage.objects;
CREATE POLICY "Public read certificates" ON storage.objects FOR SELECT USING (bucket_id = 'certificates');
DROP POLICY IF EXISTS "Public read blog" ON storage.objects;
CREATE POLICY "Public read blog" ON storage.objects FOR SELECT USING (bucket_id = 'blog');

-- Grant authenticated users upload access
DROP POLICY IF EXISTS "Authenticated upload avatars" ON storage.objects;
CREATE POLICY "Authenticated upload avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars');
DROP POLICY IF EXISTS "Authenticated upload cv" ON storage.objects;
CREATE POLICY "Authenticated upload cv" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'cv');
DROP POLICY IF EXISTS "Authenticated upload projects" ON storage.objects;
CREATE POLICY "Authenticated upload projects" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'projects');
DROP POLICY IF EXISTS "Authenticated upload certificates" ON storage.objects;
CREATE POLICY "Authenticated upload certificates" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'certificates');
DROP POLICY IF EXISTS "Authenticated upload blog" ON storage.objects;
CREATE POLICY "Authenticated upload blog" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'blog');

-- Grant authenticated users delete access
DROP POLICY IF EXISTS "Authenticated delete avatars" ON storage.objects;
CREATE POLICY "Authenticated delete avatars" ON storage.objects FOR DELETE USING (bucket_id = 'avatars');
DROP POLICY IF EXISTS "Authenticated delete cv" ON storage.objects;
CREATE POLICY "Authenticated delete cv" ON storage.objects FOR DELETE USING (bucket_id = 'cv');
DROP POLICY IF EXISTS "Authenticated delete projects" ON storage.objects;
CREATE POLICY "Authenticated delete projects" ON storage.objects FOR DELETE USING (bucket_id = 'projects');
DROP POLICY IF EXISTS "Authenticated delete certificates" ON storage.objects;
CREATE POLICY "Authenticated delete certificates" ON storage.objects FOR DELETE USING (bucket_id = 'certificates');
DROP POLICY IF EXISTS "Authenticated delete blog" ON storage.objects;
CREATE POLICY "Authenticated delete blog" ON storage.objects FOR DELETE USING (bucket_id = 'blog');

-- Grant permissions to roles
GRANT USAGE ON SCHEMA storage TO anon, authenticated;
GRANT ALL ON SCHEMA storage TO postgres, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA storage TO postgres, service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA storage TO anon, authenticated;
