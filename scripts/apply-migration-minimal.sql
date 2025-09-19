-- ========================================
-- MIGRATION MINIMALE - ÉTAPES ESSENTIELLES SEULEMENT
-- ========================================
-- Copiez ce contenu dans Supabase SQL Editor

-- 1. Ajouter la colonne media JSONB
ALTER TABLE posts ADD COLUMN IF NOT EXISTS media JSONB DEFAULT '[]';

-- 2. Ajouter les colonnes de fallback si elles n'existent pas
ALTER TABLE posts ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS media_urls TEXT[];
ALTER TABLE posts ADD COLUMN IF NOT EXISTS media_types TEXT[];

-- 3. Créer un index sur la colonne media
CREATE INDEX IF NOT EXISTS idx_posts_media ON posts USING GIN (media);

-- 4. Fonction helper simple pour récupérer les médias
CREATE OR REPLACE FUNCTION get_post_media(post_id UUID)
RETURNS JSONB AS $$
DECLARE
  post_record RECORD;
  result JSONB := '[]'::jsonb;
BEGIN
  -- Récupérer le post
  SELECT media, image_url, video_url
  INTO post_record
  FROM posts
  WHERE id = post_id;

  -- Si media JSONB existe et n'est pas vide, l'utiliser
  IF post_record.media IS NOT NULL AND post_record.media != '[]'::jsonb THEN
    result := post_record.media;
  -- Sinon, construire le JSONB à partir des anciennes colonnes
  ELSE
    -- Ajouter image_url si présent
    IF post_record.image_url IS NOT NULL AND post_record.image_url != '' THEN
      result := jsonb_build_array(
        jsonb_build_object(
          'url', post_record.image_url,
          'type', 'image',
          'alt', 'Image du post'
        )
      );
    END IF;

    -- Ajouter video_url si présent
    IF post_record.video_url IS NOT NULL AND post_record.video_url != '' THEN
      result := result || jsonb_build_array(
        jsonb_build_object(
          'url', post_record.video_url,
          'type', 'video',
          'alt', 'Vidéo du post'
        )
      );
    END IF;
  END IF;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 5. Vue simple pour les posts avec médias
CREATE OR REPLACE VIEW posts_with_media AS
SELECT 
  p.*,
  get_post_media(p.id) as unified_media
FROM posts p;

-- ========================================
-- FIN DE LA MIGRATION MINIMALE
-- ========================================
-- Cette version ne fait que les étapes essentielles
-- Vous pourrez migrer les données manuellement plus tard si nécessaire
