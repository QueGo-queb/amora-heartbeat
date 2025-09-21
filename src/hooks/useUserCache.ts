/**
 * Hook de cache pour optimiser les données utilisateur
 * Évite les requêtes répétées et améliore les performances
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface CachedUserData {
  profile?: any;
  premiumStatus?: any;
  lastUpdated: number;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useUserCache() {
  const [cache, setCache] = useState<CachedUserData | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const cacheRef = useRef<CachedUserData | null>(null);

  const isCacheValid = useCallback(() => {
    if (!cacheRef.current) return false;
    return Date.now() - cacheRef.current.lastUpdated < CACHE_DURATION;
  }, []);

  const fetchUserData = useCallback(async (forceRefresh = false) => {
    if (!user?.id) return null;

    // ✅ Utiliser le cache si valide et pas de force refresh
    if (!forceRefresh && isCacheValid() && cacheRef.current) {
      return cacheRef.current;
    }

    try {
      setLoading(true);

      // Récupérer le profil et le statut premium en parallèle
      const [profileResult, premiumResult] = await Promise.all([
        supabase
          .from('users')
          .select('*')
          .eq('user_id', user.id)
          .single(),
        supabase
          .from('users')
          .select('plan, premium_since')
          .eq('user_id', user.id)
          .single()
      ]);

      const newCache: CachedUserData = {
        profile: profileResult.data,
        premiumStatus: premiumResult.data,
        lastUpdated: Date.now()
      };

      setCache(newCache);
      cacheRef.current = newCache;
      
      return newCache;

    } catch (error) {
      console.error('Erreur cache utilisateur:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user?.id, isCacheValid]);

  const invalidateCache = useCallback(() => {
    setCache(null);
    cacheRef.current = null;
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchUserData();
    } else {
      invalidateCache();
    }
  }, [user?.id, fetchUserData, invalidateCache]);

  return {
    cache,
    loading,
    refresh: fetchUserData,
    invalidate: invalidateCache,
    isValid: isCacheValid()
  };
}
