import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { testUsers, filterUsersByInterests, calculateCompatibilityScore } from '@/data/testUsersWithPosts';

interface FeedPost {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  author_name: string;
  author_avatar: string;
  commonInterests: string[];
  compatibilityScore: number;
}

export function useInterestsBasedFeed() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userInterests, setUserInterests] = useState<string[]>([]);

  // Récupérer les intérêts de l'utilisateur connecté
  const getUserInterests = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Récupérer les intérêts depuis le profil utilisateur
      const { data: profile } = await supabase
        .from('profiles')
        .select('interests')
        .eq('id', user.id)
        .single();

      return profile?.interests || [];
    } catch (error) {
      console.error('Erreur récupération intérêts:', error);
      return [];
    }
  }, []);

  // Charger les posts basés sur les intérêts communs
  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const interests = await getUserInterests();
      setUserInterests(interests);
      
      // Si l'utilisateur n'a pas d'intérêts, afficher tous les posts
      if (interests.length === 0) {
        const allPosts = testUsers.flatMap(user => 
          user.posts.map(post => ({
            id: post.id,
            content: post.content,
            created_at: post.created_at,
            author_id: post.author_id,
            author_name: post.author_name,
            author_avatar: post.author_avatar,
            commonInterests: [],
            compatibilityScore: 0
          }))
        );
        
        setPosts(allPosts);
        setLoading(false);
        return;
      }

      // Filtrer les utilisateurs avec intérêts communs
      const compatibleUsers = filterUsersByInterests(interests, testUsers, 1);
      
      // Créer les posts avec scoring de compatibilité
      const relevantPosts = compatibleUsers.flatMap(user => {
        const commonInterests = user.interests.filter(interest => 
          interests.includes(interest)
        );
        
        return user.posts.map(post => {
          const compatibilityScore = calculateCompatibilityScore(interests, user);

          return {
            id: post.id,
            content: post.content,
            created_at: post.created_at,
            author_id: post.author_id,
            author_name: post.author_name,
            author_avatar: post.author_avatar,
            commonInterests,
            compatibilityScore
          };
        });
      });

      // Trier par score de compatibilité décroissant
      relevantPosts.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
      
      setPosts(relevantPosts);
    } catch (error) {
      console.error('Erreur chargement posts:', error);
      setError('Erreur lors du chargement des posts');
    } finally {
      setLoading(false);
    }
  }, [getUserInterests]);

  // Rafraîchir le feed
  const refresh = useCallback(() => {
    console.log('🔄 Rafraîchissement du feed basé sur les intérêts...');
    loadPosts();
  }, []); // ✅ Retirer loadPosts des dépendances

  // Charger les posts au montage
  useEffect(() => {
    loadPosts();
  }, []); // ✅ Se déclenche une seule fois

  return {
    posts,
    loading,
    error,
    refresh,
    userInterests,
    loadPosts
  };
}
