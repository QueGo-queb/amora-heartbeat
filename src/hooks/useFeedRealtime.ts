/**
 * Hook pour les mises à jour en temps réel du feed
 * Utilise Supabase Realtime pour écouter les nouveaux posts
 */

import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { FeedPost, FeedFilters, FeedResponse } from '../../types/feed';

export function useFeedRealtime(currentPosts: FeedPost[], viewerProfile: any) {
  const [newPosts, setNewPosts] = useState<FeedPost[]>([]);
  const [hasNewPosts, setHasNewPosts] = useState(false);

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
          // ✅ CORRIGÉ - Utiliser is_active au lieu de visibility
          filter: 'is_active=eq.true'
        },
        async (payload) => {
          try {
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

            // Vérifier si le post correspond aux critères de l'utilisateur
            const { attachScores } = await import('../../utils/scoring');
            const scoredPosts = attachScores([newPost], viewerProfile);
            
            if (scoredPosts.length > 0) {
              setNewPosts(prev => [scoredPosts[0], ...prev]);
              setHasNewPosts(true);
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
  }, [viewerProfile]);

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
