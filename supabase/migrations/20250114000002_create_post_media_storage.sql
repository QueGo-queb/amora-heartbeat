-- Migration pour créer le bucket de stockage des médias des posts
-- Date: 2025-01-14

-- 1. Créer le bucket pour les médias des posts
INSERT INTO storage.buckets (id, name, public) 
VALUES ('post-media', 'post-media', true) 
ON CONFLICT (id) DO NOTHING;

-- 2. Politiques RLS pour le bucket post-media

-- Politique : Les utilisateurs authentifiés peuvent uploader des médias
DROP POLICY IF EXISTS "Authenticated users can upload post media" ON storage.objects;
CREATE POLICY "Authenticated users can upload post media" ON storage.objects 
FOR INSERT 
WITH CHECK (
    bucket_id = 'post-media' 
    AND auth.role() = 'authenticated'
);

-- Politique : Tout le monde peut voir les médias des posts
DROP POLICY IF EXISTS "Anyone can view post media" ON storage.objects;
CREATE POLICY "Anyone can view post media" ON storage.objects 
FOR SELECT 
USING (bucket_id = 'post-media');

-- Politique : Les utilisateurs peuvent modifier leurs propres médias
DROP POLICY IF EXISTS "Users can update their own post media" ON storage.objects;
CREATE POLICY "Users can update their own post media" ON storage.objects 
FOR UPDATE 
USING (
    bucket_id = 'post-media' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Politique : Les utilisateurs peuvent supprimer leurs propres médias
DROP POLICY IF EXISTS "Users can delete their own post media" ON storage.objects;
CREATE POLICY "Users can delete their own post media" ON storage.objects 
FOR DELETE 
USING (
    bucket_id = 'post-media' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 3. Commentaires
COMMENT ON TABLE storage.buckets IS 'Buckets de stockage Supabase';
COMMENT ON TABLE storage.objects IS 'Objets stockés dans les buckets';
