-- Migration corrective pour s'assurer que toutes les colonnes de posts existent
-- Date: 2025-01-15

-- Ajouter les colonnes manquantes si elles n'existent pas
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;

ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS comments_count INTEGER DEFAULT 0;

ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;

ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS media_urls TEXT[] DEFAULT '{}';

ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS media_types TEXT[] DEFAULT '{}';

ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS publication_language TEXT DEFAULT 'fr';

ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS target_gender TEXT DEFAULT 'all';

ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS target_countries TEXT[] DEFAULT '{}';

ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS phone_number TEXT;

ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS is_premium_post BOOLEAN DEFAULT false;

ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Ajouter les contraintes si elles n'existent pas
ALTER TABLE posts 
DROP CONSTRAINT IF EXISTS posts_publication_language_check;
ALTER TABLE posts 
ADD CONSTRAINT IF NOT EXISTS posts_publication_language_check 
CHECK (publication_language IN ('fr', 'en', 'es', 'ht', 'pt-BR'));

ALTER TABLE posts 
DROP CONSTRAINT IF EXISTS posts_target_gender_check;
ALTER TABLE posts 
ADD CONSTRAINT IF NOT EXISTS posts_target_gender_check 
CHECK (target_gender IN ('all', 'male', 'female'));

-- Créer les index si ils n'existent pas
CREATE INDEX IF NOT EXISTS idx_posts_likes_count ON posts(likes_count);
CREATE INDEX IF NOT EXISTS idx_posts_comments_count ON posts(comments_count);
CREATE INDEX IF NOT EXISTS idx_posts_views_count ON posts(views_count);
CREATE INDEX IF NOT EXISTS idx_posts_media_urls ON posts USING GIN(media_urls);
CREATE INDEX IF NOT EXISTS idx_posts_publication_language ON posts(publication_language);
CREATE INDEX IF NOT EXISTS idx_posts_target_gender ON posts(target_gender);
CREATE INDEX IF NOT EXISTS idx_posts_target_countries ON posts USING GIN(target_countries);
CREATE INDEX IF NOT EXISTS idx_posts_is_active ON posts(is_active);
CREATE INDEX IF NOT EXISTS idx_posts_is_premium ON posts(is_premium_post);

-- Commentaires pour documentation
COMMENT ON COLUMN posts.likes_count IS 'Nombre de likes sur le post';
COMMENT ON COLUMN posts.comments_count IS 'Nombre de commentaires sur le post';
COMMENT ON COLUMN posts.views_count IS 'Nombre de vues du post';
COMMENT ON COLUMN posts.media_urls IS 'URLs des médias attachés au post';
COMMENT ON COLUMN posts.media_types IS 'Types des médias (image, video)';
COMMENT ON COLUMN posts.publication_language IS 'Langue de publication';
COMMENT ON COLUMN posts.target_gender IS 'Genre ciblé pour la publication';
COMMENT ON COLUMN posts.target_countries IS 'Pays ciblés pour la publication';
COMMENT ON COLUMN posts.is_active IS 'Indique si le post est actif';
COMMENT ON COLUMN posts.is_premium_post IS 'Indique si le post contient des éléments premium';
