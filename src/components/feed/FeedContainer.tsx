/**
 * Conteneur principal du feed
 * Gère le chargement, la pagination et l'affichage des posts
 */

import { useState, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';
import { RefreshCw, AlertCircle, Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PostCard } from './PostCard';
import { FiltersBar } from './FiltersBar';
import { CreatePostModal } from './CreatePostModal';
import { useFeed } from '@/hooks/useFeed';
import type { FeedFilters } from '@/types/feed';

const FeedContainer = () => {
  const [filters, setFilters] = useState<FeedFilters>({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { ref: loadMoreRef, inView } = useInView();

  const {
    posts,
    loading,
    loadingMore,
    hasMore,
    error,
    loadMore,
    refresh,
    createPost
  } = useFeed({ filters });

  // Charger plus de posts quand l'utilisateur atteint le bas
  const handleLoadMore = useCallback(() => {
    if (inView && hasMore && !loadingMore) {
      loadMore();
    }
  }, [inView, hasMore, loadingMore, loadMore]);

  // Mettre à jour les filtres
  const handleFiltersChange = useCallback((newFilters: FeedFilters) => {
    setFilters(newFilters);
  }, []);

  // Créer un nouveau post
  const handleCreatePost = useCallback(async (postData: any) => {
    try {
      await createPost(postData);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating post:', error);
    }
  }, [createPost]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8 px-4">
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2">
              <div className="heart-logo">
                <div className="heart-shape animate-pulse" />
              </div>
              <span className="text-lg">Chargement du feed...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8 px-4">
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Erreur de chargement</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={refresh} className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Réessayer
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header avec bouton de création */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Fil d'actualité</h1>
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nouveau post
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-6 px-4">
        {/* Filtres */}
        <div className="mb-6">
          <FiltersBar 
            filters={filters}
            onFiltersChange={handleFiltersChange}
          />
        </div>

        {/* Posts */}
        <div className="space-y-6">
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Aucun post trouvé</h3>
              <p className="text-muted-foreground mb-4">
                {Object.keys(filters).length > 0 
                  ? "Aucun post ne correspond à vos filtres."
                  : "Soyez le premier à publier quelque chose !"
                }
              </p>
              <Button onClick={() => setShowCreateModal(true)}>
                Créer un post
              </Button>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard 
                key={post.id} 
                post={post}
                onLike={() => {/* Géré par le hook */}}
                onComment={() => {/* TODO: Implémenter */}}
                onShare={() => {/* TODO: Implémenter */}}
              />
            ))
          )}

          {/* Load more trigger */}
          {hasMore && (
            <div ref={loadMoreRef} className="flex justify-center py-4">
              {loadingMore ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Chargement...</span>
                </div>
              ) : (
                <Button variant="outline" onClick={loadMore}>
                  Charger plus
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de création de post */}
      <CreatePostModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSubmit={handleCreatePost}
      />
    </div>
  );
};

export default FeedContainer;
