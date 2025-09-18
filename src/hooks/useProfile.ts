import { useState, useEffect, useCallback, useRef } from 'react';
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
  
  // 🔧 CORRECTION 1: Utiliser useRef pour éviter les appels multiples
  const hasLoadedRef = useRef(false);
  const isLoadingRef = useRef(false);

  // 🔧 CORRECTION 2: Fonction loadProfile stable avec protection
  const loadProfile = useCallback(async () => {
    if (!user?.id || isLoadingRef.current) {
      setLoading(false);
      return;
    }

    // Éviter les appels multiples
    if (hasLoadedRef.current && profile) {
      setLoading(false);
      return;
    }

    try {
      isLoadingRef.current = true;
      setLoading(true);
      setError(null);

      console.log('🔍 Chargement du profil pour:', user.email);

      // 🔧 CORRECTION 3: Requête simplifiée - chercher d'abord par user_id
      let { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      // Si pas trouvé par user_id, chercher par id
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
        hasLoadedRef.current = true;
      } else {
        console.log('⚠️ Aucun profil trouvé, vérification approfondie...');
        
        // Vérifier d'abord si un profil existe déjà (recherche exhaustive)
        const { data: existingProfiles } = await supabase
          .from('profiles')
          .select('*')
          .or(`user_id.eq.${user.id},email.eq.${user.email}`)
          .limit(1);

        if (existingProfiles && existingProfiles.length > 0) {
          console.log('✅ Profil existant trouvé:', existingProfiles[0].full_name);
          setProfile(existingProfiles[0]);
          hasLoadedRef.current = true;
          return;
        }

        // Seulement créer un nouveau profil si vraiment aucun n'existe
        console.log('�� Aucun profil existant, création nécessaire...');
        
        // Ne créer un profil que si l'utilisateur n'a vraiment pas de profil
        // et seulement avec les métadonnées disponibles
        const newProfile = {
          user_id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || 'Utilisateur',
          interests: [],
          bio: '',
          country: '',
          language: 'fr',
          plan: 'free' as const,
          is_active: true,
          avatar_url: null
        };

        console.log('�� Création du profil de secours:', newProfile);

        // Utiliser INSERT au lieu d'UPSERT pour éviter d'écraser un profil existant
        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single();

        if (createError) {
          // Si l'erreur est due à un conflit (profil existe déjà), essayer de le récupérer
          if (createError.code === '23505') {
            console.log('�� Profil existe déjà, tentative de récupération...');
            const { data: existingProfile } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', user.id)
              .single();
            
            if (existingProfile) {
              setProfile(existingProfile);
              hasLoadedRef.current = true;
              return;
            }
          }
          
          console.error('❌ Erreur création profil:', createError);
          throw createError;
        }

        console.log('✅ Profil créé avec succès:', createdProfile.full_name);
        setProfile(createdProfile);
        hasLoadedRef.current = true;
      }

    } catch (error: any) {
      console.error('❌ Erreur loadProfile:', error);
      setError(error.message);
      
      if (!error.message.includes('unique constraint')) {
        toast({
          title: "Erreur de profil",
          description: "Impossible de charger votre profil",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [user?.id, user?.email, user?.user_metadata?.full_name, toast, profile]);

  const updateProfile = useCallback(async (updates: Partial<ProfileData>) => {
    if (!profile || !user) return;

    try {
      setLoading(true);
      setError(null);

      console.log('📝 Mise à jour du profil:', updates);

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id)
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

  // 🔧 CORRECTION 4: useEffect optimisé avec reset sur changement d'utilisateur
  useEffect(() => {
    if (user?.id) {
      // Reset si changement d'utilisateur
      if (hasLoadedRef.current && profile && profile.user_id !== user.id) {
        hasLoadedRef.current = false;
        setProfile(null);
      }
      
      // Charger seulement si pas encore chargé
      if (!hasLoadedRef.current && !isLoadingRef.current) {
        loadProfile();
      }
    } else {
      // Reset si pas d'utilisateur
      hasLoadedRef.current = false;
      setProfile(null);
      setLoading(false);
    }
  }, [user?.id]); // 🔧 CORRECTION 5: Dépendance minimale

  // 🔧 CORRECTION 6: Cleanup à la destruction du composant
  useEffect(() => {
    return () => {
      hasLoadedRef.current = false;
      isLoadingRef.current = false;
    };
  }, []);

  return {
    profile,
    loading,
    error,
    loadProfile,
    refreshProfile: loadProfile, // 🔧 AJOUT: Alias pour compatibilité
    updateProfile,
  };
}