#!/usr/bin/env node

/**
 * Script de nettoyage automatique pour la production
 * Supprime tous les éléments de développement et de test
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

// Fichiers et dossiers à supprimer
const filesToDelete = [
  'src/components/cache/CacheMonitor.tsx',
  'src/components/rbac/RBACTest.tsx',
  'src/components/SentryTest.tsx',
  'src/test',
  'docs/ADMIN_ADS_README.md',
  'docs/FEED_README.md',
  'scripts/create-amora-logo.js',
  'scripts/generate-favicon.js',
  'scripts/generate-icons.js',
  'scripts/health-check.js',
  'scripts/deployment-check.js',
];

// Patterns de code à nettoyer
const cleanupPatterns = [
  /console\.log\([^)]*\);?\s*\n?/g,
  /console\.debug\([^)]*\);?\s*\n?/g,
  /console\.warn\([^)]*\);?\s*\n?/g,
  /\/\/ TODO:.*\n/g,
  /\/\/ FIXME:.*\n/g,
  /\/\/ DEBUG:.*\n/g,
  /\/\* TODO:[\s\S]*?\*\//g,
];

// Extensions de fichiers à nettoyer
const extensionsToClean = ['.ts', '.tsx', '.js', '.jsx'];

function deleteFiles() {
  console.log('🗑️  Suppression des fichiers de développement...');
  
  filesToDelete.forEach(filePath => {
    const fullPath = path.join(rootDir, filePath);
    
    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath);
      
      if (stats.isDirectory()) {
        fs.rmSync(fullPath, { recursive: true, force: true });
        console.log(`✅ Dossier supprimé: ${filePath}`);
      } else {
        fs.unlinkSync(fullPath);
        console.log(`✅ Fichier supprimé: ${filePath}`);
      }
    }
  });
}

function cleanupCode(dir = 'src') {
  console.log('🧹 Nettoyage du code...');
  
  const fullDir = path.join(rootDir, dir);
  
  function processDirectory(dirPath) {
    const items = fs.readdirSync(dirPath);
    
    items.forEach(item => {
      const itemPath = path.join(dirPath, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        processDirectory(itemPath);
      } else if (stats.isFile()) {
        const ext = path.extname(item);
        
        if (extensionsToClean.includes(ext)) {
          cleanupFile(itemPath);
        }
      }
    });
  }
  
  processDirectory(fullDir);
}

function cleanupFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Appliquer les patterns de nettoyage
    cleanupPatterns.forEach(pattern => {
      const newContent = content.replace(pattern, '');
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    });
    
    // Nettoyer les lignes vides multiples
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`🧽 Nettoyé: ${path.relative(rootDir, filePath)}`);
    }
  } catch (error) {
    console.error(`❌ Erreur nettoyage ${filePath}:`, error.message);
  }
}

// Exécution du script
console.log('🚀 Démarrage du nettoyage production...\n');

deleteFiles();
console.log('');
cleanupCode();

console.log('\n✅ Nettoyage production terminé !');
console.log('\n📋 Prochaines étapes :');
console.log('1. Vérifier les variables d\'environnement (.env.production)');
console.log('2. Tester le build : npm run build');
console.log('3. Tester le preview : npm run preview');
console.log('4. Déployer en production');
