/**
 * Contexte global avec intégration Google Translate
 */
import React, { createContext, useContext, useState, useEffect } from 'react';

interface LanguageContextType {
  selectedLanguage: string;
  setSelectedLanguage: (language: string) => void;
  isGoogleTranslateReady: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedLanguage, setSelectedLanguageState] = useState(() => {
    return localStorage.getItem('amora-language') || 'fr';
  });
  
  const [isGoogleTranslateReady, setIsGoogleTranslateReady] = useState(false);

  // ✅ VÉRIFIER SI GOOGLE TRANSLATE EST PRÊT
  useEffect(() => {
    const checkGoogleTranslate = () => {
      if (window.google && window.google.translate) {
        setIsGoogleTranslateReady(true);
        console.log('✅ Google Translate ready');
      } else {
        setTimeout(checkGoogleTranslate, 500);
      }
    };
    
    // Vérifier immédiatement et après 2 secondes
    checkGoogleTranslate();
    setTimeout(checkGoogleTranslate, 2000);
  }, []);

  // ✅ FONCTION DE CHANGEMENT DE LANGUE AVEC GOOGLE TRANSLATE
  const setSelectedLanguage = (language: string) => {
    console.log('🌐 Language change requested:', language);
    
    setSelectedLanguageState(language);
    localStorage.setItem('amora-language', language);
    
    // ✅ DÉCLENCHER GOOGLE TRANSLATE
    if (window.changeLanguage) {
      window.changeLanguage(language);
    } else {
      console.log('⚠️ Google Translate function not available yet');
    }
  };

  return (
    <LanguageContext.Provider value={{ 
      selectedLanguage, 
      setSelectedLanguage,
      isGoogleTranslateReady 
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
