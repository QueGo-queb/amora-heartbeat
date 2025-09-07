-- Migration pour corriger les références d'authentification dans la table posts
-- Le problème : posts.user_id référence public.users(id) mais RLS utilise auth.uid()

-- 1. Supprimer l'ancienne contrainte de clé étrangère
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'posts_user_id_fkey' 
    AND table_name = 'posts'
  ) THEN
    ALTER TABLE posts DROP CONSTRAINT posts_user_id_fkey;
  END IF;
END $$;

-- 2. Modifier la table posts pour référencer auth.users au lieu de public.users
ALTER TABLE posts 
DROP CONSTRAINT IF EXISTS posts_user_id_fkey;

-- 3. Ajouter la nouvelle contrainte vers auth.users
ALTER TABLE posts 
ADD CONSTRAINT posts_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 4. Supprimer les anciennes politiques RLS pour posts
DROP POLICY IF EXISTS "Posts are publicly viewable" ON public.posts;
DROP POLICY IF EXISTS "Users can create posts" ON public.posts;
DROP POLICY IF EXISTS "Users can update own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON public.posts;

-- 5. Créer de nouvelles politiques RLS plus permissives
CREATE POLICY "Anyone can view posts" ON public.posts 
FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create posts" ON public.posts 
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own posts" ON public.posts 
FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own posts" ON public.posts 
FOR DELETE USING (user_id = auth.uid());

-- 6. Supprimer les anciens triggers de validation qui peuvent bloquer
DROP TRIGGER IF EXISTS validate_post_content_trigger ON posts;
DROP TRIGGER IF EXISTS validate_post_content_trigger_v2 ON posts;

-- 7. Créer un trigger de validation plus simple (optionnel)
CREATE OR REPLACE FUNCTION simple_post_validation()
RETURNS TRIGGER AS $$
BEGIN
  -- Validation basique : au moins du contenu ou des médias
  IF (NEW.content IS NULL OR NEW.content = '') 
     AND (NEW.media_urls IS NULL OR array_length(NEW.media_urls, 1) = 0) THEN
    RAISE EXCEPTION 'Un post doit avoir du contenu ou des médias';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER simple_post_validation_trigger
  BEFORE INSERT OR UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION simple_post_validation();

-- 8. S'assurer que la table posts a les bonnes colonnes
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS media_urls TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS media_types TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS target_group TEXT DEFAULT 'all',
ADD COLUMN IF NOT EXISTS target_countries TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS target_languages TEXT[] DEFAULT '{"fr"}',
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS external_links TEXT[] DEFAULT '{}';

-- Commentaires
COMMENT ON POLICY "Authenticated users can create posts" ON public.posts IS 'Permet aux utilisateurs authentifiés de créer des posts';
