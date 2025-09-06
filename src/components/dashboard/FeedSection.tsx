import { useState, useEffect, useCallback } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal, 
  Clock, 
  MapPin, 
  User, 
  RefreshCw,
  Phone,
  Video,
  Mic,
  Crown,
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useGenderFilteredFeed } from '@/hooks/useGenderFilteredFeed';
import { useMessaging } from '@/hooks/useMessaging';
import { useToast } from '@/hooks/use-toast';

interface FeedSectionProps {
  className?: string;
}

const FeedSection: React.FC<FeedSectionProps> = ({ className = '' }) => {
  const { posts, loading, error, refresh, userProfile, userInterests } = useGenderFilteredFeed();
  const { sending, sendContactRequest, startAudioCall, startVideoCall } = useMessaging();
  const { toast } = useToast();

  const handleContact = async (post: any) => {
    if (!post.canContact) {
      toast({
        title: "Plan gratuit requis",
        description: post.contactRestriction || "Passez au plan premium pour contacter cette personne.",
        variant: "destructive",
      });
      return;
    }

    // Ouvrir le modal de contact ou rediriger vers la page de messages
    toast({
      title: "💬 Contact",
      description: "Redirection vers la page de messages...",
    });
    
    // Ici vous pouvez rediriger vers la page de messages
    // navigate(`/messages?recipient=${post.author_id}`);
  };

  const handleAudioCall = async (post: any) => {
    const result = await startAudioCall(post.author_id);
    if (result.success) {
      // Logique pour démarrer l'appel
      console.log('Démarrage appel audio avec:', post.author_id);
    }
  };

  const handleVideoCall = async (post: any) => {
    const result = await startVideoCall(post.author_id);
    if (result.success) {
      // Logique pour démarrer l'appel
      console.log('Démarrage appel vidéo avec:', post.author_id);
    }
  };

  if (loading) {
    return (
      <Card className={`${className}`}>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span>Chargement du feed personnalisé...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`${className}`}>
        <CardContent className="p-8">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={refresh} variant="outline">
              Réessayer
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (posts.length === 0) {
    return (
      <Card className={`${className}`}>
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">💡</span>
          </div>
          <h3 className="text-lg font-semibold mb-2">Aucun post à afficher</h3>
          <p className="text-muted-foreground mb-4">
            {userProfile?.interests.length === 0 
              ? "Ajoutez des intérêts et préférences à votre profil pour voir des publications personnalisées !"
              : "Aucune publication ne correspond à vos préférences actuelles. Modifiez vos critères pour voir plus de contenu !"
            }
          </p>
          <Button onClick={refresh} variant="outline">
            Actualiser
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">📱 Fil d'actualité personnalisé</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {userProfile && (
              <>
                {userProfile.gender === 'male' ? 'Homme' : 'Femme'} cherchant 
                {userProfile.seeking_gender === 'both' ? ' tout le monde' : 
                 userProfile.seeking_gender === 'male' ? ' des hommes' : ' des femmes'}
                {userInterests.length > 0 && ` • ${userInterests.length} intérêt${userInterests.length > 1 ? 's' : ''}`}
              </>
            )}
          </p>
        </div>
        <Button onClick={refresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>

      <div className="space-y-6">
        {posts.map((post) => (
          <Card key={post.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={post.author_avatar} alt={post.author_name} />
                  <AvatarFallback>{post.author_name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-semibold flex items-center gap-2">
                    {post.author_name}
                    {post.author_plan === 'premium' && (
                      <Badge variant="default" className="bg-yellow-600 text-white text-xs">
                        <Crown className="h-3 w-3 mr-1" />
                        Premium
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {new Date(post.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                    <span>•</span>
                    <span>{post.author_gender === 'male' ? 'Homme' : 'Femme'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {post.commonInterests.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {post.commonInterests.length} intérêt{post.commonInterests.length > 1 ? 's' : ''} commun{post.commonInterests.length > 1 ? 's' : ''}
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    Score: {post.compatibilityScore}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <p className="text-gray-800 mb-4 leading-relaxed">{post.content}</p>
              
              {/* Intérêts communs */}
              {post.commonInterests.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-2">Intérêts communs :</p>
                  <div className="flex flex-wrap gap-2">
                    {post.commonInterests.map((interest, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions de contact avec logique premium */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  {/* Bouton de contact principal */}
                  <Button
                    variant={post.canContact ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleContact(post)}
                    disabled={sending}
                    className="flex items-center gap-2"
                  >
                    {post.canContact ? (
                      <>
                        <MessageCircle className="h-4 w-4" />
                        Contacter
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4" />
                        Premium requis
                      </>
                    )}
                  </Button>

                  {/* Boutons premium */}
                  {post.canContact && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAudioCall(post)}
                        disabled={sending}
                        className="flex items-center gap-2"
                        title="Appel audio (Premium)"
                      >
                        <Phone className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVideoCall(post)}
                        disabled={sending}
                        className="flex items-center gap-2"
                        title="Appel vidéo (Premium)"
                      >
                        <Video className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
                
                <div className="text-xs text-muted-foreground">
                  Compatibilité: {post.compatibilityScore}%
                </div>
              </div>

              {/* Message d'information pour les utilisateurs gratuits */}
              {!post.canContact && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-800">
                    <Crown className="w-4 h-4" />
                    <span className="text-sm font-medium">Fonctionnalité premium</span>
                  </div>
                  <p className="text-blue-700 text-sm mt-1">
                    {post.contactRestriction}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FeedSection;
