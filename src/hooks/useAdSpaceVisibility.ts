import { useState, useEffect } from 'react';

interface AdSpaceVisibility {
  isVisible: boolean;
  toggleVisibility: () => void;
  setVisibility: (visible: boolean) => void;
}

export function useAdSpaceVisibility(): AdSpaceVisibility {
  const [isVisible, setIsVisible] = useState(() => {
    // Récupérer l'état depuis le localStorage au chargement
    const saved = localStorage.getItem('adSpaceVisibility');
    return saved ? JSON.parse(saved) : true; // Par défaut visible
  });

  // Sauvegarder l'état dans le localStorage à chaque changement
  useEffect(() => {
    localStorage.setItem('adSpaceVisibility', JSON.stringify(isVisible));
  }, [isVisible]);

  const toggleVisibility = () => {
    setIsVisible(prev => !prev);
  };

  const setVisibility = (visible: boolean) => {
    setIsVisible(visible);
  };

  return {
    isVisible,
    toggleVisibility,
    setVisibility
  };
}
