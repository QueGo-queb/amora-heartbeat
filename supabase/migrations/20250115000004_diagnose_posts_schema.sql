-- Script de diagnostic pour vérifier le schéma de la table posts
-- Date: 2025-01-15

-- Afficher le schéma actuel de la table posts
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'posts' 
ORDER BY ordinal_position;

-- Afficher les contraintes
SELECT 
    constraint_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'posts';

-- Afficher les index
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'posts';

-- Tester l'insertion d'un post minimal
INSERT INTO posts (user_id, content) 
VALUES (
    (SELECT id FROM auth.users LIMIT 1), 
    'Test post - diagnostic'
) 
RETURNING id, content, created_at;

-- Nettoyer le test
DELETE FROM posts WHERE content = 'Test post - diagnostic';
