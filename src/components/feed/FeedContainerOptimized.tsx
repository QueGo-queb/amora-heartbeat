/**
 * ✅ CONTENEUR FEED ULTRA-OPTIMISÉ avec lazy loading et cache
 */

import { useState, useEffect, useCallback, useMemo, Suspense, lazy } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useFeedOptimized } from '@/hooks/useFeedOptimized';
import { usePerformanceMonitor } from '@/lib/performanceMonitor';
import { useRateLimit, rateLimitConfigs } from '@/lib/rateLimiter';
import { OptimizedLoader } from '@/components/ui/optimized-loader';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';
import { logger } from '@/lib/logger';

// ✅ LAZY LOADING des composants lourds
const PostCreator = lazy(() => import('./PostCreator'));
const FriendsSuggestions = lazy(() => import('./FriendsSuggestions'));
const PostCard = lazy(() => import('./PostCard'));

const FeedContainerOptimized = () => {
  const { user, loading: authLoading } = useAuth();
  const { recordMetric, measureAsyncFunction } = usePerformanceMonitor();
  const { isAllowed: canCreatePost, waitTime: postWaitTime } = useRateLimit(rateLimitConfigs.post);
  
  // État local optimisé
  const [showPostCreator, setShowPostCreator] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<number>(0);

  // ✅ OPTIMISÉ: Hook feed avec cache intelligent
  const {
    posts,
    loading,
    loadingMore,
    hasMore,
    error,
    isEmpty,
    loadMore,
    refresh: refreshFeed
  } = useFeedOptimized({
    pageSize: 10,
    enableCache: true,
    cacheTTL: 300 // 5 minutes
  });

  // ✅ OPTIMISÉ: Fonction de refresh avec rate limiting
  const handleRefresh = useCallback(async () => {
    if (!canCreatePost) {
      logger.warn(`⏱️ Rate limit: attendez ${Math.ceil(postWaitTime / 1000)}s`);
      return;
    }

    await measureAsyncFunction('feed_refresh', async () => {
      await refreshFeed();
      setLastRefresh(Date.now());
      recordMetric('feed_refresh_success', Date.now());
    });
  }, [canCreatePost, postWaitTime, refreshFeed, measureAsyncFunction, recordMetric]);

  // ✅ OPTIMISÉ: Fonction de création de post
  const handleCreatePost = useCallback(() => {
    if (!canCreatePost) {
      logger.warn(`⏱️ Rate limit: attendez ${Math.ceil(postWaitTime / 1000)}s`);
      return;
    }

    setShowPostCreator(true);
    recordMetric('post_creator_opened', Date.now());
  }, [canCreatePost, postWaitTime, recordMetric]);

  // ✅ OPTIMISÉ: Fonction de chargement de plus de posts
  const handleLoadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    await measureAsyncFunction('feed_load_more', async () => {
      await loadMore();
      recordMetric('feed_load_more_success', Date.now());
    });
  }, [loadingMore, hasMore, loadMore, measureAsyncFunction, recordMetric]);

  // ✅ OPTIMISÉ: Valeurs mémorisées
  const feedStats = useMemo(() => ({
    totalPosts: posts.length,
    hasNewPosts: lastRefresh > 0 && posts.some(post => 
      new Date(post.created_at).getTime() > lastRefresh
    ),
    isEmpty: isEmpty && !loading
  }), [posts.length, lastRefresh, posts, isEmpty, loading]);

  // ✅ OPTIMISÉ: Chargement initial avec métriques
  useEffect(() => {
    recordMetric('feed_container_mount', Date.now());
    
    return () => {
      recordMetric('feed_container_unmount', Date.now());
    };
  }, [recordMetric]);

  // ✅ OPTIMISÉ: Gestion des erreurs
  if (error && !loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-red-600">Erreur de chargement</h3>
          <p className="text-sm text-muted-foreground mt-2">{error}</p>
        </div>
        <Button onClick={handleRefresh} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Header avec statistiques */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Feed</h1>
          <p className="text-sm text-muted-foreground">
            {feedStats.totalPosts} posts
            {feedStats.hasNewPosts && (
              <span className="ml-2 text-green-600">• Nouveau contenu</span>
            )}
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={!canCreatePost}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          
          <Button
            onClick={handleCreatePost}
            disabled={!canCreatePost || authLoading}
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Créer
          </Button>
        </div>
      </div>

      {/* Rate limit warning */}
      {!canCreatePost && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm text-yellow-800">
            ⏱️ Limite atteinte. Attendez {Math.ceil(postWaitTime / 1000)}s avant de créer un nouveau post.
          </p>
        </div>
      )}

      {/* Post Creator Modal */}
      {showPostCreator && (
        <Suspense fallback={<OptimizedLoader text="Chargement..." />}>
          <PostCreator
            onClose={() => setShowPostCreator(false)}
            onSuccess={() => {
              setShowPostCreator(false);
              handleRefresh();
            }}
          />
        </Suspense>
      )}

      {/* Friends Suggestions */}
      <Suspense fallback={<OptimizedLoader variant="dots" />}>
        <FriendsSuggestions />
      </Suspense>

      {/* Posts List */}
      <div className="space-y-4">
        {loading && posts.length === 0 ? (
          <div className="flex justify-center py-8">
            <OptimizedLoader variant="heart" text="Chargement du feed..." />
          </div>
        ) : feedStats.isEmpty ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-muted-foreground">
              Aucun post pour le moment
            </h3>
            <p className="text-sm text-muted-foreground mt-2">
              Soyez le premier à partager quelque chose !
            </p>
          </div>
        ) : (
          <>
            {posts.map((post) => (
              <Suspense key={post.id} fallback={<OptimizedLoader size="sm" />}>
                <PostCard post={post} />
              </Suspense>
            ))}

            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center pt-4">
                <Button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  variant="outline"
                >
                  {loadingMore ? (
                    <OptimizedLoader size="sm" />
                  ) : (
                    'Charger plus'
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FeedContainerOptimized;
