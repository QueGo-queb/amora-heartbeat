-- Migration pour la gestion des rôles admin
-- Date: 2025-09-18

-- Politique pour permettre aux admins de modifier les rôles
CREATE POLICY "Admins can update user roles" ON profiles
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles admin_profiles 
      WHERE admin_profiles.user_id = auth.uid() 
      AND admin_profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles admin_profiles 
      WHERE admin_profiles.user_id = auth.uid() 
      AND admin_profiles.role = 'admin'
    )
  );

-- Index pour optimiser les requêtes de rôles
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id_role ON profiles(user_id, role);

-- Fonction pour vérifier les permissions admin
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = user_uuid AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
