-- Script pour nettoyer les comptes de test de manière sécurisée
-- Date: 2025-09-18

-- 🔍 ÉTAPE 1: Identifier les comptes de test potentiels
SELECT 
  id,
  email,
  full_name,
  created_at,
  role,
  plan,
  -- Marquer les comptes suspects comme test
  CASE 
    WHEN email LIKE '%test%' OR email LIKE '%demo%' OR email LIKE '%example%' THEN 'POTENTIAL_TEST'
    WHEN full_name LIKE '%Test%' OR full_name LIKE '%Demo%' THEN 'POTENTIAL_TEST'
    WHEN email LIKE '%@gmail.com' AND created_at < NOW() - INTERVAL '7 days' AND full_name IS NULL THEN 'INACTIVE_OLD'
    ELSE 'KEEP'
  END as account_type
FROM profiles 
WHERE role != 'admin' -- Ne jamais supprimer les admins
ORDER BY created_at DESC;

-- 🔍 ÉTAPE 2: Compter les différents types de comptes
SELECT 
  account_type,
  COUNT(*) as count
FROM (
  SELECT 
    CASE 
      WHEN email LIKE '%test%' OR email LIKE '%demo%' OR email LIKE '%example%' THEN 'POTENTIAL_TEST'
      WHEN full_name LIKE '%Test%' OR full_name LIKE '%Demo%' THEN 'POTENTIAL_TEST'
      WHEN email LIKE '%@gmail.com' AND created_at < NOW() - INTERVAL '7 days' AND full_name IS NULL THEN 'INACTIVE_OLD'
      ELSE 'KEEP'
    END as account_type
  FROM profiles 
  WHERE role != 'admin'
) as categorized
GROUP BY account_type;

-- 🗑️ ÉTAPE 3: Suppression sécurisée (DÉCOMMENTEZ SEULEMENT APRÈS VÉRIFICATION)
/*
-- Supprimer les comptes de test évidents (emails avec test/demo/example)
DELETE FROM profiles 
WHERE role != 'admin' 
AND (
  email LIKE '%test%' 
  OR email LIKE '%demo%' 
  OR email LIKE '%example.com'
  OR email LIKE '%test@%'
  OR full_name LIKE '%Test%'
  OR full_name LIKE '%Demo%'
);

-- Supprimer les comptes inactifs anciens sans nom
DELETE FROM profiles 
WHERE role != 'admin'
AND created_at < NOW() - INTERVAL '30 days'
AND full_name IS NULL
AND email NOT IN ('clodenerc@yahoo.fr', 'dieujustebiduello@gmail.com', 'regisyvener30@gmail.com');
*/

-- 🔍 ÉTAPE 4: Vérification finale
SELECT 
  'Comptes restants après nettoyage' as status,
  COUNT(*) as total_accounts,
  COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_accounts,
  COUNT(CASE WHEN role = 'user' THEN 1 END) as user_accounts
FROM profiles;