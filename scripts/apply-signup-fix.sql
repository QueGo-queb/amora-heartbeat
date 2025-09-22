-- CORRECTION URGENTE: Trigger handle_new_user manquant email
-- Problème: AuthApiError: Database error saving new user

-- 1. Supprimer l'ancien trigger défaillant
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Corriger la fonction avec email obligatoire
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  -- ✅ CORRECTION: Inclure l'email requis par la table profiles
  INSERT INTO public.profiles (
    user_id, 
    email, 
    full_name
  )
  VALUES (
    new.id, 
    new.email,  -- ✅ EMAIL OBLIGATOIRE
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- Log mais ne pas bloquer l'inscription
    RAISE LOG 'Erreur profil pour %: %', new.email, SQLERRM;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Recréer le trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Vérifier la structure de profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'profiles' AND constraint_type = 'UNIQUE' AND constraint_name LIKE '%user_id%'
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_id_unique UNIQUE (user_id);
  END IF;
END $$;
