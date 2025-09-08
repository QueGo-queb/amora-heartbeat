import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { FeedCacheService } from '@/lib/feedCache';
import { CacheService } from '@/lib/cache';
import { supabase } from '@/integrations/supabase/client';
import type { FeedPost, FeedFilters, FeedResponse } from '../../types/feed';

interface UseFeedOptions {
  pageSize?: number;
  useCache?: boolean;
  cacheFirst?: boolean;
}

export function useFeedCached(options: UseFeedOptions = {}) {
  const {
    pageSize = 10,
    useCache = true,
    cacheFirst = true
  } = options;

  const { user } = useAuth();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const loadPosts = useCallback(async (cursor?: string, append = false) => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      // Si cache-first et premier chargement, essayer le cache
      if (useCache && cacheFirst && !cursor && !append) {
        const cachedPosts = await FeedCacheService.getUserFeed(user.id);
        
        if (cachedPosts && cachedPosts.length > 0) {
          setPosts(cachedPosts);
          setLoading(false);
          return;
        }
        }

      // Charger depuis la base de données
      const { data, error: fetchError } = await supabase.rpc('get_feed_posts_optimized', {
        user_id: user?.id || '',
        page_size: pageSize,
        cursor_date: cursor || null,
        user_filters: {}
      });

      if (fetchError) throw fetchError;

      const newPosts = data || [];
      
      if (append) {
        setPosts(prev => [...prev, ...newPosts]);
      } else {
        setPosts(newPosts);
        
        // Mettre en cache si premier chargement
        if (useCache && !cursor && newPosts.length > 0) {
          await FeedCacheService.setUserFeed(user.id, newPosts);
          }
      }

      setHasMore(newPosts.length === pageSize);

    } catch (err) {
      console.error('Error loading feed:', err);
      setError('Erreur lors du chargement du feed');
    } finally {
      setLoading(false);
    }
  }, [user?.id, pageSize, useCache, cacheFirst]);

  const refreshFeed = useCallback(async () => {
    if (user?.id && useCache) {
      // Invalidate cache and reload
      await FeedCacheService.invalidateUserFeed(user.id);
    }
    await loadPosts();
  }, [user?.id, useCache, loadPosts]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    
    const lastPost = posts[posts.length - 1];
    if (lastPost) {
      await loadPosts(lastPost.created_at, true);
    }
  }, [posts, hasMore, loading, loadPosts]);

  // Chargement initial
  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  return {
    posts,
    loading,
    error,
    hasMore,
    loadMore,
    refreshFeed,
    invalidateCache: () => user?.id && FeedCacheService.invalidateUserFeed(user.id)
  };
}
