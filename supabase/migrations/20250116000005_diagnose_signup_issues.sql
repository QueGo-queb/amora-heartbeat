-- Migration de diagnostic pour identifier les problèmes d'inscription
-- Date: 2025-01-16

-- 1. Créer une fonction pour diagnostiquer les problèmes
CREATE OR REPLACE FUNCTION public.diagnose_signup_issues()
RETURNS TABLE (
  issue_type TEXT,
  issue_description TEXT,
  status TEXT
) AS $$
BEGIN
  -- Vérifier si RLS est activé
  RETURN QUERY
  SELECT 
    'RLS Status'::TEXT,
    'Row Level Security on profiles table'::TEXT,
    CASE WHEN EXISTS (
      SELECT 1 FROM pg_class c 
      JOIN pg_namespace n ON n.oid = c.relnamespace 
      WHERE c.relname = 'profiles' 
      AND n.nspname = 'public'
      AND c.relrowsecurity = true
    ) THEN 'ENABLED'::TEXT ELSE 'DISABLED'::TEXT END;

  -- Vérifier les politiques RLS
  RETURN QUERY
  SELECT 
    'RLS Policies'::TEXT,
    'Number of INSERT policies on profiles'::TEXT,
    (SELECT COUNT(*)::TEXT FROM pg_policies WHERE tablename = 'profiles' AND cmd = 'INSERT');

  -- Vérifier la fonction handle_new_user
  RETURN QUERY
  SELECT 
    'Trigger Function'::TEXT,
    'handle_new_user function exists'::TEXT,
    CASE WHEN EXISTS (
      SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user'
    ) THEN 'EXISTS'::TEXT ELSE 'MISSING'::TEXT END;

  -- Vérifier le trigger
  RETURN QUERY
  SELECT 
    'Trigger'::TEXT,
    'on_auth_user_created trigger exists'::TEXT,
    CASE WHEN EXISTS (
      SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
    ) THEN 'EXISTS'::TEXT ELSE 'MISSING'::TEXT END;

  -- Vérifier les contraintes de la table
  RETURN QUERY
  SELECT 
    'Table Constraints'::TEXT,
    'Number of constraints on profiles'::TEXT,
    (SELECT COUNT(*)::TEXT FROM information_schema.table_constraints WHERE table_name = 'profiles');

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Créer une fonction pour tester l'insertion
CREATE OR REPLACE FUNCTION public.test_profile_insertion(test_user_id UUID, test_email TEXT, test_name TEXT)
RETURNS TABLE (
  step TEXT,
  result TEXT,
  error_message TEXT
) AS $$
BEGIN
  -- Test 1: Vérifier les permissions
  RETURN QUERY
  SELECT 
    'Permission Check'::TEXT,
    'Testing INSERT permission'::TEXT,
    ''::TEXT;

  BEGIN
    -- Test 2: Tentative d'insertion
    INSERT INTO public.profiles (
      user_id, email, full_name, gender, birthdate, location,
      interests, looking_for_gender, looking_for_age_min, 
      looking_for_age_max, looking_for_interests, plan
    ) VALUES (
      test_user_id, test_email, test_name, 'male', '1990-01-01'::date,
      '', '{}', 'any', 18, 99, '{}', 'free'
    );
    
    RETURN QUERY
    SELECT 
      'Insert Test'::TEXT,
      'SUCCESS'::TEXT,
      'Profile inserted successfully'::TEXT;
      
  EXCEPTION
    WHEN OTHERS THEN
      RETURN QUERY
      SELECT 
        'Insert Test'::TEXT,
        'FAILED'::TEXT,
        SQLERRM::TEXT;
  END;

  -- Nettoyer le test
  DELETE FROM public.profiles WHERE user_id = test_user_id;
  
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Commentaires
COMMENT ON FUNCTION public.diagnose_signup_issues() IS 'Fonction de diagnostic pour identifier les problèmes d''inscription';
COMMENT ON FUNCTION public.test_profile_insertion(UUID, TEXT, TEXT) IS 'Fonction de test pour vérifier l''insertion de profils';
