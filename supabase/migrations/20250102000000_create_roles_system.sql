-- Créer le type ENUM pour les rôles
CREATE TYPE user_role AS ENUM ('user', 'premium', 'moderator', 'admin', 'super_admin');

-- Créer le type ENUM pour les permissions
CREATE TYPE permission_type AS ENUM (
  'read_users',
  'write_users',
  'delete_users',
  'read_posts',
  'write_posts',
  'delete_posts',
  'moderate_content',
  'manage_payments',
  'view_analytics',
  'manage_ads',
  'manage_promotions',
  'manage_system',
  'super_admin_access'
);

-- Table des rôles
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name user_role UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des permissions
CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name permission_type UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table de liaison rôles-permissions
CREATE TABLE IF NOT EXISTS role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(role_id, permission_id)
);

-- Table pour assigner des rôles aux utilisateurs
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, -- Référence vers auth.users ou votre table users
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  assigned_by UUID, -- Qui a assigné ce rôle
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- Optionnel: rôle temporaire
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id, role_id)
);

-- Indexes pour les performances
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX idx_user_roles_active ON user_roles(is_active, expires_at);
CREATE INDEX idx_role_permissions_role_id ON role_permissions(role_id);

-- Triggers pour updated_at
CREATE TRIGGER update_roles_updated_at 
  BEFORE UPDATE ON roles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Activer RLS
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour roles
CREATE POLICY "Roles sont lisibles par tous les utilisateurs authentifiés" ON roles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Seuls les admins peuvent modifier les rôles" ON roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('admin', 'super_admin')
      AND ur.is_active = true
      AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
    )
  );

-- Politiques RLS pour permissions
CREATE POLICY "Permissions sont lisibles par tous les utilisateurs authentifiés" ON permissions
  FOR SELECT USING (auth.role() = 'authenticated');

-- Politiques RLS pour user_roles
CREATE POLICY "Utilisateurs peuvent voir leurs propres rôles" ON user_roles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins peuvent voir tous les rôles" ON user_roles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('admin', 'super_admin')
      AND ur.is_active = true
    )
  );

CREATE POLICY "Seuls les admins peuvent assigner des rôles" ON user_roles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('admin', 'super_admin')
      AND ur.is_active = true
    )
  );
