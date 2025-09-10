-- Assurer que toutes les tables nécessaires existent
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value BOOLEAN NOT NULL DEFAULT true,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ajouter le paramètre pour l'espace publicitaire si pas déjà présent
INSERT INTO admin_settings (key, value, description) 
VALUES ('ad_space_visible', true, 'Contrôle la visibilité de l''espace publicitaire')
ON CONFLICT (key) DO NOTHING;

-- S'assurer que les politiques RLS existent pour les nouvelles tables
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes si elles existent (pour éviter les conflits)
DROP POLICY IF EXISTS "Allow public read admin_settings" ON admin_settings;
DROP POLICY IF EXISTS "Allow admin manage admin_settings" ON admin_settings;

-- Créer les politiques RLS
CREATE POLICY "Allow public read admin_settings" ON admin_settings
  FOR SELECT USING (true);

CREATE POLICY "Allow admin manage admin_settings" ON admin_settings
  FOR ALL USING (auth.jwt() ->> 'email' = 'clodenerc@yahoo.fr');

-- Fonction pour updated_at si elle n'existe pas
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Supprimer le trigger existant s'il existe
DROP TRIGGER IF EXISTS update_admin_settings_updated_at ON admin_settings;

-- Créer le trigger pour admin_settings
CREATE TRIGGER update_admin_settings_updated_at 
  BEFORE UPDATE ON admin_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
