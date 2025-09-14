-- Migration simple pour ajouter les colonnes de base à la table posts
-- Date: 2025-01-15

-- Vérifier si la table posts existe
DO $$ 
BEGIN
    -- Si la table n'existe pas, la créer avec le schéma minimal
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'posts') THEN
        CREATE TABLE posts (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        -- Activer RLS
        ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
        
        -- Politiques RLS de base
        CREATE POLICY "Anyone can view posts" ON posts FOR SELECT USING (true);
        CREATE POLICY "Users can create their own posts" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);
        CREATE POLICY "Users can update their own posts" ON posts FOR UPDATE USING (auth.uid() = user_id);
        CREATE POLICY "Users can delete their own posts" ON posts FOR DELETE USING (auth.uid() = user_id);
        
        RAISE NOTICE 'Table posts créée avec schéma minimal';
    ELSE
        RAISE NOTICE 'Table posts existe déjà';
    END IF;
END $$;

-- Ajouter les colonnes optionnelles si elles n'existent pas
ALTER TABLE posts ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS comments_count INTEGER DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Créer les index de base
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_is_active ON posts(is_active);

-- Commentaires
COMMENT ON TABLE posts IS 'Table des publications - version simplifiée';
COMMENT ON COLUMN posts.content IS 'Contenu de la publication';
COMMENT ON COLUMN posts.likes_count IS 'Nombre de likes';
COMMENT ON COLUMN posts.comments_count IS 'Nombre de commentaires';
COMMENT ON COLUMN posts.views_count IS 'Nombre de vues';
COMMENT ON COLUMN posts.is_active IS 'Post actif ou non';
