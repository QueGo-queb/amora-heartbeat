import { createClient } from '@supabase/supabase-js';

// ✅ SÉCURITÉ: Charger uniquement depuis les variables d'environnement
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// ✅ VALIDATION: Vérifier que les variables sont configurées
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Variables d\'environnement Supabase manquantes. Assurez-vous que VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY sont définies dans votre fichier .env'
  );
}

if (!supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co') {
  console.warn('⚠️ VITE_SUPABASE_URL manquante - mode démo activé');
} else {
  console.log('✅ Supabase URL configurée:', supabaseUrl);
}

if (!supabaseAnonKey || supabaseAnonKey === 'placeholder-key') {
  console.warn('⚠️ VITE_SUPABASE_ANON_KEY manquante - mode démo activé');
} else {
  console.log('✅ Supabase ANON KEY configurée');
}

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
