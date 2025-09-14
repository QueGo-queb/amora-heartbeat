-- Script pour appliquer le schéma des publications
-- À exécuter dans le Supabase Dashboard > SQL Editor

-- 1. Appliquer la migration principale des posts
\i supabase/migrations/20250114000001_create_posts_schema.sql

-- 2. Appliquer la migration du stockage des médias
\i supabase/migrations/20250114000002_create_post_media_storage.sql

-- 3. Vérifier que tout fonctionne
SELECT 
    table_name, 
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_name IN ('posts', 'post_interactions', 'post_comments')
ORDER BY table_name, ordinal_position;

-- 4. Vérifier les buckets de stockage
SELECT * FROM storage.buckets WHERE id IN ('post-media', 'avatars');

-- 5. Vérifier les politiques RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('posts', 'post_interactions', 'post_comments')
ORDER BY tablename, policyname;
