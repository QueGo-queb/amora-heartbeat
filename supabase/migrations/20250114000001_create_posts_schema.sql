-- Migration pour créer le schéma complet des publications
-- Date: 2025-01-14

-- 1. Créer la table posts avec toutes les colonnes nécessaires
CREATE TABLE IF NOT EXISTS posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    media_urls TEXT[] DEFAULT '{}',
    media_types TEXT[] DEFAULT '{}', -- 'image' ou 'video'
    
    -- Nouvelles colonnes pour le ciblage
    publication_language TEXT DEFAULT 'fr' CHECK (publication_language IN ('fr', 'en', 'es', 'ht', 'pt-BR')),
    target_gender TEXT DEFAULT 'all' CHECK (target_gender IN ('all', 'male', 'female')),
    target_countries TEXT[] DEFAULT '{}', -- Liste des pays cibles
    
    -- Champ premium pour numéro de téléphone
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

-- 2. Créer les index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_publication_language ON posts(publication_language);
CREATE INDEX IF NOT EXISTS idx_posts_target_gender ON posts(target_gender);
CREATE INDEX IF NOT EXISTS idx_posts_target_countries ON posts USING GIN(target_countries);
CREATE INDEX IF NOT EXISTS idx_posts_is_active ON posts(is_active);
CREATE INDEX IF NOT EXISTS idx_posts_is_premium ON posts(is_premium_post);

-- 3. Créer la table pour les interactions (likes, vues)
CREATE TABLE IF NOT EXISTS post_interactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    interaction_type TEXT NOT NULL CHECK (interaction_type IN ('like', 'view', 'share')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(post_id, user_id, interaction_type)
);

-- Index pour les interactions
CREATE INDEX IF NOT EXISTS idx_post_interactions_post_id ON post_interactions(post_id);
CREATE INDEX IF NOT EXISTS idx_post_interactions_user_id ON post_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_post_interactions_type ON post_interactions(interaction_type);

-- 4. Créer la table pour les commentaires
CREATE TABLE IF NOT EXISTS post_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Index pour les commentaires
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_user_id ON post_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_created_at ON post_comments(created_at DESC);

-- 5. Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. Triggers pour updated_at
DROP TRIGGER IF EXISTS update_posts_updated_at ON posts;
CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_post_comments_updated_at ON post_comments;
CREATE TRIGGER update_post_comments_updated_at
    BEFORE UPDATE ON post_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 7. Fonction pour mettre à jour les compteurs
CREATE OR REPLACE FUNCTION update_post_counters()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.interaction_type = 'like' THEN
            UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
        ELSIF NEW.interaction_type = 'view' THEN
            UPDATE posts SET views_count = views_count + 1 WHERE id = NEW.post_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.interaction_type = 'like' THEN
            UPDATE posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.post_id;
        ELSIF OLD.interaction_type = 'view' THEN
            UPDATE posts SET views_count = GREATEST(views_count - 1, 0) WHERE id = OLD.post_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Trigger pour les compteurs d'interactions
DROP TRIGGER IF EXISTS update_post_interaction_counters ON post_interactions;
CREATE TRIGGER update_post_interaction_counters
    AFTER INSERT OR DELETE ON post_interactions
    FOR EACH ROW
    EXECUTE FUNCTION update_post_counters();

-- 8. Fonction pour mettre à jour le compteur de commentaires
CREATE OR REPLACE FUNCTION update_comment_counter()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.is_active = true THEN
        UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND OLD.is_active = true AND NEW.is_active = false) THEN
        UPDATE posts SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.post_id;
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' AND OLD.is_active = false AND NEW.is_active = true THEN
        UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Trigger pour le compteur de commentaires
DROP TRIGGER IF EXISTS update_post_comment_counters ON post_comments;
CREATE TRIGGER update_post_comment_counters
    AFTER INSERT OR UPDATE OR DELETE ON post_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_comment_counter();

-- 9. RLS Policies pour posts
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Politique : Les utilisateurs peuvent voir tous les posts actifs
DROP POLICY IF EXISTS "Anyone can view active posts" ON posts;
CREATE POLICY "Anyone can view active posts" ON posts
    FOR SELECT USING (is_active = true);

-- Politique : Les utilisateurs peuvent créer leurs propres posts
DROP POLICY IF EXISTS "Users can create their own posts" ON posts;
CREATE POLICY "Users can create their own posts" ON posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politique : Les utilisateurs peuvent modifier leurs propres posts
DROP POLICY IF EXISTS "Users can update their own posts" ON posts;
CREATE POLICY "Users can update their own posts" ON posts
    FOR UPDATE USING (auth.uid() = user_id);

-- Politique : Les utilisateurs peuvent supprimer leurs propres posts
DROP POLICY IF EXISTS "Users can delete their own posts" ON posts;
CREATE POLICY "Users can delete their own posts" ON posts
    FOR DELETE USING (auth.uid() = user_id);

-- 10. RLS Policies pour post_interactions
ALTER TABLE post_interactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view all interactions" ON post_interactions;
CREATE POLICY "Users can view all interactions" ON post_interactions
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create their own interactions" ON post_interactions;
CREATE POLICY "Users can create their own interactions" ON post_interactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own interactions" ON post_interactions;
CREATE POLICY "Users can delete their own interactions" ON post_interactions
    FOR DELETE USING (auth.uid() = user_id);

-- 11. RLS Policies pour post_comments
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active comments" ON post_comments;
CREATE POLICY "Anyone can view active comments" ON post_comments
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Users can create their own comments" ON post_comments;
CREATE POLICY "Users can create their own comments" ON post_comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own comments" ON post_comments;
CREATE POLICY "Users can update their own comments" ON post_comments
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own comments" ON post_comments;
CREATE POLICY "Users can delete their own comments" ON post_comments
    FOR DELETE USING (auth.uid() = user_id);

-- 12. Commentaires sur les colonnes
COMMENT ON TABLE posts IS 'Table principale des publications';
COMMENT ON COLUMN posts.publication_language IS 'Langue de publication (fr, en, es, ht, pt-BR)';
COMMENT ON COLUMN posts.target_gender IS 'Genre ciblé pour la publication (all, male, female)';
COMMENT ON COLUMN posts.target_countries IS 'Liste des pays cibles pour la publication';
COMMENT ON COLUMN posts.phone_number IS 'Numéro de téléphone (réservé aux utilisateurs premium)';
COMMENT ON COLUMN posts.is_premium_post IS 'Indique si le post contient des éléments premium';
COMMENT ON COLUMN posts.media_urls IS 'URLs des médias attachés au post';
COMMENT ON COLUMN posts.media_types IS 'Types des médias (image, video)';

-- 13. Données de test (optionnel)
-- Insérer quelques posts de test si nécessaire
-- INSERT INTO posts (user_id, content, publication_language, target_gender, target_countries) 
-- VALUES 
--     ('your-user-id', 'Premier post de test', 'fr', 'all', ARRAY['Haiti', 'France']),
--     ('your-user-id', 'Test post in English', 'en', 'female', ARRAY['USA', 'Canada']);
