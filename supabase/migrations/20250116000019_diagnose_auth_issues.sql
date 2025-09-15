-- ✅ DIAGNOSTIC: Problèmes d'authentification

-- 1. Vérifier la structure de la table auth.users
DO $$
DECLARE
    column_name TEXT;
    column_type TEXT;
BEGIN
    RAISE NOTICE '=== STRUCTURE TABLE AUTH.USERS ===';
    
    FOR column_name, column_type IN 
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND table_schema = 'auth'
        ORDER BY ordinal_position
    LOOP
        RAISE NOTICE 'Colonne: % - Type: %', column_name, column_type;
    END LOOP;
END $$;

-- 2. Vérifier les contraintes sur auth.users
DO $$
DECLARE
    constraint_name TEXT;
    constraint_type TEXT;
BEGIN
    RAISE NOTICE '=== CONTRAINTES AUTH.USERS ===';
    
    FOR constraint_name, constraint_type IN 
        SELECT conname, contype
        FROM pg_constraint c
        JOIN pg_class t ON c.conrelid = t.oid
        WHERE t.relname = 'users' AND t.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'auth')
    LOOP
        RAISE NOTICE 'Contrainte: % - Type: %', constraint_name, constraint_type;
    END LOOP;
END $$;

-- 3. Vérifier les politiques RLS sur profiles
DO $$
DECLARE
    policy_name TEXT;
    policy_cmd TEXT;
    policy_qual TEXT;
BEGIN
    RAISE NOTICE '=== POLITIQUES RLS PROFILES ===';
    
    FOR policy_name, policy_cmd, policy_qual IN 
        SELECT policyname, cmd, qual
        FROM pg_policies 
        WHERE tablename = 'profiles'
    LOOP
        RAISE NOTICE 'Politique: % - Commande: % - Condition: %', policy_name, policy_cmd, policy_qual;
    END LOOP;
END $$;

-- 4. Vérifier les triggers sur auth.users
DO $$
DECLARE
    trigger_name TEXT;
    trigger_function TEXT;
BEGIN
    RAISE NOTICE '=== TRIGGERS AUTH.USERS ===';
    
    FOR trigger_name, trigger_function IN 
        SELECT tgname, tgfoid::regproc
        FROM pg_trigger t
        JOIN pg_class c ON t.tgrelid = c.oid
        WHERE c.relname = 'users' AND c.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'auth')
    LOOP
        RAISE NOTICE 'Trigger: % - Fonction: %', trigger_name, trigger_function;
    END LOOP;
END $$;

-- 5. Test de création d'utilisateur simple
DO $$
BEGIN
    RAISE NOTICE '=== TEST CRÉATION UTILISATEUR ===';
    
    -- Essayer d'insérer un utilisateur de test
    BEGIN
        INSERT INTO auth.users (
            id,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            'test@example.com',
            crypt('password123', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW()
        );
        
        RAISE NOTICE '✅ Test de création d''utilisateur réussi';
        
        -- Supprimer l'utilisateur de test
        DELETE FROM auth.users WHERE email = 'test@example.com';
        
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '❌ Erreur lors du test de création: %', SQLERRM;
    END;
END $$;
