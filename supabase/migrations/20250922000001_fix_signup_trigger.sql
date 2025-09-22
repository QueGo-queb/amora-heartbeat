-- Correction du trigger handle_new_user pour inclure l'email
-- Problème: Le trigger n'incluait pas l'email requis dans la table profiles

-- 1. Supprimer l'ancien trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Corriger la fonction handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  -- Insérer dans profiles avec email ET full_name
  INSERT INTO public.profiles (
    user_id, 
    email, 
    full_name
  )
  VALUES (
    new.id, 
    new.email,  -- ✅ AJOUT de l'email manquant
    COALESCE(new.raw_user_meta_data->>'full_name', new.email)  -- ✅ Fallback si pas de nom
  );
  
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- Log l'erreur mais ne pas bloquer l'inscription
    RAISE LOG 'Erreur création profil pour %: %', new.email, SQLERRM;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Recréer le trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Ajouter une contrainte pour éviter les doublons
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_user_id_unique UNIQUE (user_id);

-- 5. Créer un index pour les performances
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
