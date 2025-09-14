-- Migration corrective pour ajouter les colonnes manquantes à la table posts existante
-- Date: 2025-01-15

-- Ajouter les colonnes manquantes pour le ciblage par âge
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS age_range_min INTEGER DEFAULT 18 CHECK (age_range_min >= 18 AND age_range_min <= 100);

ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS age_range_max INTEGER DEFAULT 65 CHECK (age_range_max >= 18 AND age_range_max <= 100);

-- Ajouter une contrainte pour s'assurer que min <= max
ALTER TABLE posts 
ADD CONSTRAINT IF NOT EXISTS age_range_check CHECK (age_range_min <= age_range_max);

-- Ajouter les colonnes pour la compatibilité avec le formulaire existant
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS languages TEXT[] DEFAULT '{}';

-- Vérifier si la colonne target_gender existe et la renommer si nécessaire
DO $$ 
BEGIN
    -- Vérifier si target_gender existe
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'posts' AND column_name = 'target_gender') THEN
        -- Renommer target_gender en gender_targeting
        ALTER TABLE posts RENAME COLUMN target_gender TO gender_targeting;
    ELSE
        -- Créer la colonne gender_targeting si elle n'existe pas
        ALTER TABLE posts ADD COLUMN IF NOT EXISTS gender_targeting TEXT DEFAULT 'all' CHECK (gender_targeting IN ('all', 'male', 'female'));
    END IF;
END $$;

-- Mettre à jour la contrainte pour gender_targeting
ALTER TABLE posts 
DROP CONSTRAINT IF EXISTS posts_target_gender_check;
ALTER TABLE posts 
DROP CONSTRAINT IF EXISTS posts_gender_targeting_check;
ALTER TABLE posts 
ADD CONSTRAINT posts_gender_targeting_check CHECK (gender_targeting IN ('all', 'male', 'female'));

-- Créer les index pour les nouvelles colonnes
CREATE INDEX IF NOT EXISTS idx_posts_age_range_min ON posts(age_range_min);
CREATE INDEX IF NOT EXISTS idx_posts_age_range_max ON posts(age_range_max);
CREATE INDEX IF NOT EXISTS idx_posts_gender_targeting ON posts(gender_targeting);
CREATE INDEX IF NOT EXISTS idx_posts_languages ON posts USING GIN(languages);

-- Mettre à jour les commentaires
COMMENT ON COLUMN posts.age_range_min IS 'Âge minimum ciblé pour la publication';
COMMENT ON COLUMN posts.age_range_max IS 'Âge maximum ciblé pour la publication';
COMMENT ON COLUMN posts.gender_targeting IS 'Genre ciblé pour la publication (all, male, female)';
COMMENT ON COLUMN posts.languages IS 'Langues de la publication';
