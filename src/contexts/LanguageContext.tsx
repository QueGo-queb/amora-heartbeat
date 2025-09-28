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

  // ✅ VÉRIFIER SI GOOGLE TRANSLATE EST PRÊT - ANTI-BOUCLE INFINIE
  useEffect(() => {
    let attemptCount = 0;
    const maxAttempts = 10; // ✅ LIMITE STRICTE
    
    const checkGoogleTranslate = () => {
      attemptCount++;
      
      if (attemptCount > maxAttempts) {
        console.warn('🛑 Google Translate check timeout après', maxAttempts, 'tentatives');
        return;
      }
      
      if (window.google && window.google.translate) {
        setIsGoogleTranslateReady(true);
        console.log('✅ Google Translate ready après', attemptCount, 'tentatives');
      } else {
        setTimeout(checkGoogleTranslate, 500);
      }
    };
    
    // Vérifier immédiatement et après 2 secondes
    checkGoogleTranslate();
    const timeoutId = setTimeout(checkGoogleTranslate, 2000);
    
    // ✅ CLEANUP IMPORTANT
    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  // ✅ FONCTION DE CHANGEMENT DE LANGUE AVEC GOOGLE TRANSLATE
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
          // ✅ SÉCURITÉ: Éviter les reloads en boucle
          const reloadCount = parseInt(sessionStorage.getItem('amora-reload-count') || '0');
          if (reloadCount < 2) { // ✅ Maximum 2 reloads
            console.log('⚠️ Translation not detected, forcing page reload... (tentative', reloadCount + 1, '/2)');
            sessionStorage.setItem('amora-reload-count', String(reloadCount + 1));
            window.location.reload();
          } else {
            console.warn('🛑 Trop de reloads, arrêt de la traduction automatique');
            sessionStorage.removeItem('amora-reload-count');
            // ✅ FALLBACK: Utiliser les traductions internes
            console.log('🔄 Utilisation des traductions internes comme fallback');
          }
        } else {
          console.log('✅ Translation successful!');
          sessionStorage.removeItem('amora-reload-count'); // ✅ Reset counter sur succès
        }
      }, 3000);
    } else {
      // ✅ SÉCURITÉ: Éviter les reloads en boucle même en fallback
      const reloadCount = parseInt(sessionStorage.getItem('amora-reload-count') || '0');
      if (reloadCount < 1) { // ✅ Une seule tentative pour le fallback
        console.log('⚠️ Google Translate not available, reloading page...');
        sessionStorage.setItem('amora-reload-count', '1');
        window.location.reload();
      } else {
        console.warn('🛑 Google Translate indisponible, utilisation des traductions internes');
        sessionStorage.removeItem('amora-reload-count');
      }
    }
  };

  // ✅ CORRIGÉ: Éviter la boucle infinie Google Translate
  useEffect(() => {
    const savedLanguage = localStorage.getItem('amora-language');
    if (savedLanguage && savedLanguage !== 'fr' && isGoogleTranslateReady) {
      console.log('🔄 Applying saved language:', savedLanguage);
      // Une seule tentative avec timeout plus long
      const timeoutId = setTimeout(() => {
        if (window.changeLanguage && typeof window.changeLanguage === 'function') {
          try {
            window.changeLanguage(savedLanguage);
          } catch (error) {
            console.warn('⚠️ Erreur Google Translate, utilisation des traductions internes');
            setSelectedLanguage(savedLanguage);
          }
        }
      }, 3000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [isGoogleTranslateReady]); // ✅ Dépendre de l'état Google Translate

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
