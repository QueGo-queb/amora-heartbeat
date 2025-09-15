-- ✅ CORRECTION: Politiques RLS pour permettre l'insertion par le trigger

-- 1. Supprimer les politiques RLS existantes qui peuvent bloquer le trigger
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_auth" ON profiles;

-- 2. Créer une politique RLS qui permet l'insertion par le trigger
CREATE POLICY "profiles_insert_trigger" ON profiles
    FOR INSERT
    WITH CHECK (
        -- Permettre l'insertion si l'utilisateur correspond à l'utilisateur connecté
        user_id = auth.uid()
        OR
        -- Permettre l'insertion par le trigger (quand auth.uid() est NULL)
        auth.uid() IS NULL
    );

-- 3. Vérifier que RLS est activé
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 4. Vérification des politiques
DO $$
DECLARE
    policies_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO policies_count 
    FROM pg_policies 
    WHERE tablename = 'profiles' AND cmd = 'INSERT';
    
    RAISE NOTICE '✅ Politiques INSERT sur profiles: %', policies_count;
END $$;
