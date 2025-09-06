import { PostCreator } from './PostCreator';
import { PostCard } from './PostCard';
import { FriendsSuggestions } from './FriendsSuggestions';
import { useSocialFeed } from '@/hooks/useSocialFeed';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export function SocialFeed() {
  const { posts, loading, error, userProfile, refresh, handleLike } = useSocialFeed();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-8 px-4">
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-lg">Chargement du fil d'actualité...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-8 px-4">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h2 className="text-xl font-semibold mb-2">Erreur de chargement</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={refresh} className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Réessayer
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header du feed */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Fil d'actualité</h1>
              <p className="text-gray-600 mt-1">
                Publications personnalisées selon vos intérêts et votre localisation
              </p>
            </div>
            <Button variant="outline" onClick={refresh} className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Actualiser
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Feed principal */}
          <div className="lg:col-span-3">
            {/* Créateur de post */}
            <PostCreator onPostCreated={refresh} />

            {/* Liste des posts */}
            {posts.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📝</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Aucune publication trouvée</h3>
                <p className="text-gray-600 mb-4">
                  Aucune publication pertinente basée sur vos intérêts pour le moment.
                </p>
                <p className="text-sm text-gray-500">
                  Essayez de définir vos intérêts dans votre profil ou créez votre première publication !
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={{
                      id: post.id,
                      content: post.content,
                      created_at: post.created_at,
                      likes_count: post.likes_count,
                      comments_count: post.comments_count,
                      user: {
                        id: post.profiles?.id || post.user_id,
                        name: post.profiles?.full_name || 'Utilisateur',
                        avatar: post.profiles?.avatar_url,
                        interests: post.profiles?.interests || [],
                        isPremium: post.profiles?.plan === 'premium'
                      },
                      commonInterests: post.commonInterests
                    }}
                    currentUserId={userProfile?.id}
                    onLike={handleLike}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar avec suggestions */}
          <div className="lg:col-span-1">
            <FriendsSuggestions />
          </div>
        </div>
      </div>
    </div>
  );
}
