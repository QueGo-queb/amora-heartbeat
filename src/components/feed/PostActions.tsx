/**
 * ✅ Composant PostActions - Gestion des icônes ❤️ 💬
 * Logique complète pour likes et messages avec compteurs en temps réel
 */

import { useState, useEffect, useCallback } from 'react';
import { Heart, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { usePremium } from '@/hooks/usePremium';
import { usePremiumRestriction } from '@/hooks/usePremiumRestriction';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import type { FeedPost } from '../../../types/feed';

interface PostActionsProps {
  post: FeedPost;
  onLikeUpdate?: (postId: string, newLikeCount: number, isLiked: boolean) => void;
}

export function PostActions({ post, onLikeUpdate }: PostActionsProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes_count || 0);
  const [commentCount, setCommentCount] = useState(post.comments_count || 0);
  const [isLoading, setIsLoading] = useState(false);
  
  const { user } = useAuth();
  const { isPremium } = usePremium();
  const { checkPremiumFeature } = usePremiumRestriction();
  const { toast } = useToast();

  // ✅ Vérifier l'état initial du like
  useEffect(() => {
    const checkInitialState = async () => {
      if (!user) return;

      try {
        // Vérifier si l'utilisateur a déjà liké ce post
        const { data: likeResult } = await supabase
          .from('likes')
          .select('id')
          .eq('user_id', user.id)
          .eq('post_id', post.id)
          .maybeSingle();

        setIsLiked(!!likeResult);
      } catch (error) {
        // Erreur silencieuse - pas de like existant
        if (process.env.NODE_ENV === 'development') {
          console.log('État initial vérifié pour le post:', post.id);
        }
      }
    };

    checkInitialState();
  }, [user, post.id]);

  // ✅ Mise à jour en temps réel des compteurs (Likes et Commentaires)
  useEffect(() => {
    if (!post.id) return;

    // Canal pour les likes
    const likesChannel = supabase
      .channel(`post-likes-${post.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'likes',
          filter: `post_id=eq.${post.id}`
        },
        async () => {
          // Recalculer le nombre de likes
          const { count } = await supabase
            .from('likes')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', post.id);

          setLikeCount(count || 0);
        }
      )
      .subscribe();

    // Canal pour les commentaires
    const commentsChannel = supabase
      .channel(`post-comments-${post.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${post.id}`
        },
        async () => {
          // Recalculer le nombre de commentaires
          const { count } = await supabase
            .from('comments')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', post.id);

          setCommentCount(count || 0);
        }
      )
      .subscribe();

    // Nettoyage des canaux
    return () => {
      supabase.removeChannel(likesChannel);
      supabase.removeChannel(commentsChannel);
    };
  }, [post.id]);

  // ✅ GESTION DES LIKES
  const handleLike = useCallback(async () => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour aimer un post.",
        variant: "destructive",
      });
      return;
    }

    if (isLoading) return;

    setIsLoading(true);

    try {
      if (isLiked) {
        // Unlike - supprimer le like
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', post.id);

        if (error) throw error;

        setIsLiked(false);
        onLikeUpdate?.(post.id, likeCount - 1, false);

        toast({
          title: "Like retiré",
          description: "Vous n'aimez plus ce post.",
        });
      } else {
        // Like - ajouter le like
        const { error } = await supabase
          .from('likes')
          .insert({
            user_id: user.id,
            post_id: post.id
          });

        if (error) throw error;

        setIsLiked(true);
        onLikeUpdate?.(post.id, likeCount + 1, true);

        toast({
          title: "Post aimé !",
          description: "Vous aimez ce post.",
        });
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Erreur lors du like:', error);
      }
      toast({
        title: "Erreur",
        description: "Impossible de modifier le like.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, post.id, isLiked, isLoading, likeCount, onLikeUpdate, toast]);

  // ✅ GESTION DES MESSAGES (PREMIUM REQUIS)
  const handleMessage = useCallback(() => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour envoyer un message.",
        variant: "destructive",
      });
      return;
    }

    // Vérifier le statut Premium
    checkPremiumFeature('messages', () => {
      // ✅ CORRIGÉ: Navigation vers la page de messagerie
      const conversationPath = `/messages/${post.user_id}`;
      
      // Utiliser window.location pour la navigation
      if (typeof window !== 'undefined') {
        window.location.href = conversationPath;
      }
      
      toast({
        title: "Ouverture de la messagerie",
        description: `Conversation avec ${post.profiles.full_name}`,
      });
    }, post.profiles.full_name);
  }, [user, checkPremiumFeature, post.user_id, post.profiles.full_name, toast]);

  return (
    <div className="flex items-center gap-6 pt-3 border-t">
      {/* ❤️ BOUTON LIKE - FONCTIONNEL */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLike}
        disabled={isLoading}
        className={`flex items-center gap-2 transition-all duration-200 ${
          isLiked 
            ? 'text-red-500 hover:text-red-600' 
            : 'text-muted-foreground hover:text-red-500'
        }`}
        aria-label={isLiked ? "Retirer le like" : "Aimer ce post"}
      >
        <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
        <span className="text-sm font-medium">{likeCount}</span>
      </Button>

      {/* 💬 BOUTON MESSAGE - FONCTIONNEL (PREMIUM REQUIS) */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleMessage}
        className={`flex items-center gap-2 transition-all duration-200 ${
          isPremium 
            ? 'text-blue-500 hover:text-blue-600' 
            : 'text-muted-foreground hover:text-blue-500'
        }`}
        aria-label="Envoyer un message"
      >
        <MessageCircle className="w-5 h-5" />
        <span className="text-sm font-medium">{commentCount}</span>
        {!isPremium && (
          <span className="text-xs text-yellow-600 ml-1" title="Fonctionnalité Premium">💎</span>
        )}
      </Button>
    </div>
  );
}
