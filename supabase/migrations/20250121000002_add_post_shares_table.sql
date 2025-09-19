-- ✅ Ajouter la table post_shares pour tracker les partages

-- 1. Créer la table post_shares
CREATE TABLE IF NOT EXISTS post_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  share_type TEXT DEFAULT 'link' CHECK (share_type IN ('link', 'repost')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id) -- Un utilisateur ne peut partager qu'une fois le même post
);

-- 2. Ajouter la colonne shares_count à la table posts
ALTER TABLE posts ADD COLUMN IF NOT EXISTS shares_count INTEGER DEFAULT 0;

-- 3. Créer les index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_post_shares_post_id ON post_shares(post_id);
CREATE INDEX IF NOT EXISTS idx_post_shares_user_id ON post_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_post_shares_created_at ON post_shares(created_at DESC);

-- 4. Créer un trigger pour mettre à jour le compteur de partages
CREATE OR REPLACE FUNCTION update_shares_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET shares_count = shares_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET shares_count = shares_count - 1 WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_posts_shares_count
  AFTER INSERT OR DELETE ON post_shares
  FOR EACH ROW EXECUTE FUNCTION update_shares_count();

-- 5. Activer RLS sur la table post_shares
ALTER TABLE post_shares ENABLE ROW LEVEL SECURITY;

-- 6. Créer les politiques RLS pour post_shares
CREATE POLICY "Users can view all shares" ON post_shares
  FOR SELECT USING (true);

CREATE POLICY "Users can create own shares" ON post_shares
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own shares" ON post_shares
  FOR DELETE USING (user_id = auth.uid());

-- 7. Donner les permissions nécessaires
GRANT ALL ON post_shares TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 8. Vérification finale
DO $$
DECLARE
    table_exists BOOLEAN;
    trigger_exists BOOLEAN;
    policies_count INTEGER;
BEGIN
    -- Vérifier la table
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'post_shares' 
        AND table_schema = 'public'
    ) INTO table_exists;
    
    -- Vérifier le trigger
    SELECT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_posts_shares_count'
    ) INTO trigger_exists;
    
    -- Compter les politiques
    SELECT COUNT(*) INTO policies_count 
    FROM pg_policies 
    WHERE tablename = 'post_shares';
    
    RAISE NOTICE '✅ Table post_shares existe: %', table_exists;
    RAISE NOTICE '✅ Trigger shares_count existe: %', trigger_exists;
    RAISE NOTICE '✅ Politiques RLS créées: %', policies_count;
    
    IF table_exists AND trigger_exists AND policies_count >= 3 THEN
        RAISE NOTICE ' Table post_shares configurée avec succès !';
    ELSE
        RAISE NOTICE '❌ Problème dans la configuration';
    END IF;
END $$;
