-- Migration critique pour unifier les références de la table posts
-- Objectif : Corriger les conflits de clés étrangères

-- 1. Identifier et supprimer toutes les contraintes existantes
DO $$
BEGIN
  -- Supprimer toutes les contraintes de clé étrangère sur posts.user_id
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'posts_user_id_fkey' 
    AND table_name = 'posts'
  ) THEN
    ALTER TABLE posts DROP CONSTRAINT posts_user_id_fkey;
  END IF;

  -- Supprimer d'autres variantes possibles
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name LIKE '%posts%user_id%' 
    AND table_name = 'posts'
  ) THEN
    EXECUTE 'ALTER TABLE posts DROP CONSTRAINT ' || (
      SELECT constraint_name 
      FROM information_schema.table_constraints 
      WHERE constraint_name LIKE '%posts%user_id%' 
      AND table_name = 'posts' 
      LIMIT 1
    );
  END IF;
END $$;

-- 2. Ajouter la référence unifiée vers auth.users UNIQUEMENT
ALTER TABLE posts 
ADD CONSTRAINT posts_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3. Vérifier que la contrainte est bien créée
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'posts_user_id_fkey' 
    AND table_name = 'posts'
  ) THEN
    RAISE EXCEPTION 'Échec de création de la contrainte posts_user_id_fkey';
  END IF;
END $$;

-- Commentaire de documentation
COMMENT ON CONSTRAINT posts_user_id_fkey ON posts IS 'Référence unifiée vers auth.users pour cohérence système';
