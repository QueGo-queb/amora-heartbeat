-- ✅ SOLUTION: Désactiver le trigger problématique

-- 1. Supprimer le trigger qui cause l'erreur
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Vérification
DO $$
BEGIN
  RAISE NOTICE '✅ Trigger problématique supprimé';
  RAISE NOTICE 'Les profils seront créés manuellement côté client';
END $$;
