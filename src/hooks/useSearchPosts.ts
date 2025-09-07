import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SearchPost {
  id: string;
  user_id: string;
  content: string;
  post_type: 'search';
  target_age_min: number;
  target_age_max: number;
  target_countries: string[];
  target_languages: string[];
  target_interests: string[];
  target_genders: string[];
  created_at: string;
  author_name: string;
  author_avatar?: string;
}

export function useSearchPosts() {
  const [searchPosts, setSearchPosts] = useState<SearchPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSearchPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('user_visible_posts')
        .select('*')
        .eq('post_type', 'search')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setSearchPosts(data || []);
    } catch (err) {
      console.error('Erreur chargement publications de recherche:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSearchPosts();
  }, []);

  return {
    searchPosts,
    loading,
    error,
    refreshSearchPosts: loadSearchPosts
  };
}
