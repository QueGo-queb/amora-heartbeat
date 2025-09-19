-- ✅ CORRECTION DES COMPTEURS EN TEMPS RÉEL
-- S'assurer que tous les compteurs sont synchronisés et que les triggers fonctionnent

-- 1. Vérifier et corriger la structure de la table posts
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS shares_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS comments_count INTEGER DEFAULT 0;

-- 2. Synchroniser les compteurs existants avec les données réelles
UPDATE posts SET likes_count = (
  SELECT COUNT(*) FROM likes WHERE likes.post_id = posts.id
);

UPDATE posts SET shares_count = (
  SELECT COUNT(*) FROM post_shares WHERE post_shares.post_id = posts.id
);

UPDATE posts SET comments_count = (
  SELECT COUNT(*) FROM comments WHERE comments.post_id = posts.id
);

-- 3. Recréer les triggers pour s'assurer qu'ils fonctionnent
DROP TRIGGER IF EXISTS update_posts_likes_count ON likes;
DROP TRIGGER IF EXISTS update_posts_shares_count ON post_shares;
DROP TRIGGER IF EXISTS update_posts_comments_count ON comments;

-- 4. Recréer la fonction pour les likes
CREATE OR REPLACE FUNCTION update_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

-- 5. Recréer la fonction pour les partages
CREATE OR REPLACE FUNCTION update_shares_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET shares_count = shares_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET shares_count = GREATEST(0, shares_count - 1) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

-- 6. Recréer la fonction pour les commentaires
CREATE OR REPLACE FUNCTION update_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET comments_count = GREATEST(0, comments_count - 1) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

-- 7. Recréer les triggers
CREATE TRIGGER update_posts_likes_count
  AFTER INSERT OR DELETE ON likes
  FOR EACH ROW EXECUTE FUNCTION update_likes_count();

CREATE TRIGGER update_posts_shares_count
  AFTER INSERT OR DELETE ON post_shares
  FOR EACH ROW EXECUTE FUNCTION update_shares_count();

CREATE TRIGGER update_posts_comments_count
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_comments_count();

-- 8. Activer RLS sur toutes les tables si nécessaire
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- 9. Créer les politiques RLS pour les posts
DROP POLICY IF EXISTS "Users can view all posts" ON posts;
CREATE POLICY "Users can view all posts" ON posts
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create own posts" ON posts;
CREATE POLICY "Users can create own posts" ON posts
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own posts" ON posts;
CREATE POLICY "Users can update own posts" ON posts
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own posts" ON posts;
CREATE POLICY "Users can delete own posts" ON posts
  FOR DELETE USING (user_id = auth.uid());

-- 10. Créer les politiques RLS pour les likes
DROP POLICY IF EXISTS "Users can view all likes" ON likes;
CREATE POLICY "Users can view all likes" ON likes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create own likes" ON likes;
CREATE POLICY "Users can create own likes" ON likes
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own likes" ON likes;
CREATE POLICY "Users can delete own likes" ON likes
  FOR DELETE USING (user_id = auth.uid());

-- 11. Créer les politiques RLS pour les commentaires
DROP POLICY IF EXISTS "Users can view all comments" ON comments;
CREATE POLICY "Users can view all comments" ON comments
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create own comments" ON comments;
CREATE POLICY "Users can create own comments" ON comments
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own comments" ON comments;
CREATE POLICY "Users can update own comments" ON comments
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own comments" ON comments;
CREATE POLICY "Users can delete own comments" ON comments
  FOR DELETE USING (user_id = auth.uid());

-- 12. Donner les permissions nécessaires
GRANT ALL ON posts TO authenticated;
GRANT ALL ON likes TO authenticated;
GRANT ALL ON comments TO authenticated;
GRANT ALL ON post_shares TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 13. Vérification finale
DO $$
DECLARE
    posts_count INTEGER;
    likes_count INTEGER;
    shares_count INTEGER;
    comments_count INTEGER;
BEGIN
    -- Compter les posts
    SELECT COUNT(*) INTO posts_count FROM posts;
    
    -- Compter les likes
    SELECT COUNT(*) INTO likes_count FROM likes;
    
    -- Compter les partages
    SELECT COUNT(*) INTO shares_count FROM post_shares;
    
    -- Compter les commentaires
    SELECT COUNT(*) INTO comments_count FROM comments;
    
    RAISE NOTICE '✅ Posts: %', posts_count;
    RAISE NOTICE '✅ Likes: %', likes_count;
    RAISE NOTICE '✅ Partages: %', shares_count;
    RAISE NOTICE '✅ Commentaires: %', comments_count;
    
    -- Vérifier que les compteurs sont synchronisés
    IF EXISTS (
        SELECT 1 FROM posts p 
        WHERE p.likes_count != (
            SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id
        )
    ) THEN
        RAISE NOTICE '⚠️ Certains compteurs de likes ne sont pas synchronisés';
    ELSE
        RAISE NOTICE '✅ Tous les compteurs de likes sont synchronisés';
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM posts p 
        WHERE p.shares_count != (
            SELECT COUNT(*) FROM post_shares ps WHERE ps.post_id = p.id
        )
    ) THEN
        RAISE NOTICE '⚠️ Certains compteurs de partages ne sont pas synchronisés';
    ELSE
        RAISE NOTICE '✅ Tous les compteurs de partages sont synchronisés';
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM posts p 
        WHERE p.comments_count != (
            SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id
        )
    ) THEN
        RAISE NOTICE '⚠️ Certains compteurs de commentaires ne sont pas synchronisés';
    ELSE
        RAISE NOTICE '✅ Tous les compteurs de commentaires sont synchronisés';
    END IF;
    
    RAISE NOTICE '🎉 Configuration des compteurs en temps réel terminée !';
END $$;
