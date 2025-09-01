import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Récupérer la session initiale
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getInitialSession();

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);

        // Gérer les redirections automatiques
        if (event === 'SIGNED_IN' && session?.user) {
          if (session.user.email === 'clodenerc@yahoo.fr') {
            navigate('/admin');
          } else {
            navigate('/dashboard');
          }
        } else if (event === 'SIGNED_OUT') {
          navigate('/');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Déconnexion",
        description: "Vous avez été déconnecté avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la déconnexion.",
        variant: "destructive",
      });
    }
  };

  return {
    user,
    loading,
    signOut,
    isAuthenticated: !!user,
    isAdmin: user?.email === 'clodenerc@yahoo.fr'
  };
};
