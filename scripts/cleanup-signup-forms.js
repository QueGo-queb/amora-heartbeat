#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧹 Nettoyage des fichiers signup-form dupliqués...');

// Fichiers à supprimer
const filesToDelete = [
  'src/components/ui/signup-form-optimized.tsx',
  'src/components/ui/signup-form-fixed.tsx',
  'src/components/ui/signup-form-backup.tsx'
];

// Fichier à garder
const keepFile = 'src/components/ui/signup-form.tsx';

console.log('\n�� Plan de nettoyage:');
console.log(`✅ GARDER: ${keepFile}`);
filesToDelete.forEach(file => {
  console.log(`❌ SUPPRIMER: ${file}`);
});

// Vérifier que le fichier principal existe
if (!fs.existsSync(keepFile)) {
  console.error(`❌ ERREUR: Le fichier principal ${keepFile} n'existe pas !`);
  process.exit(1);
}

console.log('\n🗑️ Suppression des fichiers dupliqués...');

let deletedCount = 0;
filesToDelete.forEach(file => {
  if (fs.existsSync(file)) {
    try {
      fs.unlinkSync(file);
      console.log(`✅ Supprimé: ${file}`);
      deletedCount++;
    } catch (error) {
      console.error(`❌ Erreur lors de la suppression de ${file}:`, error.message);
    }
  } else {
    console.log(`⚠️ Fichier déjà supprimé: ${file}`);
  }
});

console.log(`\n🎉 Nettoyage terminé ! ${deletedCount} fichier(s) supprimé(s).`);
console.log(`✅ Fichier principal conservé: ${keepFile}`);

// Vérification finale
console.log('\n🔍 Vérification finale:');
const remainingFiles = fs.readdirSync('src/components/ui/')
  .filter(file => file.includes('signup-form'));

if (remainingFiles.length === 1 && remainingFiles[0] === 'signup-form.tsx') {
  console.log('✅ Parfait ! Un seul fichier signup-form.tsx reste.');
} else {
  console.log('⚠️ Fichiers restants:', remainingFiles);
}
