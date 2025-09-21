/**
 * Contexte d'authentification global pour éviter les multiples instances
 * et optimiser les performances
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { trackEvent, trackError } from '@/lib/sentry';
import { logger } from '@/lib/logger';

interface AuthContextType {
  user: any;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // ✅ OPTIMISATION: Cache pour éviter les appels répétés
  const userCache = useMemo(() => user, [user?.id, user?.email]);

  const getInitialSession = useCallback(async () => {
    if (isInitialized) return; // ✅ Éviter les appels multiples

    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        logger.error('Erreur récupération session:', error);
      }
      
      logger.log('🔍 Session récupérée (contexte):', session?.user?.email || 'Aucun utilisateur');
      setUser(session?.user ?? null);

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
      setIsInitialized(true);
    }
  }, [isInitialized]);

  const refreshUser = useCallback(async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
    } catch (error) {
      logger.error('Erreur refresh user:', error);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      
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
  }, [toast, user?.id]);

  useEffect(() => {
    getInitialSession();

    // ✅ OPTIMISATION: Un seul listener global
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // ✅ Debounce pour éviter les appels répétés
        if (event === 'INITIAL_SESSION' && isInitialized) {
          return; // Ignorer si déjà initialisé
        }

        logger.log('🔄 Auth state change (contexte):', event, session?.user?.email || 'Aucun utilisateur');
        
        setUser(session?.user ?? null);
        setLoading(false);

        if (event === 'SIGNED_OUT') {
          navigate('/');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [getInitialSession, navigate, isInitialized]);

  const contextValue = useMemo(() => ({
    user: userCache,
    loading,
    isAuthenticated: !!userCache,
    isAdmin: userCache?.email === 'clodenerc@yahoo.fr',
    signOut,
    refreshUser
  }), [userCache, loading, signOut, refreshUser]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
