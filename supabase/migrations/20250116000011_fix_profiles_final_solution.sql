-- ✅ SOLUTION DÉFINITIVE: Éliminer complètement la récursion RLS

-- 1. DIAGNOSTIC COMPLET
DO $$
DECLARE
    policies_count INTEGER;
    triggers_count INTEGER;
    policy_name TEXT;
BEGIN
    RAISE NOTICE '=== DIAGNOSTIC AVANT CORRECTION ===';
    
    -- Compter les politiques RLS
    SELECT COUNT(*) INTO policies_count FROM pg_policies WHERE tablename = 'profiles';
    RAISE NOTICE 'Politiques RLS existantes: %', policies_count;
    
    -- Lister toutes les politiques
    FOR policy_name IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'profiles'
    LOOP
        RAISE NOTICE 'Politique: %', policy_name;
    END LOOP;
    
    -- Compter les triggers
    SELECT COUNT(*) INTO triggers_count FROM pg_trigger WHERE tgname LIKE '%profiles%';
    RAISE NOTICE 'Triggers existants: %', triggers_count;
    
END $$;

-- 2. SUPPRIMER TOUTES LES POLITIQUES RLS EXISTANTES
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON profiles;
DROP POLICY IF EXISTS "Allow profile creation" ON profiles;
DROP POLICY IF EXISTS "Allow profile reading" ON profiles;
DROP POLICY IF EXISTS "Allow profile updates" ON profiles;
DROP POLICY IF EXISTS "Allow profile deletion" ON profiles;
DROP POLICY IF EXISTS "Admin can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Admin can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admin can delete all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can read their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- 3. SUPPRIMER TOUS LES TRIGGERS QUI PEUVENT CRÉER DES CONFLITS
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;

-- 4. DÉSACTIVER TEMPORAIREMENT RLS POUR DIAGNOSTIC
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 5. VÉRIFIER LA STRUCTURE DE LA TABLE
DO $$
DECLARE
    col_name TEXT; -- ✅ CORRIGÉ: Renommer la variable
    col_type TEXT; -- ✅ CORRIGÉ: Renommer la variable
BEGIN
    RAISE NOTICE '=== STRUCTURE TABLE PROFILES ===';
    
    FOR col_name, col_type IN 
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        ORDER BY ordinal_position
    LOOP
        RAISE NOTICE 'Colonne: % - Type: %', col_name, col_type;
    END LOOP;
END $$;

-- 6. VÉRIFIER LES DONNÉES EXISTANTES
DO $$
DECLARE
    total_profiles INTEGER;
    profiles_with_user_id INTEGER;
    profiles_without_user_id INTEGER;
    profile_record RECORD; -- ✅ CORRIGÉ: Utiliser RECORD pour les exemples
BEGIN
    RAISE NOTICE '=== DONNÉES EXISTANTES ===';
    
    SELECT COUNT(*) INTO total_profiles FROM profiles;
    RAISE NOTICE 'Total profils: %', total_profiles;
    
    SELECT COUNT(*) INTO profiles_with_user_id FROM profiles WHERE user_id IS NOT NULL;
    RAISE NOTICE 'Profils avec user_id: %', profiles_with_user_id;
    
    SELECT COUNT(*) INTO profiles_without_user_id FROM profiles WHERE user_id IS NULL;
    RAISE NOTICE 'Profils sans user_id: %', profiles_without_user_id;
    
    -- Afficher quelques exemples
    IF total_profiles > 0 THEN
        RAISE NOTICE 'Exemples de profils:';
        FOR profile_record IN 
            SELECT id, user_id, email, full_name 
            FROM profiles 
            LIMIT 3
        LOOP
            RAISE NOTICE 'ID: %, user_id: %, email: %, name: %', 
                profile_record.id, profile_record.user_id, profile_record.email, profile_record.full_name;
        END LOOP;
    END IF;
END $$;

-- 7. CRÉER DES POLITIQUES RLS SIMPLES ET SANS RÉCURSION
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Politique SELECT : Les utilisateurs peuvent lire leur propre profil
CREATE POLICY "profiles_select_own" ON profiles
    FOR SELECT
    USING (user_id = auth.uid());

-- Politique INSERT : Les utilisateurs peuvent créer leur propre profil
CREATE POLICY "profiles_insert_own" ON profiles
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Politique UPDATE : Les utilisateurs peuvent modifier leur propre profil
CREATE POLICY "profiles_update_own" ON profiles
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Politique DELETE : Les utilisateurs peuvent supprimer leur propre profil
CREATE POLICY "profiles_delete_own" ON profiles
    FOR DELETE
    USING (user_id = auth.uid());

-- 8. CRÉER UN TRIGGER SIMPLE POUR updated_at
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_profiles_updated_at();

-- 9. CRÉER UN TRIGGER POUR handle_new_user (SIMPLIFIÉ)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Vérifier si un profil existe déjà
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE user_id = NEW.id) THEN
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
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recréer le trigger sur auth.users
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 10. VÉRIFICATION FINALE
DO $$
DECLARE
    policies_count INTEGER;
    triggers_count INTEGER;
BEGIN
    RAISE NOTICE '=== VÉRIFICATION FINALE ===';
    
    SELECT COUNT(*) INTO policies_count FROM pg_policies WHERE tablename = 'profiles';
    RAISE NOTICE 'Politiques RLS créées: %', policies_count;
    
    SELECT COUNT(*) INTO triggers_count FROM pg_trigger WHERE tgname LIKE '%profiles%';
    RAISE NOTICE 'Triggers créés: %', triggers_count;
    
    RAISE NOTICE '✅ Configuration terminée avec succès';
END $$;
