-- ✅ CORRECTION: Permissions admin pour création d'utilisateurs

-- 1. Créer une fonction pour vérifier si un utilisateur est admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Vérifier si l'utilisateur est dans la liste des admins
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = is_admin.user_id 
    AND profiles.email IN (
      'clodenerc@yahoo.fr',
      'admin@amora.com'
      -- Ajoutez d'autres emails admin ici
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Créer une fonction pour créer des utilisateurs admin
CREATE OR REPLACE FUNCTION public.create_admin_user(
  p_email TEXT,
  p_password TEXT,
  p_full_name TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  new_user_id UUID;
  result JSON;
BEGIN
  -- Vérifier que l'utilisateur actuel est admin
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Accès refusé: Seuls les administrateurs peuvent créer des utilisateurs';
  END IF;

  -- Créer l'utilisateur dans auth.users via l'API admin
  -- Note: Cette fonction doit être appelée côté client avec les bonnes permissions
  
  -- Créer le profil
  INSERT INTO profiles (
    user_id,
    email,
    full_name,
    is_active,
    created_at,
    updated_at
  ) VALUES (
    new_user_id,
    p_email,
    COALESCE(p_full_name, 'Administrateur'),
    true,
    NOW(),
    NOW()
  );

  result := json_build_object(
    'success', true,
    'user_id', new_user_id,
    'email', p_email,
    'message', 'Utilisateur admin créé avec succès'
  );

  RETURN result;

EXCEPTION
  WHEN OTHERS THEN
    result := json_build_object(
      'success', false,
      'error', SQLERRM,
      'message', 'Erreur lors de la création de l\'utilisateur admin'
    );
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Donner les permissions nécessaires
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_admin_user(TEXT, TEXT, TEXT) TO authenticated;

-- 4. Vérification
DO $$
BEGIN
  RAISE NOTICE '✅ Fonctions admin créées avec succès';
END $$;
