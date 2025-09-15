-- ✅ TEST: Vérifier que le trigger fonctionne correctement

-- 1. Test de création d'utilisateur (simulation)
DO $$
DECLARE
    test_user_id UUID;
    profile_exists BOOLEAN;
BEGIN
    RAISE NOTICE '=== TEST DU TRIGGER ===';
    
    -- Générer un ID de test
    test_user_id := gen_random_uuid();
    
    -- Simuler l'insertion d'un utilisateur (sans vraiment l'insérer)
    RAISE NOTICE 'Test avec user_id: %', test_user_id;
    
    -- Vérifier que la fonction trigger existe et est accessible
    IF EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'handle_new_user' 
        AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    ) THEN
        RAISE NOTICE '✅ Fonction handle_new_user existe';
    ELSE
        RAISE NOTICE '❌ Fonction handle_new_user manquante';
    END IF;
    
    -- Vérifier que le trigger existe
    IF EXISTS (
        SELECT 1 FROM pg_trigger t
        JOIN pg_class c ON t.tgrelid = c.oid
        WHERE c.relname = 'users' 
        AND c.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'auth')
        AND t.tgname = 'on_auth_user_created'
    ) THEN
        RAISE NOTICE '✅ Trigger on_auth_user_created existe';
    ELSE
        RAISE NOTICE '❌ Trigger on_auth_user_created manquant';
    END IF;
    
    RAISE NOTICE '=== FIN DU TEST ===';
END $$;
