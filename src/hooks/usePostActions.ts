/**
 * ✅ Hook pour gérer les actions sur les posts (likes, partages, messages)
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface PostActionState {
  isLiked: boolean;
  isShared: boolean;
  likeCount: number;
  shareCount: number;
  isLoading: boolean;
}

export function usePostActions(postId: string, initialLikeCount = 0, initialShareCount = 0) {
  const [state, setState] = useState<PostActionState>({
    isLiked: false,
    isShared: false,
    likeCount: initialLikeCount,
    shareCount: initialShareCount,
    isLoading: false
  });

  const { user } = useAuth();
  const { toast } = useToast();

  // Vérifier l'état initial
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

        setState(prev => ({
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

  // Toggle like
  const toggleLike = async () => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour aimer un post.",
        variant: "destructive",
      });
      return;
    }

    if (state.isLoading) return;

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      if (state.isLiked) {
        // Unlike
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', postId);

        if (error) throw error;

        setState(prev => ({
          ...prev,
          isLiked: false,
          likeCount: Math.max(0, prev.likeCount - 1),
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

        setState(prev => ({
          ...prev,
          isLiked: true,
          likeCount: prev.likeCount + 1,
          isLoading: false
        }));
      }
    } catch (error) {
      console.error('Erreur lors du like:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      toast({
        title: "Erreur",
        description: "Impossible de modifier le like.",
        variant: "destructive",
      });
    }
  };

  // Toggle share
  const toggleShare = async () => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour partager un post.",
        variant: "destructive",
      });
      return;
    }

    if (state.isLoading) return;

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Copier le lien
      const postUrl = `${window.location.origin}/post/${postId}`;
      await navigator.clipboard.writeText(postUrl);

      // Enregistrer le partage si pas déjà fait
      if (!state.isShared) {
        const { error } = await supabase
          .from('post_shares')
          .insert({
            user_id: user.id,
            post_id: postId,
            share_type: 'link'
          });

        if (error) throw error;

        setState(prev => ({
          ...prev,
          isShared: true,
          shareCount: prev.shareCount + 1,
          isLoading: false
        }));
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }

      toast({
        title: "Post partagé !",
        description: "Le lien a été copié dans votre presse-papier.",
      });
    } catch (error) {
      console.error('Erreur lors du partage:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      toast({
        title: "Erreur",
        description: "Impossible de partager le post.",
        variant: "destructive",
      });
    }
  };

  return {
    ...state,
    toggleLike,
    toggleShare
  };
}
