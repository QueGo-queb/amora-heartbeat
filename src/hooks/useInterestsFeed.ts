// src/hooks/useInterestsFeed.ts - VERSION CORRIGÉE
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Post {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
  profiles?: {
    id: string;
    full_name: string;
    avatar_url?: string;
    user_id: string;
  };
}

export function useInterestsFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Chargement des posts...');

      const { data, error: fetchError } = await supabase
        .from('posts')
        .select(`
          id,
          user_id,
          content,
          created_at,
          likes_count,
          comments_count,
          profiles!inner (
            id,
            full_name,
            avatar_url,
            user_id
          )
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (fetchError) {
        console.error('Erreur Supabase:', fetchError);
        // Ne pas lancer d'erreur si la table est vide
        if (fetchError.code !== 'PGRST116') {
          throw fetchError;
        }
      }

      console.log('✅ Posts chargés:', data?.length || 0);
      setPosts(data || []);

    } catch (err: any) {
      console.error('Erreur chargement posts:', err);
      setError(err.message || 'Erreur lors du chargement');
      
      // Toast seulement pour les vraies erreurs, pas pour les tables vides
      if (!err.message?.includes('relation') && !err.message?.includes('does not exist')) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les posts",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const refresh = useCallback(() => {
    console.log('🔄 Rafraîchissement du feed...');
    loadPosts();
  }, [loadPosts]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  return {
    posts,
    loading,
    error,
    refresh
  };
}
