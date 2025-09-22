/**
 * Client Supabase Admin avec service role pour les opérations côté serveur
 * Bypass automatiquement RLS et permet toutes les opérations
 * ⚠️ SÉCURITÉ: Ce fichier ne doit JAMAIS être exposé côté client
 * ⚠️ La Service Role Key ne doit être utilisée que côté serveur
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../types/supabase';

// ⚠️ SÉCURITÉ: Vérifier que nous sommes côté serveur
if (typeof window !== 'undefined') {
  throw new Error('supabaseAdmin ne peut pas être utilisé côté client pour des raisons de sécurité');
}

// ✅ CORRIGÉ: Variables d'environnement appropriées selon le contexte
const supabaseUrl = typeof window === 'undefined' 
  ? process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL
  : import.meta.env.VITE_SUPABASE_URL;
  
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.warn('⚠️ Service Role Key non disponible - fonctionnalités admin désactivées');
  // Ne pas throw d'erreur en production pour éviter de casser l'app
}

// Créer le client admin seulement si les variables sont disponibles
export const supabaseAdmin = supabaseUrl && supabaseServiceRoleKey ? createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
}) : null;

// Types pour les données du feed
export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  gender: 'male' | 'female' | 'other' | null;
  birthdate: string | null;
  location: string | null;
  interests: string[];
  looking_for_gender: 'male' | 'female' | 'other' | 'any';
  looking_for_age_min: number;
  looking_for_age_max: number;
  looking_for_interests: string[];
  plan: 'free' | 'premium';
  premium_since: string | null;
  role?: 'user' | 'admin' | 'moderator';
  is_suspended?: boolean;
  created_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  content: string;
  media: any[];
  tags: string[];
  visibility: 'public' | 'friends' | 'private';
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
  profiles: Profile;
}

export interface PostWithScore extends Post {
  relevance_score: number;
}

export interface Advertisement {
  id: string;
  title: string;
  content?: string;
  type: 'text' | 'image' | 'gif' | 'video' | 'lottie';
  media: any;
  target_tags: string[];
  target_location?: any;
  start_at: string;
  end_at: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
}

// Fonctions utilitaires pour l'administration
export async function isUserAdmin(userId: string): Promise<boolean> {
  try {
    // ⚠️ SÉCURITÉ: Vérifier que supabaseAdmin est disponible
    if (!supabaseAdmin) {
      console.warn('supabaseAdmin non disponible - vérification admin impossible');
      return false;
    }

    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('role, email')
      .eq('id', userId)
      .single();

    if (error || !profile) return false;

    // ⚠️ SÉCURITÉ: Ne pas hardcoder d'emails en production
    return profile.role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

export async function getActiveAds(targetTags?: string[]): Promise<Advertisement[]> {
  try {
    // ⚠️ SÉCURITÉ: Vérifier que supabaseAdmin est disponible
    if (!supabaseAdmin) {
      console.warn('supabaseAdmin non disponible - publicités non disponibles');
      return [];
    }

    let query = supabaseAdmin
      .from('ads')
      .select('*')
      .eq('is_active', true)
      .gte('start_at', new Date().toISOString())
      .lte('end_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (targetTags && targetTags.length > 0) {
      query = query.overlaps('target_tags', targetTags);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching active ads:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getActiveAds:', error);
    return [];
  }
}
