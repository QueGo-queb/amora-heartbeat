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

      const transformedPosts = data?.map(post => ({
        id: post.id,
        content: post.content,
        created_at: post.created_at,
        user: {
          id: post.user_id,
          full_name: post.user_full_name,
          avatar_url: post.user_avatar_url
        },
        likes_count: post.likes_count,
        comments_count: post.comments_count
      })) || [];

      if (append && cursor) {
        setPosts(prev => [...prev, ...transformedPosts]);
      } else {
        setPosts(transformedPosts);
      }

      setHasMore(transformedPosts.length === pageSize);

      // Mettre en cache si activé
      if (useCache && !cursor && !append) {
        await FeedCacheService.setUserFeed(user.id, transformedPosts);
      }

    } catch (err) {
      console.error('Erreur chargement feed:', err);
      setError('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, [user?.id, pageSize, useCache, cacheFirst]);

  const refresh = useCallback(async () => {
    setPosts([]);
    setHasMore(true);
    await loadPosts();
  }, []); // ✅ Retirer loadPosts des dépendances

  // ✅ SOLUTION BOUCLE INFINIE - loadMore stable
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const lastPost = posts[posts.length - 1];
      if (lastPost) {
        loadPosts(lastPost.created_at, true);
      }
    }
  }, [loading, hasMore, posts]); // ✅ PAS de loadPosts dans les dépendances

  // ✅ SOLUTION BOUCLE INFINIE - useEffect stable
  useEffect(() => {
    if (loading || !hasMore) return;
    if (posts.length === 0) return; // Éviter le chargement initial en boucle
    
    // Charger plus de posts
    loadPosts();
  }, [loading, hasMore, posts]); // ✅ PAS de loadPosts dans les dépendances

  return {
    posts,
    loading,
    error,
    hasMore,
    refresh,
    loadMore
  };
}
