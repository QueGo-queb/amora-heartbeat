#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 === CORRECTION DES ERREURS CRITIQUES ===\n');

// Liste des corrections à appliquer
const fixes = [
  {
    file: 'src/components/feed/FeedContainer.tsx',
    search: "import { Button } from './ui/button';",
    replace: "import { Button } from '@/components/ui/button';"
  },
  {
    file: 'src/lib/sentry-simple.ts',
    create: true,
    content: `// Version simplifiée du tracking pour éviter les erreurs TypeScript
export function trackEvent(eventName: string, properties?: Record<string, any>) {
  try {
    console.log('📊 Event tracked:', eventName, properties);
  } catch (error) {
    console.warn('Erreur tracking:', error);
  }
}

export function trackError(error: Error, context?: Record<string, any>) {
  try {
    console.error('🚨 Error tracked:', error, context);
  } catch (trackingError) {
    console.warn('Erreur tracking d\\'erreur:', trackingError);
  }
}`
  }
];

async function applyFixes() {
  for (const fix of fixes) {
    const filePath = path.join(__dirname, '..', fix.file);
    
    try {
      if (fix.create) {
        // Créer le fichier
        fs.writeFileSync(filePath, fix.content);
        console.log(`✅ Créé: ${fix.file}`);
      } else {
        // Modifier le fichier existant
        const content = fs.readFileSync(filePath, 'utf8');
        const newContent = content.replace(fix.search, fix.replace);
        fs.writeFileSync(filePath, newContent);
        console.log(`✅ Corrigé: ${fix.file}`);
      }
    } catch (error) {
      console.log(`❌ Erreur avec ${fix.file}:`, error.message);
    }
  }
  
  console.log('\n🎉 Corrections appliquées !');
  console.log('\n📋 Prochaines étapes:');
  console.log('1. Exécuter la migration avatar_url dans Supabase Dashboard');
  console.log('2. Tester le build: npm run build');
  console.log('3. Vérifier que tous les boutons fonctionnent');
}

applyFixes().catch(console.error);
