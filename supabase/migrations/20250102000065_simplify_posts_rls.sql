-- Migration critique pour simplifier les politiques RLS sur posts
-- Objectif : Éliminer les conflits de permissions

-- 1. Supprimer toutes les anciennes politiques RLS sur posts
DROP POLICY IF EXISTS "Posts are publicly viewable" ON public.posts;
DROP POLICY IF EXISTS "Users can create posts" ON public.posts;
DROP POLICY IF EXISTS "Users can update own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON public.posts;
DROP POLICY IF EXISTS "Anyone can view posts" ON public.posts;
DROP POLICY IF EXISTS "Authenticated users can create posts" ON public.posts;

-- 2. Créer des politiques RLS simplifiées et cohérentes
-- Lecture : Tous peuvent voir les posts publics
CREATE POLICY "Public posts are viewable by all" ON public.posts 
FOR SELECT USING (true);

-- Création : Utilisateurs authentifiés peuvent créer
CREATE POLICY "Authenticated users can create posts" ON public.posts 
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Modification : Utilisateurs peuvent modifier leurs propres posts
CREATE POLICY "Users can update their own posts" ON public.posts 
FOR UPDATE USING (user_id = auth.uid());

-- Suppression : Utilisateurs peuvent supprimer leurs propres posts
CREATE POLICY "Users can delete their own posts" ON public.posts 
FOR DELETE USING (user_id = auth.uid());

-- 3. Vérifier que les politiques sont bien créées
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'posts' 
    AND policyname = 'Authenticated users can create posts'
  ) THEN
    RAISE EXCEPTION 'Échec de création des politiques RLS pour posts';
  END IF;
END $$;

-- Commentaires de documentation
COMMENT ON POLICY "Public posts are viewable by all" ON public.posts IS 'Lecture libre des posts publics';
COMMENT ON POLICY "Authenticated users can create posts" ON public.posts IS 'Création limitée aux utilisateurs authentifiés';
COMMENT ON POLICY "Users can update their own posts" ON public.posts IS 'Modification limitée au propriétaire';
COMMENT ON POLICY "Users can delete their own posts" ON public.posts IS 'Suppression limitée au propriétaire';
