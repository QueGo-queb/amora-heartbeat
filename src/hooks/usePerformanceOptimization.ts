/**
 * Hook pour optimiser les performances de l'application
 * Cache les requêtes, limite les re-renders, optimise les états
 */

import { useState, useCallback, useRef, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresIn: number;
}

interface PerformanceMetrics {
  queryCount: number;
  cacheHits: number;
  cacheMisses: number;
  averageQueryTime: number;
}

export const usePerformanceOptimization = () => {
  const cache = useRef<Map<string, CacheEntry<any>>>(new Map());
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    queryCount: 0,
    cacheHits: 0,
    cacheMisses: 0,
    averageQueryTime: 0
  });

  // Cache avec expiration
  const getCachedData = useCallback(<T>(key: string): T | null => {
    const entry = cache.current.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.expiresIn) {
      cache.current.delete(key);
      return null;
    }

    setMetrics(prev => ({ ...prev, cacheHits: prev.cacheHits + 1 }));
    return entry.data;
  }, []);

  const setCachedData = useCallback(<T>(key: string, data: T, expiresIn: number = 300000) => {
    cache.current.set(key, {
      data,
      timestamp: Date.now(),
      expiresIn
    });
  }, []);

  // Requête optimisée avec cache
  const optimizedQuery = useCallback(async <T>(
    queryKey: string,
    queryFn: () => Promise<T>,
    cacheTime: number = 300000
  ): Promise<T> => {
    const startTime = Date.now();

    // Vérifier le cache d'abord
    const cachedData = getCachedData<T>(queryKey);
    if (cachedData) {
      return cachedData;
    }

    setMetrics(prev => ({ ...prev, cacheMisses: prev.cacheMisses + 1 }));

    try {
      const data = await queryFn();
      const queryTime = Date.now() - startTime;

      // Mettre en cache
      setCachedData(queryKey, data, cacheTime);

      // Mettre à jour les métriques
      setMetrics(prev => ({
        ...prev,
        queryCount: prev.queryCount + 1,
        averageQueryTime: (prev.averageQueryTime * prev.queryCount + queryTime) / (prev.queryCount + 1)
      }));

      return data;
    } catch (error) {
      setMetrics(prev => ({ ...prev, queryCount: prev.queryCount + 1 }));
      throw error;
    }
  }, [getCachedData, setCachedData]);

  // Requêtes Supabase optimisées prêtes à l'emploi
  const queries = useMemo(() => ({
    // Utilisateurs avec cache long
    getUsers: () => optimizedQuery(
      'users-list',
      async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, email, full_name, plan, role, created_at')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data;
      },
      600000 // 10 minutes
    ),

    // Statistiques admin avec cache moyen
    getAdminStats: () => optimizedQuery(
      'admin-stats',
      async () => {
        const [
          { data: users },
          { data: posts },
          { data: transactions }
        ] = await Promise.all([
          supabase.from('profiles').select('plan, created_at'),
          supabase.from('posts').select('id, created_at'),
          supabase.from('transactions').select('amount_cents, created_at').eq('status', 'succeeded')
        ]);

        return {
          totalUsers: users?.length || 0,
          premiumUsers: users?.filter(u => u.plan === 'premium').length || 0,
          totalPosts: posts?.length || 0,
          totalRevenue: (transactions?.reduce((sum, t) => sum + (t.amount_cents || 0), 0) || 0) / 100
        };
      },
      300000 // 5 minutes
    ),

    // Posts du feed avec cache court
    getFeedPosts: (userId?: string) => optimizedQuery(
      `feed-posts-${userId || 'anonymous'}`,
      async () => {
        const { data, error } = await supabase
          .from('posts')
          .select(`
            id, content, created_at, likes_count, comments_count,
            profiles!inner (id, full_name, avatar_url)
          `)
          .order('created_at', { ascending: false })
          .limit(20);
        
        if (error) throw error;
        return data;
      },
      60000 // 1 minute
    ),

    // Footer content avec cache très long
    getFooterContent: () => optimizedQuery(
      'footer-content',
      async () => {
        const [
          { data: content },
          { data: links },
          { data: socials }
        ] = await Promise.all([
          supabase.from('footer_content').select('*').eq('is_active', true).single(),
          supabase.from('footer_links').select('*').eq('is_active', true).order('category, order_index'),
          supabase.from('footer_socials').select('*').eq('is_active', true).order('order_index')
        ]);

        return { content, links, socials };
      },
      1800000 // 30 minutes
    )
  }), [optimizedQuery]);

  // Nettoyage du cache
  const clearCache = useCallback((pattern?: string) => {
    if (pattern) {
      for (const key of cache.current.keys()) {
        if (key.includes(pattern)) {
          cache.current.delete(key);
        }
      }
    } else {
      cache.current.clear();
    }
  }, []);

  // Préchargement de données critiques
  const preloadCriticalData = useCallback(async () => {
    try {
      await Promise.all([
        queries.getFeedPosts(),
        queries.getFooterContent()
      ]);
      console.log('✅ Données critiques préchargées');
    } catch (error) {
      console.error('❌ Erreur préchargement:', error);
    }
  }, [queries]);

  return {
    queries,
    metrics,
    clearCache,
    preloadCriticalData,
    getCachedData,
    setCachedData
  };
};
