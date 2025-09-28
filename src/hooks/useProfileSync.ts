import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export function useProfileSync() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // ✅ CORRECTION: Chargement initial optimisé
  const loadProfile = useCallback(async () => {
    if (!user?.id) return;

    try {
      setError(null); // Clear previous error before new fetch
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // ✅ CORRECTION: Mise à jour avec synchronisation temps réel
  const updateProfile = useCallback(async (updates) => {
    if (!user?.id) return;

    try {
      setLoading(true);
      
      // Mise à jour en base
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      // ✅ Mise à jour immédiate de l'état local
      setProfile(data);
      
      // ✅ Notification de succès
      toast({
        title: "✅ Profil mis à jour",
        description: "Vos modifications ont été sauvegardées",
      });

      return data;
    } catch (err) {
      toast({
        title: "❌ Erreur",
        description: "Impossible de sauvegarder les modifications",
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.id, toast]);

  // ✅ CORRECTION: Écoute des changements en temps réel
  useEffect(() => {
    if (!user?.id) return;

    // Chargement initial
    loadProfile();

    // ✅ Écoute des changements en temps réel
    const channel = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('🔄 Changement profil détecté:', payload.new);
          setProfile(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, loadProfile]);

  return {
    profile,
    loading,
    error,
    updateProfile,
    refreshProfile: loadProfile,
  };
}
