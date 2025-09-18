import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

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

export function useProfile() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // 🔧 CORRECTION PRINCIPALE - Requête SQL simplifiée et sécurisée
  const loadProfile = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Chargement du profil pour:', user.email);

      // 🔧 CORRECTION 1: Requête simplifiée - chercher d'abord par user_id
      let { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle(); // maybeSingle() au lieu de single() pour éviter l'erreur si pas trouvé

      // 🔧 CORRECTION 2: Si pas trouvé par user_id, chercher par id
      if (!existingProfile && !profileError) {
        const result = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        
        existingProfile = result.data;
        profileError = result.error;
      }

      if (profileError) {
        console.error('❌ Erreur récupération profil:', profileError);
        throw profileError;
      }

      if (existingProfile) {
        console.log('✅ Profil trouvé:', existingProfile.full_name);
        setProfile(existingProfile);
      } else {
        console.log('⚠️ Aucun profil trouvé, création automatique...');
        
        // 🔧 CORRECTION 3: Vérifier d'abord si un profil existe déjà (pour éviter la contrainte unique)
        const { data: checkExisting } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (checkExisting) {
          // Un profil existe déjà, le récupérer
          const { data: foundProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();
          
          if (foundProfile) {
            setProfile(foundProfile);
            return;
          }
        }

        // 🔧 CORRECTION 4: Création sécurisée avec UPSERT
        const newProfile = {
          user_id: user.id, // Utiliser user_id au lieu de id personnalisé
          email: user.email || '',
          full_name: user.user_metadata?.full_name || 'Utilisateur',
          interests: [],
          bio: '',
          country: '',
          language: 'fr',
          plan: 'free' as const,
          is_active: true,
          avatar_url: null
        };

        console.log('📝 Création du profil:', newProfile);

        // 🔧 CORRECTION 5: Utiliser UPSERT pour éviter les conflits
        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .upsert(newProfile, { 
            onConflict: 'user_id',
            ignoreDuplicates: false 
          })
          .select()
          .single();

        if (createError) {
          console.error('❌ Erreur création profil:', createError);
          throw createError;
        }

        console.log('✅ Profil créé avec succès:', createdProfile.full_name);
        setProfile(createdProfile);
      }

    } catch (error: any) {
      console.error('❌ Erreur loadProfile:', error);
      setError(error.message);
      
      // 🔧 CORRECTION 6: Ne pas afficher le toast d'erreur si c'est juste un problème de contrainte
      if (!error.message.includes('unique constraint')) {
        toast({
          title: "Erreur de profil",
          description: "Impossible de charger votre profil",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [user?.id, toast]); // 🔧 CORRECTION 7: Dépendances minimales

  // Mettre à jour le profil
  const updateProfile = useCallback(async (updates: Partial<ProfileData>) => {
    if (!profile || !user) return;

    try {
      setLoading(true);
      setError(null);

      console.log('📝 Mise à jour du profil:', updates);

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id) // 🔧 CORRECTION 8: Utiliser user_id uniquement
        .select()
        .single();

      if (error) {
        console.error('❌ Erreur mise à jour profil:', error);
        throw error;
      }

      console.log('✅ Profil mis à jour avec succès:', data);
      setProfile(data);
      
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été sauvegardées avec succès",
      });

      return data;
    } catch (error: any) {
      console.error('❌ Erreur updateProfile:', error);
      setError(error.message);
      
      toast({
        title: "Erreur de mise à jour",
        description: "Impossible de sauvegarder vos modifications",
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setLoading(false);
    }
  }, [profile, user, toast]);

  // 🔧 CORRECTION 9: useEffect avec protection contre les appels multiples
  useEffect(() => {
    if (user?.id && !profile && !loading) {
      loadProfile();
    }
  }, [user?.id]); // Dépendance minimale pour éviter les boucles

  return {
    profile,
    loading,
    error,
    loadProfile,
    updateProfile,
  };
}