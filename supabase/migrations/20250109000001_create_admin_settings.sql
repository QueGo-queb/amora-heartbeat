-- Table pour les paramètres administrateur
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value BOOLEAN NOT NULL DEFAULT true,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ajouter le paramètre pour l'espace publicitaire
INSERT INTO admin_settings (key, value, description) 
VALUES ('ad_space_visible', true, 'Contrôle la visibilité de l''espace publicitaire sur la page d''accueil')
ON CONFLICT (key) DO NOTHING;

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_admin_settings_key ON admin_settings(key);

-- RLS pour sécuriser l'accès
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Politique : seuls les admins peuvent lire/modifier
CREATE POLICY "Admin can manage settings" ON admin_settings
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email = 'clodenerc@yahoo.fr'
  )
);
