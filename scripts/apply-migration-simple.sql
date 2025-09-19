-- ========================================
-- MIGRATION SIMPLIFIÉE POUR ÉVITER LES ERREURS
-- ========================================
-- Copiez ce contenu dans Supabase SQL Editor

-- Migration non destructive pour unifier le système de médias
-- Date: 2025-01-22
-- Version simplifiée pour éviter les erreurs de syntaxe

-- 1. Ajouter la colonne media JSONB si elle n'existe pas déjà
ALTER TABLE posts ADD COLUMN IF NOT EXISTS media JSONB DEFAULT '[]';

-- 2. Ajouter les colonnes de fallback si elles n'existent pas (pour la rétrocompatibilité)
ALTER TABLE posts ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS media_urls TEXT[];
ALTER TABLE posts ADD COLUMN IF NOT EXISTS media_types TEXT[];

-- 3. Créer un index sur la colonne media pour les performances
CREATE INDEX IF NOT EXISTS idx_posts_media ON posts USING GIN (media);

-- 4. Fonction simplifiée pour migrer les données existantes
CREATE OR REPLACE FUNCTION migrate_existing_media_to_jsonb()
RETURNS void AS $$
DECLARE
  post_record RECORD;
  media_array JSONB;
BEGIN
  -- Migrer les posts qui ont des image_url mais pas de media
  FOR post_record IN 
    SELECT id, image_url FROM posts 
    WHERE image_url IS NOT NULL 
      AND image_url != '' 
      AND (media IS NULL OR media = '[]'::jsonb)
  LOOP
    media_array := jsonb_build_array(
      jsonb_build_object(
        'url', post_record.image_url,
        'type', 'image',
        'alt', 'Image du post'
      )
    );
    
    UPDATE posts 
    SET media = media_array
    WHERE id = post_record.id;
  END LOOP;

  -- Migrer les posts qui ont des video_url mais pas de media
  FOR post_record IN 
    SELECT id, video_url FROM posts 
    WHERE video_url IS NOT NULL 
      AND video_url != '' 
      AND (media IS NULL OR media = '[]'::jsonb)
  LOOP
    media_array := jsonb_build_array(
      jsonb_build_object(
        'url', post_record.video_url,
        'type', 'video',
        'alt', 'Vidéo du post'
      )
    );
    
    UPDATE posts 
    SET media = media_array
    WHERE id = post_record.id;
  END LOOP;

  -- Migrer les posts qui ont des media_urls (version simplifiée)
  FOR post_record IN 
    SELECT id, media_urls, media_types FROM posts 
    WHERE media_urls IS NOT NULL 
      AND array_length(media_urls, 1) > 0 
      AND (media IS NULL OR media = '[]'::jsonb)
  LOOP
    media_array := '[]'::jsonb;
    
    -- Ajouter chaque URL avec son type correspondant
    FOR i IN 1..array_length(post_record.media_urls, 1) LOOP
      DECLARE
        url_item TEXT := post_record.media_urls[i];
        type_item TEXT := 'image'; -- Par défaut
      BEGIN
        -- Récupérer le type correspondant s'il existe
        IF post_record.media_types IS NOT NULL 
           AND array_length(post_record.media_types, 1) >= i THEN
          type_item := post_record.media_types[i];
        END IF;
        
        -- Ajouter au tableau JSONB
        media_array := media_array || jsonb_build_array(
          jsonb_build_object(
            'url', url_item,
            'type', type_item,
            'alt', 'Média du post'
          )
        );
      END;
    END LOOP;
    
    UPDATE posts 
    SET media = media_array
    WHERE id = post_record.id;
  END LOOP;

  -- Log des migrations effectuées
  RAISE NOTICE 'Migration des médias terminée - Posts avec image_url: %', 
    (SELECT count(*) FROM posts WHERE image_url IS NOT NULL AND image_url != '');
  RAISE NOTICE 'Posts avec video_url: %', 
    (SELECT count(*) FROM posts WHERE video_url IS NOT NULL AND video_url != '');
  RAISE NOTICE 'Posts avec media_urls: %', 
    (SELECT count(*) FROM posts WHERE media_urls IS NOT NULL AND array_length(media_urls, 1) > 0);
  RAISE NOTICE 'Posts avec media JSONB: %', 
    (SELECT count(*) FROM posts WHERE media IS NOT NULL AND media != '[]'::jsonb);
END;
$$ LANGUAGE plpgsql;

-- 5. Exécuter la migration des données
SELECT migrate_existing_media_to_jsonb();

-- 6. Créer une fonction helper pour récupérer les médias avec fallback
CREATE OR REPLACE FUNCTION get_post_media(post_id UUID)
RETURNS JSONB AS $$
DECLARE
  post_record RECORD;
  result JSONB := '[]'::jsonb;
BEGIN
  -- Récupérer le post
  SELECT media, image_url, video_url, media_urls, media_types
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
      result := result || jsonb_build_array(
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

    -- Ajouter media_urls si présents (version simplifiée)
    IF post_record.media_urls IS NOT NULL AND array_length(post_record.media_urls, 1) > 0 THEN
      FOR i IN 1..array_length(post_record.media_urls, 1) LOOP
        DECLARE
          url_item TEXT := post_record.media_urls[i];
          type_item TEXT := 'image'; -- Par défaut
        BEGIN
          -- Récupérer le type correspondant s'il existe
          IF post_record.media_types IS NOT NULL 
             AND array_length(post_record.media_types, 1) >= i THEN
            type_item := post_record.media_types[i];
          END IF;
          
          -- Ajouter au résultat
          result := result || jsonb_build_array(
            jsonb_build_object(
              'url', url_item,
              'type', type_item,
              'alt', 'Média du post'
            )
          );
        END;
      END LOOP;
    END IF;
  END IF;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 7. Créer une vue pour faciliter les requêtes avec médias unifiés
CREATE OR REPLACE VIEW posts_with_media AS
SELECT 
  p.*,
  get_post_media(p.id) as unified_media,
  -- Garder les anciennes colonnes pour la rétrocompatibilité
  p.image_url,
  p.video_url,
  p.media_urls,
  p.media_types
FROM posts p;

-- 8. Créer une fonction RPC pour le feed optimisé
CREATE OR REPLACE FUNCTION get_feed_posts_optimized(
  user_id UUID,
  page_size INTEGER DEFAULT 10,
  cursor_date TIMESTAMPTZ DEFAULT NULL,
  user_filters JSONB DEFAULT '{}'::jsonb
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  media JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  likes_count INTEGER,
  comments_count INTEGER,
  user_id UUID,
  profiles JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.content,
    get_post_media(p.id) as media,
    p.created_at,
    p.updated_at,
    p.likes_count,
    p.comments_count,
    p.user_id,
    to_jsonb(prof.*) as profiles
  FROM posts p
  JOIN profiles prof ON p.user_id = prof.id
  WHERE 
    -- Exclure les posts de l'utilisateur connecté du feed principal
    p.user_id != user_id
    -- Pagination par date
    AND (cursor_date IS NULL OR p.created_at < cursor_date)
    -- Filtres optionnels
    AND (
      user_filters->>'media_type' = 'all' 
      OR user_filters->>'media_type' IS NULL
      OR (
        user_filters->>'media_type' = 'image' 
        AND get_post_media(p.id)::text LIKE '%"type":"image"%'
      )
      OR (
        user_filters->>'media_type' = 'video' 
        AND get_post_media(p.id)::text LIKE '%"type":"video"%'
      )
    )
  ORDER BY p.created_at DESC
  LIMIT page_size;
END;
$$ LANGUAGE plpgsql;

-- 9. Créer une fonction pour récupérer les posts de l'utilisateur
CREATE OR REPLACE FUNCTION get_user_posts(
  target_user_id UUID,
  page_size INTEGER DEFAULT 10,
  cursor_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  media JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  likes_count INTEGER,
  comments_count INTEGER,
  user_id UUID,
  profiles JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.content,
    get_post_media(p.id) as media,
    p.created_at,
    p.updated_at,
    p.likes_count,
    p.comments_count,
    p.user_id,
    to_jsonb(prof.*) as profiles
  FROM posts p
  JOIN profiles prof ON p.user_id = prof.id
  WHERE 
    p.user_id = target_user_id
    AND (cursor_date IS NULL OR p.created_at < cursor_date)
  ORDER BY p.created_at DESC
  LIMIT page_size;
END;
$$ LANGUAGE plpgsql;

-- 10. Commentaires pour la documentation
COMMENT ON FUNCTION migrate_existing_media_to_jsonb() IS 'Migre les données de médias existantes vers le nouveau format JSONB';
COMMENT ON FUNCTION get_post_media(UUID) IS 'Récupère les médias d un post avec fallback vers les anciennes colonnes';
COMMENT ON FUNCTION get_feed_posts_optimized(UUID, INTEGER, TIMESTAMPTZ, JSONB) IS 'Récupère les posts du feed en excluant ceux de l utilisateur connecté';
COMMENT ON FUNCTION get_user_posts(UUID, INTEGER, TIMESTAMPTZ) IS 'Récupère les posts d un utilisateur spécifique pour Mes publications';
COMMENT ON VIEW posts_with_media IS 'Vue unifiée des posts avec médias compatibles avec l ancien et nouveau format';

-- ========================================
-- FIN DE LA MIGRATION SIMPLIFIÉE
-- ========================================
-- Cette version évite les problèmes de syntaxe avec les tableaux
-- et utilise des boucles FOR plus robustes
