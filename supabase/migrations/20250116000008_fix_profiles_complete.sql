-- ✅ CORRECTION COMPLÈTE: Résoudre définitivement les erreurs 500 sur profiles

-- 1. DIAGNOSTIC COMPLET
DO $$
DECLARE
    profile_count INTEGER;
    user_id_count INTEGER;
    policies_count INTEGER;
BEGIN
    RAISE NOTICE '=== DIAGNOSTIC COMPLET TABLE PROFILES ===';
    
    -- Compter les profils
    SELECT COUNT(*) INTO profile_count FROM profiles;
    RAISE NOTICE 'Total profils: %', profile_count;
    
    -- Compter les profils avec user_id
    SELECT COUNT(*) INTO user_id_count FROM profiles WHERE user_id IS NOT NULL;
    RAISE NOTICE 'Profils avec user_id: %', user_id_count;
    
    -- Compter les politiques RLS
    SELECT COUNT(*) INTO policies_count FROM pg_policies WHERE tablename = 'profiles';
    RAISE NOTICE 'Politiques RLS: %', policies_count;
    
    -- Lister les politiques existantes
    RAISE NOTICE '=== POLITIQUES EXISTANTES ===';
    FOR policies_count IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'profiles'
    LOOP
        RAISE NOTICE 'Politique: %', policies_count;
    END LOOP;
    
END $$;

-- 2. NETTOYAGE COMPLET DES POLITIQUES RLS
-- Supprimer TOUTES les politiques existantes pour éviter les conflits
DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON profiles;
DROP POLICY IF EXISTS "Profiles are publicly viewable" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;
DROP POLICY IF EXISTS "Avatar URLs are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON profiles;

-- 3. DÉSACTIVER TEMPORAIREMENT RLS POUR RECONFIGURER
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 4. VÉRIFIER ET CORRIGER LA STRUCTURE DE LA TABLE
-- S'assurer que la colonne user_id existe
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- S'assurer que les colonnes essentielles existent
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS region TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS seeking_gender TEXT,
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'fr',
ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 5. CRÉER LES INDEX NÉCESSAIRES
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);

-- 6. METTRE À JOUR LES PROFILS EXISTANTS
-- Remplir user_id pour les profils existants qui n'en ont pas
UPDATE profiles 
SET user_id = au.id
FROM auth.users au
WHERE profiles.user_id IS NULL 
  AND profiles.email = au.email;

-- 7. RÉACTIVER RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 8. CRÉER DES POLITIQUES RLS SIMPLES ET NON-RÉCURSIVES
-- Politique SELECT: Tout le monde peut lire les profils (pour le matching)
CREATE POLICY "profiles_select_public" ON profiles
  FOR SELECT USING (true);

-- Politique INSERT: Seul l'utilisateur peut créer son profil
CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Politique UPDATE: Seul l'utilisateur peut modifier son profil
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (user_id = auth.uid());

-- Politique DELETE: Seul l'utilisateur peut supprimer son profil
CREATE POLICY "profiles_delete_own" ON profiles
  FOR DELETE USING (user_id = auth.uid());

-- 9. CORRIGER LA FONCTION handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Vérifier si le profil existe déjà
  IF EXISTS (SELECT 1 FROM profiles WHERE user_id = NEW.id) THEN
    RAISE NOTICE 'Profil déjà existant pour user_id: %', NEW.id;
    RETURN NEW;
  END IF;

  -- Créer le profil avec des valeurs par défaut
  INSERT INTO public.profiles (
    user_id,
    email,
    full_name,
    gender,
    age,
    bio,
    country,
    region,
    city,
    language,
    seeking_gender,
    interests,
    plan,
    is_active,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Utilisateur'),
    COALESCE(NEW.raw_user_meta_data->>'gender', 'other'),
    COALESCE((NEW.raw_user_meta_data->>'age')::integer, 25),
    NULL,
    NULL,
    NULL,
    NULL,
    COALESCE(NEW.raw_user_meta_data->>'language', 'fr'),
    'any',
    '{}',
    'free',
    true,
    NOW(),
    NOW()
  );
  
  RAISE NOTICE 'Profil créé avec succès pour user_id: %', NEW.id;
  RETURN NEW;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Erreur lors de la création du profil pour user_id %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 10. RECONFIGURER LE TRIGGER
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 11. DONNER LES PERMISSIONS NÉCESSAIRES
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON profiles TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 12. TEST DE VÉRIFICATION
DO $$
DECLARE
    test_user_id UUID;
    test_result RECORD;
BEGIN
    RAISE NOTICE '=== TEST DE VÉRIFICATION ===';
    
    -- Prendre un utilisateur existant pour le test
    SELECT id INTO test_user_id FROM auth.users LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        RAISE NOTICE 'Test avec user_id: %', test_user_id;
        
        -- Test de lecture
        BEGIN
            SELECT * INTO test_result FROM profiles WHERE user_id = test_user_id LIMIT 1;
            RAISE NOTICE '✅ Test de lecture réussi';
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE '❌ Test de lecture échoué: %', SQLERRM;
        END;
        
        -- Test de lecture par id
        BEGIN
            SELECT * INTO test_result FROM profiles WHERE id = test_user_id LIMIT 1;
            RAISE NOTICE '✅ Test de lecture par id réussi';
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE '❌ Test de lecture par id échoué: %', SQLERRM;
        END;
    ELSE
        RAISE NOTICE 'Aucun utilisateur trouvé pour le test';
    END IF;
    
END $$;

-- 13. VÉRIFICATION FINALE
DO $$
BEGIN
    RAISE NOTICE '=== VÉRIFICATION FINALE ===';
    RAISE NOTICE 'Profils totaux: %', (SELECT COUNT(*) FROM profiles);
    RAISE NOTICE 'Profils avec user_id: %', (SELECT COUNT(*) FROM profiles WHERE user_id IS NOT NULL);
    RAISE NOTICE 'Politiques RLS: %', (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'profiles');
    RAISE NOTICE 'RLS activé: %', (SELECT relrowsecurity FROM pg_class WHERE relname = 'profiles');
END $$;
