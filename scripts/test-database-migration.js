#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🗄️ Test de la migration de base de données...');

// Vérifier que la migration existe
const migrationPath = 'supabase/migrations/20250120000001_add_seeking_country_to_profiles.sql';

if (!fs.existsSync(migrationPath)) {
  console.log('❌ Fichier de migration non trouvé');
  process.exit(1);
}

console.log('✅ Fichier de migration trouvé');

// Lire et analyser la migration
try {
  const migrationContent = fs.readFileSync(migrationPath, 'utf8');
  
  console.log('\n Analyse de la migration:');
  
  const checks = [
    { name: 'Ajout de la colonne seeking_country', pattern: 'ADD COLUMN.*seeking_country' },
    { name: 'Type TEXT[]', pattern: 'TEXT\\[\\]' },
    { name: 'Valeur par défaut', pattern: "DEFAULT '{}'" },
    { name: 'Index GIN', pattern: 'USING GIN' },
    { name: 'Commentaire', pattern: 'COMMENT ON COLUMN' }
  ];
  
  checks.forEach(check => {
    const regex = new RegExp(check.pattern, 'i');
    if (regex.test(migrationContent)) {
      console.log(`✅ ${check.name}`);
    } else {
      console.log(`❌ ${check.name}`);
    }
  });
  
  console.log('\n📋 Contenu de la migration:');
  console.log('```sql');
  console.log(migrationContent);
  console.log('```');
  
} catch (error) {
  console.log('❌ Erreur lors de la lecture de la migration:', error.message);
}

console.log('\n Pour appliquer la migration:');
console.log('1. Assurez-vous que Supabase CLI est installé');
console.log('2. Exécutez: supabase db push');
console.log('3. Ou exécutez la migration manuellement dans le dashboard Supabase');
