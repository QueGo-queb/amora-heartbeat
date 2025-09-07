-- Migration pour corriger la structure des posts et ajouter le support multimédia
-- Corrige l'erreur de contrainte de clé étrangère et ajoute les fonctionnalités médias

-- 1. Vérifier et corriger la référence de clé étrangère
-- La table posts doit référencer auth.users, pas une table users personnalisée
DO $$
BEGIN
  -- Supprimer l'ancienne contrainte si elle existe
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'posts_user_id_fkey' 
    AND table_name = 'posts'
  ) THEN
    ALTER TABLE posts DROP CONSTRAINT posts_user_id_fkey;
  END IF;
  
  -- Ajouter la nouvelle contrainte vers auth.users
  ALTER TABLE posts 
  ADD CONSTRAINT posts_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
END $$;

-- 2. Ajouter les champs pour les médias
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS media_urls TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS media_types TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS has_phone BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS has_links BOOLEAN DEFAULT FALSE;

-- 3. Index pour optimiser les recherches de médias
CREATE INDEX IF NOT EXISTS idx_posts_media_types ON posts USING GIN(media_types);
CREATE INDEX IF NOT EXISTS idx_posts_has_phone ON posts(has_phone);
CREATE INDEX IF NOT EXISTS idx_posts_has_links ON posts(has_links);

-- 4. Supprimer les anciennes fonctions et triggers dans le bon ordre
DO $$
BEGIN
  -- Supprimer d'abord tous les triggers qui dépendent des fonctions
  DROP TRIGGER IF EXISTS validate_post_content_trigger ON posts;
  DROP TRIGGER IF EXISTS validate_post_content_trigger_v2 ON posts;
  
  -- Ensuite supprimer toutes les fonctions
  DROP FUNCTION IF EXISTS validate_post_before_insert();
  DROP FUNCTION IF EXISTS validate_post_before_insert_v2();
  DROP FUNCTION IF EXISTS validate_post_content(TEXT, TEXT, TEXT, TEXT[]);
  DROP FUNCTION IF EXISTS validate_post_content(TEXT, TEXT);
  DROP FUNCTION IF EXISTS validate_post_content();
  DROP FUNCTION IF EXISTS validate_post_content_v2(TEXT, TEXT, TEXT, TEXT[]);
EXCEPTION
  WHEN OTHERS THEN
    -- Ignorer les erreurs si les objets n'existent pas
    NULL;
END $$;

-- 5. Fonction pour valider le contenu selon le plan utilisateur (version unique)
CREATE OR REPLACE FUNCTION validate_post_content_v2(
  content_text TEXT,
  user_plan TEXT,
  phone_number TEXT DEFAULT NULL,
  external_links TEXT[] DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  result JSONB := '{"valid": true, "errors": []}'::JSONB;
  phone_pattern TEXT := '\+?[0-9\s\-\(\)]{7,}';
  url_pattern TEXT := 'https?://[^\s]+';
  errors TEXT[] := '{}';
BEGIN
  -- Si l'utilisateur est Premium, tout est autorisé
  IF user_plan = 'premium' THEN
    RETURN result;
  END IF;
  
  -- Pour les utilisateurs gratuits, vérifier le contenu
  IF user_plan = 'free' THEN
    -- Vérifier les numéros de téléphone dans le contenu
    IF content_text IS NOT NULL AND content_text ~ phone_pattern THEN
      errors := array_append(errors, 'Les numéros de téléphone ne sont pas autorisés avec le plan gratuit');
    END IF;
    
    -- Vérifier les liens dans le contenu
    IF content_text IS NOT NULL AND content_text ~ url_pattern THEN
      errors := array_append(errors, 'Les liens externes ne sont pas autorisés avec le plan gratuit');
    END IF;
    
    -- Vérifier si des champs Premium sont remplis
    IF phone_number IS NOT NULL AND phone_number != '' THEN
      errors := array_append(errors, 'Le champ téléphone nécessite un plan Premium');
    END IF;
    
    IF external_links IS NOT NULL AND array_length(external_links, 1) > 0 THEN
      errors := array_append(errors, 'Les liens externes nécessitent un plan Premium');
    END IF;
  END IF;
  
  -- Construire le résultat
  IF array_length(errors, 1) > 0 THEN
    result := jsonb_build_object(
      'valid', false,
      'errors', to_jsonb(errors)
    );
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 6. Trigger pour valider automatiquement les posts avant insertion (version unique)
CREATE OR REPLACE FUNCTION validate_post_before_insert_v2()
RETURNS TRIGGER AS $$
DECLARE
  user_plan TEXT;
  validation_result JSONB;
BEGIN
  -- Récupérer le plan de l'utilisateur depuis les métadonnées ou profiles
  SELECT COALESCE(
    (raw_user_meta_data->>'plan')::TEXT,
    'free'
  ) INTO user_plan
  FROM auth.users 
  WHERE id = NEW.user_id;
  
  -- Si pas trouvé dans auth.users, chercher dans profiles
  IF user_plan IS NULL OR user_plan = '' OR user_plan = 'free' THEN
    SELECT COALESCE(plan, 'free') INTO user_plan
    FROM profiles 
    WHERE id = NEW.user_id;
  END IF;
  
  -- Valider le contenu
  validation_result := validate_post_content_v2(
    COALESCE(NEW.content, ''),
    COALESCE(user_plan, 'free'),
    NEW.phone_number,
    NEW.external_links
  );
  
  -- Si la validation échoue, lever une exception
  IF NOT (validation_result->>'valid')::BOOLEAN THEN
    RAISE EXCEPTION 'Validation failed: %', validation_result->>'errors';
  END IF;
  
  -- Mettre à jour les flags
  NEW.has_phone := (NEW.phone_number IS NOT NULL AND NEW.phone_number != '');
  NEW.has_links := (NEW.external_links IS NOT NULL AND array_length(NEW.external_links, 1) > 0);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Créer le trigger avec le nouveau nom
CREATE TRIGGER validate_post_content_trigger_v2
  BEFORE INSERT OR UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION validate_post_before_insert_v2();

-- Commentaires pour documentation
COMMENT ON COLUMN posts.media_urls IS 'URLs des fichiers média (images, vidéos) attachés au post';
COMMENT ON COLUMN posts.media_types IS 'Types des médias (image, video) correspondant aux URLs';
COMMENT ON COLUMN posts.has_phone IS 'Indique si le post contient un numéro de téléphone';
COMMENT ON COLUMN posts.has_links IS 'Indique si le post contient des liens externes';
COMMENT ON FUNCTION validate_post_content_v2 IS 'Valide le contenu d un post selon le plan utilisateur (version 2)';
COMMENT ON FUNCTION validate_post_before_insert_v2 IS 'Trigger function pour valider les posts avant insertion (version 2)';
