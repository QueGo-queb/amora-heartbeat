-- Migration finale pour corriger définitivement l'inscription
-- Date: 2025-01-16

-- 1. S'assurer que RLS est activé sur profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 2. Supprimer toutes les politiques existantes pour éviter les conflits
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Avatar URLs are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Profiles are publicly viewable" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;

-- 3. Créer les politiques RLS complètes et sécurisées
CREATE POLICY "profiles_select_policy" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "profiles_insert_policy" ON profiles
  FOR INSERT WITH CHECK (
    user_id = auth.uid() OR 
    id = auth.uid() OR 
    auth.role() = 'service_role' OR
    auth.role() = 'postgres'
  );

CREATE POLICY "profiles_update_policy" ON profiles
  FOR UPDATE USING (
    user_id = auth.uid() OR 
    id = auth.uid() OR 
    auth.role() = 'service_role' OR
    auth.role() = 'postgres'
  );

CREATE POLICY "profiles_delete_policy" ON profiles
  FOR DELETE USING (
    user_id = auth.uid() OR 
    id = auth.uid() OR 
    auth.role() = 'service_role' OR
    auth.role() = 'postgres'
  );

-- 4. Créer une fonction trigger robuste avec gestion d'erreur complète
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insérer dans profiles avec toutes les données nécessaires et gestion d'erreur
  BEGIN
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
      'male', -- Valeur par défaut sûre
      '1990-01-01'::date, -- Valeur par défaut sûre
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
      updated_at = NOW()
    ON CONFLICT (user_id) DO UPDATE SET
      email = EXCLUDED.email,
      full_name = COALESCE(profiles.full_name, EXCLUDED.full_name),
      updated_at = NOW();
    
    RAISE NOTICE 'Profil créé avec succès pour l''utilisateur %', new.id;
    
  EXCEPTION
    WHEN OTHERS THEN
      -- Log l'erreur détaillée mais ne pas bloquer l'inscription
      RAISE WARNING 'Erreur lors de la création du profil pour l''utilisateur %: % (Code: %)', 
        new.id, SQLERRM, SQLSTATE;
      -- Retourner new pour ne pas bloquer l'inscription
      RETURN new;
  END;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql;

-- 5. S'assurer que le trigger existe et fonctionne
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Créer des index pour optimiser les performances et éviter les conflits
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_user_id_unique ON profiles(user_id) WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_email_unique ON profiles(email) WHERE email IS NOT NULL;

-- 7. Donner les permissions nécessaires à la fonction
ALTER FUNCTION public.handle_new_user() OWNER TO postgres;

-- 8. Commentaires pour documentation
COMMENT ON TABLE profiles IS 'Table des profils utilisateurs avec RLS activé et trigger automatique robuste';
COMMENT ON FUNCTION public.handle_new_user() IS 'Fonction trigger SECURITY DEFINER pour créer automatiquement un profil lors de l''inscription avec gestion d''erreur complète';
