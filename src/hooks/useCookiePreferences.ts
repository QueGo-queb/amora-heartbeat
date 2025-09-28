import { useState, useEffect } from 'react';

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  preferences: boolean;
  advertising: boolean;
}

export const useCookiePreferences = () => {
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    preferences: false,
    advertising: false
  });

  const [hasMadeChoice, setHasMadeChoice] = useState(false);

  useEffect(() => {
    // Charger les préférences depuis localStorage
    const savedPreferences = localStorage.getItem('amora-cookie-preferences');
    const choiceMade = localStorage.getItem('amora-cookie-choice-made');
    
    if (savedPreferences) {
      try {
        const parsedPreferences = JSON.parse(savedPreferences);
        // Valider que les préférences parsées correspondent à la structure attendue
        if (parsedPreferences && typeof parsedPreferences === 'object' && 
            'essential' in parsedPreferences && 'analytics' in parsedPreferences &&
            'preferences' in parsedPreferences && 'advertising' in parsedPreferences) {
          setPreferences(parsedPreferences);
        } else {
          console.warn('Préférences de cookies corrompues, utilisation des valeurs par défaut');
          localStorage.removeItem('amora-cookie-preferences');
        }
      } catch (error) {
        console.error('Erreur lors du parsing des préférences de cookies:', error);
        localStorage.removeItem('amora-cookie-preferences');
        // Continuer avec les valeurs par défaut
      }
    }
    
    if (choiceMade === 'true') {
      setHasMadeChoice(true);
    }
  }, []);

  const updatePreferences = (newPreferences: CookiePreferences) => {
    setPreferences(newPreferences);
    localStorage.setItem('amora-cookie-preferences', JSON.stringify(newPreferences));
    localStorage.setItem('amora-cookie-choice-made', 'true');
    setHasMadeChoice(true);
  };

  const resetPreferences = () => {
    const defaultPreferences: CookiePreferences = {
      essential: true,
      analytics: false,
      preferences: false,
      advertising: false
    };
    updatePreferences(defaultPreferences);
  };

  return {
    preferences,
    hasMadeChoice,
    updatePreferences,
    resetPreferences
  };
};
