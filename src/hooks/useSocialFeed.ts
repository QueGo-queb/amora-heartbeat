import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface SocialPost {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  author_name: string;
  author_avatar: string;
  likes_count: number;
  comments_count: number;
  user_has_liked: boolean;
  relevance_score: number;
}

interface UserProfile {
  id: string;
  interests: string[];
  location?: string;
  age?: number;
}

export function useSocialFeed() {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // ✅ SOLUTION BOUCLE INFINIE #1 - loadUserProfile stable
  const loadUserProfile = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, interests, location, age')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setUserProfile(profile);
    } catch (error) {
      console.error('Erreur chargement profil:', error);
    }
  }, [user?.id]); // ✅ Seulement user.id comme dépendance

  // ✅ SOLUTION BOUCLE INFINIE #2 - calculateRelevanceScore stable
  const calculateRelevanceScore = useCallback((post: any, profile: UserProfile | null) => {
    if (!profile || !post) return 0;

    let score = 0;

    // Score basé sur les intérêts communs
    if (profile.interests && post.author_interests) {
      const commonInterests = profile.interests.filter(interest => 
        post.author_interests.includes(interest)
      );
      score += commonInterests.length * 10;
    }

    // Score basé sur la localisation
    if (profile.location && post.author_location) {
      if (profile.location === post.author_location) {
        score += 20;
      }
    }

    // Score basé sur l'âge (proximité)
    if (profile.age && post.author_age) {
      const ageDiff = Math.abs(profile.age - post.author_age);
      if (ageDiff <= 5) score += 15;
      else if (ageDiff <= 10) score += 10;
    }

    return score;
  }, []); // ✅ Pas de dépendances - fonction pure

  // ✅ SOLUTION BOUCLE INFINIE #3 - loadSocialFeed stable
  const loadSocialFeed = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      // Charger le profil utilisateur si nécessaire
      if (!userProfile) {
        await loadUserProfile();
      }

      // Charger les posts
      const { data: postsData, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:profiles(*),
          likes:likes(*)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      // Calculer les scores de pertinence
      const scoredPosts = postsData?.map(post => ({
        ...post,
        relevance_score: calculateRelevanceScore(post, userProfile)
      })) || [];

      // Trier par score de pertinence
      scoredPosts.sort((a, b) => b.relevance_score - a.relevance_score);

      setPosts(scoredPosts);
    } catch (error) {
      console.error('Erreur chargement feed social:', error);
      setError('Erreur lors du chargement du fil d\'actualité');
    } finally {
      setLoading(false);
    }
  }, [user?.id, userProfile]); // ✅ Dépendances stables

  // Gérer les likes
  const handleLike = useCallback(async (postId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Vérifier si l'utilisateur a déjà liké ce post
      const { data: existingLike } = await supabase
        .from('likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();

      if (existingLike) {
        // Supprimer le like
        await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
      } else {
        // Ajouter le like
        await supabase
          .from('likes')
          .insert({
            post_id: postId,
            user_id: user.id
          });
      }

      // Rafraîchir le feed
      await loadSocialFeed();
    } catch (error) {
      console.error('Erreur like:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le like",
        variant: "destructive",
      });
    }
  }, [toast]); // ✅ loadSocialFeed retiré des dépendances

  // ✅ SOLUTION BOUCLE INFINIE - refresh stable
  const refresh = useCallback(() => {
    loadSocialFeed();
  }, []); // ✅ Pas de dépendances - loadSocialFeed sera appelé directement

  // ✅ SOLUTION BOUCLE INFINIE #5 - Chargement initial stable
  useEffect(() => {
    if (user?.id) {
      loadSocialFeed();
    }
  }, [user?.id]); // ✅ Seulement user.id

  return {
    posts,
    loading,
    error,
    userProfile,
    refresh,
    handleLike
  };
}