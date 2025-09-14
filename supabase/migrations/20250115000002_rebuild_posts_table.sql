-- Migration pour reconstruire la table posts avec le schéma correct
-- Date: 2025-01-15

-- 1. Sauvegarder les données existantes
CREATE TABLE IF NOT EXISTS posts_backup AS 
SELECT * FROM posts;

-- 2. Supprimer les contraintes existantes
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_user_id_fkey;
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_visibility_check;
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_publication_language_check;
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_target_gender_check;
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_content_check;

-- 3. Supprimer la table posts existante
DROP TABLE IF EXISTS posts CASCADE;

-- 4. Créer la table posts avec le schéma complet et correct
CREATE TABLE posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    
    -- Médias
    media_urls TEXT[] DEFAULT '{}',
    media_types TEXT[] DEFAULT '{}',
    
    -- Ciblage et langues
    publication_language TEXT DEFAULT 'fr' CHECK (publication_language IN ('fr', 'en', 'es', 'ht', 'pt-BR')),
    target_gender TEXT DEFAULT 'all' CHECK (target_gender IN ('all', 'male', 'female')),
    target_countries TEXT[] DEFAULT '{}',
    
    -- Champs premium
    phone_number TEXT,
    is_premium_post BOOLEAN DEFAULT false,
    
    -- Métadonnées
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    
    -- Statistiques
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0
);

-- 5. Restaurer les données existantes (si possible)
INSERT INTO posts (
    id, user_id, content, created_at, updated_at,
    likes_count, comments_count, is_active
)
SELECT 
    id, 
    user_id, 
    content, 
    created_at, 
    updated_at,
    COALESCE(likes_count, 0),
    COALESCE(comments_count, 0),
    true
FROM posts_backup
WHERE content IS NOT NULL;

-- 6. Créer les index
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_likes_count ON posts(likes_count);
CREATE INDEX IF NOT EXISTS idx_posts_comments_count ON posts(comments_count);
CREATE INDEX IF NOT EXISTS idx_posts_views_count ON posts(views_count);
CREATE INDEX IF NOT EXISTS idx_posts_media_urls ON posts USING GIN(media_urls);
CREATE INDEX IF NOT EXISTS idx_posts_publication_language ON posts(publication_language);
CREATE INDEX IF NOT EXISTS idx_posts_target_gender ON posts(target_gender);
CREATE INDEX IF NOT EXISTS idx_posts_target_countries ON posts USING GIN(target_countries);
CREATE INDEX IF NOT EXISTS idx_posts_is_active ON posts(is_active);
CREATE INDEX IF NOT EXISTS idx_posts_is_premium ON posts(is_premium_post);

-- 7. Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. Trigger pour updated_at
DROP TRIGGER IF EXISTS update_posts_updated_at ON posts;
CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 9. RLS Policies
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Anyone can view active posts" ON posts;
DROP POLICY IF EXISTS "Users can create their own posts" ON posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON posts;

-- Créer les nouvelles politiques
CREATE POLICY "Anyone can view active posts" ON posts
    FOR SELECT USING (is_active = true);

CREATE POLICY "Users can create their own posts" ON posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" ON posts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" ON posts
    FOR DELETE USING (auth.uid() = user_id);

-- 10. Commentaires
COMMENT ON TABLE posts IS 'Table principale des publications avec ciblage avancé';
COMMENT ON COLUMN posts.publication_language IS 'Langue de publication (fr, en, es, ht, pt-BR)';
COMMENT ON COLUMN posts.target_gender IS 'Genre ciblé pour la publication (all, male, female)';
COMMENT ON COLUMN posts.target_countries IS 'Pays ciblés pour la publication';
COMMENT ON COLUMN posts.media_urls IS 'URLs des médias attachés au post';
COMMENT ON COLUMN posts.media_types IS 'Types des médias (image, video)';
COMMENT ON COLUMN posts.likes_count IS 'Nombre de likes sur le post';
COMMENT ON COLUMN posts.comments_count IS 'Nombre de commentaires sur le post';
COMMENT ON COLUMN posts.views_count IS 'Nombre de vues du post';
COMMENT ON COLUMN posts.is_active IS 'Indique si le post est actif';
COMMENT ON COLUMN posts.is_premium_post IS 'Indique si le post contient des éléments premium';

-- 11. Nettoyage
DROP TABLE IF EXISTS posts_backup;
