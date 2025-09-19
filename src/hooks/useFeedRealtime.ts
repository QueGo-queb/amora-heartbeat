/**
 * Hook pour les mises à jour en temps réel du feed
 * Utilise Supabase Realtime pour écouter les nouveaux posts
 * ✅ CORRIGÉ : N'injecte pas les posts de l'utilisateur connecté dans son feed principal
 */

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { FeedPost, FeedFilters, FeedResponse } from '../../types/feed';

export function useFeedRealtime(currentPosts: FeedPost[], viewerProfile: any) {
  const [newPosts, setNewPosts] = useState<FeedPost[]>([]);
  const [hasNewPosts, setHasNewPosts] = useState(false);
  
  // ✅ SOLUTION BOUCLE INFINIE #3 - Utiliser useRef pour viewerProfile
  const viewerProfileRef = useRef(viewerProfile);
  
  useEffect(() => {
    viewerProfileRef.current = viewerProfile;
  }, [viewerProfile]);

  useEffect(() => {
    // S'abonner aux nouveaux posts
    const channel = supabase
      .channel('feed-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'posts',
          filter: 'visibility=eq.public'
        },
        async (payload) => {
          try {
            // ✅ CORRECTION : Ne pas injecter les posts de l'utilisateur connecté
            if (payload.new.user_id === viewerProfileRef.current?.id) {
              console.log('🚫 Post de l\'utilisateur connecté ignoré dans le feed principal');
              return;
            }

            // Récupérer les détails complets du nouveau post
            const { data: newPost, error } = await supabase
              .from('posts')
              .select(`
                *,
                profiles:profiles(*)
              `)
              .eq('id', payload.new.id)
              .single();

            if (error || !newPost) return;

            // ✅ Utiliser la ref stable
            const { attachScores } = await import('../../utils/scoring');
            const scoredPosts = attachScores([newPost], viewerProfileRef.current);
            
            if (scoredPosts.length > 0) {
              setNewPosts(prev => [scoredPosts[0], ...prev]);
              setHasNewPosts(true);
              console.log('✅ Nouveau post ajouté au feed principal:', newPost.id);
            }
          } catch (error) {
            console.error('Error processing new post:', error);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []); // ✅ Pas de dépendances pour éviter les re-souscriptions

  // Fonction pour intégrer les nouveaux posts dans le feed principal
  const integrateNewPosts = () => {
    if (newPosts.length > 0) {
      setNewPosts([]);
      setHasNewPosts(false);
      return [...newPosts, ...currentPosts];
    }
    return currentPosts;
  };

  return {
    newPosts,
    hasNewPosts,
    integrateNewPosts
  };
}
