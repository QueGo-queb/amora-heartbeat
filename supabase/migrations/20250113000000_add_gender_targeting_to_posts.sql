-- Migration pour ajouter le ciblage par genre aux publications
-- Permet de cibler hommes/femmes pour les publications

-- Ajouter le champ de ciblage par genre
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS target_gender TEXT DEFAULT 'all' CHECK (target_gender IN ('all', 'male', 'female'));

-- Ajouter le champ pour la langue de publication
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS publication_language TEXT DEFAULT 'fr' CHECK (publication_language IN ('fr', 'en', 'es', 'ht', 'pt-BR'));

-- Index pour optimiser les recherches par genre
CREATE INDEX IF NOT EXISTS idx_posts_target_gender ON posts(target_gender);
CREATE INDEX IF NOT EXISTS idx_posts_publication_language ON posts(publication_language);

-- Mettre à jour la fonction de vérification pour inclure le genre
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
    WHEN 'friends' THEN
      -- Amis seulement (à implémenter selon votre logique d'amitié)
      NULL;
    WHEN 'premium_only' THEN
      -- Premium seulement
      IF user_rec.subscription_plan != 'premium' THEN
        RETURN FALSE;
      END IF;
    ELSE
      -- Autres critères peuvent être ajoutés ici
      NULL;
  END CASE;
  
  -- Vérifier le ciblage par genre
  CASE post_rec.target_gender
    WHEN 'all' THEN
      -- Tout le monde peut voir
      NULL;
    WHEN 'male' THEN
      -- Hommes seulement
      IF user_rec.gender != 'male' THEN
        RETURN FALSE;
      END IF;
    WHEN 'female' THEN
      -- Femmes seulement
      IF user_rec.gender != 'female' THEN
        RETURN FALSE;
      END IF;
    ELSE
      -- Genre non reconnu
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
COMMENT ON COLUMN posts.target_gender IS 'Genre ciblé pour le post (all, male, female)';
COMMENT ON COLUMN posts.publication_language IS 'Langue de publication du post (fr, en, es, ht, pt-BR)';
