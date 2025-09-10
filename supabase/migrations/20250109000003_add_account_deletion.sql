-- Ajouter des colonnes pour la suppression douce des comptes
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deletion_reason TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Index pour filtrer les comptes actifs
CREATE INDEX IF NOT EXISTS idx_profiles_active ON profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_profiles_deleted_at ON profiles(deleted_at);

-- Vue pour les profils actifs seulement
CREATE OR REPLACE VIEW active_profiles AS
SELECT * FROM profiles 
WHERE is_active = true AND deleted_at IS NULL;
