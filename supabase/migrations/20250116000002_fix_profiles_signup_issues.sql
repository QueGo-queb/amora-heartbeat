-- Migration pour corriger les problèmes d'inscription avec la table profiles
-- Problèmes identifiés :
-- 1. Pas de politique INSERT pour profiles
-- 2. RLS non activé sur profiles
-- 3. Structure incohérente entre id et user_id

-- Activer RLS sur la table profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes pour éviter les conflits
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Avatar URLs are viewable by everyone" ON profiles;

-- Créer les politiques RLS pour profiles
CREATE POLICY "Profiles are publicly viewable" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (user_id = auth.uid() OR id = auth.uid());

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (user_id = auth.uid() OR id = auth.uid());

CREATE POLICY "Users can delete own profile" ON profiles
  FOR DELETE USING (user_id = auth.uid() OR id = auth.uid());

-- Corriger la fonction handle_new_user pour utiliser la bonne structure
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  -- Insérer dans profiles avec user_id
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name',
    new.email
  )
  ON CONFLICT (email) DO UPDATE SET
    user_id = EXCLUDED.user_id,
    full_name = EXCLUDED.full_name;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- S'assurer que le trigger existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ajouter des commentaires pour documentation
COMMENT ON TABLE profiles IS 'Table des profils utilisateurs avec RLS activé';
COMMENT ON COLUMN profiles.user_id IS 'Référence vers auth.users.id';
COMMENT ON COLUMN profiles.id IS 'ID unique du profil (peut être différent de user_id)';
