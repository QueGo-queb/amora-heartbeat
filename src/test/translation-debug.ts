/**
 * Debug des traductions - Test spécifique pour les liens manquants
 */

import { translateDatabaseLink } from '@/lib/footerTranslations';

// Test des traductions spécifiques mentionnées par l'utilisateur
export const testMissingTranslations = () => {
  console.log('🧪 === TEST DES TRADUCTIONS MANQUANTES ===');
  
  const testCases = [
    // Français
    { name: 'À propos', lang: 'fr', expected: 'À propos' },
    { name: 'Centre d\'aide', lang: 'fr', expected: 'Centre d\'aide' },
    { name: 'Conditions d\'utilisation', lang: 'fr', expected: 'Conditions d\'utilisation' },
    { name: 'Politique de confidentialité', lang: 'fr', expected: 'Politique de confidentialité' },
    { name: 'Politique des cookies', lang: 'fr', expected: 'Politique des cookies' },
    { name: 'Mentions légales', lang: 'fr', expected: 'Mentions légales' },
    
    // Anglais
    { name: 'About', lang: 'en', expected: 'About' },
    { name: 'Help Center', lang: 'en', expected: 'Help Center' },
    { name: 'Terms of Service', lang: 'en', expected: 'Terms of Service' },
    { name: 'Privacy Policy', lang: 'en', expected: 'Privacy Policy' },
    { name: 'Cookie Policy', lang: 'en', expected: 'Cookie Policy' },
    { name: 'Legal Notice', lang: 'en', expected: 'Legal Notice' },
    
    // Espagnol
    { name: 'Acerca de', lang: 'es', expected: 'Acerca de' },
    { name: 'Centro de Ayuda', lang: 'es', expected: 'Centro de Ayuda' },
    { name: 'Términos de Servicio', lang: 'es', expected: 'Términos de Servicio' },
    { name: 'Política de Privacidad', lang: 'es', expected: 'Política de Privacidad' },
    { name: 'Política de Cookies', lang: 'es', expected: 'Política de Cookies' },
    { name: 'Aviso Legal', lang: 'es', expected: 'Aviso Legal' }
  ];

  for (const testCase of testCases) {
    const result = translateDatabaseLink(testCase.name, testCase.lang);
    console.log(`📝 "${testCase.name}" (${testCase.lang}) → "${result}"`);
    
    if (result === testCase.expected) {
      console.log(`✅ Test réussi`);
    } else {
      console.log(`❌ Test échoué. Attendu: "${testCase.expected}", Reçu: "${result}"`);
    }
  }
  
  console.log('\n🏁 === FIN DU TEST DES TRADUCTIONS MANQUANTES ===');
};

// Test de la fonction avec des noms de base de données typiques
export const testDatabaseNames = () => {
  console.log('\n🧪 === TEST DES NOMS DE BASE DE DONNÉES ===');
  
  const databaseNames = [
    'À propos',
    'Centre d\'aide', 
    'Conditions d\'utilisation',
    'Politique de confidentialité',
    'Politique des cookies',
    'Mentions légales',
    'Paramètres des cookies',
    'Support',
    'FAQ',
    'Contact'
  ];

  const languages = ['fr', 'en', 'es', 'pt', 'ht'];

  for (const lang of languages) {
    console.log(`\n📋 Langue: ${lang}`);
    for (const name of databaseNames) {
      const result = translateDatabaseLink(name, lang);
      console.log(`  "${name}" → "${result}"`);
    }
  }
  
  console.log('\n🏁 === FIN DU TEST DES NOMS DE BASE DE DONNÉES ===');
};

// Exécuter les tests
if (typeof window !== 'undefined') {
  testMissingTranslations();
  testDatabaseNames();
}
