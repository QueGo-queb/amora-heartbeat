import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Lock,
  Plus,
  Edit3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useGenderFilteredFeed } from '@/hooks/useGenderFilteredFeed';
import { useMessaging } from '@/hooks/useMessaging';
import { useToast } from '@/hooks/use-toast';
import { PremiumUpgradeModal } from '@/components/settings/PremiumUpgradeModal';
import { useCountryDetection } from '@/hooks/useCountryDetection';
import { CreatePostModal } from '@/components/feed/CreatePostModal';

interface FeedSectionProps {
  className?: string;
}

const FeedSection: React.FC<FeedSectionProps> = ({ className = '' }) => {
  const { posts, loading, error, refresh, userProfile, userInterests } = useGenderFilteredFeed();
  const { sending, sendContactRequest, startAudioCall, startVideoCall } = useMessaging();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { countryInfo } = useCountryDetection();
  
  // État pour gérer l'ouverture des modals
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);

  const handleContact = async (post: any) => {
    if (!post.canContact) {
      setShowPremiumModal(true);
      return;
    }

    toast({
      title: "Demande de contact envoyée",
      description: `Votre demande a été envoyée à ${post.profiles?.full_name}`,
    });
  };

  const handleCreatePost = () => {
    setShowCreatePostModal(true);
  };

  const handlePostCreated = () => {
    // Actualiser le feed après création d'un post
    refresh();
  };

  const handleAudioCall = async (post: any) => {
    const result = await startAudioCall(post.author_id);
    if (result.success) {
      // Logique pour démarrer l'appel
      }
  };

  const handleVideoCall = async (post: any) => {
    const result = await startVideoCall(post.author_id);
    if (result.success) {
      // Logique pour démarrer l'appel
      }
  };

  const handlePremiumModalClose = () => {
    setShowPremiumModal(false);
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
      {/* Bouton Créer une publication */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Edit3 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Créer une publication</h3>
                <p className="text-sm text-gray-600">Partagez vos pensées avec la communauté</p>
              </div>
            </div>
            <Button 
              onClick={handleCreatePost}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Publier
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Header avec refresh */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Fil d'actualité</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={refresh}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
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
                  {/* Bouton de contact principal - CORRECTION ICI */}
                  <Button
                    variant={post.canContact ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleContact(post)}
                    disabled={sending}
                    className="flex items-center gap-2 cursor-pointer"
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

      {/* Modals */}
      <CreatePostModal
        open={showCreatePostModal}
        onClose={() => setShowCreatePostModal(false)}
        onPostCreated={handlePostCreated}
      />
      
      <PremiumUpgradeModal
        open={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        userCountry={countryInfo?.country}
      />
    </div>
  );
};

export default FeedSection;
