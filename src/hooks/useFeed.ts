/**
 * Hook pour gérer le feed avec scoring et pagination
 * Gère le chargement, le filtrage et la pagination des posts
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { FeedPost, FeedFilters, FeedResponse } from '@/types/feed';

interface UseFeedOptions {
  filters?: FeedFilters;
  pageSize?: number;
  autoRefresh?: boolean;
}

export function useFeed(options: UseFeedOptions = {}) {
  const {
    filters = {},
    pageSize = 10,
    autoRefresh = true
  } = options;

  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fonction de scoring pour trier les posts
  const calculatePostScore = (post: FeedPost): number => {
    let score = 0;
    
    // Score de base par récence (posts récents = plus de points)
    const hoursSinceCreation = (Date.now() - new Date(post.created_at).getTime()) / (1000 * 60 * 60);
    score += Math.max(0, 100 - hoursSinceCreation * 2);
    
    // Bonus pour les posts premium
    if (post.is_premium) score += 50;
    
    // Bonus pour l'engagement (likes, commentaires)
    score += post.likes_count * 2;
    score += post.comments_count * 3;
    
    // Bonus pour les médias
    if (post.media.length > 0) score += 20;
    
    return score;
  };

  // Charger les posts avec scoring
  const loadPosts = useCallback(async (cursor?: string, append = false) => {
    try {
      setError(null);
      if (!cursor) setLoading(true);
      if (cursor) setLoadingMore(true);

      // Préparer les filtres pour la fonction RPC
      const userFilters = {
        media_type: filters.media_type || 'all',
        premium_only: filters.premium_only ? 'true' : 'false',
        tags: filters.tags || []
      };

      console.log('🔄 Chargement du feed avec filtres:', userFilters);

      // Utiliser notre fonction RPC optimisée
      const { data, error: fetchError } = await supabase.rpc('get_feed_posts_optimized', {
        page_size: pageSize,
        cursor_date: cursor ? cursor : null,
        user_filters: userFilters
      });

      if (fetchError) {
        console.error('Erreur lors du chargement du feed:', fetchError);
        throw fetchError;
      }

      console.log('✅ Feed chargé:', data?.length, 'posts');

      // Transformer les données pour correspondre au format attendu
      const transformedPosts = data?.map(post => ({
        id: post.id,
        content: post.content,
        media_urls: post.media_urls || [],
        media_types: post.media_types || [],
        target_group: post.target_group,
        target_countries: post.target_countries || [],
        target_languages: post.target_languages || [],
        phone_number: post.phone_number,
        external_links: post.external_links || [],
        created_at: post.created_at,
        
        // Données utilisateur transformées
        user: {
          id: post.user_id,
          email: post.user_email,
          full_name: post.user_full_name,
          avatar_url: post.user_avatar_url,
          plan: post.user_plan,
          is_premium: post.user_plan === 'premium'
        },
        
        // Engagement
        likes_count: post.likes_count,
        comments_count: post.comments_count,
        user_has_liked: post.user_has_liked,
        
        // Calculer le score pour le tri
        score: calculatePostScore({
          created_at: post.created_at,
          is_premium: post.user_plan === 'premium',
          likes_count: post.likes_count,
          comments_count: post.comments_count,
          media: post.media_urls || []
        })
      })) || [];

      // Trier par score si demandé
      if (filters.sort_by === 'popular') {
        transformedPosts.sort((a, b) => b.score - a.score);
      }

      // Mettre à jour l'état
      if (append && cursor) {
        setPosts(prev => [...prev, ...transformedPosts]);
      } else {
        setPosts(transformedPosts);
      }

      // Gérer la pagination
      setHasMore(transformedPosts.length === pageSize);
      if (transformedPosts.length > 0) {
        setNextCursor(transformedPosts[transformedPosts.length - 1].created_at);
      }

      console.log('✅ Feed mis à jour avec', transformedPosts.length, 'posts');

    } catch (err) {
      console.error('Erreur lors du chargement du feed:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      toast({
        title: "Erreur",
        description: "Impossible de charger le feed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filters, pageSize, toast]);

  // Charger plus de posts (pagination)
  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore && nextCursor) {
      loadPosts(nextCursor, true);
    }
  }, [loadPosts, loadingMore, hasMore, nextCursor]);

  // Rafraîchir le feed
  const refresh = useCallback(() => {
    setPosts([]);
    setNextCursor(null);
    setHasMore(true);
    loadPosts();
  }, [loadPosts]);

  // Like/Unlike un post
  const toggleLike = useCallback(async (postId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      const post = posts.find(p => p.id === postId);
      if (!post) return;

      if (post.is_liked) {
        // Unlike
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        setPosts(prev => prev.map(p => 
          p.id === postId 
            ? { ...p, is_liked: false, likes_count: p.likes_count - 1 }
            : p
        ));
      } else {
        // Like
        await supabase
          .from('post_likes')
          .insert({ post_id: postId, user_id: user.id });

        setPosts(prev => prev.map(p => 
          p.id === postId 
            ? { ...p, is_liked: true, likes_count: p.likes_count + 1 }
            : p
        ));
      }
    } catch (err) {
      console.error('Error toggling like:', err);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le like",
        variant: "destructive",
      });
    }
  }, [posts, toast]);

  // Créer un nouveau post
  const createPost = useCallback(async (postData: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      const { data, error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          ...postData
        })
        .select()
        .single();

      if (error) throw error;

      // Ajouter le nouveau post au début du feed
      setPosts(prev => [data, ...prev]);

      toast({
        title: "Post créé",
        description: "Votre publication a été ajoutée au feed",
      });

      return data;
    } catch (err) {
      console.error('Error creating post:', err);
      toast({
        title: "Erreur",
        description: "Impossible de créer le post",
        variant: "destructive",
      });
      throw err;
    }
  }, [toast]);

  // Écouter les nouveaux posts en temps réel
  useEffect(() => {
    if (!autoRefresh) return;

    const channel = supabase
      .channel('feed_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'posts',
          filter: 'visibility=eq.public'
        },
        (payload) => {
          const newPost = payload.new as FeedPost;
          setPosts(prev => [newPost, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [autoRefresh]);

  // Charger les posts au montage et quand les filtres changent
  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  return {
    posts,
    loading,
    loadingMore,
    hasMore,
    error,
    loadMore,
    refresh,
    toggleLike,
    createPost
  };
}
