/**
 * Client Supabase Admin avec service role pour les opérations côté serveur
 * Bypass automatiquement RLS et permet toutes les opérations
 * TODO: Protéger l'accès - ce fichier ne doit jamais être exposé côté client
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase environment variables for admin client');
}

export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

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
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('role, email')
      .eq('id', userId)
      .single();

    if (error || !profile) return false;

    return profile.role === 'admin' || profile.email === 'clodenerc@yahoo.fr';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

export async function getActiveAds(targetTags?: string[]): Promise<Advertisement[]> {
  try {
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
