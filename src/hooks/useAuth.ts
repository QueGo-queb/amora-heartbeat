import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { trackEvent, trackError } from '@/lib/sentry';

export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Récupérer la session initiale
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erreur récupération session:', error);
        }
        
        console.log('🔍 Session récupérée:', session?.user?.email || 'Aucun utilisateur');
        setUser(session?.user ?? null);

        // Tracker les connexions réussies dans getInitialSession
        if (session?.user) {
          trackEvent('user_session_restored', {
            category: 'auth',
            action: 'session_restore',
            userId: session.user.id,
          });
        }
      } catch (error) {
        console.error('Erreur lors de la récupération de session:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state change:', event, session?.user?.email || 'Aucun utilisateur');
        
        setUser(session?.user ?? null);
        setLoading(false);

        // **SUPPRESSION DES REDIRECTIONS AUTOMATIQUES PROBLÉMATIQUES**
        // Ne pas rediriger automatiquement depuis le feed
        // L'utilisateur peut rester sur la page qu'il visite
        
        if (event === 'SIGNED_OUT') {
          // Seulement rediriger lors de la déconnexion
          navigate('/');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      
      // Tracker la déconnexion
      trackEvent('user_logout', {
        category: 'auth',
        action: 'logout',
        userId: user?.id,
      });
      
      toast({
        title: "Déconnexion",
        description: "Vous avez été déconnecté avec succès.",
      });
    } catch (error) {
      // Tracker l'erreur de déconnexion
      trackError(error as Error, {
        userId: user?.id,
        action: 'logout',
        metadata: { 
          timestamp: Date.now(),
          userAgent: navigator.userAgent 
        }
      });
      
      toast({
        title: "Erreur",
        description: "Erreur lors de la déconnexion.",
        variant: "destructive",
      });
    }
  };

  // Vérification admin simple et fiable
  const isAdminLegacy = user?.email === 'clodenerc@yahoo.fr';

  return {
    user,
    loading,
    signOut,
    isAuthenticated: !!user,
    isAdmin: isAdminLegacy,
  };
};
