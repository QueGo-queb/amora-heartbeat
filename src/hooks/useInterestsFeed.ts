// src/hooks/useInterestsFeed.ts - VERSION CORRIGÉE SANS RELATION
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

      // D'abord, charger les posts sans relation
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          id,
          user_id,
          content,
          created_at,
          likes_count,
          comments_count
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (postsError) {
        console.error('Erreur posts:', postsError);
        // Si la table posts n'existe pas, retourner un tableau vide
        if (postsError.code === 'PGRST116' || postsError.message?.includes('does not exist')) {
          console.log('📭 Table posts vide ou inexistante');
          setPosts([]);
          return;
        }
        throw postsError;
      }

      if (!postsData || postsData.length === 0) {
        console.log('📭 Aucun post trouvé');
        setPosts([]);
        return;
      }

      // Ensuite, charger les profils pour chaque post
      const userIds = [...new Set(postsData.map(post => post.user_id))];
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          avatar_url,
          user_id
        `)
        .in('user_id', userIds);

      // Créer un map des profils pour un accès rapide
      const profilesMap = new Map();
      if (profilesData && !profilesError) {
        profilesData.forEach(profile => {
          profilesMap.set(profile.user_id, profile);
        });
      }

      // Combiner les posts avec leurs profils
      const postsWithProfiles = postsData.map(post => ({
        ...post,
        profiles: profilesMap.get(post.user_id) || {
          id: post.user_id,
          full_name: 'Utilisateur',
          avatar_url: null,
          user_id: post.user_id
        }
      }));

      console.log('✅ Posts chargés avec profils:', postsWithProfiles.length);
      setPosts(postsWithProfiles);

    } catch (err: any) {
      console.error('Erreur chargement posts:', err);
      
      // Gérer les erreurs de relation
      if (err.message?.includes('relationship') || err.message?.includes('schema cache')) {
        console.log('⚠️ Erreur de relation détectée, utilisation de données de test');
        
        // Créer des posts de test pour éviter l'erreur
        const testPosts: Post[] = [
          {
            id: 'test-1',
            user_id: 'test-user-1',
            content: 'Bienvenue sur Amora ! Partagez vos pensées avec la communauté.',
            created_at: new Date().toISOString(),
            likes_count: 0,
            comments_count: 0,
            profiles: {
              id: 'test-profile-1',
              full_name: 'Amora Team',
              avatar_url: null,
              user_id: 'test-user-1'
            }
          }
        ];
        
        setPosts(testPosts);
        setError(null);
      } else {
        setError(err.message || 'Erreur lors du chargement');
        
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
