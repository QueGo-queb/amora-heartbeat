import { useNavigate, useLocation } from 'react-router-dom';
import { useCallback } from 'react';

interface NavigationHistory {
  path: string;
  timestamp: number;
  title?: string;
}

export function useAdminNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  // Historique de navigation pour l'admin
  const getNavigationHistory = useCallback((): NavigationHistory[] => {
    const history = sessionStorage.getItem('adminNavigationHistory');
    return history ? JSON.parse(history) : [];
  }, []);

  // Ajouter une page à l'historique
  const addToHistory = useCallback((path: string, title?: string) => {
    const history = getNavigationHistory();
    const newEntry: NavigationHistory = {
      path,
      timestamp: Date.now(),
      title
    };

    // Éviter les doublons consécutifs
    if (history.length === 0 || history[history.length - 1].path !== path) {
      history.push(newEntry);
      
      // Garder seulement les 10 dernières pages
      if (history.length > 10) {
        history.shift();
      }
      
      sessionStorage.setItem('adminNavigationHistory', JSON.stringify(history));
    }
  }, [getNavigationHistory]);

  // Retour à la page précédente
  const goBack = useCallback(() => {
    const history = getNavigationHistory();
    
    if (history.length > 1) {
      // Retirer la page actuelle
      history.pop();
      // Retourner à la page précédente
      const previousPage = history[history.length - 1];
      navigate(previousPage.path);
      
      // Mettre à jour l'historique
      sessionStorage.setItem('adminNavigationHistory', JSON.stringify(history));
    } else {
      // Retour à l'admin principal
      navigate('/admin');
    }
  }, [navigate, getNavigationHistory]);

  // Retour à une page spécifique
  const goToPage = useCallback((path: string) => {
    navigate(path);
    addToHistory(path);
  }, [navigate, addToHistory]);

  // Retour à l'admin principal
  const goToMainAdmin = useCallback(() => {
    navigate('/admin');
    // Réinitialiser l'historique
    sessionStorage.removeItem('adminNavigationHistory');
  }, [navigate]);

  // Vérifier si on peut revenir en arrière
  const canGoBack = useCallback((): boolean => {
    const history = getNavigationHistory();
    return history.length > 1;
  }, [getNavigationHistory]);

  // Obtenir la page précédente
  const getPreviousPage = useCallback((): NavigationHistory | null => {
    const history = getNavigationHistory();
    return history.length > 1 ? history[history.length - 2] : null;
  }, [getNavigationHistory]);

  return {
    goBack,
    goToPage,
    goToMainAdmin,
    canGoBack,
    getPreviousPage,
    addToHistory,
    currentPath: location.pathname
  };
}
