-- ✅ CORRECTION COMPLÈTE: Sauvegarde complète du profil lors de l'inscription

-- 1. Désactiver temporairement le trigger pour éviter les conflits
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. S'assurer que tous les champs nécessaires existent dans profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS seeking_country TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS seeking_gender TEXT DEFAULT 'any',
ADD COLUMN IF NOT EXISTS looking_for TEXT DEFAULT 'any';

-- 3. Créer un index unique sur user_id pour éviter les doublons
DROP INDEX IF EXISTS idx_profiles_user_id_unique;
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_user_id_unique ON profiles(user_id);

-- 4. Améliorer le trigger pour gérer les conflits avec upsert
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Attendre un petit délai pour laisser l'application créer le profil complet
  -- Si un profil existe déjà (créé par l'application), ne rien faire
  IF EXISTS (SELECT 1 FROM profiles WHERE user_id = NEW.id) THEN
    RAISE NOTICE 'Profil déjà existant pour user_id: %, ignoré par le trigger', NEW.id;
    RETURN NEW;
  END IF;
  
  -- Créer un profil minimal seulement si aucun profil n'existe
  BEGIN
    INSERT INTO profiles (
      user_id,
      email,
      full_name,
      is_active,
      created_at,
      updated_at
    ) VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', 'Utilisateur'),
      true,
      NOW(),
      NOW()
    );
    
    RAISE NOTICE 'Profil minimal créé par trigger pour user_id: %', NEW.id;
    
  EXCEPTION
    WHEN unique_violation THEN
      -- Conflit détecté, le profil a été créé par l'application
      RAISE NOTICE 'Conflit détecté pour user_id: %, profil créé par l''application', NEW.id;
    WHEN OTHERS THEN
      -- Autre erreur
      RAISE WARNING 'Erreur création profil minimal user_id %: %', NEW.id, SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Recréer le trigger avec un délai pour éviter les conflits
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 6. Créer une fonction utilitaire pour vérifier et corriger les profils existants
CREATE OR REPLACE FUNCTION public.ensure_profile_complete(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  profile_exists BOOLEAN;
  profile_record RECORD;
BEGIN
  -- Vérifier si le profil existe
  SELECT EXISTS(SELECT 1 FROM profiles WHERE user_id = p_user_id) INTO profile_exists;
  
  IF NOT profile_exists THEN
    RAISE WARNING 'Aucun profil trouvé pour user_id: %', p_user_id;
    RETURN FALSE;
  END IF;
  
  -- Récupérer le profil actuel
  SELECT * INTO profile_record FROM profiles WHERE user_id = p_user_id;
  
  -- Vérifier et corriger les champs manquants
  IF profile_record.full_name IS NULL OR profile_record.full_name = 'Utilisateur' THEN
    UPDATE profiles 
    SET full_name = 'Utilisateur ' || SUBSTRING(p_user_id::text, 1, 8)
    WHERE user_id = p_user_id;
    
    RAISE NOTICE 'Nom corrigé pour user_id: %', p_user_id;
  END IF;
  
  -- S'assurer que les champs obligatoires ont des valeurs par défaut
  UPDATE profiles SET
    gender = COALESCE(gender, 'other'),
    age = COALESCE(age, 18),
    language = COALESCE(language, 'fr'),
    seeking_gender = COALESCE(seeking_gender, 'any'),
    interests = COALESCE(interests, '{}'),
    seeking_country = COALESCE(seeking_country, '{}'),
    plan = COALESCE(plan, 'free'),
    role = COALESCE(role, 'user'),
    subscription_plan = COALESCE(subscription_plan, 'free'),
    is_active = COALESCE(is_active, true),
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  RAISE NOTICE 'Profil mis à jour pour user_id: %', p_user_id;
  RETURN TRUE;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Erreur lors de la mise à jour du profil pour user_id %: %', p_user_id, SQLERRM;
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Donner les permissions nécessaires
GRANT EXECUTE ON FUNCTION public.ensure_profile_complete TO authenticated;

-- 8. Corriger les profils existants qui ont des problèmes
DO $$
DECLARE
  profile_record RECORD;
  corrected_count INTEGER := 0;
BEGIN
  RAISE NOTICE '=== CORRECTION DES PROFILS EXISTANTS ===';
  
  -- Trouver les profils avec des problèmes
  FOR profile_record IN 
    SELECT user_id, full_name 
    FROM profiles 
    WHERE full_name IS NULL 
       OR full_name = 'Utilisateur'
       OR gender IS NULL
       OR age IS NULL
       OR language IS NULL
  LOOP
    -- Corriger le profil
    IF public.ensure_profile_complete(profile_record.user_id) THEN
      corrected_count := corrected_count + 1;
    END IF;
  END LOOP;
  
  RAISE NOTICE 'Profils corrigés: %', corrected_count;
END $$;

-- 9. Vérification finale
DO $$
DECLARE
    trigger_exists BOOLEAN;
    function_exists BOOLEAN;
    index_exists BOOLEAN;
    profiles_count INTEGER;
    incomplete_profiles INTEGER;
BEGIN
    -- Vérifier le trigger
    SELECT EXISTS (
        SELECT 1 FROM pg_trigger t
        JOIN pg_class c ON t.tgrelid = c.oid
        WHERE c.relname = 'users' 
        AND c.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'auth')
        AND t.tgname = 'on_auth_user_created'
    ) INTO trigger_exists;
    
    -- Vérifier la fonction
    SELECT EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'ensure_profile_complete' 
        AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    ) INTO function_exists;
    
    -- Vérifier l'index
    SELECT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'profiles' 
        AND indexname = 'idx_profiles_user_id_unique'
    ) INTO index_exists;
    
    -- Compter les profils
    SELECT COUNT(*) INTO profiles_count FROM profiles;
    
    -- Compter les profils incomplets
    SELECT COUNT(*) INTO incomplete_profiles 
    FROM profiles 
    WHERE full_name IS NULL 
       OR full_name = 'Utilisateur'
       OR gender IS NULL
       OR age IS NULL;
    
    RAISE NOTICE '✅ Trigger existe: %', trigger_exists;
    RAISE NOTICE '✅ Fonction ensure_profile_complete existe: %', function_exists;
    RAISE NOTICE '✅ Index unique sur user_id existe: %', index_exists;
    RAISE NOTICE '✅ Total profils: %', profiles_count;
    RAISE NOTICE '✅ Profils incomplets: %', incomplete_profiles;
    
    IF trigger_exists AND function_exists AND index_exists THEN
        RAISE NOTICE ' Configuration d''inscription complète terminée avec succès !';
    ELSE
        RAISE NOTICE '❌ Problème dans la configuration';
    END IF;
END $$;
