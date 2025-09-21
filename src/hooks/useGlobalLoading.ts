/**
 * Hook global pour gérer tous les états de chargement
 * Évite les incohérences et améliore l'UX
 */

import { useState, useCallback, useRef } from 'react';

interface LoadingState {
  [key: string]: boolean;
}

export function useGlobalLoading() {
  const [loadingStates, setLoadingStates] = useState<LoadingState>({});
  const timeoutsRef = useRef<{ [key: string]: NodeJS.Timeout }>({});

  const setLoading = useCallback((key: string, isLoading: boolean, minDuration = 500) => {
    if (isLoading) {
      // Commencer le chargement immédiatement
      setLoadingStates(prev => ({ ...prev, [key]: true }));
    } else {
      // ✅ OPTIMISATION: Durée minimale de chargement pour éviter les flashs
      if (timeoutsRef.current[key]) {
        clearTimeout(timeoutsRef.current[key]);
      }

      timeoutsRef.current[key] = setTimeout(() => {
        setLoadingStates(prev => ({ ...prev, [key]: false }));
        delete timeoutsRef.current[key];
      }, minDuration);
    }
  }, []);

  const isLoading = useCallback((key: string) => {
    return loadingStates[key] || false;
  }, [loadingStates]);

  const isAnyLoading = useCallback(() => {
    return Object.values(loadingStates).some(Boolean);
  }, [loadingStates]);

  return {
    setLoading,
    isLoading,
    isAnyLoading,
    loadingStates
  };
}
