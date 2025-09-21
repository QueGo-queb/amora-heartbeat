/**
 * Composant pour gérer les métadonnées SEO multilingues
 * S'adapte automatiquement à la langue sélectionnée
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface MetaData {
  title: string;
  description: string;
  keywords: string;
}

const seoTranslations: Record<string, Record<string, MetaData>> = {
  '/': {
    fr: {
      title: 'AMORA - Trouvez l\'amour sans frontières | Rencontres multiculturelles',
      description: 'Plateforme de rencontres multiculturelle pour célibataires haïtiens, latinos, caribéens et africains. Trouvez votre âme sœur aujourd\'hui !',
      keywords: 'rencontres, amour, haïti, latino, caribéen, africain, célibataires, multiculturel'
    },
    en: {
      title: 'AMORA - Find Love Without Borders | Multicultural Dating',
      description: 'Multicultural dating platform for Haitian, Latino, Caribbean and African singles. Find your soulmate today!',
      keywords: 'dating, love, haiti, latino, caribbean, african, singles, multicultural'
    },
    ht: {
      title: 'AMORA - Jwenn Lanmou San Fwontyè | Randevou Kiltirèl',
      description: 'Platfòm randevou kiltirèl pou selibatè Ayisyen, Latino, Karayib ak Afriken yo. Jwenn nanm frè ou jodi a!',
      keywords: 'randevou, lanmou, ayiti, latino, karayib, afriken, selibatè, kiltirèl'
    },
    es: {
      title: 'AMORA - Encuentra el Amor Sin Fronteras | Citas Multiculturales',
      description: 'Plataforma de citas multicultural para solteros haitianos, latinos, caribeños y africanos. ¡Encuentra tu alma gemela hoy!',
      keywords: 'citas, amor, haití, latino, caribeño, africano, solteros, multicultural'
    },
    pt: {
      title: 'AMORA - Encontre o Amor Sem Fronteiras | Encontros Multiculturais',
      description: 'Plataforma de encontros multicultural para solteiros haitianos, latinos, caribenhos e africanos. Encontre sua alma gêmea hoje!',
      keywords: 'encontros, amor, haiti, latino, caribenho, africano, solteiros, multicultural'
    },
    ptBR: {
      title: 'AMORA - Encontre o Amor Sem Fronteiras | Encontros Multiculturais',
      description: 'Plataforma de encontros multicultural para solteiros haitianos, latinos, caribenhos e africanos. Encontre sua alma gêmea hoje!',
      keywords: 'encontros, amor, haiti, latino, caribenho, africano, solteiros, multicultural'
    }
  },
  '/premium': {
    fr: {
      title: 'AMORA Premium - Débloquez votre potentiel amoureux | 9.99$/mois',
      description: 'Accédez aux fonctionnalités premium d\'AMORA pour maximiser vos chances de trouver l\'amour. Abonnement à partir de 9.99$/mois.',
      keywords: 'premium, abonnement, fonctionnalités avancées, amour, rencontres'
    },
    en: {
      title: 'AMORA Premium - Unlock Your Love Potential | $9.99/month',
      description: 'Access AMORA\'s premium features to maximize your chances of finding love. Subscription starting at $9.99/month.',
      keywords: 'premium, subscription, advanced features, love, dating'
    },
    ht: {
      title: 'AMORA Premium - Debloke Potansyèl Lanmou Ou | $9.99/mwa',
      description: 'Gen aksè nan karakteristik premium AMORA yo pou maksimize chans ou yo nan jwenn lanmou. Abònman ki kòmanse nan $9.99/mwa.',
      keywords: 'premium, abònman, karakteristik avanse, lanmou, randevou'
    },
    es: {
      title: 'AMORA Premium - Desbloquea tu Potencial Amoroso | $9.99/mes',
      description: 'Accede a las funciones premium de AMORA para maximizar tus posibilidades de encontrar el amor. Suscripción desde $9.99/mes.',
      keywords: 'premium, suscripción, funciones avanzadas, amor, citas'
    },
    pt: {
      title: 'AMORA Premium - Desbloqueie seu Potencial Amoroso | $9.99/mês',
      description: 'Acesse os recursos premium do AMORA para maximizar suas chances de encontrar o amor. Assinatura a partir de $9.99/mês.',
      keywords: 'premium, assinatura, recursos avançados, amor, encontros'
    },
    ptBR: {
      title: 'AMORA Premium - Desbloqueie seu Potencial Amoroso | $9.99/mês',
      description: 'Acesse os recursos premium do AMORA para maximizar suas chances de encontrar o amor. Assinatura a partir de $9.99/mês.',
      keywords: 'premium, assinatura, recursos avançados, amor, encontros'
    }
  }
  // Ajouter d'autres pages...
};

interface MultilingualMetaProps {
  language: string;
}

export const MultilingualMeta = ({ language }: MultilingualMetaProps) => {
  const location = useLocation();

  useEffect(() => {
    const currentPath = location.pathname;
    const langCode = language || 'fr';
    const normalizedLangCode = langCode === 'ptBR' ? 'pt' : langCode; // ✅ NORMALISATION
    const metaData = seoTranslations[currentPath]?.[normalizedLangCode] || seoTranslations['/'][normalizedLangCode];

    // Mettre à jour le titre
    document.title = metaData.title;

    // Mettre à jour les métadonnées
    updateMetaTag('description', metaData.description);
    updateMetaTag('keywords', metaData.keywords);
    
    // Open Graph
    updateMetaTag('og:title', metaData.title);
    updateMetaTag('og:description', metaData.description);
    updateMetaTag('og:url', `https://amora.ca/${langCode}${currentPath}`);
    updateMetaTag('og:locale', getOpenGraphLocale(langCode));
    
    // Twitter Card
    updateMetaTag('twitter:title', metaData.title);
    updateMetaTag('twitter:description', metaData.description);

  }, [location.pathname, language]);

  return null;
};

const updateMetaTag = (name: string, content: string) => {
  let meta = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`) as HTMLMetaElement;
  
  if (!meta) {
    meta = document.createElement('meta');
    if (name.startsWith('og:') || name.startsWith('twitter:')) {
      meta.setAttribute('property', name);
    } else {
      meta.setAttribute('name', name);
    }
    document.head.appendChild(meta);
  }
  
  meta.setAttribute('content', content);
};

const getOpenGraphLocale = (langCode: string): string => {
  const locales: Record<string, string> = {
    'fr': 'fr_CA',
    'en': 'en_US',
    'ht': 'ht_HT',
    'es': 'es_ES',
    'pt': 'pt_BR'
  };
  return locales[langCode] || 'fr_CA';
};
