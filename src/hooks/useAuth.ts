import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { trackEvent, trackError } from '@/lib/sentry';
import { logger } from '@/lib/logger';
import type { AuthUser } from '@/types/auth';
import type { User } from '@supabase/supabase-js';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // ✅ OPTIMISÉ: useCallback pour éviter les re-renders
  const getInitialSession = useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        logger.error('Erreur récupération session:', error);
      }
      
      logger.log('🔍 Session récupérée:', session?.user?.email || 'Aucun utilisateur');
      setUser(session?.user ?? null);

      // Tracker les connexions réussies
      if (session?.user) {
        trackEvent('user_session_restored', {
          category: 'auth',
          action: 'session_restore',
          userId: session.user.id,
        });
      }
    } catch (error) {
      logger.error('Erreur lors de la récupération de session:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ SOLUTION BOUCLE INFINIE - signOut stable
  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      
      // Tracker la déconnexion
      trackEvent('user_logout', {
        category: 'auth',
        action: 'logout',
        userId: user?.id,
      });
      
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès.",
      });
    } catch (error) {
      logger.error('Erreur lors de la déconnexion:', error);
      trackError(error);
    }
  }, [toast]); // ✅ Seulement toast - user sera mis à jour par l'auth state change

  useEffect(() => {
    getInitialSession();

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        logger.log('🔄 Auth state change:', event, session?.user?.email || 'Aucun utilisateur');
        
        setUser(session?.user ?? null);
        setLoading(false);

        if (event === 'SIGNED_OUT') {
          navigate('/');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []); // ✅ Tableau vide - getInitialSession et navigate sont stables

  // ✅ OPTIMISÉ: useMemo pour les valeurs dérivées
  const authState = useMemo(() => ({
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.email === 'clodenerc@yahoo.fr'
  }), [user, loading]);

  return {
    ...authState,
    signOut
  };
};
