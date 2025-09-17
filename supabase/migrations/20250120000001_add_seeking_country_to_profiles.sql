/**
 * ✅ MIGRATION: Ajout du champ seeking_country à la table profiles
 */

-- Ajouter la colonne seeking_country
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS seeking_country TEXT[] DEFAULT '{}';

-- Ajouter un index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_profiles_seeking_country 
ON profiles USING GIN(seeking_country);

-- Ajouter un commentaire pour documenter la colonne
COMMENT ON COLUMN profiles.seeking_country IS 'Liste des codes de pays ciblés par l''utilisateur pour les rencontres';

-- Mettre à jour les politiques RLS si nécessaire
-- (Les politiques existantes devraient déjà couvrir cette colonne)
