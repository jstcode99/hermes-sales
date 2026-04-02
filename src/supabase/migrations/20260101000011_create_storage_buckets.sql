-- ==========================================
-- Storage Buckets for multi-tenant
-- ==========================================

-- Company logos bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  (
    'company-logos',
    'company-logos',
    true,
    2097152, -- 2MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  )
ON CONFLICT (id) DO NOTHING;

-- User avatars bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  (
    'avatars',
    'avatars',
    true,
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  )
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- Storage Policies
-- ==========================================

-- Company logos: company members can upload, public read
CREATE POLICY "Allow public read company-logos"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'company-logos');

CREATE POLICY "Allow authenticated upload company-logos"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'company-logos');

CREATE POLICY "Allow company owners update company-logos"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'company-logos'
    AND (
      name LIKE 'company/' || (
        SELECT string_agg(company_id::text, ',')
        FROM public.company_users
        WHERE user_id = auth.uid() AND role = 'owner'
      ) || '/*'
    )
  );

-- User avatars: users can upload their own, public read
CREATE POLICY "Allow public read avatars"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'avatars');

CREATE POLICY "Allow users upload avatars"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND name LIKE 'user/' || auth.uid()::text || '/*'
  );

CREATE POLICY "Allow users update own avatars"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND name LIKE 'user/' || auth.uid()::text || '/*'
  );
