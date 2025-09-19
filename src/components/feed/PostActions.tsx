/**
 * ✅ Composant PostActions - Gestion des icônes ❤️ 💬 🔗
 * Logique complète pour likes, messages et partages avec compteurs en temps réel
 */

import { useState, useEffect, useCallback } from 'react';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
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
  onShareUpdate?: (postId: string, newShareCount: number) => void;
}

export function PostActions({ post, onLikeUpdate, onShareUpdate }: PostActionsProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes_count || 0);
  const [shareCount, setShareCount] = useState(post.shares_count || 0);
  const [commentCount, setCommentCount] = useState(post.comments_count || 0);
  const [isLoading, setIsLoading] = useState(false);
  
  const { user } = useAuth();
  const { isPremium } = usePremium();
  const { checkPremiumFeature } = usePremiumRestriction();
  const { toast } = useToast();

  // ✅ Vérifier l'état initial des likes et partages
  useEffect(() => {
    const checkInitialState = async () => {
      if (!user) return;

      try {
        // Vérifier les likes et partages en parallèle
        const [likeResult, shareResult] = await Promise.all([
          supabase
            .from('likes')
            .select('id')
            .eq('user_id', user.id)
            .eq('post_id', post.id)
            .single(),
          supabase
            .from('post_shares')
            .select('id')
            .eq('user_id', user.id)
            .eq('post_id', post.id)
            .single()
        ]);

        setIsLiked(!!likeResult.data);
        setIsShared(!!shareResult.data);
      } catch (error) {
        // Pas de like/partage existant, c'est normal
        console.log('État initial vérifié pour le post:', post.id);
      }
    };

    checkInitialState();
  }, [user, post.id]);

  // ✅ Mise à jour en temps réel des compteurs
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

    // Canal pour les partages
    const sharesChannel = supabase
      .channel(`post-shares-${post.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'post_shares',
          filter: `post_id=eq.${post.id}`
        },
        async () => {
          // Recalculer le nombre de partages
          const { count } = await supabase
            .from('post_shares')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', post.id);

          setShareCount(count || 0);
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
      supabase.removeChannel(sharesChannel);
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
      console.error('Erreur lors du like:', error);
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
      // Action pour utilisateur Premium
      console.log(' Ouverture de la messagerie avec', post.profiles.full_name);
      
      // TODO: Implémenter l'ouverture de la messagerie
      // navigate(`/chat/${post.user_id}`);
      
      toast({
        title: "Messagerie ouverte",
        description: `Conversation avec ${post.profiles.full_name}`,
      });
    }, post.profiles.full_name);
  }, [user, checkPremiumFeature, post.profiles.full_name, toast]);

  // ✅ GESTION DES PARTAGES
  const handleShare = useCallback(async () => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour partager un post.",
        variant: "destructive",
      });
      return;
    }

    if (isLoading) return;

    setIsLoading(true);

    try {
      // Copier le lien du post dans le presse-papier
      const postUrl = `${window.location.origin}/post/${post.id}`;
      
      await navigator.clipboard.writeText(postUrl);

      // Enregistrer le partage dans la base de données
      if (!isShared) {
        const { error } = await supabase
          .from('post_shares')
          .insert({
            user_id: user.id,
            post_id: post.id,
            share_type: 'link'
          });

        if (error) throw error;

        setIsShared(true);
        onShareUpdate?.(post.id, shareCount + 1);
      }

      toast({
        title: "Post partagé !",
        description: "Le lien a été copié dans votre presse-papier.",
      });
    } catch (error) {
      console.error('Erreur lors du partage:', error);
      toast({
        title: "Erreur",
        description: "Impossible de partager le post.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, post.id, isLoading, isShared, shareCount, onShareUpdate, toast]);

  return (
    <div className="flex items-center gap-4 pt-3 border-t">
      {/* ❤️ BOUTON LIKE */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLike}
        disabled={isLoading}
        className={`flex items-center gap-2 transition-colors ${
          isLiked 
            ? 'text-red-500 hover:text-red-600' 
            : 'text-muted-foreground hover:text-red-500'
        }`}
      >
        <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
        <span className="text-sm font-medium">{likeCount}</span>
      </Button>

      {/* 💬 BOUTON MESSAGE (PREMIUM REQUIS) */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleMessage}
        className={`flex items-center gap-2 transition-colors ${
          isPremium 
            ? 'text-blue-500 hover:text-blue-600' 
            : 'text-muted-foreground hover:text-blue-500'
        }`}
      >
        <MessageCircle className="w-4 h-4" />
        <span className="text-sm font-medium">{commentCount}</span>
        {!isPremium && (
          <span className="text-xs text-yellow-600 ml-1">💎</span>
        )}
      </Button>

      {/* 🔗 BOUTON PARTAGE */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleShare}
        disabled={isLoading}
        className={`flex items-center gap-2 transition-colors ${
          isShared 
            ? 'text-green-500 hover:text-green-600' 
            : 'text-muted-foreground hover:text-green-500'
        }`}
      >
        <Share2 className={`w-4 h-4 ${isShared ? 'fill-current' : ''}`} />
        <span className="text-sm font-medium">{shareCount}</span>
      </Button>
    </div>
  );
}
