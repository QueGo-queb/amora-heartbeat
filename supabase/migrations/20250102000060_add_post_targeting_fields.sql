-- Migration pour ajouter les champs de ciblage aux publications
-- Permet de gérer les restrictions selon le plan utilisateur

-- Ajouter les nouveaux champs à la table posts
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS target_group TEXT DEFAULT 'all',
ADD COLUMN IF NOT EXISTS target_countries TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS target_languages TEXT[] DEFAULT '{"fr"}',
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS external_links TEXT[] DEFAULT '{}';

-- Index pour optimiser les recherches
CREATE INDEX IF NOT EXISTS idx_posts_target_group ON posts(target_group);
CREATE INDEX IF NOT EXISTS idx_posts_target_countries ON posts USING GIN(target_countries);
CREATE INDEX IF NOT EXISTS idx_posts_target_languages ON posts USING GIN(target_languages);

-- Fonction pour vérifier si un utilisateur peut voir un post selon les critères
CREATE OR REPLACE FUNCTION user_can_view_post(
  user_profile_id UUID,
  post_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  user_rec RECORD;
  post_rec RECORD;
BEGIN
  -- Récupérer les informations du profil utilisateur
  SELECT * INTO user_rec FROM profiles WHERE id = user_profile_id;
  
  -- Récupérer les critères du post
  SELECT * INTO post_rec FROM posts WHERE id = post_id;
  
  -- Si l'utilisateur ou le post n'existe pas, retourner false
  IF user_rec IS NULL OR post_rec IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Vérifier le groupe cible
  CASE post_rec.target_group
    WHEN 'all' THEN
      -- Tout le monde peut voir
      NULL;
    WHEN 'same_country' THEN
      -- Même pays seulement
      IF user_rec.country != (SELECT country FROM profiles WHERE id = post_rec.user_id) THEN
        RETURN FALSE;
      END IF;
    WHEN 'premium_only' THEN
      -- Premium seulement
      IF user_rec.plan != 'premium' THEN
        RETURN FALSE;
      END IF;
    ELSE
      -- Autres critères peuvent être ajoutés ici
      NULL;
  END CASE;
  
  -- Vérifier les pays ciblés
  IF array_length(post_rec.target_countries, 1) > 0 THEN
    IF NOT (user_rec.country = ANY(post_rec.target_countries)) THEN
      RETURN FALSE;
    END IF;
  END IF;
  
  -- Vérifier les langues ciblées
  IF array_length(post_rec.target_languages, 1) > 0 THEN
    IF NOT (user_rec.language = ANY(post_rec.target_languages)) THEN
      RETURN FALSE;
    END IF;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Commentaires pour documentation
COMMENT ON COLUMN posts.target_group IS 'Groupe de personnes pouvant voir le post (all, friends, same_country, etc.)';
COMMENT ON COLUMN posts.target_countries IS 'Liste des pays où le post est visible';
COMMENT ON COLUMN posts.target_languages IS 'Liste des langues dans lesquelles le post est affiché';
COMMENT ON COLUMN posts.phone_number IS 'Numéro de téléphone (Premium uniquement)';
COMMENT ON COLUMN posts.external_links IS 'Liens externes (Premium uniquement)';
