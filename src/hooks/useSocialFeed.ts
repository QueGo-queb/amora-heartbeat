import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SocialFeedPost {
  id: string;
  content: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
  user_id: string;
  profiles: {
    id: string;
    full_name: string;
    avatar_url?: string;
    interests: string[];
    location?: string;
    plan?: string;
  };
  commonInterests: string[];
  relevanceScore: number;
}

export function useSocialFeed() {
  const [posts, setPosts] = useState<SocialFeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const { toast } = useToast();

  // Charger le profil utilisateur
  const loadUserProfile = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      setUserProfile(profile);
      return profile;
    } catch (error) {
      console.error('Erreur chargement profil:', error);
      return null;
    }
  }, []);

  // Calculer la compatibilité basée sur les intérêts et la localisation
  const calculateRelevanceScore = useCallback((post: any, userProfile: any) => {
    let score = 0;

    // Score de base par récence
    const hoursSinceCreation = (Date.now() - new Date(post.created_at).getTime()) / (1000 * 60 * 60);
    score += Math.max(0, 100 - hoursSinceCreation * 2);

    // Score des intérêts communs
    const userInterests = userProfile?.interests || [];
    const postUserInterests = post.profiles?.interests || [];
    const commonInterests = userInterests.filter((interest: string) => 
      postUserInterests.includes(interest)
    );
    score += commonInterests.length * 25;

    // Bonus pour la même localisation
    if (userProfile?.location && post.profiles?.location) {
      const userLocation = userProfile.location.toLowerCase();
      const postLocation = post.profiles.location.toLowerCase();
      if (userLocation === postLocation) {
        score += 50;
      } else if (userLocation.includes(postLocation) || postLocation.includes(userLocation)) {
        score += 25;
      }
    }

    // Bonus pour les utilisateurs premium
    if (post.profiles?.plan === 'premium') {
      score += 10;
    }

    // Score d'engagement
    score += post.likes_count * 2 + post.comments_count * 3;

    return score;
  }, []);

  // Charger les posts du feed social
  const loadSocialFeed = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const profile = await loadUserProfile();
      if (!profile) {
        setError('Profil utilisateur non trouvé');
        return;
      }

      // Récupérer les posts publics avec les profils des auteurs
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:profiles!posts_user_id_fkey (
            id,
            full_name,
            avatar_url,
            interests,
            location,
            plan
          )
        `)
        .eq('visibility', 'public')
        .order('created_at', { ascending: false })
        .limit(50);

      if (postsError) throw postsError;

      // Calculer les scores de pertinence et les intérêts communs
      const scoredPosts = (posts || []).map(post => {
        const relevanceScore = calculateRelevanceScore(post, profile);
        const userInterests = profile.interests || [];
        const postUserInterests = post.profiles?.interests || [];
        const commonInterests = userInterests.filter((interest: string) => 
          postUserInterests.includes(interest)
        );

        return {
          ...post,
          commonInterests,
          relevanceScore
        };
      });

      // Trier par score de pertinence
      scoredPosts.sort((a, b) => b.relevanceScore - a.relevanceScore);

      setPosts(scoredPosts);
    } catch (error) {
      console.error('Erreur chargement feed social:', error);
      setError('Erreur lors du chargement du fil d\'actualité');
    } finally {
      setLoading(false);
    }
  }, [loadUserProfile, calculateRelevanceScore]);

  // Gérer les likes
  const handleLike = useCallback(async (postId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Vérifier si déjà liké
      const { data: existingLike } = await supabase
        .from('likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();

      if (existingLike) {
        // Retirer le like
        await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, likes_count: Math.max(0, post.likes_count - 1) }
            : post
        ));
      } else {
        // Ajouter le like
        await supabase
          .from('likes')
          .insert({ post_id: postId, user_id: user.id });

        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, likes_count: post.likes_count + 1 }
            : post
        ));
      }
    } catch (error) {
      console.error('Erreur like:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le like",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Rafraîchir le feed
  const refresh = useCallback(() => {
    loadSocialFeed();
  }, [loadSocialFeed]);

  useEffect(() => {
    loadSocialFeed();
  }, [loadSocialFeed]);

  return {
    posts,
    loading,
    error,
    userProfile,
    refresh,
    handleLike
  };
}