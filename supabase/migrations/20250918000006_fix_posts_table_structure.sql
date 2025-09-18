-- Migration pour corriger la structure de la table posts
-- Date: 2025-09-18

-- Ajouter les colonnes manquantes à la table posts
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'public' 
  CHECK (visibility IN ('public', 'friends', 'private')),
ADD COLUMN IF NOT EXISTS media JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS comments_count INTEGER DEFAULT 0;

-- Mettre à jour les posts existants
UPDATE posts 
SET 
  is_active = true,
  tags = '{}',
  visibility = 'public',
  media = '[]',
  likes_count = 0,
  comments_count = 0
WHERE is_active IS NULL;

-- Ajouter des index pour les performances
CREATE INDEX IF NOT EXISTS idx_posts_is_active ON posts(is_active);
CREATE INDEX IF NOT EXISTS idx_posts_visibility ON posts(visibility);
CREATE INDEX IF NOT EXISTS idx_posts_tags ON posts USING GIN(tags);

-- Vérifier la structure finale
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'posts' 
AND table_schema = 'public'
ORDER BY ordinal_position;
