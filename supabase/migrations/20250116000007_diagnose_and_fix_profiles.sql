-- ✅ DIAGNOSTIC ET CORRECTION: Problème de chargement du profil

-- 1. Vérifier la structure de la table profiles
DO $$
BEGIN
    RAISE NOTICE '=== DIAGNOSTIC TABLE PROFILES ===';
    
    -- Vérifier si la colonne user_id existe
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'user_id'
    ) THEN
        RAISE NOTICE '✅ Colonne user_id existe';
        
        -- Compter les profils avec user_id NULL
        PERFORM COUNT(*) FROM profiles WHERE user_id IS NULL;
        RAISE NOTICE 'Profils avec user_id NULL: %', (SELECT COUNT(*) FROM profiles WHERE user_id IS NULL);
        
        -- Compter les profils avec user_id rempli
        RAISE NOTICE 'Profils avec user_id rempli: %', (SELECT COUNT(*) FROM profiles WHERE user_id IS NOT NULL);
        
    ELSE
        RAISE NOTICE '❌ Colonne user_id n''existe pas';
    END IF;
    
    -- Vérifier les politiques RLS
    RAISE NOTICE '=== POLITIQUES RLS ===';
    PERFORM COUNT(*) FROM pg_policies WHERE tablename = 'profiles';
    RAISE NOTICE 'Nombre de politiques RLS: %', (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'profiles');
    
END $$;

-- 2. S'assurer que la colonne user_id existe et est correctement configurée
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3. Créer un index sur user_id s'il n'existe pas
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

-- 4. Mettre à jour les profils existants qui n'ont pas de user_id
-- (en utilisant l'email pour faire le lien avec auth.users)
UPDATE profiles 
SET user_id = au.id
FROM auth.users au
WHERE profiles.user_id IS NULL 
  AND profiles.email = au.email;

-- 5. Corriger la fonction handle_new_user pour qu'elle fonctionne avec la nouvelle structure
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insérer le profil avec user_id correct
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
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log l'erreur mais ne pas faire échouer l'inscription
    RAISE WARNING 'Erreur lors de la création du profil pour user_id %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 6. S'assurer que le trigger est correctement configuré
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Nettoyer et recréer les politiques RLS
DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON profiles;
DROP POLICY IF EXISTS "Profiles are publicly viewable" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;
DROP POLICY IF EXISTS "Avatar URLs are viewable by everyone" ON profiles;

-- 8. Créer des politiques RLS simples et fonctionnelles
CREATE POLICY "profiles_select_all" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "profiles_delete_own" ON profiles
  FOR DELETE USING (user_id = auth.uid());

-- 9. Vérification finale
DO $$
BEGIN
    RAISE NOTICE '=== VÉRIFICATION FINALE ===';
    RAISE NOTICE 'Profils totaux: %', (SELECT COUNT(*) FROM profiles);
    RAISE NOTICE 'Profils avec user_id: %', (SELECT COUNT(*) FROM profiles WHERE user_id IS NOT NULL);
    RAISE NOTICE 'Politiques RLS: %', (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'profiles');
END $$;
