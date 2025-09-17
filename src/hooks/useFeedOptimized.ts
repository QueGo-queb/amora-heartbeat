/**
 * ✅ HOOK FEED ULTRA-OPTIMISÉ avec cache intelligent et performance
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { CacheService } from '@/lib/cache';
import { logger } from '@/lib/logger';
import type { FeedPost, FeedFilters } from '../../types/feed';
import { useDatabaseMonitor } from '@/lib/databaseMonitor';

interface UseFeedOptimizedOptions {
  filters?: FeedFilters;
  pageSize?: number;
  autoRefresh?: boolean;
  enableCache?: boolean;
  cacheTTL?: number; // en secondes
}

export function useFeedOptimized(options: UseFeedOptimizedOptions = {}) {
  const {
    filters = {},
    pageSize = 10,
    autoRefresh = true,
    enableCache = true,
    cacheTTL = 300 // 5 minutes par défaut
  } = options;

  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const { toast } = useToast();
  const { user } = useAuth();
  
  // ✅ OPTIMISÉ: Ref pour éviter les re-renders inutiles
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastFetchTimeRef = useRef<number>(0);
  const cacheKeyRef = useRef<string>('');

  // ✅ OPTIMISÉ: useMemo pour la clé de cache
  const cacheKey = useMemo(() => {
    const filtersStr = JSON.stringify(filters);
    const userStr = user?.id || 'anonymous';
    return `feed:${userStr}:${filtersStr}:${pageSize}`;
  }, [filters, user?.id, pageSize]);

  // ✅ OPTIMISÉ: Fonction de scoring mémorisée
  const calculatePostScore = useCallback((post: FeedPost): number => {
    let score = 0;
    
    // Score de base par récence
    const hoursSinceCreation = (Date.now() - new Date(post.created_at).getTime()) / (1000 * 60 * 60);
    score += Math.max(0, 100 - hoursSinceCreation * 2);
    
    // Bonus pour les posts premium
    if (post.is_premium) score += 50;
    
    // Bonus pour l'engagement
    score += post.likes_count * 2;
    score += post.comments_count * 3;
    
    // Bonus pour les médias
    if (post.media && post.media.length > 0) score += 20;
    
    return score;
  }, []);

  // ✅ OPTIMISÉ: Fonction de chargement avec monitoring DB
  const loadPosts = useCallback(async (isLoadMore: boolean = false) => {
    // Éviter les requêtes trop fréquentes (debouncing)
    const now = Date.now();
    if (now - lastFetchTimeRef.current < 1000) {
      logger.log('⏱️ Debouncing: requête trop récente');
      return;
    }
    lastFetchTimeRef.current = now;

    // Annuler la requête précédente si elle existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setError(null);
      }

      // ✅ OPTIMISÉ: Vérifier le cache d'abord
      if (enableCache && !isLoadMore) {
        const cachedData = await CacheService.get<{
          posts: FeedPost[];
          nextCursor: string | null;
          hasMore: boolean;
        }>(cacheKey);

        if (cachedData) {
          logger.log('�� Cache hit pour le feed');
          setPosts(cachedData.posts);
          setNextCursor(cachedData.nextCursor);
          setHasMore(cachedData.hasMore);
          setLoading(false);
          return;
        }
      }

      // ✅ OPTIMISÉ: Mesurer les performances de la requête
      const queryResult = await measureQuery('feed_load_posts', async () => {
        // Construire la requête
        let query = supabase
          .from('posts')
          .select(`
            *,
            profiles:profiles(*)
          `)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(pageSize + 1);

        // Appliquer les filtres
        if (filters.tags && filters.tags.length > 0) {
          query = query.overlaps('tags', filters.tags);
        }

        if (filters.userId) {
          query = query.eq('user_id', filters.userId);
        }

        if (filters.dateFrom) {
          query = query.gte('created_at', filters.dateFrom);
        }

        if (filters.dateTo) {
          query = query.lte('created_at', filters.dateTo);
        }

        // Pagination
        if (isLoadMore && nextCursor) {
          query = query.lt('created_at', nextCursor);
        }

        const { data, error: queryError } = await query;

        if (queryError) {
          throw queryError;
        }

        if (!data) {
          throw new Error('Aucune donnée reçue');
        }

        return data;
      });

      // Traiter les données
      const allPosts = queryResult as FeedPost[];
      const hasMoreData = allPosts.length > pageSize;
      const postsToShow = hasMoreData ? allPosts.slice(0, pageSize) : allPosts;

      // Calculer les scores et trier
      const scoredPosts = postsToShow.map(post => ({
        ...post,
        relevance_score: calculatePostScore(post)
      })).sort((a, b) => b.relevance_score - a.relevance_score);

      // Mettre à jour l'état
      if (isLoadMore) {
        setPosts(prev => [...prev, ...scoredPosts]);
      } else {
        setPosts(scoredPosts);
      }

      setNextCursor(hasMoreData ? postsToShow[postsToShow.length - 1]?.created_at : null);
      setHasMore(hasMoreData);

      // ✅ OPTIMISÉ: Mettre en cache les résultats
      if (enableCache && !isLoadMore) {
        await CacheService.set(cacheKey, {
          posts: scoredPosts,
          nextCursor: hasMoreData ? postsToShow[postsToShow.length - 1]?.created_at : null,
          hasMore: hasMoreData
        }, cacheTTL);
      }

      logger.log(`�� Feed chargé: ${scoredPosts.length} posts, hasMore: ${hasMoreData}`);

    } catch (error: any) {
      if (error.name === 'AbortError') {
        logger.log('🚫 Requête annulée');
        return;
      }

      logger.error('❌ Erreur chargement feed:', error);
      setError('Erreur lors du chargement du feed');
      
      toast({
        title: "Erreur",
        description: "Impossible de charger le feed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filters, pageSize, nextCursor, user, cacheKey, enableCache, cacheTTL, calculatePostScore, toast, measureQuery]);

  // ✅ OPTIMISÉ: Fonction de refresh avec invalidation du cache
  const refresh = useCallback(async () => {
    if (enableCache) {
      await CacheService.delete(cacheKey);
    }
    await loadPosts(false);
  }, [loadPosts, cacheKey, enableCache]);

  // ✅ OPTIMISÉ: Fonction de like optimisée
  const toggleLike = useCallback(async (postId: string) => {
    if (!user) return;

    try {
      // Optimistic update
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              likes_count: post.likes_count + (post.is_liked ? -1 : 1),
              is_liked: !post.is_liked 
            }
          : post
      ));

      // Requête API
      const { error } = await supabase
        .from('likes')
        .upsert({
          user_id: user.id,
          post_id: postId
        });

      if (error) {
        // Rollback en cas d'erreur
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                likes_count: post.likes_count + (post.is_liked ? 1 : -1),
                is_liked: !post.is_liked 
              }
            : post
        ));
        throw error;
      }

      // Invalider le cache
      if (enableCache) {
        await CacheService.delete(cacheKey);
      }

    } catch (error) {
      logger.error('❌ Erreur toggle like:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le like",
        variant: "destructive",
      });
    }
  }, [user, cacheKey, enableCache, toast]);

  // ✅ OPTIMISÉ: Chargement initial
  useEffect(() => {
    loadPosts(false);
  }, [loadPosts]);

  // ✅ OPTIMISÉ: Nettoyage à la destruction
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // ✅ OPTIMISÉ: Valeurs mémorisées
  const feedState = useMemo(() => ({
    posts,
    loading,
    loadingMore,
    hasMore,
    error,
    isEmpty: !loading && posts.length === 0
  }), [posts, loading, loadingMore, hasMore, error]);

  return {
    ...feedState,
    loadMore: () => loadPosts(true),
    refresh,
    toggleLike
  };
}
