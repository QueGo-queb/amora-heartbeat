import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth'; // ✅ AJOUT: Import manquant

interface UserWithInterests {
  id: string;
  full_name: string;
  avatar_url?: string;
  interests: string[];
  commonInterests: string[];
  matchScore: number;
}

export function useInterestsMatching() {
  const [users, setUsers] = useState<UserWithInterests[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth(); // ✅ CORRECTION: Récupérer user depuis useAuth

  // Calculer le score de compatibilité basé sur les intérêts communs
  const calculateMatchScore = (userInterests: string[], currentUserInterests: string[]): number => {
    const commonInterests = userInterests.filter(interest => 
      currentUserInterests.includes(interest)
    );
    
    // Score de base : 10 points par intérêt commun
    let score = commonInterests.length * 10;
    
    // Bonus pour les intérêts rares (moins d'utilisateurs les ont)
    const rareInterests = ['aquarium', 'theater', 'playing-music-instrument', 'hot-yoga'];
    const rareBonus = commonInterests.filter(interest => rareInterests.includes(interest)).length * 5;
    score += rareBonus;
    
    return score;
  };

  // Récupérer les utilisateurs avec intérêts communs
  const loadUsersWithCommonInterests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // ✅ CORRECTION: Utiliser user depuis useAuth au lieu de supabase.auth.getUser()
      if (!user) {
        setUsers([]);
        setLoading(false);
        return;
      }

      // Récupérer le profil de l'utilisateur actuel
      const { data: currentUserProfile } = await supabase
        .from('profiles')
        .select('interests')
        .eq('id', user.id)
        .single();

      if (!currentUserProfile?.interests || currentUserProfile.interests.length === 0) {
        setUsers([]);
        setLoading(false);
        return;
      }

      const currentUserInterests = currentUserProfile.interests;

      // Récupérer tous les autres utilisateurs avec leurs intérêts
      const { data: allUsers, error: fetchError } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          avatar_url,
          interests
        `)
        .neq('id', user.id)
        .not('interests', 'is', null);

      if (fetchError) throw fetchError;

      // Calculer les scores de compatibilité
      const usersWithScores = allUsers
        .map(userProfile => {
          const userInterests = userProfile.interests || [];
          const commonInterests = userInterests.filter(interest => 
            currentUserInterests.includes(interest)
          );
          
          if (commonInterests.length === 0) return null;

          return {
            id: userProfile.id,
            full_name: userProfile.full_name || 'Utilisateur',
            avatar_url: userProfile.avatar_url,
            interests: userInterests,
            commonInterests,
            matchScore: calculateMatchScore(userInterests, currentUserInterests)
          };
        })
        .filter(Boolean)
        .sort((a, b) => b!.matchScore - a!.matchScore)
        .slice(0, 10); // Top 10

      setUsers(usersWithScores as UserWithInterests[]);
    } catch (err) {
      console.error('Error loading users with common interests:', err);
      setError('Erreur lors du chargement des suggestions');
      toast({
        title: "Erreur",
        description: "Impossible de charger les suggestions d'amis",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast, user]); // ✅ CORRECTION: Ajouter user dans les dépendances

  // ✅ CORRECTION: useEffect stable avec user depuis useAuth
  useEffect(() => {
    if (user?.id) {
      loadUsersWithCommonInterests();
    } else {
      // Reset state when user is null (logout)
      setUsers([]);
      setLoading(false);
      setError(null);
    }
  }, [user?.id, loadUsersWithCommonInterests]);

  return {
    users,
    loading,
    error,
    refresh: loadUsersWithCommonInterests
  };
}
