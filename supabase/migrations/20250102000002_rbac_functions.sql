-- Fonction pour vérifier si un utilisateur a une permission spécifique
CREATE OR REPLACE FUNCTION user_has_permission(
  user_id UUID,
  permission_name TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    JOIN role_permissions rp ON r.id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = user_has_permission.user_id
    AND p.name = permission_name::permission_type
    AND ur.is_active = true
    AND r.is_active = true
    AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
  );
END;
$$;

-- Fonction pour récupérer tous les rôles d'un utilisateur
CREATE OR REPLACE FUNCTION get_user_roles(user_id UUID)
RETURNS TABLE (
  role_name user_role,
  role_display_name TEXT,
  permissions TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.name::user_role,
    r.display_name,
    ARRAY_AGG(p.name::TEXT) as permissions
  FROM user_roles ur
  JOIN roles r ON ur.role_id = r.id
  JOIN role_permissions rp ON r.id = rp.role_id
  JOIN permissions p ON rp.permission_id = p.id
  WHERE ur.user_id = get_user_roles.user_id
  AND ur.is_active = true
  AND r.is_active = true
  AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
  GROUP BY r.name, r.display_name
  ORDER BY r.name;
END;
$$;

-- Fonction pour vérifier si un utilisateur est admin
CREATE OR REPLACE FUNCTION is_user_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = is_user_admin.user_id
    AND r.name IN ('admin', 'super_admin')
    AND ur.is_active = true
    AND r.is_active = true
    AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
  );
END;
$$;

-- Fonction pour nettoyer les rôles expirés (à exécuter périodiquement)
CREATE OR REPLACE FUNCTION cleanup_expired_roles()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  UPDATE user_roles 
  SET is_active = false
  WHERE expires_at IS NOT NULL 
  AND expires_at <= NOW() 
  AND is_active = true;
  
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  RETURN expired_count;
END;
$$;

-- Créer un index pour optimiser les fonctions
CREATE INDEX IF NOT EXISTS idx_user_roles_lookup 
ON user_roles(user_id, is_active, expires_at) 
WHERE is_active = true;

-- Politique RLS mise à jour pour les fonctions
CREATE POLICY "Utilisateurs peuvent exécuter les fonctions sur leurs données" ON user_roles
  FOR ALL USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_roles ur2
      JOIN roles r2 ON ur2.role_id = r2.id
      WHERE ur2.user_id = auth.uid()
      AND r2.name IN ('admin', 'super_admin')
      AND ur2.is_active = true
    )
  );
