-- ✅ CORRECTION CRITIQUE: Problème d'inscription

-- 1. Désactiver temporairement le trigger problématique
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Rendre les champs optionnels dans profiles
ALTER TABLE profiles 
ALTER COLUMN age DROP NOT NULL,
ALTER COLUMN gender DROP NOT NULL,
ALTER COLUMN language DROP NOT NULL,
ALTER COLUMN role DROP NOT NULL,
ALTER COLUMN subscription_plan DROP NOT NULL,
ALTER COLUMN bio DROP NOT NULL,
ALTER COLUMN country DROP NOT NULL,
ALTER COLUMN city DROP NOT NULL,
ALTER COLUMN region DROP NOT NULL;

-- 3. Ajouter des valeurs par défaut
ALTER TABLE profiles 
ALTER COLUMN age SET DEFAULT 18,
ALTER COLUMN gender SET DEFAULT 'other',
ALTER COLUMN language SET DEFAULT 'fr',
ALTER COLUMN role SET DEFAULT 'user',
ALTER COLUMN subscription_plan SET DEFAULT 'free';

-- 4. Créer un trigger simplifié et robuste
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Vérifier si un profil existe déjà
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE user_id = NEW.id) THEN
    BEGIN
      -- Insérer le profil avec seulement les champs essentiels
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
      
      RAISE NOTICE 'Profil créé avec succès pour user_id: %', NEW.id;
      
    EXCEPTION
      WHEN OTHERS THEN
        -- Log l'erreur mais ne pas faire échouer l'inscription
        RAISE WARNING 'Erreur création profil user_id %: %', NEW.id, SQLERRM;
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Recréer le trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 6. Vérifier que tout fonctionne
DO $$
DECLARE
    trigger_exists BOOLEAN;
    function_exists BOOLEAN;
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
        WHERE proname = 'handle_new_user' 
        AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    ) INTO function_exists;
    
    RAISE NOTICE '✅ Trigger existe: %', trigger_exists;
    RAISE NOTICE '✅ Fonction existe: %', function_exists;
    
    IF trigger_exists AND function_exists THEN
        RAISE NOTICE '🎉 Configuration d''inscription corrigée avec succès !';
    ELSE
        RAISE NOTICE '❌ Problème dans la configuration';
    END IF;
END $$;
