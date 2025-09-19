/**
 * Conteneur pour "Mes publications" - affiche uniquement les posts de l'utilisateur
 */

import { useState, useEffect } from 'react';
import { useMyPosts } from '@/hooks/useMyPosts';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, User, Calendar, Heart, MessageCircle, Share2 } from 'lucide-react';

const MyPostsContainer = () => {
  const { user } = useAuth();
  const { posts, loading, error, refresh } = useMyPosts();

  if (!user) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">�� Connexion requise</h3>
          <p className="text-gray-600">Vous devez être connecté pour voir vos publications.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">📝 Mes publications</h2>
            <p className="text-gray-600 mt-1">
              Vos posts personnels ({posts.length} publication{posts.length !== 1 ? 's' : ''})
            </p>
          </div>
          <Button
            onClick={refresh}
            variant="outline"
            size="sm"
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* État de chargement */}
      {loading && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600 mr-3"></div>
            <p className="text-gray-600">🔄 Chargement de vos publications...</p>
          </div>
        </div>
      )}

      {/* Gestion des erreurs */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="text-red-600 mr-3">❌</div>
            <div className="flex-1">
              <h4 className="font-semibold text-red-800 mb-1">Erreur de chargement</h4>
              <p className="text-red-700 text-sm mb-3">{error}</p>
              <Button 
                onClick={refresh}
                variant="destructive"
                size="sm"
              >
                Réessayer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Aucun post */}
      {!loading && !error && posts.length === 0 && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold mb-2 text-gray-900">Aucune publication</h3>
          <p className="text-gray-600 mb-6">
            Vous n'avez pas encore publié de contenu. Créez votre premier post !
          </p>
          <Button
            onClick={() => window.location.href = '/feed'}
            className="bg-gradient-to-r from-[#E63946] to-[#52B788] hover:from-[#D62828] hover:to-[#40916C] text-white"
          >
            Créer une publication
          </Button>
        </div>
      )}

      {/* Liste des posts */}
      {!loading && !error && posts.length > 0 && (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                      {post.profiles?.avatar_url ? (
                        <img 
                          src={post.profiles.avatar_url} 
                          alt="" 
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-sm">
                          {(post.profiles?.full_name || 'U').charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {post.profiles?.full_name || 'Utilisateur'}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-3 h-3" />
                        {new Date(post.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                  <Badge variant={post.visibility === 'public' ? 'default' : 'secondary'}>
                    {post.visibility === 'public' ? 'Public' : post.visibility}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-900 leading-relaxed mb-4">{post.content}</p>
                
                {/* ✅ AJOUT : AFFICHAGE DES MÉDIAS */}
                {post.media && post.media.length > 0 && (
                  <div className="mb-4">
                    <div className="grid grid-cols-1 gap-2">
                      {post.media.map((media, index) => (
                        <div key={index} className="relative group">
                          {media.type === 'image' ? (
                            <img
                              src={media.url}
                              alt={`Image ${index + 1}`}
                              className="w-full h-64 object-cover rounded-lg"
                              loading="lazy"
                              onError={(e) => {
                                console.error('Erreur chargement image:', media.url);
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : media.type === 'video' ? (
                            <video
                              src={media.url}
                              controls
                              className="w-full h-64 object-cover rounded-lg"
                              onError={(e) => {
                                console.error('Erreur chargement vidéo:', media.url);
                                e.currentTarget.style.display = 'none';
                              }}
                            >
                              Votre navigateur ne supporte pas la lecture vidéo.
                            </video>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}
                
                {/* Statistiques */}
                <div className="flex items-center space-x-6 text-sm text-gray-500 pt-3 border-t">
                  <div className="flex items-center space-x-1">
                    <Heart className="w-4 h-4" />
                    <span>{post.likes_count}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageCircle className="w-4 h-4" />
                    <span>{post.comments_count}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Share2 className="w-4 h-4" />
                    <span>{post.shares_count}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPostsContainer;
