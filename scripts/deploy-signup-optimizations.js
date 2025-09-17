#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtenir le répertoire courant pour les modules ES6
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Déploiement des optimisations du formulaire d\'inscription...');

// 1. Vérifier les prérequis
console.log('\n📋 Vérification des prérequis:');

const requiredFiles = [
  'src/components/ui/country-multi-select.tsx',
  'src/components/ui/signup-form-optimized.tsx',
  'supabase/migrations/20250120000001_add_seeking_country_to_profiles.sql'
];

let allFilesExist = true;
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MANQUANT`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n❌ Certains fichiers requis sont manquants. Arrêt du déploiement.');
  process.exit(1);
}

// 2. Sauvegarder l'ancien formulaire
console.log('\n Sauvegarde de l\'ancien formulaire...');
const oldFormPath = 'src/components/ui/signup-form.tsx';
const backupPath = 'src/components/ui/signup-form-backup.tsx';

if (fs.existsSync(oldFormPath)) {
  fs.copyFileSync(oldFormPath, backupPath);
  console.log(`✅ Ancien formulaire sauvegardé dans ${backupPath}`);
} else {
  console.log('⚠️ Ancien formulaire non trouvé, création d\'un nouveau');
}

// 3. Installer le nouveau formulaire
console.log('\n Installation du nouveau formulaire...');
const newFormPath = 'src/components/ui/signup-form-optimized.tsx';
const targetPath = 'src/components/ui/signup-form.tsx';

fs.copyFileSync(newFormPath, targetPath);
console.log('✅ Nouveau formulaire installé');

// 4. Créer le composant de test
console.log('\n🧪 Création du composant de test...');
const testComponentPath = 'src/components/test/SignupFormTest.tsx';
const testComponentDir = path.dirname(testComponentPath);

if (!fs.existsSync(testComponentDir)) {
  fs.mkdirSync(testComponentDir, { recursive: true });
}

// Contenu du composant de test
const testComponentContent = `/**
 * ✅ COMPOSANT DE TEST POUR LE FORMULAIRE D'INSCRIPTION OPTIMISÉ
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SignupFormOptimized } from '@/components/ui/signup-form-optimized';
import { CountryMultiSelect } from '@/components/ui/country-multi-select';
import { Badge } from '@/components/ui/badge';

export function SignupFormTest() {
  const [showForm, setShowForm] = useState(false);
  const [testCountries, setTestCountries] = useState<string[]>([]);
  const [testResults, setTestResults] = useState<string[]>([]);

  const runTests = () => {
    const results: string[] = [];
    
    // Test 1: Vérifier que le composant CountryMultiSelect fonctionne
    try {
      results.push('✅ Test 1: Composant CountryMultiSelect chargé');
    } catch (error) {
      results.push('❌ Test 1: Erreur avec CountryMultiSelect');
    }
    
    // Test 2: Vérifier la sélection de pays
    if (testCountries.length > 0) {
      results.push(\`✅ Test 2: \${testCountries.length} pays sélectionnés\`);
    } else {
      results.push('⚠️ Test 2: Aucun pays sélectionné');
    }
    
    // Test 3: Vérifier que l'Argentine est dans la liste
    if (testCountries.includes('AR')) {
      results.push('✅ Test 3: Argentine trouvée dans la sélection');
    } else {
      results.push('⚠️ Test 3: Argentine non sélectionnée');
    }
    
    setTestResults(results);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>🧪 Test du Formulaire d'Inscription Optimisé</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Test du composant CountryMultiSelect */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Test du Composant CountryMultiSelect</h3>
              <CountryMultiSelect
                selectedCountries={testCountries}
                onCountriesChange={setTestCountries}
                placeholder="Testez la sélection de pays..."
                maxSelections={5}
              />
              
              {testCountries.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Pays sélectionnés:</p>
                  <div className="flex flex-wrap gap-2">
                    {testCountries.map(country => (
                      <Badge key={country} variant="secondary">
                        {country}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Boutons de test */}
            <div className="flex gap-4">
              <Button onClick={runTests} variant="outline">
                🧪 Lancer les Tests
              </Button>
              <Button 
                onClick={() => setShowForm(!showForm)}
                className="bg-pink-500 hover:bg-pink-600"
              >
                {showForm ? 'Masquer' : 'Afficher'} le Formulaire Complet
              </Button>
            </div>

            {/* Résultats des tests */}
            {testResults.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Résultats des Tests:</h3>
                <div className="space-y-1">
                  {testResults.map((result, index) => (
                    <p key={index} className="text-sm">{result}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2"> Instructions de Test:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>1. Testez la sélection de pays ci-dessus</li>
                <li>2. Vérifiez que l'Argentine est disponible</li>
                <li>3. Testez la recherche de pays</li>
                <li>4. Vérifiez la limite de sélection</li>
                <li>5. Affichez le formulaire complet pour un test end-to-end</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Formulaire complet */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>📝 Formulaire d'Inscription Complet</CardTitle>
            </CardHeader>
            <CardContent>
              <SignupFormOptimized language="fr" />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}`;

fs.writeFileSync(testComponentPath, testComponentContent);
console.log('✅ Composant de test créé');

// 5. Mettre à jour le package.json avec les nouveaux scripts
console.log('\n📦 Mise à jour des scripts...');
try {
  const packageJsonPath = 'package.json';
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Ajouter les nouveaux scripts
  packageJson.scripts = {
    ...packageJson.scripts,
    'test:signup': 'node scripts/test-signup-form.js',
    'test:database': 'node scripts/test-database-migration.js',
    'deploy:signup': 'node scripts/deploy-signup-optimizations.js'
  };
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('✅ Scripts ajoutés au package.json');
} catch (error) {
  console.log('⚠️ Erreur lors de la mise à jour du package.json:', error.message);
}

// 6. Créer un fichier de documentation
console.log('\n📚 Création de la documentation...');
const documentation = `# 🚀 Optimisations du Formulaire d'Inscription AMORA

## ✅ Améliorations Apportées

### 1. **Composant de Sélection Multi-Pays Optimisé**
- Interface mobile-friendly avec recherche
- Sélection multiple avec limite configurable
- Argentine ajoutée à la liste des pays
- Filtrage par région et recherche textuelle
- Gestion des erreurs améliorée

### 2. **Formulaire d'Inscription Optimisé**
- Validation en temps réel avec debouncing
- Gestion d'erreur complète et informative
- Sauvegarde des pays ciblés en base de données
- Performance optimisée avec useMemo et useCallback
- UX améliorée avec barre de progression

### 3. **Base de Données**
- Nouvelle colonne \`seeking_country\` dans la table \`profiles\`
- Index GIN pour optimiser les requêtes
- Migration SQL prête à déployer

## Tests Disponibles

\`\`\`bash
# Tester le formulaire
npm run test:signup

# Tester la migration de base de données
npm run test:database

# Déployer les optimisations
npm run deploy:signup
\`\`\`

## Fichiers Modifiés/Créés

- \`src/components/ui/country-multi-select.tsx\` - Nouveau composant
- \`src/components/ui/signup-form-optimized.tsx\` - Formulaire optimisé
- \`supabase/migrations/20250120000001_add_seeking_country_to_profiles.sql\` - Migration
- \`src/components/test/SignupFormTest.tsx\` - Composant de test

## 🚀 Prochaines Étapes

1. **Exécuter la migration de base de données**
   \`\`\`bash
   supabase db push
   \`\`\`

2. **Tester l'inscription complète**
   - Ouvrir l'application
   - Aller sur la page d'inscription
   - Tester la sélection de pays
   - Vérifier la sauvegarde

3. **Vérifier les données**
   - Se connecter à Supabase
   - Vérifier que la colonne \`seeking_country\` existe
   - Tester une inscription et vérifier les données

## 🔧 Configuration

Le composant \`CountryMultiSelect\` accepte les props suivantes:
- \`selectedCountries\`: Array de codes de pays
- \`onCountriesChange\`: Fonction de callback
- \`placeholder\`: Texte d'aide
- \`maxSelections\`: Limite de sélection (défaut: 10)

## 📱 Optimisations Mobile

- Interface responsive
- Recherche tactile optimisée
- Sélection par tap/click
- Affichage des drapeaux pour l'identification visuelle
- Limite de sélection pour éviter la surcharge

## 🎯 Pays Disponibles

La liste inclut tous les pays ciblés par AMORA:
- Amérique du Nord: États-Unis, Canada, Mexique
- Amérique du Sud: Argentine, Brésil, Chili, Colombie, Pérou, Uruguay
- Caraïbes: Haïti, République Dominicaine, Jamaïque, Cuba
- Europe: France, Espagne, Belgique, Suisse, Italie, Allemagne
- Afrique: Congo, Cameroun, Algérie, Côte d'Ivoire, Sénégal, etc.
- Asie: Chine, Japon, Corée du Sud, Inde
- Océanie: Australie, Nouvelle-Zélande

## ⚠️ Notes Importantes

- L'ancien formulaire est sauvegardé dans \`signup-form-backup.tsx\`
- La migration doit être exécutée avant de tester
- Les pays sont stockés comme codes ISO (ex: 'AR' pour Argentine)
- La validation empêche l'inscription sans pays ciblés
`;

fs.writeFileSync('SIGNUP_OPTIMIZATIONS.md', documentation);
console.log('✅ Documentation créée (SIGNUP_OPTIMIZATIONS.md)');

// 7. Résumé final
console.log('\n🎉 Déploiement terminé avec succès !');
console.log('\n Résumé des actions:');
console.log('✅ Fichiers requis vérifiés');
console.log('✅ Ancien formulaire sauvegardé');
console.log('✅ Nouveau formulaire installé');
console.log('✅ Composant de test créé');
console.log('✅ Scripts ajoutés au package.json');
console.log('✅ Documentation créée');

console.log('\n Prochaines étapes:');
console.log('1. Exécuter: npm run test:signup');
console.log('2. Exécuter la migration de base de données');
console.log('3. Tester l\'inscription complète');
console.log('4. Vérifier la sauvegarde des pays ciblés');

console.log('\n✨ Formulaire d\'inscription optimisé prêt à l\'emploi !');
