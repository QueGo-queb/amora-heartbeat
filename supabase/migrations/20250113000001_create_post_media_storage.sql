-- Créer le bucket pour stocker les médias des posts
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-media', 'post-media', true)
ON CONFLICT (id) DO NOTHING;

-- Politiques RLS pour le bucket post-media
CREATE POLICY "Authenticated users can upload post media" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'post-media' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Anyone can view post media" ON storage.objects
FOR SELECT USING (bucket_id = 'post-media');

CREATE POLICY "Users can delete their own post media" ON storage.objects
FOR DELETE USING (
  bucket_id = 'post-media' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
