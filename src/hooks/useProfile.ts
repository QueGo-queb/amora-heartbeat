import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProfileData {
  id: string;
  full_name: string;
  interests: string[];
  avatar_url?: string;
  bio?: string;
  location?: string;
  age?: number;
  gender?: string;
  seeking_gender?: string;
  plan?: 'free' | 'premium';
  created_at: string;
  updated_at: string;
}

export function useProfile() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Charger le profil de l'utilisateur connecté
  const loadProfile = useCallback(async () => {
    try {
      // Debug
      setLoading(true);
      setError(null);

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error('❌ Erreur authentification:', authError); // Debug
        throw new Error("Utilisateur non authentifié");
      }

      // Debug

      // Récupérer le profil depuis Supabase
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('❌ Erreur récupération profil:', profileError); // Debug
        
        // Créer un profil par défaut si il n'existe pas
        if (profileError.code === 'PGRST116') { // No rows returned
          // Debug
          
          const defaultProfile: ProfileData = {
            id: user.id,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Utilisateur',
            interests: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          try {
            const { error: insertError } = await supabase
              .from('profiles')
              .insert([defaultProfile]);

            if (insertError) {
              console.error('❌ Erreur insertion profil par défaut:', insertError); // Debug
              // Utiliser le profil en mémoire
              setProfile(defaultProfile);
              return;
            }

            // Debug
            setProfile(defaultProfile);
            return;
          } catch (insertErr) {
            console.error('❌ Exception lors de l\'insertion:', insertErr); // Debug
            // Utiliser le profil en mémoire
            setProfile(defaultProfile);
            return;
          }
        } else {
          throw profileError;
        }
      }

      if (data) {
        // Debug
        
        const profileData: ProfileData = {
          id: data.id,
          full_name: data.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Utilisateur',
          interests: data.interests || [],
          avatar_url: data.avatar_url,
          bio: data.bio,
          location: data.location,
          age: data.age,
          gender: data.gender,
          seeking_gender: data.seeking_gender,
          plan: data.plan || 'free',
          created_at: data.created_at,
          updated_at: data.updated_at
        };

        setProfile(profileData);
      }

    } catch (err) {
      console.error('❌ Erreur chargement profil:', err); // Debug
      
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement du profil';
      setError(errorMessage);
    } finally {
      setLoading(false);
      // Debug
    }
  }, []);

  // Mettre à jour le profil
  const updateProfile = useCallback(async (updatedData: Partial<ProfileData>) => {
    if (!profile) {
      console.error('❌ Aucun profil à mettre à jour'); // Debug
      return { success: false, error: 'Aucun profil à mettre à jour' };
    }

    try {
      // Debug

      const { error } = await supabase
        .from('profiles')
        .update({
          ...updatedData,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);

      if (error) {
        console.error('❌ Erreur mise à jour Supabase:', error); // Debug
        throw error;
      }

      // Debug

      // Mettre à jour le profil local
      setProfile(prev => prev ? { ...prev, ...updatedData, updated_at: new Date().toISOString() } : null);

      return { success: true };
    } catch (err) {
      console.error('❌ Erreur mise à jour profil:', err); // Debug
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
      return { success: false, error: errorMessage };
    }
  }, [profile]);

  // Rafraîchir le profil
  const refreshProfile = useCallback(async () => {
    // Debug
    await loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return {
    profile,
    loading,
    error,
    updateProfile,
    refreshProfile,
    loadProfile
  };
}