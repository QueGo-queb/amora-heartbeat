/**
 * Hook pour récupérer les posts de l'utilisateur connecté (Mes publications)
 * Utilise le nouveau système de médias avec fallback
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { FeedPost, FeedFilters } from '../../types/feed';
import { useAuth } from '@/hooks/useAuth';
import { getPostMedia } from '../../utils/mediaUtils';

interface UseMyPostsOptions {
  filters?: FeedFilters;
  pageSize?: number;
  autoRefresh?: boolean;
}

export function useMyPosts(options: UseMyPostsOptions = {}) {
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

  // Utiliser useRef pour les valeurs stables
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
    score += (post.likes_count || 0) * 2;
    score += (post.comments_count || 0) * 3;
    
    // Bonus pour les médias
    if (post.media && post.media.length > 0) score += 20;
    
    return score;
  };

  // Charger les posts de l'utilisateur
  const loadPosts = useCallback(async (cursor?: string, append = false) => {
    try {
      setError(null);
      if (!cursor) setLoading(true);
      if (cursor) setLoadingMore(true);

      if (!userRef.current?.id) {
        throw new Error('Utilisateur non connecté');
      }

      // ✅ Requête pour récupérer SEULEMENT les posts de l'utilisateur connecté
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
        .eq('user_id', userRef.current.id) // ✅ SEULEMENT les posts de l'utilisateur connecté
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

      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error('Erreur lors du chargement de mes posts:', fetchError);
        throw fetchError;
      }

      // Transformer les données avec le nouveau système de médias
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
      } else {
        setNextCursor(null);
        setHasMore(false);
      }

    } catch (err: any) {
      console.error('Erreur dans loadPosts:', err);
      setError(err.message || 'Erreur lors du chargement des posts');
      toast({
        title: 'Erreur',
        description: err.message || 'Impossible de charger vos posts',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [toast]);

  // Charger plus de posts (pagination)
  const loadMore = useCallback(() => {
    if (hasMore && !loadingMore && nextCursor) {
      loadPosts(nextCursor, true);
    }
  }, [hasMore, loadingMore, nextCursor, loadPosts]);

  // Rafraîchir les posts
  const refresh = useCallback(() => {
    setPosts([]);
    setNextCursor(null);
    setHasMore(true);
    loadPosts();
  }, [loadPosts]);

  // Charger les posts au montage
  useEffect(() => {
    if (userRef.current?.id) {
      loadPosts();
    }
  }, [loadPosts]);

  // Auto-refresh si activé
  useEffect(() => {
    if (!autoRefresh || !userRef.current?.id) return;

    const interval = setInterval(() => {
      // Vérifier s'il y a de nouveaux posts
      refresh();
    }, 30000); // Rafraîchir toutes les 30 secondes

    return () => clearInterval(interval);
  }, [autoRefresh, refresh]);

  return {
    posts,
    loading,
    loadingMore,
    hasMore,
    error,
    loadMore,
    refresh,
    // Statistiques
    totalPosts: posts.length,
    hasPosts: posts.length > 0
  };
}