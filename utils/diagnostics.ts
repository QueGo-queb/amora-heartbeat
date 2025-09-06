import { supabase } from '@/integrations/supabase/client';

export const runDiagnostics = async () => {
  const results = {
    tables: {} as Record<string, boolean>,
    auth: false,
    rls: {} as Record<string, boolean>,
    errors: [] as string[]
  };

  try {
    // 1. Vérifier l'authentification
    const { data: { user } } = await supabase.auth.getUser();
    results.auth = !!user;
    
    if (!user) {
      results.errors.push('Utilisateur non authentifié');
    }

    // 2. Vérifier les tables essentielles
    const tablesToCheck = [
      'users',
      'paypal_config', 
      'caja_vecina_accounts',
      'caja_vecina_payments',
      'paypal_payments',
      'usdt_payment_links',
      'transactions'
    ];

    for (const table of tablesToCheck) {
      try {
        const { error } = await supabase.from(table).select('id').limit(1);
        results.tables[table] = !error;
        if (error) {
          results.errors.push(`Table ${table}: ${error.message}`);
        }
      } catch (err: any) {
        results.tables[table] = false;
        results.errors.push(`Table ${table}: ${err.message}`);
      }
    }

    // 3. Vérifier les permissions RLS
    const rlsTests = [
      { table: 'paypal_config', action: 'select' },
      { table: 'caja_vecina_accounts', action: 'select' }
    ];

    for (const test of rlsTests) {
      try {
        const { error } = await supabase.from(test.table).select('*').limit(1);
        results.rls[`${test.table}_${test.action}`] = !error;
        if (error) {
          results.errors.push(`RLS ${test.table} ${test.action}: ${error.message}`);
        }
      } catch (err: any) {
        results.rls[`${test.table}_${test.action}`] = false;
        results.errors.push(`RLS ${test.table} ${test.action}: ${err.message}`);
      }
    }

    // 4. Vérifier les hooks
    try {
      // Test des imports
      const { usePayPal } = await import('@/hooks/usePayPal');
      const { useCajaVecina } = await import('@/hooks/useCajaVecina');
      results.errors.push('Hooks importés avec succès');
    } catch (err: any) {
      results.errors.push(`Erreur import hooks: ${err.message}`);
    }

  } catch (error: any) {
    results.errors.push(`Erreur générale: ${error.message}`);
  }

  return results;
};

// Fonction pour afficher les résultats
export const displayDiagnostics = async () => {
  const results = await runDiagnostics();
  
  console.group('🔍 DIAGNOSTIC AMORA HEARTBEAT');
  
  console.group('📊 Tables');
  Object.entries(results.tables).forEach(([table, exists]) => {
    console.log(`${exists ? '✅' : '❌'} ${table}`);
  });
  console.groupEnd();
  
  console.group('🔐 Authentification');
  console.log(`${results.auth ? '✅' : '❌'} Utilisateur connecté`);
  console.groupEnd();
  
  console.group('🛡️ RLS Permissions');
  Object.entries(results.rls).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}`);
  });
  console.groupEnd();
  
  if (results.errors.length > 0) {
    console.group('⚠️ Erreurs détectées');
    results.errors.forEach(error => console.log(`• ${error}`));
    console.groupEnd();
  }
  
  console.groupEnd();
  
  return results;
};