-- Script séparé pour configurer le storage (à exécuter après la migration)

-- Créer le bucket pour les vidéos de profil
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-videos',
  'profile-videos', 
  false,
  104857600, -- 100MB
  ARRAY['video/mp4', 'video/webm', 'video/quicktime']
) ON CONFLICT (id) DO NOTHING;

-- Bucket pour les miniatures
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'video-thumbnails',
  'video-thumbnails',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Politiques storage
CREATE POLICY "Users can upload their own profile videos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profile-videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view approved profile videos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'profile-videos'
  AND EXISTS (
    SELECT 1 FROM video_profiles vp
    WHERE vp.storage_path = name
    AND vp.moderation_status = 'approved'
  )
);

CREATE POLICY "Users can view their own profile videos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'profile-videos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Anyone can view video thumbnails"
ON storage.objects FOR SELECT
USING (bucket_id = 'video-thumbnails');

CREATE POLICY "Users can upload thumbnails for their videos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'video-thumbnails'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
