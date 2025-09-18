import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useAdminCheck = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        // Méthode 1: Vérifier l'email hardcodé (admin principal)
        if (user.email === 'clodenerc@yahoo.fr') {
          setIsAdmin(true);
          setLoading(false);
          return;
        }

        // Méthode 2: Vérifier le role dans user_metadata
        if (user.user_metadata?.role === 'admin') {
          setIsAdmin(true);
          setLoading(false);
          return;
        }

        // Méthode 3: Vérifier le role dans la table profiles
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Erreur vérification admin:', error);
          setIsAdmin(false);
        } else {
          setIsAdmin(profile?.role === 'admin');
        }

      } catch (error) {
        console.error('Erreur dans checkAdminStatus:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  return { isAdmin, loading };
};
