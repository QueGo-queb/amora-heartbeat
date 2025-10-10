/**
 * Test des traductions pour le footer et les pages légales
 * Ce fichier vérifie que toutes les clés de traduction sont présentes
 */

import { footerTranslations, translateDatabaseLink } from '@/lib/footerTranslations';

// Fonction pour tester les traductions
export const testFooterTranslations = () => {
  const languages = ['fr', 'en', 'es', 'pt', 'ht', 'ptBR'] as const;
  const requiredKeys = [
    'followUs',
    'newsletter',
    'newsletterDesc',
    'emailPlaceholder',
    'subscribing',
    'subscribe',
    'support',
    'legal',
    'copyright',
    'madeWithLove',
    'loadingFooter',
    'newsletterSuccess',
    'newsletterError',
    'activeNetworks',
    'activeNetworksPlural',
    'noActiveNetworks',
    'disabled',
    'disabledPlural',
    'companyDescriptionFallback',
    'companyDescriptionFull'
  ];

  const requiredSupportKeys = [
    'support',
    'faq',
    'helpCenter',
    'contact',
    'about'
  ];

  const requiredLegalKeys = [
    'legal',
    'termsOfService',
    'privacyPolicy',
    'cookiePolicy',
    'legalNotice',
    'cookieSettings'
  ];

  console.log('🧪 === TEST DES TRADUCTIONS FOOTER ===');

  for (const lang of languages) {
    console.log(`\n📋 Test de la langue: ${lang}`);
    
    const translations = footerTranslations[lang];
    if (!translations) {
      console.error(`❌ Langue ${lang} non trouvée`);
      continue;
    }

    // Test des clés principales
    for (const key of requiredKeys) {
      if (!(key in translations)) {
        console.error(`❌ Clé manquante: ${key} pour la langue ${lang}`);
      } else {
        console.log(`✅ ${key}: ${translations[key as keyof typeof translations]}`);
      }
    }

    // Test des clés support
    if (translations.supportLinks) {
      for (const key of requiredSupportKeys) {
        if (!(key in translations.supportLinks)) {
          console.error(`❌ Clé support manquante: ${key} pour la langue ${lang}`);
        } else {
          console.log(`✅ supportLinks.${key}: ${translations.supportLinks[key as keyof typeof translations.supportLinks]}`);
        }
      }
    } else {
      console.error(`❌ supportLinks manquant pour la langue ${lang}`);
    }

    // Test des clés legal
    if (translations.legalLinks) {
      for (const key of requiredLegalKeys) {
        if (!(key in translations.legalLinks)) {
          console.error(`❌ Clé legal manquante: ${key} pour la langue ${lang}`);
        } else {
          console.log(`✅ legalLinks.${key}: ${translations.legalLinks[key as keyof typeof translations.legalLinks]}`);
        }
      }
    } else {
      console.error(`❌ legalLinks manquant pour la langue ${lang}`);
    }
  }

  console.log('\n🏁 === FIN DU TEST DES TRADUCTIONS ===');
};

// Fonction pour tester la fonction translateDatabaseLink
export const testTranslateDatabaseLink = () => {
  console.log('\n🧪 === TEST DE translateDatabaseLink ===');
  
  const testCases = [
    { name: 'Support', lang: 'fr', expected: 'Support' },
    { name: 'FAQ', lang: 'fr', expected: 'FAQ' },
    { name: 'Help Center', lang: 'en', expected: 'Help Center' },
    { name: 'Terms of Service', lang: 'en', expected: 'Terms of Service' },
    { name: 'Contact', lang: 'es', expected: 'Contacto' },
    { name: 'About', lang: 'es', expected: 'Acerca de' }
  ];

  for (const testCase of testCases) {
    const result = translateDatabaseLink(testCase.name, testCase.lang);
    console.log(`📝 ${testCase.name} (${testCase.lang}) → ${result}`);
    
    if (result === testCase.expected) {
      console.log(`✅ Test réussi`);
    } else {
      console.log(`❌ Test échoué. Attendu: ${testCase.expected}, Reçu: ${result}`);
    }
  }
  
  console.log('\n🏁 === FIN DU TEST DE translateDatabaseLink ===');
};

// Exécuter les tests si ce fichier est exécuté directement
if (typeof window !== 'undefined') {
  testFooterTranslations();
  testTranslateDatabaseLink();
}
