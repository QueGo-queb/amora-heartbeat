import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
  author_age?: number;
  author_location?: string;
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

  // ✅ SOLUTION BOUCLE INFINIE #4 - Stabiliser les fonctions utilitaires
  const getUserProfile = useCallback(async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error("Utilisateur non authentifié");
      }

      // Récupérer le profil complet depuis Supabase
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, gender, seeking_gender, plan, interests, full_name, age, location')
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
  }, []); // ✅ Aucune dépendance

  // ✅ SOLUTION BOUCLE INFINIE #4 - getRealPosts stable
  const getRealPosts = useCallback(async () => {
    try {
      // Récupérer tous les posts
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (postsError) {
        console.error('Erreur récupération posts:', postsError);
        throw postsError;
      }

      if (!postsData || postsData.length === 0) {
        return [];
      }

      // Récupérer les profils des auteurs
      const userIds = [...new Set(postsData.map(post => post.user_id))];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, gender, plan, age, location, interests')
        .in('id', userIds);

      if (profilesError) {
        console.error('Erreur récupération profils:', profilesError);
        throw profilesError;
      }

      // Combiner les posts avec les profils
      const postsWithProfiles = postsData.map(post => {
        const profile = profilesData?.find(p => p.id === post.user_id);
        return {
          ...post,
          profiles: profile
        };
      });

      return postsWithProfiles;
    } catch (error) {
      console.error('Erreur lors de la récupération des posts:', error);
      return [];
    }
  }, []); // ✅ Aucune dépendance

  // ✅ SOLUTION BOUCLE INFINIE #4 - filterUsersByGenderAndPreferences stable
  const filterUsersByGenderAndPreferences = useCallback((
    allPosts: any[],
    userGender: string,
    seekingGender: string
  ) => {
    return allPosts.filter(post => {
      const authorGender = post.profiles?.gender;
      if (!authorGender) return false;
      
      // Vérifier la compatibilité des genres
      if (seekingGender === 'both') {
        return authorGender !== userGender; // Pas de même genre
      } else {
        return authorGender === seekingGender;
      }
    });
  }, []); // ✅ Aucune dépendance

  // ✅ SOLUTION BOUCLE INFINIE #4 - checkContactAbility stable
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
  }, []); // ✅ Aucune dépendance

  // ✅ SOLUTION BOUCLE INFINIE #4 - calculateCommonInterests stable
  const calculateCommonInterests = useCallback((userInterests: string[], authorInterests: string[]) => {
    if (!userInterests || !authorInterests) return [];
    return userInterests.filter(interest => authorInterests.includes(interest));
  }, []); // ✅ Aucune dépendance

  // ✅ SOLUTION BOUCLE INFINIE #4 - calculateCompatibilityScore stable (FINAL FIX)
  const calculateCompatibilityScore = useCallback((userInterests: string[], authorInterests: string[]) => {
    if (!userInterests || !authorInterests || userInterests.length === 0) return 0;
    
    // ✅ Calculer directement sans dépendance externe
    const commonInterests = userInterests.filter(interest => authorInterests.includes(interest));
    return Math.round((commonInterests.length / userInterests.length) * 100);
  }, []); // ✅ Aucune dépendance

  // ✅ SOLUTION BOUCLE INFINIE #4 - loadFilteredPosts stable
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

      // ✅ RÉCUPÉRER LES VRAIS POSTS
      const allPosts = await getRealPosts();
      console.log('📝 Posts récupérés:', allPosts.length);

      if (allPosts.length === 0) {
        setPosts([]);
        setLoading(false);
        return;
      }

      // Filtrer les posts par genre et préférences
      const compatiblePosts = filterUsersByGenderAndPreferences(
        allPosts, 
        profile.gender, 
        profile.seeking_gender
      );

      console.log('🔍 Posts compatibles:', compatiblePosts.length);

      // Transformer les posts au format attendu
      const transformedPosts: FeedPost[] = compatiblePosts.map(post => {
        const authorProfile = post.profiles;
        // ✅ CORRECTION : Utiliser les fonctions stables
        const commonInterests = calculateCommonInterests(profile.interests, authorProfile?.interests || []);
        const compatibilityScore = calculateCompatibilityScore(profile.interests, authorProfile?.interests || []);
        const contactCheck = checkContactAbility(profile.plan, authorProfile?.plan || 'free');

        return {
          id: post.id,
          content: post.content,
          created_at: post.created_at,
          author_id: post.user_id,
          author_name: authorProfile?.full_name || 'Utilisateur',
          author_avatar: authorProfile?.avatar_url || '/placeholder.svg',
          author_gender: authorProfile?.gender || 'other',
          author_plan: authorProfile?.plan || 'free',
          author_age: authorProfile?.age,
          author_location: authorProfile?.location,
          commonInterests,
          compatibilityScore,
          canContact: contactCheck.canContact,
          contactRestriction: contactCheck.restriction
        };
      });

      // Trier par score de compatibilité décroissant
      transformedPosts.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
      
      console.log('✅ Posts transformés:', transformedPosts.length);
      setPosts(transformedPosts);
    } catch (error) {
      console.error('Erreur chargement posts filtrés:', error);
      setError('Erreur lors du chargement des posts');
    } finally {
      setLoading(false);
    }
  }, []); // ✅ Aucune dépendance - toutes les fonctions sont stables

  // ✅ SOLUTION BOUCLE INFINIE #4 - refresh stable
  const refresh = useCallback(() => {
    loadFilteredPosts();
  }, []); // ✅ Aucune dépendance - loadFilteredPosts est stable

  // ✅ SOLUTION BOUCLE INFINIE #4 - useEffect stable
  useEffect(() => {
    loadFilteredPosts();
  }, []); // ✅ Se déclenche une seule fois

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