-- Migration pour créer le bucket de stockage des médias

-- Créer le bucket pour les médias des posts
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Supprimer les anciennes politiques si elles existent pour éviter les conflits
DO $$
BEGIN
  -- Supprimer les politiques existantes si elles existent
  DROP POLICY IF EXISTS "Users can upload media" ON storage.objects;
  DROP POLICY IF EXISTS "Media is publicly accessible" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete own media" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can upload media" ON storage.objects;
  DROP POLICY IF EXISTS "Public media access" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete their media" ON storage.objects;
EXCEPTION
  WHEN undefined_object THEN
    -- Ignorer si les politiques n'existent pas
    NULL;
END $$;

-- Politique pour permettre l'upload aux utilisateurs authentifiés (nom unique)
CREATE POLICY "Authenticated users can upload media" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'media' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = 'posts'
);

-- Politique pour permettre la lecture publique (nom unique)
CREATE POLICY "Public media access" ON storage.objects
FOR SELECT USING (bucket_id = 'media');

-- Politique pour permettre aux utilisateurs de supprimer leurs propres médias (nom unique)
CREATE POLICY "Users can delete their media" ON storage.objects
FOR DELETE USING (
  bucket_id = 'media' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = 'posts'
);

-- Politique pour permettre la mise à jour des métadonnées (optionnel)
CREATE POLICY "Users can update their media metadata" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'media' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = 'posts'
);
