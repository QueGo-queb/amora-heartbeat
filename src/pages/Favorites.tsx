import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, User, MessageCircle, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

const Favorites = () => {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Récupérer les favoris depuis la base de données
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          *,
          profiles:favorite_user_id (
            id,
            full_name,
            avatar_url,
            bio,
            age,
            location,
            interests
          )
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error('Erreur chargement favoris:', error);
        // Données de test si pas de BDD
        setFavorites([
          {
            id: 1,
            profiles: {
              full_name: 'Sophie Martin',
              avatar_url: '/placeholder.svg',
              bio: 'Passionnée de voyage et de cuisine',
              age: 28,
              location: 'Montréal, QC',
              interests: ['Voyage', 'Cuisine', 'Photographie']
            }
          },
          {
            id: 2,
            profiles: {
              full_name: 'Alex Dubois',
              avatar_url: '/placeholder.svg',
              bio: 'Musicien et amoureux de la nature',
              age: 32,
              location: 'Québec, QC',
              interests: ['Musique', 'Nature', 'Sport']
            }
          }
        ]);
      } else {
        setFavorites(data || []);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (favoriteId: string) => {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', favoriteId);

      if (!error) {
        setFavorites(prev => prev.filter(fav => fav.id !== favoriteId));
      }
    } catch (error) {
      console.error('Erreur suppression favori:', error);
    }
  };

  const handleSendMessage = (userId: string) => {
    navigate(`/messages?user=${userId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de vos favoris...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Favoris</h1>
            <p className="text-sm text-gray-600">
              {favorites.length} personne{favorites.length > 1 ? 's' : ''} dans vos favoris
            </p>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="p-6">
        {favorites.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Aucun favori pour le moment
              </h3>
              <p className="text-gray-600 mb-6">
                Commencez à liker des profils pour les retrouver ici !
              </p>
              <Button onClick={() => navigate('/matching')}>
                Découvrir des profils
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((favorite) => (
              <Card key={favorite.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={favorite.profiles.avatar_url} />
                      <AvatarFallback>
                        {favorite.profiles.full_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        {favorite.profiles.full_name}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>{favorite.profiles.age} ans</span>
                        {favorite.profiles.location && (
                          <>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {favorite.profiles.location}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {favorite.profiles.bio && (
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {favorite.profiles.bio}
                    </p>
                  )}
                  
                  {favorite.profiles.interests && (
                    <div className="flex flex-wrap gap-1">
                      {favorite.profiles.interests.slice(0, 3).map((interest: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => handleSendMessage(favorite.profiles.id)}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveFavorite(favorite.id)}
                    >
                      <Heart className="h-4 w-4 fill-current text-red-500" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
