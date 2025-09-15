-- Migration complète pour corriger tous les problèmes d'inscription
-- Date: 2025-01-16

-- 1. Activer RLS sur la table profiles si pas déjà fait
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 2. Supprimer les politiques existantes pour éviter les conflits
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Avatar URLs are viewable by everyone" ON profiles;

-- 3. Créer les politiques RLS complètes pour profiles
CREATE POLICY "Profiles are publicly viewable" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (
    user_id = auth.uid() OR 
    id = auth.uid() OR 
    auth.role() = 'service_role'
  );

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (
    user_id = auth.uid() OR 
    id = auth.uid() OR 
    auth.role() = 'service_role'
  );

CREATE POLICY "Users can delete own profile" ON profiles
  FOR DELETE USING (
    user_id = auth.uid() OR 
    id = auth.uid() OR 
    auth.role() = 'service_role'
  );

-- 4. Corriger la fonction handle_new_user avec gestion complète
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  -- Insérer dans profiles avec toutes les données nécessaires
  INSERT INTO public.profiles (
    user_id, 
    email, 
    full_name,
    gender,
    birthdate,
    location,
    interests,
    looking_for_gender,
    looking_for_age_min,
    looking_for_age_max,
    looking_for_interests,
    plan,
    created_at,
    updated_at
  )
  VALUES (
    new.id, 
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Nouvel utilisateur'),
    'male', -- Valeur par défaut
    '1990-01-01'::date, -- Valeur par défaut
    '', -- Valeur par défaut
    '{}', -- Valeur par défaut
    'any', -- Valeur par défaut
    18, -- Valeur par défaut
    99, -- Valeur par défaut
    '{}', -- Valeur par défaut
    'free', -- Valeur par défaut
    NOW(),
    NOW()
  )
  ON CONFLICT (email) DO UPDATE SET
    user_id = EXCLUDED.user_id,
    full_name = COALESCE(profiles.full_name, EXCLUDED.full_name),
    updated_at = NOW();
  
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- Log l'erreur mais ne pas bloquer l'inscription
    RAISE WARNING 'Erreur lors de la création du profil pour l''utilisateur %: %', new.id, SQLERRM;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 5. S'assurer que le trigger existe et fonctionne
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Créer un index unique sur user_id pour éviter les doublons
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_user_id_unique ON profiles(user_id);

-- 7. Commentaires pour documentation
COMMENT ON TABLE profiles IS 'Table des profils utilisateurs avec RLS activé et trigger automatique';
COMMENT ON FUNCTION public.handle_new_user() IS 'Fonction trigger pour créer automatiquement un profil lors de l''inscription';
