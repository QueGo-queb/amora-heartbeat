/**
 * Script de nettoyage sécurisé des comptes de test
 * Exécute: node scripts/safe-cleanup-test-accounts.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function cleanupTestAccounts() {
  console.log('🧹 Démarrage du nettoyage sécurisé des comptes de test...\n');

  try {
    // 🔍 ÉTAPE 1: Analyser les comptes existants
    console.log('📊 Analyse des comptes existants...');
    
    const { data: allProfiles, error: fetchError } = await supabase
      .from('profiles')
      .select('id, email, full_name, created_at, role, plan')
      .neq('role', 'admin'); // Exclure les admins

    if (fetchError) {
      throw fetchError;
    }

    console.log(`📈 Total des comptes non-admin: ${allProfiles.length}`);

    // 🎯 ÉTAPE 2: Identifier les comptes de test
    const testAccounts = allProfiles.filter(profile => {
      const email = profile.email?.toLowerCase() || '';
      const name = profile.full_name?.toLowerCase() || '';
      
      return (
        email.includes('test') ||
        email.includes('demo') ||
        email.includes('example') ||
        name.includes('test') ||
        name.includes('demo') ||
        email.includes('temp') ||
        // Comptes sans nom créés il y a plus de 7 jours
        (!profile.full_name && new Date(profile.created_at) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
      );
    });

    console.log(`🎯 Comptes de test identifiés: ${testAccounts.length}`);
    
    if (testAccounts.length > 0) {
      console.log('\n📋 Comptes qui seront supprimés:');
      testAccounts.forEach((account, index) => {
        console.log(`${index + 1}. ${account.email} - ${account.full_name || 'Sans nom'} - ${new Date(account.created_at).toLocaleDateString()}`);
      });

      // 🛡️ SÉCURITÉ: Vérifier qu'aucun admin ne sera supprimé
      const adminCheck = testAccounts.filter(account => account.role === 'admin');
      if (adminCheck.length > 0) {
        console.error('❌ ERREUR: Des comptes admin seraient supprimés! Arrêt du script.');
        console.log('Comptes admin concernés:', adminCheck.map(a => a.email));
        return;
      }

      // 🗑️ ÉTAPE 3: Suppression sécurisée
      console.log('\n🗑️ Suppression des comptes de test...');
      
      const testAccountIds = testAccounts.map(account => account.id);
      
      const { error: deleteError } = await supabase
        .from('profiles')
        .delete()
        .in('id', testAccountIds);

      if (deleteError) {
        throw deleteError;
      }

      console.log(`✅ ${testAccounts.length} comptes de test supprimés avec succès!`);
    } else {
      console.log('✨ Aucun compte de test trouvé. La base est déjà propre!');
    }

    // 📊 ÉTAPE 4: Rapport final
    const { data: finalProfiles, error: finalError } = await supabase
      .from('profiles')
      .select('role', { count: 'exact', head: true });

    if (!finalError) {
      console.log('\n📊 État final de la base de données:');
      
      const { data: adminCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'admin');
      
      const { data: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'user');

      console.log(`👑 Admins: ${adminCount?.length || 0}`);
      console.log(`👤 Utilisateurs: ${userCount?.length || 0}`);
      console.log(`📈 Total: ${(adminCount?.length || 0) + (userCount?.length || 0)}`);
    }

  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
  }
}

// Exécuter seulement si appelé directement
if (require.main === module) {
  cleanupTestAccounts();
}

module.exports = { cleanupTestAccounts };
