#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtenir __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Chemin vers le fichier sw.js
const swPath = path.join(__dirname, '../public/sw.js');

// Lire le fichier actuel
const content = fs.readFileSync(swPath, 'utf8');

// Extraire la version actuelle
const versionMatch = content.match(/const VERSION = '([^']+)'/);
if (!versionMatch) {
  console.error('❌ Version non trouvée dans sw.js');
  process.exit(1);
}

const currentVersion = versionMatch[1];
console.log('📋 Version actuelle:', currentVersion);

// Incrémenter la version
const versionParts = currentVersion.split('.');
const major = parseInt(versionParts[0].replace('amora-v', ''));
const minor = parseInt(versionParts[1]);
const patch = parseInt(versionParts[2]) + 1;

const newVersion = `amora-v${major}.${minor}.${patch}`;
console.log('🚀 Nouvelle version:', newVersion);

// Remplacer la version dans le fichier
const newContent = content.replace(
  /const VERSION = '[^']+'/,
  `const VERSION = '${newVersion}'`
);

// Écrire le nouveau fichier
fs.writeFileSync(swPath, newContent);
console.log('✅ Version mise à jour dans sw.js');

// Mettre à jour package.json si nécessaire
const packagePath = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
packageJson.version = `${major}.${minor}.${patch}`;
fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
console.log('✅ Version mise à jour dans package.json');
