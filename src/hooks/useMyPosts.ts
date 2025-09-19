/**
 * Hook pour gérer "Mes publications" - affiche uniquement les posts de l'utilisateur connecté
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface MyPost {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  profiles?: {
    id: string;
    full_name: string;
    avatar_url?: string;
    user_id: string;
  };
}

export function useMyPosts() {
  const [posts, setPosts] = useState<MyPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const loadMyPosts = useCallback(async () => {
    if (!user?.id) {
      setPosts([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Chargement de mes posts pour l\'utilisateur:', user.id);

      // ✅ CORRECTION : Utiliser exactement les mêmes colonnes que useInterestsFeed
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          id,
          user_id,
          content,
          created_at,
          image_url,
          video_url,
          media,
          tags,
          visibility,
          likes_count,
          comments_count
        `)
        .eq('user_id', user.id) // ✅ SEULEMENT MES POSTS
        .order('created_at', { ascending: false })
        .limit(50);

      console.log(' Mes posts récupérés:', postsData);
      console.log('📊 Nombre de mes posts:', postsData?.length || 0);

      if (postsError) {
        console.error('Erreur mes posts:', postsError);
        throw postsError;
      }

      if (!postsData || postsData.length === 0) {
        console.log('📭 Aucun de mes posts trouvé');
        setPosts([]);
        return;
      }

      // Charger le profil de l'utilisateur
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          avatar_url,
          user_id
        `)
        .eq('user_id', user.id)
        .single();

      // Combiner les posts avec le profil
      const postsWithProfileAndMedia = postsData.map(post => {
        //  TRANSFORMATION DES MÉDIAS (même logique que useInterestsFeed)
        let mediaArray = [];
        
        // Gérer l'ancien format (image_url, video_url)
        if (post.image_url) {
          mediaArray.push({ type: 'image', url: post.image_url });
        }
        if (post.video_url) {
          mediaArray.push({ type: 'video', url: post.video_url });
        }
        
        // Gérer le nouveau format (media JSONB) si disponible
        if (post.media && Array.isArray(post.media) && post.media.length > 0) {
          mediaArray = [...mediaArray, ...post.media];
        }
        
        return {
          id: post.id,
          user_id: post.user_id,
          content: post.content,
          created_at: post.created_at,
          likes_count: post.likes_count || 0,
          comments_count: post.comments_count || 0,
          shares_count: 0, // ✅ Valeur par défaut car la colonne n'existe peut-être pas
          visibility: post.visibility || 'public',
          tags: post.tags || [],
          media: mediaArray,
          profiles: profileData || {
            id: user.id,
            full_name: user.email || 'Utilisateur',
            avatar_url: null,
            user_id: user.id
          }
        };
      });

      console.log('✅ Mes posts transformés:', postsWithProfileAndMedia.length);
      setPosts(postsWithProfileAndMedia);

    } catch (err: any) {
      console.error('Erreur chargement mes posts:', err);
      setError(err.message || 'Erreur lors du chargement de vos posts');
      
      toast({
        title: "Erreur",
        description: "Impossible de charger vos posts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const refresh = useCallback(() => {
    console.log('🔄 Rafraîchissement de mes posts...');
    loadMyPosts();
  }, [loadMyPosts]);

  // ✅ Charger les posts quand l'utilisateur change
  useEffect(() => {
    loadMyPosts();
  }, [loadMyPosts]);

  return {
    posts,
    loading,
    error,
    refresh
  };
}
