/**
 * ✅ MIGRATION D'OPTIMISATION DES PERFORMANCES
 * - Index optimisés pour les requêtes fréquentes
 * - Nettoyage des tables redondantes
 * - Optimisation des politiques RLS
 */

-- 1. Créer des index optimisés pour les requêtes fréquentes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_created_at_active 
ON posts(created_at DESC) WHERE is_active = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_user_id_active 
ON posts(user_id, created_at DESC) WHERE is_active = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_tags_gin 
ON posts USING GIN(tags) WHERE is_active = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_visibility_created 
ON posts(visibility, created_at DESC) WHERE is_active = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_plan_active 
ON profiles(plan, created_at DESC) WHERE is_suspended = false;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_interests_gin 
ON profiles USING GIN(interests);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_likes_user_post 
ON likes(user_id, post_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_sender_receiver 
ON messages(sender_id, receiver_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_receiver_unread 
ON messages(receiver_id, created_at DESC) WHERE read_at IS NULL;

-- 2. Index partiels pour les requêtes spécifiques
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_premium_recent 
ON posts(created_at DESC) WHERE is_premium = true AND is_active = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_media_recent 
ON posts(created_at DESC) WHERE jsonb_array_length(media) > 0 AND is_active = true;

-- 3. Statistiques des tables pour l'optimiseur de requêtes
ANALYZE profiles;
ANALYZE posts;
ANALYZE likes;
ANALYZE messages;
ANALYZE comments;

-- 4. Fonction pour nettoyer les données anciennes (maintenance)
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void AS $$
BEGIN
  -- Supprimer les posts inactifs de plus de 30 jours
  DELETE FROM posts 
  WHERE is_active = false 
  AND created_at < NOW() - INTERVAL '30 days';
  
  -- Supprimer les messages lus de plus de 1 an
  DELETE FROM messages 
  WHERE read_at IS NOT NULL 
  AND created_at < NOW() - INTERVAL '1 year';
  
  -- Supprimer les sessions expirées
  DELETE FROM auth.sessions 
  WHERE expires_at < NOW();
  
  -- Mettre à jour les statistiques
  ANALYZE profiles;
  ANALYZE posts;
  ANALYZE messages;
END;
$$ LANGUAGE plpgsql;

-- 5. Fonction pour obtenir les statistiques de performance
CREATE OR REPLACE FUNCTION get_performance_stats()
RETURNS TABLE(
  table_name text,
  row_count bigint,
  table_size text,
  index_size text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    schemaname||'.'||tablename as table_name,
    n_tup_ins - n_tup_del as row_count,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as table_size,
    pg_size_pretty(pg_indexes_size(schemaname||'.'||tablename)) as index_size
  FROM pg_stat_user_tables 
  WHERE schemaname = 'public'
  ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
END;
$$ LANGUAGE plpgsql;

-- 6. Optimisation des politiques RLS existantes
-- Supprimer les politiques redondantes
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Posts are publicly viewable" ON posts;

-- Créer des politiques optimisées
CREATE POLICY "profiles_select_optimized" ON profiles
  FOR SELECT USING (
    -- Les utilisateurs peuvent voir tous les profils non suspendus
    is_suspended = false
  );

CREATE POLICY "posts_select_optimized" ON posts
  FOR SELECT USING (
    -- Les posts publics et actifs sont visibles par tous
    (visibility = 'public' AND is_active = true)
    OR
    -- Les posts d'amis sont visibles par les amis
    (visibility = 'friends' AND is_active = true AND user_id IN (
      SELECT friend_id FROM friendships WHERE user_id = auth.uid() AND status = 'accepted'
    ))
    OR
    -- Les utilisateurs peuvent voir leurs propres posts
    (user_id = auth.uid())
  );

-- 7. Créer une vue matérialisée pour les statistiques fréquemment consultées
CREATE MATERIALIZED VIEW IF NOT EXISTS user_stats AS
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.plan,
  p.created_at,
  COUNT(DISTINCT po.id) as posts_count,
  COUNT(DISTINCT l.id) as likes_received,
  COUNT(DISTINCT m.id) as messages_sent,
  COUNT(DISTINCT m2.id) as messages_received
FROM profiles p
LEFT JOIN posts po ON p.id = po.user_id AND po.is_active = true
LEFT JOIN likes l ON po.id = l.post_id
LEFT JOIN messages m ON p.id = m.sender_id
LEFT JOIN messages m2 ON p.id = m2.receiver_id
WHERE p.is_suspended = false
GROUP BY p.id, p.email, p.full_name, p.plan, p.created_at;

-- Index sur la vue matérialisée
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_stats_id ON user_stats(id);
CREATE INDEX IF NOT EXISTS idx_user_stats_plan ON user_stats(plan);
CREATE INDEX IF NOT EXISTS idx_user_stats_posts_count ON user_stats(posts_count DESC);

-- Fonction pour rafraîchir la vue matérialisée
CREATE OR REPLACE FUNCTION refresh_user_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY user_stats;
END;
$$ LANGUAGE plpgsql;

-- 8. Configuration des paramètres de performance
-- Augmenter la mémoire partagée pour les requêtes complexes
-- (Ces paramètres nécessitent un redémarrage de la base de données)
-- ALTER SYSTEM SET shared_buffers = '256MB';
-- ALTER SYSTEM SET effective_cache_size = '1GB';
-- ALTER SYSTEM SET work_mem = '4MB';
-- ALTER SYSTEM SET maintenance_work_mem = '64MB';

-- 9. Créer un job de maintenance automatique (si pg_cron est disponible)
-- SELECT cron.schedule('cleanup-old-data', '0 2 * * *', 'SELECT cleanup_old_data();');
-- SELECT cron.schedule('refresh-user-stats', '0 */6 * * *', 'SELECT refresh_user_stats();');

COMMENT ON FUNCTION cleanup_old_data() IS 'Nettoie les données anciennes pour optimiser les performances';
COMMENT ON FUNCTION get_performance_stats() IS 'Retourne les statistiques de performance des tables';
COMMENT ON FUNCTION refresh_user_stats() IS 'Rafraîchit la vue matérialisée des statistiques utilisateurs';
COMMENT ON MATERIALIZED VIEW user_stats IS 'Vue matérialisée des statistiques utilisateurs pour des requêtes rapides';
