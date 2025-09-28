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
        console.log('🔄 Utilisateur pas encore chargé, attente...');
        setLoading(false);
        return; // ✅ Ne pas lancer d'erreur
      }

      // ✅ CORRECTION: Requête sans relation, puis récupération séparée des profils
      let query = supabase
        .from('posts')
        .select(`
          id,
          user_id,
          content,
          created_at,
          updated_at,
          image_url,
          video_url,
          media,
          tags,
          visibility,
          likes_count,
          comments_count,
          post_type,
          phone_number,
          target_countries,
          target_genders,
          target_interests
        `)
        .eq('user_id', userRef.current.id)
        .order('created_at', { ascending: false })
        .limit(pageSizeRef.current);

      // Pagination par date
      if (cursor) {
        query = query.lt('created_at', cursor);
      }

      const { data: postsData, error: fetchError } = await query;

      if (fetchError) {
        console.error('Erreur lors du chargement de mes posts:', fetchError);
        throw fetchError;
      }

      if (!postsData || postsData.length === 0) {
        console.log('📭 Aucun post trouvé pour cet utilisateur');
        setPosts([]);
        setHasMore(false);
        setNextCursor(null);
        return;
      }

      // ✅ RÉCUPÉRER LE PROFIL DE L'UTILISATEUR SÉPARÉMENT
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          avatar_url,
          interests,
          plan,
          user_id
        `)
        .eq('user_id', userRef.current.id)
        .single();

      // ✅ TRANSFORMER LES DONNÉES AVEC LE NOUVEAU SYSTÈME DE MÉDIAS
      const transformedPosts: FeedPost[] = postsData.map(post => {
        const media = getPostMedia(post);
        
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
          image_url: post.image_url,
          video_url: post.video_url,
          media_urls: post.media_urls,
          media_types: post.media_types,
          
          // Informations de l'auteur (l'utilisateur connecté)
          profiles: profileData ? {
            id: profileData.id,
            full_name: profileData.full_name,
            avatar_url: profileData.avatar_url,
            interests: profileData.interests || [],
            is_premium: profileData.plan === 'premium'
          } : {
            id: userRef.current.id,
            full_name: 'Utilisateur',
            avatar_url: null,
            interests: [],
            is_premium: false
          },
          
          // Alias pour compatibilité
          user: profileData ? {
            id: profileData.id,
            full_name: profileData.full_name,
            avatar_url: profileData.avatar_url,
            is_premium: profileData.plan === 'premium'
          } : {
            id: userRef.current.id,
            full_name: 'Utilisateur',
            avatar_url: null,
            is_premium: false
          },
          
          // État du post
          is_premium: profileData?.plan === 'premium',
          is_liked: false, // TODO: Récupérer depuis l'API
          score: calculatePostScore({
            id: post.id,
            content: post.content,
            created_at: post.created_at,
            is_premium: profileData?.plan === 'premium',
            likes_count: post.likes_count || 0,
            comments_count: post.comments_count || 0,
            media
          })
        };
      });

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
  }, [hasMore, loadingMore, nextCursor]);

  // ✅ CORRECTION: Rendre refresh stable
  const refresh = useCallback(() => {
    setPosts([]);
    setNextCursor(null);
    setHasMore(true);
    loadPosts();
  }, []); // ✅ Dépendances vides pour stabilité

  // ✅ CORRECTION: Se déclencher seulement quand user change
  useEffect(() => {
    loadPosts();
  }, [user]); // ✅ Seulement user au lieu de loadPosts

  // Auto-refresh si activé - CORRECTION FINALE
  useEffect(() => {
    if (!autoRefresh || !userRef.current?.id) return;

    const interval = setInterval(() => {
      refresh();
    }, 30000);

    // ✅ AJOUT: Cleanup function
    return () => {
      clearInterval(interval);
    };
  }, [autoRefresh, refresh]); // ✅ Ajouter refresh dans les dépendances

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