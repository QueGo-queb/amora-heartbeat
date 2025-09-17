-- ✅ CORRECTION: Schéma de la table profiles pour l'inscription

-- 1. Rendre les champs optionnels pour permettre l'inscription
ALTER TABLE profiles 
ALTER COLUMN age DROP NOT NULL,
ALTER COLUMN gender DROP NOT NULL,
ALTER COLUMN language DROP NOT NULL,
ALTER COLUMN role DROP NOT NULL,
ALTER COLUMN subscription_plan DROP NOT NULL;

-- 2. Ajouter des valeurs par défaut
ALTER TABLE profiles 
ALTER COLUMN age SET DEFAULT 18,
ALTER COLUMN gender SET DEFAULT 'other',
ALTER COLUMN language SET DEFAULT 'fr',
ALTER COLUMN role SET DEFAULT 'user',
ALTER COLUMN subscription_plan SET DEFAULT 'free';

-- 3. Mettre à jour le trigger pour inclure tous les champs requis
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Vérifier si un profil existe déjà pour éviter les doublons
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE user_id = NEW.id) THEN
    BEGIN
      -- Insérer le profil avec toutes les colonnes et des valeurs par défaut
      INSERT INTO profiles (
        user_id,
        email,
        full_name,
        age,
        gender,
        language,
        role,
        subscription_plan,
        is_active,
        created_at,
        updated_at
      ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Utilisateur'),
        COALESCE((NEW.raw_user_meta_data->>'age')::integer, 18),
        COALESCE(NEW.raw_user_meta_data->>'gender', 'other'),
        COALESCE(NEW.raw_user_meta_data->>'language', 'fr'),
        'user',
        'free',
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

-- 4. Vérifier que les modifications sont appliquées
DO $$
DECLARE
    age_nullable BOOLEAN;
    gender_nullable BOOLEAN;
    language_nullable BOOLEAN;
    role_nullable BOOLEAN;
    subscription_plan_nullable BOOLEAN;
BEGIN
    SELECT 
        (attnotnull = false) INTO age_nullable
    FROM pg_attribute 
    WHERE attrelid = 'profiles'::regclass 
    AND attname = 'age';
    
    SELECT 
        (attnotnull = false) INTO gender_nullable
    FROM pg_attribute 
    WHERE attrelid = 'profiles'::regclass 
    AND attname = 'gender';
    
    SELECT 
        (attnotnull = false) INTO language_nullable
    FROM pg_attribute 
    WHERE attrelid = 'profiles'::regclass 
    AND attname = 'language';
    
    SELECT 
        (attnotnull = false) INTO role_nullable
    FROM pg_attribute 
    WHERE attrelid = 'profiles'::regclass 
    AND attname = 'role';
    
    SELECT 
        (attnotnull = false) INTO subscription_plan_nullable
    FROM pg_attribute 
    WHERE attrelid = 'profiles'::regclass 
    AND attname = 'subscription_plan';
    
    RAISE NOTICE '✅ age nullable: %', age_nullable;
    RAISE NOTICE '✅ gender nullable: %', gender_nullable;
    RAISE NOTICE '✅ language nullable: %', language_nullable;
    RAISE NOTICE '✅ role nullable: %', role_nullable;
    RAISE NOTICE '✅ subscription_plan nullable: %', subscription_plan_nullable;
END $$;
