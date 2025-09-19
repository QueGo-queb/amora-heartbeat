-- ✅ CORRECTION COMPLÈTE DU SYSTÈME DE MÉDIAS

-- 1. DIAGNOSTIC : Vérifier les tables existantes
DO $$
DECLARE
    posts_table_exists BOOLEAN;
    profiles_table_exists BOOLEAN;
    bucket_exists BOOLEAN;
BEGIN
    -- Vérifier l'existence des tables
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'posts' AND table_schema = 'public'
    ) INTO posts_table_exists;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'profiles' AND table_schema = 'public'
    ) INTO profiles_table_exists;
    
    -- Vérifier l'existence du bucket
    SELECT EXISTS (
        SELECT 1 FROM storage.buckets 
        WHERE id = 'post-media'
    ) INTO bucket_exists;
    
    RAISE NOTICE '=== DIAGNOSTIC MÉDIAS ===';
    RAISE NOTICE 'Table posts existe: %', posts_table_exists;
    RAISE NOTICE 'Table profiles existe: %', profiles_table_exists;
    RAISE NOTICE 'Bucket post-media existe: %', bucket_exists;
END $$;

-- 2. UNIFIER LA STRUCTURE DES POSTS
-- S'assurer que la table posts a la bonne structure
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS media JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS media_urls TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS media_types TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS shares_count INTEGER DEFAULT 0;

-- Supprimer les anciennes colonnes si elles existent (pour éviter les conflits)
ALTER TABLE posts 
DROP COLUMN IF EXISTS image_url,
DROP COLUMN IF EXISTS video_url;

-- 3. CRÉER LE BUCKET DE STOCKAGE SI NÉCESSAIRE
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('post-media', 'post-media', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'])
ON CONFLICT (id) DO NOTHING;

-- 4. NETTOYER LES ANCIENNES POLITIQUES
DROP POLICY IF EXISTS "Authenticated users can upload post media" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view post media" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own post media" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own post media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload media" ON storage.objects;
DROP POLICY IF EXISTS "Public media access" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their media" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their media metadata" ON storage.objects;

-- 5. CRÉER LES POLITIQUES RLS CORRECTES POUR LE BUCKET POST-MEDIA
-- Upload : Seuls les utilisateurs authentifiés peuvent uploader
CREATE POLICY "Authenticated users can upload post media" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'post-media' 
    AND auth.uid() IS NOT NULL
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Lecture : Tout le monde peut voir les médias publics
CREATE POLICY "Anyone can view post media" ON storage.objects
FOR SELECT USING (bucket_id = 'post-media');

-- Mise à jour : Seul le propriétaire peut modifier ses médias
CREATE POLICY "Users can update their own post media" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'post-media' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Suppression : Seul le propriétaire peut supprimer ses médias
CREATE POLICY "Users can delete their own post media" ON storage.objects
FOR DELETE USING (
    bucket_id = 'post-media' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 6. CRÉER UNE FONCTION POUR GÉNÉRER LES URLs PUBLIQUES
CREATE OR REPLACE FUNCTION public.get_media_public_url(bucket_name TEXT, file_path TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN concat('https://', current_setting('app.settings.supabase_url', true), '/storage/v1/object/public/', bucket_name, '/', file_path);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. CRÉER UNE FONCTION POUR UPLOADER UN MÉDIA
CREATE OR REPLACE FUNCTION public.upload_post_media(
  p_user_id UUID,
  p_file_name TEXT,
  p_file_data BYTEA,
  p_content_type TEXT
)
RETURNS JSONB AS $$
DECLARE
  file_path TEXT;
  public_url TEXT;
  result JSONB;
BEGIN
  -- Générer un chemin unique pour le fichier
  file_path := p_user_id::text || '/' || extract(epoch from now())::text || '_' || p_file_name;
  
  -- Uploader le fichier vers le bucket
  INSERT INTO storage.objects (bucket_id, name, owner, metadata)
  VALUES ('post-media', file_path, p_user_id, jsonb_build_object('contentType', p_content_type))
  ON CONFLICT (bucket_id, name) DO NOTHING;
  
  -- Générer l'URL publique
  public_url := public.get_media_public_url('post-media', file_path);
  
  -- Retourner les informations du fichier
  result := jsonb_build_object(
    'type', CASE 
      WHEN p_content_type LIKE 'image/%' THEN 'image'
      WHEN p_content_type LIKE 'video/%' THEN 'video'
      ELSE 'file'
    END,
    'url', public_url,
    'path', file_path,
    'content_type', p_content_type
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. DONNER LES PERMISSIONS NÉCESSAIRES
GRANT EXECUTE ON FUNCTION public.get_media_public_url TO authenticated;
GRANT EXECUTE ON FUNCTION public.upload_post_media TO authenticated;
GRANT ALL ON storage.objects TO authenticated;

-- 9. CRÉER LES INDEX POUR OPTIMISER LES PERFORMANCES
CREATE INDEX IF NOT EXISTS idx_posts_media ON posts USING GIN(media);
CREATE INDEX IF NOT EXISTS idx_posts_media_urls ON posts USING GIN(media_urls);
CREATE INDEX IF NOT EXISTS idx_posts_media_types ON posts USING GIN(media_types);
CREATE INDEX IF NOT EXISTS idx_posts_has_media ON posts(created_at DESC) WHERE jsonb_array_length(media) > 0;

-- 10. VÉRIFICATION FINALE
DO $$
DECLARE
    bucket_exists BOOLEAN;
    policies_count INTEGER;
    functions_count INTEGER;
    indexes_count INTEGER;
BEGIN
    -- Vérifier le bucket
    SELECT EXISTS (
        SELECT 1 FROM storage.buckets 
        WHERE id = 'post-media' AND public = true
    ) INTO bucket_exists;
    
    -- Compter les politiques
    SELECT COUNT(*) INTO policies_count 
    FROM pg_policies 
    WHERE tablename = 'objects' AND schemaname = 'storage';
    
    -- Compter les fonctions
    SELECT COUNT(*) INTO functions_count 
    FROM pg_proc 
    WHERE proname IN ('get_media_public_url', 'upload_post_media');
    
    -- Compter les index
    SELECT COUNT(*) INTO indexes_count 
    FROM pg_indexes 
    WHERE tablename = 'posts' AND indexname LIKE '%media%';
    
    RAISE NOTICE '=== VÉRIFICATION FINALE ===';
    RAISE NOTICE '✅ Bucket post-media configuré: %', bucket_exists;
    RAISE NOTICE '✅ Politiques RLS créées: %', policies_count;
    RAISE NOTICE '✅ Fonctions créées: %', functions_count;
    RAISE NOTICE '✅ Index créés: %', indexes_count;
    
    IF bucket_exists AND policies_count >= 4 AND functions_count >= 2 AND indexes_count >= 4 THEN
        RAISE NOTICE ' Système de médias configuré avec succès !';
    ELSE
        RAISE NOTICE '❌ Problème dans la configuration';
    END IF;
END $$;
