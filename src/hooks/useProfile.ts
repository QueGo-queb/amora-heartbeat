import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProfileData {
  id: string;
  user_id?: string;
  email: string;
  full_name: string;
  interests: string[];
  avatar_url?: string;
  bio?: string;
  country?: string;
  region?: string;
  city?: string;
  age?: number;
  gender?: string;
  seeking_gender?: string;
  language?: string;
  plan?: 'free' | 'premium';
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

// ✅ FONCTION UTILITAIRE: Générer un UUID compatible
const generateUUID = (): string => {
  // Essayer crypto.randomUUID d'abord
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback: générer un UUID simple
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export function useProfile() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Charger le profil de l'utilisateur connecté
  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error('❌ Erreur authentification:', authError);
        throw new Error("Utilisateur non authentifié");
      }

      console.log(' Chargement du profil pour user:', user.id);

      // ✅ STRATÉGIE SIMPLIFIÉE: Essayer d'abord avec user_id, puis avec id
      let profileData: ProfileData | null = null;
      let lastError: any = null;

      // Tentative 1: Recherche par user_id
      try {
        console.log('🔄 Tentative 1: Recherche par user_id...');
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (!error && data) {
          console.log('✅ Profil trouvé avec user_id');
          profileData = data;
        } else {
          lastError = error;
          console.log('❌ Profil non trouvé avec user_id:', error?.message);
        }
      } catch (err) {
        lastError = err;
        console.log('❌ Erreur recherche par user_id:', err);
      }

      // Tentative 2: Recherche par id (si user_id a échoué)
      if (!profileData) {
        try {
          console.log('🔄 Tentative 2: Recherche par id...');
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (!error && data) {
            console.log('✅ Profil trouvé avec id');
            profileData = data;
            
            // Mettre à jour le profil pour ajouter user_id
            if (!data.user_id) {
              console.log(' Ajout de user_id au profil...');
              const { error: updateError } = await supabase
                .from('profiles')
                .update({ user_id: user.id })
                .eq('id', user.id);
              
              if (!updateError) {
                profileData.user_id = user.id;
                console.log('✅ user_id ajouté au profil');
              }
            }
          } else {
            lastError = error;
            console.log('❌ Profil non trouvé avec id:', error?.message);
          }
        } catch (err) {
          lastError = err;
          console.log('❌ Erreur recherche par id:', err);
        }
      }

      // Tentative 3: Recherche par email (si les autres ont échoué)
      if (!profileData) {
        try {
          console.log('🔄 Tentative 3: Recherche par email...');
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', user.email)
            .single();

          if (!error && data) {
            console.log('✅ Profil trouvé avec email');
            profileData = data;
            
            // Mettre à jour le profil pour ajouter user_id
            if (!data.user_id) {
              console.log(' Ajout de user_id au profil...');
              const { error: updateError } = await supabase
                .from('profiles')
                .update({ user_id: user.id })
                .eq('id', data.id);
              
              if (!updateError) {
                profileData.user_id = user.id;
                console.log('✅ user_id ajouté au profil');
              }
            }
          } else {
            lastError = error;
            console.log('❌ Profil non trouvé avec email:', error?.message);
          }
        } catch (err) {
          lastError = err;
          console.log('❌ Erreur recherche par email:', err);
        }
      }

      // Si aucun profil trouvé, créer un profil par défaut
      if (!profileData) {
        console.log('📝 Création d\'un profil par défaut...');
        
        const defaultProfile: ProfileData = {
          id: generateUUID(), // ✅ CORRIGÉ: utiliser la fonction utilitaire
          user_id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Utilisateur',
          interests: [],
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        try {
          const { error: insertError } = await supabase
            .from('profiles')
            .insert([defaultProfile]);

          if (insertError) {
            console.error('❌ Erreur insertion profil par défaut:', insertError);
            // Utiliser le profil en mémoire même si l'insertion échoue
            setProfile(defaultProfile);
            return;
          }

          console.log('✅ Profil par défaut créé');
          setProfile(defaultProfile);
        } catch (insertError) {
          console.error('❌ Exception lors de l\'insertion:', insertError);
          // Utiliser le profil en mémoire
          setProfile(defaultProfile);
          return;
        }
      } else {
        console.log('✅ Profil récupéré:', profileData);
        setProfile(profileData);
      }

    } catch (err) {
      console.error('❌ Erreur chargement profil:', err);
      
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement du profil';
      setError(errorMessage);
      
      // Ne pas afficher de toast d'erreur pour éviter le spam
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Mettre à jour le profil
  const updateProfile = useCallback(async (updatedData: Partial<ProfileData>) => {
    if (!profile) {
      console.error('❌ Aucun profil à mettre à jour');
      return { success: false, error: 'Aucun profil à mettre à jour' };
    }

    try {
      console.log('🔄 Mise à jour du profil...');

      // Utiliser user_id si disponible, sinon id
      const whereClause = profile.user_id 
        ? { user_id: profile.user_id }
        : { id: profile.id };

      const { error } = await supabase
        .from('profiles')
        .update({
          ...updatedData,
          updated_at: new Date().toISOString()
        })
        .match(whereClause);

      if (error) {
        console.error('❌ Erreur mise à jour Supabase:', error);
        throw error;
      }

      console.log('✅ Profil mis à jour avec succès');

      // Mettre à jour le profil local
      setProfile(prev => prev ? { ...prev, ...updatedData, updated_at: new Date().toISOString() } : null);

      return { success: true };
    } catch (err) {
      console.error('❌ Erreur mise à jour profil:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
      return { success: false, error: errorMessage };
    }
  }, [profile]);

  // Rafraîchir le profil
  const refreshProfile = useCallback(async () => {
    console.log('🔄 Rafraîchissement du profil...');
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