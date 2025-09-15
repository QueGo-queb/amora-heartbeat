-- ✅ ACCORDER LES PERMISSIONS ADMIN À clodenerc@yahoo.fr

-- 1. Vérifier l'utilisateur actuel
DO $$
DECLARE
    user_email TEXT;
    user_id UUID;
BEGIN
    -- Récupérer l'email de l'utilisateur connecté
    SELECT auth.email() INTO user_email;
    SELECT auth.uid() INTO user_id;
    
    RAISE NOTICE 'Utilisateur connecté: % (ID: %)', user_email, user_id;
END $$;

-- 2. Créer une table pour les administrateurs si elle n'existe pas
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- 3. Activer RLS sur admin_users
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- 4. Créer des politiques pour admin_users
CREATE POLICY "Admin users can read all" ON admin_users
    FOR SELECT USING (true);

CREATE POLICY "Admin users can insert" ON admin_users
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin users can update" ON admin_users
    FOR UPDATE USING (true);

-- 5. Ajouter clodenerc@yahoo.fr comme admin
INSERT INTO admin_users (user_id, email, role, created_by)
SELECT 
    u.id,
    u.email,
    'admin',
    u.id
FROM auth.users u
WHERE u.email = 'clodenerc@yahoo.fr'
ON CONFLICT (email) DO UPDATE SET
    role = 'admin',
    updated_at = NOW();

-- 6. Créer une fonction pour vérifier les permissions admin
CREATE OR REPLACE FUNCTION public.is_admin_user(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admin_users 
        WHERE admin_users.user_id = is_admin_user.user_id
        AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Créer une fonction pour créer des utilisateurs admin
CREATE OR REPLACE FUNCTION public.create_admin_user(
    p_email TEXT,
    p_password TEXT,
    p_full_name TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    -- Vérifier que l'utilisateur actuel est admin
    IF NOT public.is_admin_user() THEN
        RAISE EXCEPTION 'Accès refusé: Seuls les administrateurs peuvent créer des utilisateurs';
    END IF;

    -- Cette fonction sera appelée côté client
    result := json_build_object(
        'success', true,
        'message', 'Permissions vérifiées. Utilisez l''API client pour créer l''utilisateur.',
        'email', p_email
    );

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Donner les permissions
GRANT EXECUTE ON FUNCTION public.is_admin_user(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_admin_user(TEXT, TEXT, TEXT) TO authenticated;

-- 9. Vérification finale
DO $$
DECLARE
    admin_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO admin_count FROM admin_users WHERE email = 'clodenerc@yahoo.fr';
    
    IF admin_count > 0 THEN
        RAISE NOTICE '✅ clodenerc@yahoo.fr a été ajouté comme administrateur';
    ELSE
        RAISE NOTICE '❌ clodenerc@yahoo.fr n''a pas été trouvé dans auth.users';
    END IF;
END $$;
