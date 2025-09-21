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
  // Améliorer la fonction setSelectedLanguage avec retry
  const setSelectedLanguage = (language: string) => {
    console.log('🌐 Language change requested:', language);
    
    setSelectedLanguageState(language);
    localStorage.setItem('amora-language', language);
    
    // ✅ MÉTHODE 1: Google Translate
    if (window.changeLanguage) {
      window.changeLanguage(language);
      
      // ✅ MÉTHODE 2: Vérification + rechargement si nécessaire
      setTimeout(() => {
        const testElements = document.querySelectorAll('h1, h2, h3, p, button, label');
        let hasTranslated = false;
        
        // Vérifier si au moins un élément a été traduit
        testElements.forEach(el => {
          const text = el.textContent?.toLowerCase() || '';
          if (language === 'en' && (text.includes('welcome') || text.includes('create') || text.includes('discover'))) {
            hasTranslated = true;
          }
          if (language === 'es' && (text.includes('bienvenido') || text.includes('crear') || text.includes('descubrir'))) {
            hasTranslated = true;
          }
          if (language === 'pt' && (text.includes('bem-vindo') || text.includes('criar') || text.includes('descobrir'))) {
            hasTranslated = true;
          }
        });
        
        if (!hasTranslated && language !== 'fr') {
          console.log('⚠️ Translation not detected, forcing page reload...');
          window.location.reload();
        } else {
          console.log('✅ Translation successful!');
        }
      }, 3000);
    } else {
      console.log('⚠️ Google Translate not available, reloading page...');
      window.location.reload();
    }
  };

  // Ajouter un useEffect pour appliquer la langue sauvegardée au chargement
  useEffect(() => {
    const savedLanguage = localStorage.getItem('amora-language');
    if (savedLanguage && savedLanguage !== 'fr') {
      console.log('🔄 Applying saved language:', savedLanguage);
      // Attendre que la page soit chargée
      setTimeout(() => {
        if (window.changeLanguage) {
          window.changeLanguage(savedLanguage);
        }
      }, 2000);
    }
  }, []);

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
