import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { testUsers, filterUsersByInterests, calculateCompatibilityScore } from '@/data/testUsers';

interface Post {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
  user: {
    id: string;
    name: string;
    avatar: string;
    interests: string[];
  };
  commonInterests: string[];
  relevanceScore: number;
}

export function useInterestsFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

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

      const userInterests = await getUserInterests();
      
      // Si l'utilisateur n'a pas d'intérêts, afficher tous les posts
      if (userInterests.length === 0) {
        const allPosts = testUsers.flatMap(user => 
          user.posts.map(post => ({
            id: post.id,
            user_id: user.id,
            content: post.content,
            created_at: post.created_at,
            likes_count: post.likes_count,
            comments_count: post.comments_count,
            user: {
              id: user.id,
              name: user.name,
              avatar: user.avatar,
              interests: user.interests
            },
            commonInterests: [],
            relevanceScore: 0
          }))
        );
        
        setPosts(allPosts);
        setLoading(false);
        return;
      }

      // Filtrer les utilisateurs avec intérêts communs
      const compatibleUsers = filterUsersByInterests(userInterests, testUsers, 1);
      
      // Créer les posts avec scoring de pertinence
      const relevantPosts = compatibleUsers.flatMap(user => {
        const commonInterests = user.interests.filter(interest => 
          userInterests.includes(interest)
        );
        
        return user.posts.map(post => {
          // Calculer le score de pertinence
          const hoursSinceCreation = (Date.now() - new Date(post.created_at).getTime()) / (1000 * 60 * 60);
          const baseScore = Math.max(0, 100 - hoursSinceCreation * 2);
          const interestsScore = commonInterests.length * 25;
          const engagementScore = post.likes_count * 2 + post.comments_count * 3;
          const relevanceScore = baseScore + interestsScore + engagementScore;

          return {
            id: post.id,
            user_id: user.id,
            content: post.content,
            created_at: post.created_at,
            likes_count: post.likes_count,
            comments_count: post.comments_count,
            user: {
              id: user.id,
              name: user.name,
              avatar: user.avatar,
              interests: user.interests
            },
            commonInterests,
            relevanceScore
          };
        });
      });

      // Trier par score de pertinence décroissant
      relevantPosts.sort((a, b) => b.relevanceScore - a.relevanceScore);
      
      setPosts(relevantPosts);
    } catch (error) {
      console.error('Erreur chargement posts:', error);
      setError('Erreur lors du chargement des posts');
    } finally {
      setLoading(false);
    }
  }, [getUserInterests]);

  // Gérer les likes
  const handleLike = useCallback(async (postId: string) => {
    try {
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, likes_count: post.likes_count + 1 }
          : post
      ));

      toast({
        title: "Like ajouté",
        description: "Votre like a été pris en compte",
      });
    } catch (error) {
      console.error('Erreur like:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le like",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Rafraîchir le feed
  const refresh = useCallback(() => {
    loadPosts();
  }, [loadPosts]);

  // Charger les posts au montage
  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  return {
    posts,
    loading,
    error,
    refresh,
    handleLike
  };
}