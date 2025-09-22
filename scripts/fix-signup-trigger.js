/**
 * Script pour corriger le trigger de création d'utilisateur
 * Problème: Le trigger handle_new_user() ne incluait pas l'email requis
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = 'https://szxbxvwknhrtxmfyficn.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6eGJ4dndrbnhydHhtZnlmaWNuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTg0NjAwNywiZXhwIjoyMDUxNDIyMDA3fQ.0XgLjJgbZQIYoFJLkPQfwZnDfPKfYLJP4Mh8EqQJqOA';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function fixSignupTrigger() {
  console.log('🔧 Correction du trigger de création d\'utilisateur...');
  
  try {
    // Lire le fichier de migration
    const migrationPath = path.join(process.cwd(), 'supabase/migrations/20250922000001_fix_signup_trigger.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Exécuter la migration
    console.log('📦 Exécution de la migration...');
    const { error } = await supabase.rpc('exec', { sql: migrationSQL });
    
    if (error) {
      console.error('❌ Erreur lors de l\'exécution de la migration:', error);
      
      // Essayer d'exécuter les commandes une par une
      console.log('🔄 Tentative d\'exécution individuelle...');
      const commands = migrationSQL
        .split(';')
        .map(cmd => cmd.trim())
        .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
      
      for (const command of commands) {
        console.log(`🔧 Exécution: ${command.substring(0, 50)}...`);
        const { error: cmdError } = await supabase.rpc('exec', { sql: command });
        if (cmdError) {
          console.warn(`⚠️ Erreur commande: ${cmdError.message}`);
        }
      }
    } else {
      console.log('✅ Migration appliquée avec succès');
    }
    
    // Test du trigger
    console.log('🧪 Test du trigger...');
    const testResult = await supabase.rpc('exec', { 
      sql: `
        SELECT 
          proname as function_name,
          prosrc as function_body
        FROM pg_proc 
        WHERE proname = 'handle_new_user';
      `
    });
    
    if (testResult.data && testResult.data.length > 0) {
      console.log('✅ Fonction handle_new_user trouvée');
      console.log('📝 Contenu:', testResult.data[0].function_body.substring(0, 100) + '...');
    } else {
      console.log('⚠️ Fonction handle_new_user non trouvée');
    }
    
    console.log('🎉 Correction terminée! Testez maintenant l\'inscription.');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  fixSignupTrigger();
}

export { fixSignupTrigger };
