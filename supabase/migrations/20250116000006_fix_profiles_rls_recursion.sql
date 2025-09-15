-- ✅ CORRECTION: Fixer la récursion infinie dans les politiques RLS de profiles

-- 1. Supprimer toutes les politiques existantes pour éviter les conflits
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON profiles;
DROP POLICY IF EXISTS "Profiles are publicly viewable" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;
DROP POLICY IF EXISTS "Avatar URLs are viewable by everyone" ON profiles;

-- 2. Désactiver temporairement RLS pour recréer les politiques
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 3. Réactiver RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 4. Créer des politiques RLS simples et non-récursives
-- Politique SELECT: Tout le monde peut voir les profils (pour le matching)
CREATE POLICY "profiles_select_all" ON profiles
  FOR SELECT USING (true);

-- Politique INSERT: Seul l'utilisateur peut créer son propre profil
CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Politique UPDATE: Seul l'utilisateur peut modifier son propre profil
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (user_id = auth.uid());

-- Politique DELETE: Seul l'utilisateur peut supprimer son propre profil
CREATE POLICY "profiles_delete_own" ON profiles
  FOR DELETE USING (user_id = auth.uid());

-- 5. Créer un index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- 6. Vérifier que la fonction handle_new_user fonctionne correctement
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insérer le profil avec des valeurs par défaut sécurisées
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

-- 7. S'assurer que le trigger est correctement configuré
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. Donner les permissions appropriées
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON profiles TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
