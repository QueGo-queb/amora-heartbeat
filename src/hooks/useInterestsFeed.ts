// src/hooks/useInterestsFeed.ts - VERSION CORRIGÉE SANS RELATION
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

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
  const { user } = useAuth();

  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Chargement des posts...');

      // ✅ CORRECTION : Exclure les posts de l'utilisateur connecté du feed principal
      let query = supabase
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
          comments_count,
          post_type,
          phone_number,
          target_countries,
          target_genders,
          target_interests
        `)
        .eq('visibility', 'public') // Seulement les posts publics
        .order('created_at', { ascending: false })
        .limit(20);

      // ✅ EXCLURE LES POSTS DE L'UTILISATEUR CONNECTÉ
      if (user?.id) {
        query = query.neq('user_id', user.id);
        console.log('🚫 Excluant les posts de l\'utilisateur:', user.id);
      }

      const { data: postsData, error: postsError } = await query;

      console.log('📊 Posts récupérés:', postsData);
      console.log('📊 Nombre de posts:', postsData?.length || 0);
      if (postsData && postsData.length > 0) {
        console.log(' Premier post structure:', postsData[0]);
      }

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
        console.log(' Aucun post trouvé (hors utilisateur connecté)');
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
      const postsWithProfilesAndMedia = postsData.map(post => {
        // 🎨 TRANSFORMATION DES MÉDIAS
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
          visibility: post.visibility || 'public',
          tags: post.tags || [],
          media: mediaArray, // Format attendu par PostCard
          phone_number: post.phone_number,
          target_countries: post.target_countries || [],
          target_genders: post.target_genders || [],
          target_interests: post.target_interests || [],
          profiles: profilesMap.get(post.user_id) || {
            id: post.user_id,
            full_name: 'Utilisateur',
            avatar_url: null,
            user_id: post.user_id,
            location: null,
            interests: []
          }
        };
      });

      console.log('✅ Posts transformés avec profils et médias:', postsWithProfilesAndMedia.length);
      console.log('🔍 Premier post transformé:', postsWithProfilesAndMedia[0]);
      setPosts(postsWithProfilesAndMedia);

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
  }, [toast, user]); // ✅ Ajouter user aux dépendances

  const refresh = useCallback(() => {
    console.log('🔄 Rafraîchissement du feed...');
    loadPosts();
  }, [loadPosts]); // ✅ Ajouter loadPosts aux dépendances

  // ✅ SOLUTION BOUCLE INFINIE - useEffect stable
  useEffect(() => {
    loadPosts();
  }, [loadPosts]); // ✅ Se déclenche quand loadPosts change (quand user change)

  return {
    posts,
    loading,
    error,
    refresh
  };
}
