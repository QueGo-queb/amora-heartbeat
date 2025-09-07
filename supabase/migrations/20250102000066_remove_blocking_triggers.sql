-- Migration critique pour supprimer les triggers bloquants
-- Objectif : Éliminer les validations qui empêchent la création de posts

-- 1. Supprimer tous les triggers de validation sur posts
DROP TRIGGER IF EXISTS validate_post_content_trigger ON posts;
DROP TRIGGER IF EXISTS validate_post_content_trigger_v2 ON posts;
DROP TRIGGER IF EXISTS simple_post_validation_trigger ON posts;

-- 2. Supprimer les fonctions de validation associées
DROP FUNCTION IF EXISTS validate_post_content();
DROP FUNCTION IF EXISTS validate_post_content_v2(TEXT, TEXT, TEXT, TEXT[]);
DROP FUNCTION IF EXISTS validate_post_before_insert();
DROP FUNCTION IF EXISTS validate_post_before_insert_v2();
DROP FUNCTION IF EXISTS simple_post_validation();

-- 3. Créer une validation minimale non-bloquante (optionnel)
CREATE OR REPLACE FUNCTION minimal_post_validation()
RETURNS TRIGGER AS $$
BEGIN
  -- Validation minimale : au moins du contenu OU des médias
  IF (NEW.content IS NULL OR trim(NEW.content) = '') 
     AND (NEW.media_urls IS NULL OR array_length(NEW.media_urls, 1) = 0) THEN
    -- Log l'erreur mais ne bloque pas
    RAISE WARNING 'Post créé sans contenu ni médias pour user_id: %', NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Appliquer le trigger non-bloquant
CREATE TRIGGER minimal_post_validation_trigger
  BEFORE INSERT ON posts
  FOR EACH ROW
  EXECUTE FUNCTION minimal_post_validation();

-- Commentaire de documentation
COMMENT ON FUNCTION minimal_post_validation IS 'Validation non-bloquante pour posts - log seulement';
