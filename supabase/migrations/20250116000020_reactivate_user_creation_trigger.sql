-- ✅ RÉACTIVATION: Trigger de création d'utilisateur corrigé

-- 1. Supprimer l'ancien trigger s'il existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Créer une fonction trigger robuste et sécurisée
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Vérifier si un profil existe déjà pour éviter les doublons
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE user_id = NEW.id) THEN
    BEGIN
      -- Insérer le profil avec toutes les colonnes obligatoires et des valeurs par défaut
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
      
      -- Log de succès
      RAISE NOTICE 'Profil créé avec succès pour user_id: %', NEW.id;
      
    EXCEPTION
      WHEN OTHERS THEN
        -- Log l'erreur détaillée mais ne pas faire échouer la création d'utilisateur
        RAISE WARNING 'Erreur lors de la création du profil pour user_id %: %', NEW.id, SQLERRM;
        RAISE WARNING 'Détails de l''erreur: %', SQLSTATE;
    END;
  ELSE
    RAISE NOTICE 'Profil existe déjà pour user_id: %', NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Définir le propriétaire de la fonction (important pour les permissions)
ALTER FUNCTION public.handle_new_user() OWNER TO postgres;

-- 4. Créer le trigger sur auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 5. Vérifier que le trigger est bien créé
DO $$
DECLARE
    trigger_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO trigger_count 
    FROM pg_trigger t
    JOIN pg_class c ON t.tgrelid = c.oid
    WHERE c.relname = 'users' 
    AND c.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'auth')
    AND t.tgname = 'on_auth_user_created';
    
    IF trigger_count > 0 THEN
        RAISE NOTICE '✅ Trigger on_auth_user_created créé avec succès';
    ELSE
        RAISE NOTICE '❌ Erreur: Trigger non créé';
    END IF;
END $$;
