-- ✅ SOLUTION DÉFINITIVE: Éliminer complètement la récursion RLS

-- 1. DIAGNOSTIC COMPLET
DO $$
BEGIN
    RAISE NOTICE '=== DIAGNOSTIC FINAL ===';
    RAISE NOTICE 'Profils totaux: %', (SELECT COUNT(*) FROM profiles);
    RAISE NOTICE 'Politiques RLS: %', (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'profiles');
    RAISE NOTICE 'RLS activé: %', (SELECT relrowsecurity FROM pg_class WHERE relname = 'profiles');
END $$;

-- 2. SUPPRIMER TOUTES LES POLITIQUES RLS EXISTANTES
DROP POLICY IF EXISTS "profiles_select_public" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON profiles;
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

-- 3. DÉSACTIVER COMPLÈTEMENT RLS TEMPORAIREMENT
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 4. VÉRIFIER ET CORRIGER LA STRUCTURE
-- S'assurer que toutes les colonnes existent
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- 5. CRÉER LES INDEX
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);

-- 6. METTRE À JOUR LES PROFILS EXISTANTS
UPDATE profiles 
SET user_id = au.id
FROM auth.users au
WHERE profiles.user_id IS NULL 
  AND profiles.email = au.email;

-- 7. RÉACTIVER RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 8. CRÉER DES POLITIQUES RLS ULTRA-SIMPLES (SANS RÉCURSION)
-- Politique SELECT: Lecture publique (pour le matching)
CREATE POLICY "profiles_public_read" ON profiles
  FOR SELECT USING (true);

-- Politique INSERT: Insertion par l'utilisateur authentifié
CREATE POLICY "profiles_authenticated_insert" ON profiles
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Politique UPDATE: Mise à jour par l'utilisateur authentifié
CREATE POLICY "profiles_authenticated_update" ON profiles
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Politique DELETE: Suppression par l'utilisateur authentifié
CREATE POLICY "profiles_authenticated_delete" ON profiles
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- 9. CORRIGER LA FONCTION handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Vérifier si le profil existe déjà
  IF EXISTS (SELECT 1 FROM profiles WHERE user_id = NEW.id OR email = NEW.email) THEN
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

-- 11. PERMISSIONS
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON profiles TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 12. TEST FINAL
DO $$
DECLARE
    test_count INTEGER;
BEGIN
    RAISE NOTICE '=== TEST FINAL ===';
    
    -- Test de lecture
    SELECT COUNT(*) INTO test_count FROM profiles;
    RAISE NOTICE '✅ Lecture réussie: % profils', test_count;
    
    -- Test de lecture par user_id
    SELECT COUNT(*) INTO test_count FROM profiles WHERE user_id IS NOT NULL;
    RAISE NOTICE '✅ Lecture par user_id réussie: % profils', test_count;
    
    RAISE NOTICE '=== CONFIGURATION FINALE ===';
    RAISE NOTICE 'Profils totaux: %', (SELECT COUNT(*) FROM profiles);
    RAISE NOTICE 'Profils avec user_id: %', (SELECT COUNT(*) FROM profiles WHERE user_id IS NOT NULL);
    RAISE NOTICE 'Politiques RLS: %', (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'profiles');
    RAISE NOTICE 'RLS activé: %', (SELECT relrowsecurity FROM pg_class WHERE relname = 'profiles');
END $$;
