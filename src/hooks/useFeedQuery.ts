// Nouveau fichier: src/hooks/useFeedQuery.ts
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { FeedPost, FeedFilters } from '../../types/feed';
import { useAuth } from '@/hooks/useAuth';

interface UseFeedQueryOptions {
  filters?: FeedFilters;
  pageSize?: number;
}

interface FeedPage {
  posts: FeedPost[];
  nextCursor: string | null;
  hasMore: boolean;
}

export function useFeedQuery(options: UseFeedQueryOptions = {}) {
  const { filters = {}, pageSize = 10 } = options;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Clé de requête unique basée sur les filtres
  const queryKey = ['feed', filters];

  // Fonction pour charger une page de posts
  const fetchFeedPage = async ({ pageParam = null }): Promise<FeedPage> => {
    const userFilters = {
      media_type: filters.media_type || 'all',
      premium_only: filters.premium_only ? 'true' : 'false',
      tags: filters.tags || []
    };

    const { data, error } = await supabase.rpc('get_feed_posts_optimized', {
      user_id: user?.id || '',
      page_size: pageSize,
      cursor_date: pageParam,
      user_filters: userFilters
    });

    if (error) {
      console.error('Erreur chargement feed:', error);
      throw error;
    }

    // Transformer les données
    const transformedPosts = data?.map(post => ({
      id: post.id,
      content: post.content,
      media_urls: post.media_urls || [],
      media_types: post.media_types || [],
      target_group: post.target_group,
      target_countries: post.target_countries || [],
      target_languages: post.target_languages || [],
      phone_number: post.phone_number,
      external_links: post.external_links || [],
      created_at: post.created_at,
      
      user: {
        id: post.user_id,
        email: post.user_email,
        full_name: post.user_full_name,
        avatar_url: post.user_avatar_url,
        plan: post.user_plan,
        is_premium: post.user_plan === 'premium'
      },
      
      likes_count: post.likes_count,
      comments_count: post.comments_count,
      user_has_liked: post.user_has_liked,
    })) || [];

    const hasMore = transformedPosts.length === pageSize;
    const nextCursor = hasMore && transformedPosts.length > 0 
      ? transformedPosts[transformedPosts.length - 1].created_at 
      : null;

    return {
      posts: transformedPosts,
      nextCursor,
      hasMore
    };
  };

  // Query infinie pour la pagination
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading,
    refetch
  } = useInfiniteQuery({
    queryKey,
    queryFn: fetchFeedPage,
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextCursor : undefined,
    staleTime: 2 * 60 * 1000, // 2 minutes pour le feed (plus frais)
    cacheTime: 5 * 60 * 1000, // 5 minutes en cache
  });

  // Mutation pour créer un post avec optimistic update
  const createPostMutation = useMutation({
    mutationFn: async (postData: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      const { data, error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          ...postData
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async (newPost) => {
      // Annuler les requêtes en cours
      await queryClient.cancelQueries({ queryKey });

      // Snapshot de l'état précédent
      const previousData = queryClient.getQueryData(queryKey);

      // Optimistic update
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return old;

        const optimisticPost = {
          id: `temp-${Date.now()}`,
          ...newPost,
          created_at: new Date().toISOString(),
          user: {
            id: 'current-user',
            full_name: 'Vous',
            plan: 'free' // À récupérer du cache
          },
          likes_count: 0,
          comments_count: 0,
          user_has_liked: false
        };

        return {
          ...old,
          pages: [
            {
              ...old.pages[0],
              posts: [optimisticPost, ...old.pages[0].posts]
            },
            ...old.pages.slice(1)
          ]
        };
      });

      return { previousData };
    },
    onError: (err, newPost, context) => {
      // Rollback en cas d'erreur
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      
      toast({
        title: "Erreur",
        description: "Impossible de créer le post",
        variant: "destructive",
      });
    },
    onSuccess: (data) => {
      // Invalider et refetch pour avoir les vraies données
      queryClient.invalidateQueries({ queryKey });
      
      toast({
        title: "Post créé",
        description: "Votre publication a été ajoutée au feed",
      });
    },
  });

  // Mutation pour toggle like avec optimistic update
  const toggleLikeMutation = useMutation({
    mutationFn: async ({ postId, currentlyLiked }: { postId: string, currentlyLiked: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      if (currentlyLiked) {
        // Supprimer le like
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
        if (error) throw error;
        return { liked: false };
      } else {
        // Ajouter le like
        const { error } = await supabase
          .from('likes')
          .insert({ post_id: postId, user_id: user.id });
        if (error) throw error;
        return { liked: true };
      }
    },
    onMutate: async ({ postId, currentlyLiked }) => {
      await queryClient.cancelQueries({ queryKey });

      const previousData = queryClient.getQueryData(queryKey);

      // Optimistic update
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            posts: page.posts.map((post: any) => 
              post.id === postId 
                ? {
                    ...post,
                    user_has_liked: !currentlyLiked,
                    likes_count: currentlyLiked 
                      ? Math.max(0, post.likes_count - 1)
                      : post.likes_count + 1
                  }
                : post
            )
          }))
        };
      });

      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      toast({
        title: "Erreur",
        description: "Impossible de modifier le like",
        variant: "destructive",
      });
    },
  });

  // Aplatir toutes les pages en une seule liste
  const posts = data?.pages.flatMap(page => page.posts) || [];

  return {
    posts,
    isLoading,
    isFetching,
    isFetchingNextPage,
    error,
    hasNextPage,
    fetchNextPage,
    refetch,
    createPost: createPostMutation.mutate,
    isCreatingPost: createPostMutation.isPending,
    toggleLike: (postId: string, currentlyLiked: boolean) => 
      toggleLikeMutation.mutate({ postId, currentlyLiked }),
    isTogglingLike: toggleLikeMutation.isPending,
  };
}
