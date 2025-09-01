/**
 * Hook simplifié pour gérer le contenu du footer
 * Version web app simple sans base de données complexe
 */

import { useState, useEffect } from 'react';

interface FooterContent {
  id: string;
  links: {
    home: string;
    about: string;
    contact: string;
    faq: string;
    terms: string;
    privacy: string;
  };
  socials: {
    facebook: string;
    instagram: string;
    twitter: string;
    linkedin: string;
    tiktok: string;
  };
  newsletter_text: string;
  copyright: string;
  updated_at: string;
}

export function useFooter() {
  const [footerContent, setFooterContent] = useState<FooterContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Charger le contenu du footer avec des données par défaut
    const defaultContent: FooterContent = {
      id: 'default',
      links: {
        home: '/',
        about: '/about',
        contact: '/contact',
        faq: '/faq',
        terms: '/terms',
        privacy: '/privacy'
      },
      socials: {
        facebook: 'https://facebook.com/amora',
        instagram: 'https://instagram.com/amora',
        twitter: 'https://twitter.com/amora',
        linkedin: 'https://linkedin.com/company/amora',
        tiktok: 'https://tiktok.com/@amora'
      },
      newsletter_text: 'Restez informé de nos dernières actualités',
      copyright: `© ${new Date().getFullYear()} Amora - Tous droits réservés`,
      updated_at: new Date().toISOString()
    };

    setFooterContent(defaultContent);
    setLoading(false);
  }, []);

  return {
    footerContent,
    loading,
    error: null
  };
}
