/**
 * Composant pour générer automatiquement les balises hreflang
 * Compatible avec toutes les pages existantes
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface Language {
  code: string;
  domain: string; // Sera votre domaine final
}

const languages: Language[] = [
  { code: 'fr', domain: 'https://amora.ca' }, // Votre domaine principal
  { code: 'en', domain: 'https://amora.ca' },
  { code: 'ht', domain: 'https://amora.ca' },
  { code: 'es', domain: 'https://amora.ca' },
  { code: 'pt', domain: 'https://amora.ca' }
];

export const HreflangTags = () => {
  const location = useLocation();

  useEffect(() => {
    // Nettoyer les balises hreflang existantes
    const existingTags = document.querySelectorAll('link[hreflang]');
    existingTags.forEach(tag => tag.remove());

    // Créer les nouvelles balises hreflang
    languages.forEach(lang => {
      const link = document.createElement('link');
      link.rel = 'alternate';
      link.hreflang = lang.code;
      
      // Générer l'URL avec préfixe langue
      const currentPath = location.pathname === '/' ? '' : location.pathname;
      link.href = `${lang.domain}/${lang.code}${currentPath}`;
      
      document.head.appendChild(link);
    });

    // Ajouter la balise x-default (français comme défaut)
    const defaultLink = document.createElement('link');
    defaultLink.rel = 'alternate';
    defaultLink.hreflang = 'x-default';
    defaultLink.href = `https://amora.ca${location.pathname}`;
    document.head.appendChild(defaultLink);

  }, [location.pathname]);

  return null; // Composant invisible
};
