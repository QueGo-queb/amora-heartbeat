/**
 * Hook pour gérer le feed avec scoring et pagination
 * Gère le chargement, le filtrage et la pagination des posts
 * ✅ CORRIGÉ: Utilise le nouveau système de médias avec fallback
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { FeedPost, FeedFilters, FeedResponse } from '../../types/feed';
import { useAuth } from '@/hooks/useAuth';
import { getPostMedia } from '../../utils/mediaUtils';

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
  const { user } = useAuth();

  // ✅ SOLUTION BOUCLE INFINIE #2 - Utiliser useRef pour les valeurs stables
  const filtersRef = useRef(filters);
  const pageSizeRef = useRef(pageSize);
  const userRef = useRef(user);

  // Mettre à jour les refs quand nécessaire
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  useEffect(() => {
    pageSizeRef.current = pageSize;
  }, [pageSize]);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

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

  // ✅ SOLUTION BOUCLE INFINIE #2 - loadPosts stable avec nouveau système de médias
  const loadPosts = useCallback(async (cursor?: string, append = false) => {
    try {
      setError(null);
      if (!cursor) setLoading(true);
      if (cursor) setLoadingMore(true);

      // ✅ CORRIGÉ: Requête directe avec exclusion des posts de l'utilisateur connecté
      let query = supabase
        .from('posts')
        .select(`
          *,
          profiles (
            id,
            full_name,
            avatar_url,
            interests,
            plan
          )
        `)
        .neq('user_id', userRef.current?.id || '') // ✅ EXCLURE LES POSTS DE L'UTILISATEUR CONNECTÉ
        .eq('visibility', 'public') // Seulement les posts publics
        .order('created_at', { ascending: false })
        .limit(pageSizeRef.current);

      // Pagination par date
      if (cursor) {
        query = query.lt('created_at', cursor);
      }

      // Filtres optionnels
      if (filtersRef.current.media_type && filtersRef.current.media_type !== 'all') {
        // Pour l'instant, on ne peut pas filtrer par type de média facilement
        // car on utilise le fallback. On pourrait améliorer cela plus tard.
      }

      if (filtersRef.current.premium_only) {
        query = query.eq('profiles.plan', 'premium');
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error('Erreur lors du chargement du feed:', fetchError);
        throw fetchError;
      }

      // ✅ CORRIGÉ: Transformer les données avec le nouveau système de médias
      const transformedPosts: FeedPost[] = data?.map(post => {
        const media = getPostMedia(post); // Utilise le fallback automatique
        
        return {
          id: post.id,
          content: post.content,
          user_id: post.user_id,
          created_at: post.created_at,
          updated_at: post.updated_at,
          likes_count: post.likes_count || 0,
          comments_count: post.comments_count || 0,
          visibility: (post.visibility as 'public' | 'private' | 'friends') || 'public',
          
          // ✅ NOUVEAU: Système unifié de médias
          media,
          
          // ✅ ANCIEN: Colonnes de fallback (pour compatibilité)
          image_url: (post as any).image_url,
          video_url: (post as any).video_url,
          media_urls: (post as any).media_urls,
          media_types: (post as any).media_types,
          
          // Informations de l'auteur
          profiles: (post as any).profiles ? {
            id: (post as any).profiles.id,
            full_name: (post as any).profiles.full_name,
            avatar_url: (post as any).profiles.avatar_url,
            interests: (post as any).profiles.interests || [],
            is_premium: (post as any).profiles.plan === 'premium'
          } : undefined,
          
          // Alias pour compatibilité
          user: (post as any).profiles ? {
            id: (post as any).profiles.id,
            full_name: (post as any).profiles.full_name,
            avatar_url: (post as any).profiles.avatar_url,
            is_premium: (post as any).profiles.plan === 'premium'
          } : undefined,
          
          // État du post
          is_premium: (post as any).profiles?.plan === 'premium',
          is_liked: false, // TODO: Récupérer depuis l'API
          score: calculatePostScore({
            id: post.id,
            content: post.content,
            created_at: post.created_at,
            is_premium: (post as any).profiles?.plan === 'premium',
            likes_count: post.likes_count || 0,
            comments_count: post.comments_count || 0,
            media
          })
        };
      }) || [];

      // Trier par score si demandé
      if (filtersRef.current.sort_by === 'popular') {
        transformedPosts.sort((a, b) => (b.score || 0) - (a.score || 0));
      }

      // Mettre à jour l'état
      if (append && cursor) {
        setPosts(prev => [...prev, ...transformedPosts]);
      } else {
        setPosts(transformedPosts);
      }

      // Gérer la pagination
      setHasMore(transformedPosts.length === pageSizeRef.current);
      if (transformedPosts.length > 0) {
        setNextCursor(transformedPosts[transformedPosts.length - 1].created_at);
      }

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
  }, [toast]); // ✅ Seulement toast dans les dépendances

  // ✅ SOLUTION BOUCLE INFINIE - loadMore stable
  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore && nextCursor) {
      loadPosts(nextCursor, true);
    }
  }, [loadingMore, hasMore, nextCursor]); // ✅ PAS de loadPosts dans les dépendances

  // ✅ SOLUTION BOUCLE INFINIE - useEffect stable
  useEffect(() => {
    if (loadingMore || !hasMore || !nextCursor) return;
    loadPosts(nextCursor, true);
  }, [loadingMore, hasMore, nextCursor]); // ✅ PAS de loadPosts dans les dépendances

  // ✅ SOLUTION BOUCLE INFINIE - refresh stable
  const refresh = useCallback(() => {
    setPosts([]);
    setNextCursor(null);
    setHasMore(true);
    loadPosts();
  }, []); // ✅ Retirer loadPosts des dépendances

  // ✅ SOLUTION BOUCLE INFINIE #1 - toggleLike stable
  const toggleLike = useCallback(async (postId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      // ✅ Utiliser une fonction de callback stable
      setPosts(prev => {
        const post = prev.find(p => p.id === postId);
        if (!post) return prev;

        if (post.is_liked) {
          // Unlike - effectuer l'action en base
          supabase
            .from('post_likes')
            .delete()
            .eq('post_id', postId)
            .eq('user_id', user.id)
            .then(({ error }) => {
              if (error) {
                console.error('Error removing like:', error);
                toast({
                  title: "Erreur",
                  description: "Impossible de supprimer le like",
                  variant: "destructive",
                });
              }
            });

          return prev.map(p => 
            p.id === postId 
              ? { ...p, is_liked: false, likes_count: p.likes_count - 1 }
              : p
          );
        } else {
          // Like - effectuer l'action en base
          supabase
            .from('post_likes')
            .insert({ post_id: postId, user_id: user.id })
            .then(({ error }) => {
              if (error) {
                console.error('Error adding like:', error);
                toast({
                  title: "Erreur",
                  description: "Impossible d'ajouter le like",
                  variant: "destructive",
                });
              }
            });

          return prev.map(p => 
            p.id === postId 
              ? { ...p, is_liked: true, likes_count: p.likes_count + 1 }
              : p
          );
        }
      });
    } catch (err) {
      console.error('Error toggling like:', err);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le like",
        variant: "destructive",
      });
    }
  }, [toast]); // ✅ Seulement toast dans les dépendances

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

  // ✅ SOLUTION BOUCLE INFINIE - useEffect stable
  useEffect(() => {
    if (user?.id) {
      loadPosts();
    }
  }, []); // ✅ Se déclenche une seule fois

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
