import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  full_name: string | null;
  email: string;
}

export const useGreeting = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fonction pour déterminer le salut selon l'heure
  const getGreeting = (): string => {
    const hours = new Date().getHours();
    return hours < 12 ? "Bonjour" : "Bonsoir";
  };

  // Fonction pour obtenir le nom d'affichage
  const getDisplayName = (): string => {
    if (profile?.full_name) {
      return profile.full_name;
    }
    return "Utilisateur";
  };

  // 🔧 RÉCUPÉRATION SÉCURISÉE DU PROFIL
  useEffect(() => {
    const fetchCurrentUserProfile = async () => {
      try {
        // 1. Récupérer l'utilisateur connecté
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          console.error('❌ useGreeting - Pas d\'utilisateur connecté');
          setLoading(false);
          return;
        }

        console.log('🔍 useGreeting - Récupération profil pour:', user.email, 'ID:', user.id);
        
        // 2. Récupérer le profil de CET utilisateur uniquement
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', user.id)  // 🔒 SÉCURITÉ: ID exact de l'utilisateur connecté
          .single();

        if (error) {
          console.error('❌ useGreeting - Erreur profil:', error);
          // Fallback sur les métadonnées d'auth
          setProfile({
            full_name: user.user_metadata?.full_name || null,
            email: user.email || ''
          });
        } else {
          console.log('✅ useGreeting - Profil récupéré:', data);
          setProfile(data);
        }
      } catch (error) {
        console.error('❌ useGreeting - Erreur générale:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUserProfile();
  }, []);

  return {
    greeting: getGreeting(),
    displayName: getDisplayName(),
    profile,
    loading
  };
};
