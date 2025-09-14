-- Migration pour ajouter la colonne updated_at à la table profiles
-- Cette colonne permet de suivre les modifications du profil

-- Ajouter la colonne updated_at avec valeur par défaut
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Ajouter la colonne created_at si elle n'existe pas
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Créer un index pour optimiser les requêtes par date de mise à jour
CREATE INDEX IF NOT EXISTS idx_profiles_updated_at ON profiles(updated_at);

-- Créer un index pour optimiser les requêtes par date de création
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);

-- Créer une fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Créer le trigger pour mettre à jour automatiquement updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Mettre à jour les enregistrements existants avec des valeurs par défaut
UPDATE profiles 
SET 
    created_at = COALESCE(created_at, NOW()),
    updated_at = COALESCE(updated_at, NOW())
WHERE created_at IS NULL OR updated_at IS NULL;

-- Commentaires pour documentation
COMMENT ON COLUMN profiles.created_at IS 'Date de création du profil';
COMMENT ON COLUMN profiles.updated_at IS 'Date de dernière mise à jour du profil';
