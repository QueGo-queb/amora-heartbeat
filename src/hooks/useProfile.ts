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
  
  // ✅ CORRECTION: Cache local pour éviter les appels multiples
  const cacheRef = useRef<{ [key: string]: ProfileData }>({});
  const isLoadingRef = useRef(false);

  // ✅ CORRECTION: Fonction de chargement optimisée
  const loadProfile = useCallback(async (forceRefresh = false) => {
    if (!user?.id || isLoadingRef.current) return;

    // Vérifier le cache si pas de force refresh
    if (!forceRefresh && cacheRef.current[user.id]) {
      setProfile(cacheRef.current[user.id]);
      setLoading(false);
      return;
    }

    try {
      isLoadingRef.current = true;
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        // ✅ Mise en cache
        cacheRef.current[user.id] = data;
        setProfile(data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [user?.id, toast]);

  // ✅ CORRECTION: Mise à jour avec invalidation de cache
  const updateProfile = useCallback(async (updates: Partial<ProfileData>) => {
    if (!profile || !user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      // ✅ Mise à jour immédiate + cache
      const updatedProfile = { ...profile, ...data };
      cacheRef.current[user.id] = updatedProfile;
      setProfile(updatedProfile);
      
      toast({
        title: "✅ Profil mis à jour",
        description: "Vos modifications ont été sauvegardées",
      });

      return data;
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "❌ Erreur",
        description: "Impossible de sauvegarder les modifications",
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [profile, user, toast]);

  // ✅ CORRECTION: useEffect optimisé
  useEffect(() => {
    if (user?.id) {
      loadProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user?.id, loadProfile]);

  return {
    profile,
    loading,
    error,
    loadProfile,
    refreshProfile: () => loadProfile(true), // Force refresh
    updateProfile,
  };
}