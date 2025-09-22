import { createClient } from '@supabase/supabase-js';

// ✅ CORRIGÉ: Valeurs directes pour éviter les problèmes de cache
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://szxbxvwknhrtxmfyficn.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6eGJ4dndrbmhydHhtZnlmaWNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1NjYxNzksImV4cCI6MjA3MjE0MjE3OX0.-h8eeR3STS4ZqdjoobIcvYAVv07_SIomGVKKWxUTHSA';

// ✅ CORRIGÉ: Vérification avec les nouvelles valeurs
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
