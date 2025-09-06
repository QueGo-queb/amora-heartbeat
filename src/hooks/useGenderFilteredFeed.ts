import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { testUsers, filterUsersByInterests, calculateCompatibilityScore } from '@/data/testUsersWithPosts';

interface UserProfile {
  id: string;
  gender: 'male' | 'female' | 'other';
  seeking_gender: 'male' | 'female' | 'other' | 'both';
  plan: 'free' | 'premium';
  interests: string[];
}

interface FeedPost {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  author_name: string;
  author_avatar: string;
  author_gender: 'male' | 'female' | 'other';
  author_plan: 'free' | 'premium';
  commonInterests: string[];
  compatibilityScore: number;
  canContact: boolean;
  contactRestriction?: string;
}

export function useGenderFilteredFeed() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userInterests, setUserInterests] = useState<string[]>([]);

  // Récupérer le profil utilisateur avec genre et préférences
  const getUserProfile = useCallback(async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error("Utilisateur non authentifié");
      }

      // Récupérer le profil complet depuis Supabase
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, gender, seeking_gender, plan, interests')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Erreur récupération profil:', profileError);
        // Profil par défaut si erreur
        return {
          id: user.id,
          gender: 'other' as const,
          seeking_gender: 'both' as const,
          plan: 'free' as const,
          interests: []
        };
      }

      return {
        id: profile.id,
        gender: profile.gender || 'other',
        seeking_gender: profile.seeking_gender || 'both',
        plan: profile.plan || 'free',
        interests: profile.interests || []
      };
    } catch (error) {
      console.error('Erreur récupération profil utilisateur:', error);
      return null;
    }
  }, []);

  // Filtrer les utilisateurs par genre et préférences
  const filterUsersByGenderAndPreferences = useCallback((
    allUsers: any[],
    userGender: string,
    seekingGender: string
  ) => {
    return allUsers.filter(user => {
      // Vérifier la compatibilité des genres
      if (seekingGender === 'both') {
        return user.gender !== userGender; // Pas de même genre
      } else {
        return user.gender === seekingGender;
      }
    });
  }, []);

  // Vérifier si l'utilisateur peut contacter l'auteur du post
  const checkContactAbility = useCallback((
    userPlan: string,
    authorPlan: string
  ): { canContact: boolean; restriction?: string } => {
    if (userPlan === 'premium') {
      return { canContact: true };
    } else {
      return { 
        canContact: false, 
        restriction: "Passez au plan premium pour pouvoir contacter cette personne." 
      };
    }
  }, []);

  // Charger les posts filtrés
  const loadFilteredPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const profile = await getUserProfile();
      if (!profile) {
        setError('Impossible de récupérer votre profil');
        setLoading(false);
        return;
      }

      setUserProfile(profile);
      setUserInterests(profile.interests);

      // Filtrer les utilisateurs par genre et préférences
      const compatibleUsers = filterUsersByGenderAndPreferences(
        testUsers, 
        profile.gender, 
        profile.seeking_gender
      );

      // Filtrer par intérêts communs si l'utilisateur en a
      let relevantUsers = compatibleUsers;
      if (profile.interests.length > 0) {
        relevantUsers = filterUsersByInterests(profile.interests, compatibleUsers, 1);
      }

      // Créer les posts avec toutes les informations nécessaires
      const relevantPosts = relevantUsers.flatMap(user => {
        const commonInterests = profile.interests.length > 0 
          ? user.interests.filter(interest => profile.interests.includes(interest))
          : [];

        const compatibilityScore = profile.interests.length > 0
          ? calculateCompatibilityScore(profile.interests, user)
          : 0;

        const contactCheck = checkContactAbility(profile.plan, user.plan || 'free');

        return user.posts.map(post => ({
          id: post.id,
          content: post.content,
          created_at: post.created_at,
          author_id: post.author_id,
          author_name: post.author_name,
          author_avatar: post.author_avatar,
          author_gender: user.gender || 'other',
          author_plan: user.plan || 'free',
          commonInterests,
          compatibilityScore,
          canContact: contactCheck.canContact,
          contactRestriction: contactCheck.restriction
        }));
      });

      // Trier par score de compatibilité décroissant
      relevantPosts.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
      
      setPosts(relevantPosts);
    } catch (error) {
      console.error('Erreur chargement posts filtrés:', error);
      setError('Erreur lors du chargement des posts');
    } finally {
      setLoading(false);
    }
  }, [getUserProfile, filterUsersByGenderAndPreferences, checkContactAbility]);

  // Rafraîchir le feed
  const refresh = useCallback(() => {
    loadFilteredPosts();
  }, [loadFilteredPosts]);

  // Charger les posts au montage
  useEffect(() => {
    loadFilteredPosts();
  }, [loadFilteredPosts]);

  return {
    posts,
    loading,
    error,
    refresh,
    userProfile,
    userInterests,
    loadFilteredPosts
  };
}