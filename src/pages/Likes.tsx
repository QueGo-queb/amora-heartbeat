import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, User, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

const Likes = () => {
  const navigate = useNavigate();
  const [likes, setLikes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLikes();
  }, []);

  // ✅ CORRECTION : Charger les vrais likes depuis la base de données
  const loadLikes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Récupérer les likes reçus
      const { data, error } = await supabase
        .from('likes')
        .select(`
          *,
          profiles:liker_id (
            id,
            full_name,
            avatar_url,
            bio,
            age,
            location
          )
        `)
        .eq('liked_user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur chargement likes:', error);
        setLikes([]);
      } else {
        setLikes(data || []);
      }
    } catch (error) {
      console.error('Erreur:', error);
      setLikes([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Bouton de retour */}
      <div className="container mx-auto px-4 pt-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au fil d'actualité
        </Button>
      </div>

      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Heart className="w-8 h-8 text-red-500" />
            <h1 className="text-3xl font-bold">Mes J'aime</h1>
          </div>
          
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : likes.length === 0 ? (
            <Card className="culture-card">
              <CardHeader>
                <CardTitle>Aucun j'aime reçu</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Personne ne vous a encore aimé. Soyez actif sur la plateforme pour attirer l'attention !
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {likes.map((like) => (
                <Card key={like.id} className="culture-card hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={like.profiles?.avatar_url} alt={like.profiles?.full_name} />
                        <AvatarFallback>
                          <User className="w-8 h-8" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {like.profiles?.full_name || 'Utilisateur'}
                          </h3>
                          <Badge variant="secondary" className="text-xs">
                            <Heart className="w-3 h-3 mr-1" />
                            Vous aime
                          </Badge>
                        </div>
                        {like.profiles?.age && (
                          <p className="text-sm text-gray-600">
                            {like.profiles.age} ans
                          </p>
                        )}
                        {like.profiles?.location && (
                          <p className="text-sm text-gray-500 truncate">
                            {like.profiles.location}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(like.created_at).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <Button 
                        size="sm"
                        onClick={() => navigate(`/profile/${like.profiles?.id}`)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Voir profil
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Likes;
