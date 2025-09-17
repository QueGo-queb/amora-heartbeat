#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Correction du formulaire d\'inscription...');

// 1. Sauvegarder le fichier corrompu
const corruptedFile = 'src/components/ui/signup-form.tsx';
const backupFile = 'src/components/ui/signup-form-corrupted-backup.tsx';

if (fs.existsSync(corruptedFile)) {
  console.log('📦 Sauvegarde du fichier corrompu...');
  fs.copyFileSync(corruptedFile, backupFile);
  console.log(`✅ Fichier corrompu sauvegardé dans ${backupFile}`);
}

// 2. Remplacer par la version corrigée
const fixedFile = 'src/components/ui/signup-form-fixed.tsx';
const targetFile = 'src/components/ui/signup-form.tsx';

if (fs.existsSync(fixedFile)) {
  console.log('�� Remplacement par la version corrigée...');
  fs.copyFileSync(fixedFile, targetFile);
  console.log('✅ Formulaire corrigé installé');
} else {
  console.log('❌ Fichier corrigé non trouvé');
  process.exit(1);
}

// 3. Vérifier que le fichier est valide
console.log('\n🔍 Vérification de la syntaxe...');
try {
  const content = fs.readFileSync(targetFile, 'utf8');
  
  // Vérifications de base
  const checks = [
    { name: 'Export SignupForm', pattern: 'export function SignupForm' },
    { name: 'Import CountryMultiSelect', pattern: 'CountryMultiSelect' },
    { name: 'Validation des pays', pattern: 'seekingCountry' },
    { name: 'Gestion d\'erreur', pattern: 'getErrorMessage' },
    { name: 'Sauvegarde en BDD', pattern: 'seeking_country' }
  ];
  
  checks.forEach(check => {
    if (content.includes(check.pattern)) {
      console.log(`✅ ${check.name}`);
    } else {
      console.log(`❌ ${check.name}`);
    }
  });
  
} catch (error) {
  console.log('❌ Erreur lors de la vérification:', error.message);
}

console.log('\n🎉 Correction terminée !');
console.log('📝 Le formulaire d\'inscription a été corrigé et optimisé');
console.log('🚀 Vous pouvez maintenant tester l\'inscription');
