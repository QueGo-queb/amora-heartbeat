/**
 * ✅ Hook pour gérer les compteurs de posts en temps réel
 * Utilise Supabase Realtime pour synchroniser les compteurs entre tous les utilisateurs
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface PostCounters {
  likeCount: number;
  shareCount: number;
  commentCount: number;
  isLiked: boolean;
  isShared: boolean;
  isLoading: boolean;
}

interface UsePostCountersProps {
  postId: string;
  initialLikeCount?: number;
  initialShareCount?: number;
  initialCommentCount?: number;
}

export function usePostCounters({
  postId,
  initialLikeCount = 0,
  initialShareCount = 0,
  initialCommentCount = 0
}: UsePostCountersProps) {
  const [counters, setCounters] = useState<PostCounters>({
    likeCount: initialLikeCount,
    shareCount: initialShareCount,
    commentCount: initialCommentCount,
    isLiked: false,
    isShared: false,
    isLoading: false
  });

  const { user } = useAuth();

  // ✅ Vérifier l'état initial des likes et partages
  useEffect(() => {
    if (!user || !postId) return;

    const checkInitialState = async () => {
      try {
        // Vérifier les likes et partages en parallèle
        const [likeResult, shareResult] = await Promise.all([
          supabase
            .from('likes')
            .select('id')
            .eq('user_id', user.id)
            .eq('post_id', postId)
            .single(),
          supabase
            .from('post_shares')
            .select('id')
            .eq('user_id', user.id)
            .eq('post_id', postId)
            .single()
        ]);

        setCounters(prev => ({
          ...prev,
          isLiked: !!likeResult.data,
          isShared: !!shareResult.data
        }));
      } catch (error) {
        // Pas de like/partage existant, c'est normal
        console.log('État initial vérifié pour le post:', postId);
      }
    };

    checkInitialState();
  }, [user, postId]);

  // ✅ Mise à jour en temps réel des compteurs
  useEffect(() => {
    if (!postId) return;

    // Canal pour les likes
    const likesChannel = supabase
      .channel(`post-likes-${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'likes',
          filter: `post_id=eq.${postId}`
        },
        async () => {
          // Recalculer le nombre de likes
          const { count } = await supabase
            .from('likes')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', postId);

          setCounters(prev => ({
            ...prev,
            likeCount: count || 0
          }));
        }
      )
      .subscribe();

    // Canal pour les partages
    const sharesChannel = supabase
      .channel(`post-shares-${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'post_shares',
          filter: `post_id=eq.${postId}`
        },
        async () => {
          // Recalculer le nombre de partages
          const { count } = await supabase
            .from('post_shares')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', postId);

          setCounters(prev => ({
            ...prev,
            shareCount: count || 0
          }));
        }
      )
      .subscribe();

    // Canal pour les commentaires
    const commentsChannel = supabase
      .channel(`post-comments-${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${postId}`
        },
        async () => {
          // Recalculer le nombre de commentaires
          const { count } = await supabase
            .from('comments')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', postId);

          setCounters(prev => ({
            ...prev,
            commentCount: count || 0
          }));
        }
      )
      .subscribe();

    // Nettoyage des canaux
    return () => {
      supabase.removeChannel(likesChannel);
      supabase.removeChannel(sharesChannel);
      supabase.removeChannel(commentsChannel);
    };
  }, [postId]);

  // ✅ Toggle like
  const toggleLike = useCallback(async () => {
    if (!user) {
      throw new Error('Utilisateur non connecté');
    }

    if (counters.isLoading) return;

    setCounters(prev => ({ ...prev, isLoading: true }));

    try {
      if (counters.isLiked) {
        // Unlike
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', postId);

        if (error) throw error;

        setCounters(prev => ({
          ...prev,
          isLiked: false,
          isLoading: false
        }));
      } else {
        // Like
        const { error } = await supabase
          .from('likes')
          .insert({
            user_id: user.id,
            post_id: postId
          });

        if (error) throw error;

        setCounters(prev => ({
          ...prev,
          isLiked: true,
          isLoading: false
        }));
      }
    } catch (error) {
      console.error('Erreur lors du like:', error);
      setCounters(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, [user, postId, counters.isLiked, counters.isLoading]);

  // ✅ Toggle share
  const toggleShare = useCallback(async () => {
    if (!user) {
      throw new Error('Utilisateur non connecté');
    }

    if (counters.isLoading) return;

    setCounters(prev => ({ ...prev, isLoading: true }));

    try {
      // Copier le lien du post
      const postUrl = `${window.location.origin}/post/${postId}`;
      await navigator.clipboard.writeText(postUrl);

      // Enregistrer le partage si pas déjà fait
      if (!counters.isShared) {
        const { error } = await supabase
          .from('post_shares')
          .insert({
            user_id: user.id,
            post_id: postId,
            share_type: 'link'
          });

        if (error) throw error;

        setCounters(prev => ({
          ...prev,
          isShared: true,
          isLoading: false
        }));
      } else {
        setCounters(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Erreur lors du partage:', error);
      setCounters(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, [user, postId, counters.isShared, counters.isLoading]);

  return {
    ...counters,
    toggleLike,
    toggleShare
  };
}
