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
      <Card className={`${className} bg-[#F8F9FA] border-[#CED4DA] shadow-lg`}>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 border-2 border-[#E63946] border-t-transparent rounded-full animate-spin" />
              <span className="text-[#212529] font-medium">Chargement du feed personnalisé...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`${className} bg-[#F8F9FA] border-[#CED4DA]`}>
        <CardContent className="p-8">
          <div className="text-center">
            <p className="text-[#E63946] mb-4 font-medium">{error}</p>
            <Button 
              onClick={refresh} 
              className="bg-[#E63946] hover:bg-[#E63946]/90 text-white border-0"
            >
              Réessayer
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (posts.length === 0) {
    return (
      <div className={`space-y-6 ${className}`}>
        {/* Bouton Créer une publication - DESIGN MAINTENU avec nouvelle palette */}
        <Card className="bg-gradient-to-r from-[#52B788]/10 to-[#52B788]/5 border-[#52B788]/30 shadow-lg rounded-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#52B788] rounded-full flex items-center justify-center">
                  <Edit3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-[#212529]">Créer une publication</h3>
                  <p className="text-sm text-[#CED4DA]">Partagez vos pensées avec la communauté</p>
                </div>
              </div>
              <Button 
                onClick={handleCreatePost}
                className="bg-[#E63946] hover:bg-[#E63946]/90 text-white border-0"
              >
                <Plus className="w-4 h-4 mr-2" />
                Publier
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Message aucun post - DESIGN MAINTENU avec nouvelle palette */}
        <Card className="bg-[#F8F9FA] border-[#CED4DA] shadow-lg rounded-xl">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-[#52B788] rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💡</span>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-[#212529]">Aucun post à afficher</h3>
            <p className="text-[#CED4DA] mb-4">
              {userProfile?.interests.length === 0 
                ? "Ajoutez des intérêts et préférences à votre profil pour voir des publications personnalisées !"
                : "Aucune publication ne correspond à vos préférences actuelles. Modifiez vos critères pour voir plus de contenu !"
              }
            </p>
            <Button 
              onClick={refresh} 
              className="bg-[#52B788] hover:bg-[#52B788]/90 text-white border-0"
            >
              Actualiser
            </Button>
          </CardContent>
        </Card>

        {/* Modal de création de post */}
        <CreatePostModal
          open={showCreatePostModal}
          onClose={() => setShowCreatePostModal(false)}
          onPostCreated={handlePostCreated}
        />
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Bouton Créer une publication - DESIGN MAINTENU avec nouvelle palette */}
      <Card className="bg-gradient-to-r from-[#52B788]/10 to-[#52B788]/5 border-[#52B788]/30 shadow-lg rounded-xl">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#52B788] rounded-full flex items-center justify-center">
                <Edit3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-medium text-[#212529]">Créer une publication</h3>
                <p className="text-sm text-[#CED4DA]">Partagez vos pensées avec la communauté</p>
              </div>
            </div>
            <Button 
              onClick={handleCreatePost}
              className="bg-[#E63946] hover:bg-[#E63946]/90 text-white border-0"
            >
              <Plus className="w-4 h-4 mr-2" />
              Publier
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Header avec refresh - DESIGN MAINTENU avec nouvelle palette */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#212529]">Fil d'actualité</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={refresh}
          disabled={loading}
          className="flex items-center gap-2 border-[#CED4DA] text-[#212529] hover:bg-[#52B788] hover:text-white hover:border-[#52B788]"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      <div className="space-y-6">
        {posts.map((post) => (
          <Card key={post.id} className="hover:shadow-lg transition-shadow bg-[#F8F9FA] border-[#CED4DA] rounded-xl">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={post.author_avatar} alt={post.author_name} />
                  <AvatarFallback className="bg-[#E63946] text-white">{post.author_name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-semibold flex items-center gap-2 text-[#212529]">
                    {post.author_name}
                    {post.author_plan === 'premium' && (
                      <Badge className="bg-yellow-600 text-white text-xs border-0">
                        <Crown className="h-3 w-3 mr-1" />
                        Premium
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#CED4DA]">
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
                    <Badge className="text-xs bg-[#52B788] text-white border-0">
                      {post.commonInterests.length} intérêt{post.commonInterests.length > 1 ? 's' : ''} commun{post.commonInterests.length > 1 ? 's' : ''}
                    </Badge>
                  )}
                  <Badge className="text-xs bg-[#E63946] text-white border-0">
                    Score: {post.compatibilityScore}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <p className="text-[#212529] mb-4 leading-relaxed">{post.content}</p>
              
              {/* Intérêts communs - DESIGN MAINTENU avec nouvelle palette */}
              {post.commonInterests.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-[#CED4DA] mb-2">Intérêts communs :</p>
                  <div className="flex flex-wrap gap-2">
                    {post.commonInterests.map((interest, index) => (
                      <Badge key={index} className="text-xs bg-[#52B788] text-white border-0">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions de contact avec logique premium - DESIGN MAINTENU avec nouvelle palette */}
              <div className="flex items-center justify-between pt-4 border-t border-[#CED4DA]/30">
                <div className="flex items-center gap-2">
                  {/* Bouton de contact principal - CORRECTION ICI */}
                  <Button
                    variant={post.canContact ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleContact(post)}
                    disabled={sending}
                    className={`flex items-center gap-2 cursor-pointer ${
                      post.canContact 
                        ? "bg-[#E63946] hover:bg-[#E63946]/90 text-white border-0"
                        : "border-[#CED4DA] text-[#212529] hover:bg-[#CED4DA]/20"
                    }`}
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

                  {/* Boutons premium - DESIGN MAINTENU avec nouvelle palette */}
                  {post.canContact && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAudioCall(post)}
                        disabled={sending}
                        className="flex items-center gap-2 border-[#52B788] text-[#52B788] hover:bg-[#52B788] hover:text-white"
                        title="Appel audio (Premium)"
                      >
                        <Phone className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVideoCall(post)}
                        disabled={sending}
                        className="flex items-center gap-2 border-[#52B788] text-[#52B788] hover:bg-[#52B788] hover:text-white"
                        title="Appel vidéo (Premium)"
                      >
                        <Video className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
                
                <div className="text-xs text-[#CED4DA]">
                  Compatibilité: {post.compatibilityScore}%
                </div>
              </div>

              {/* Message d'information pour les utilisateurs gratuits - DESIGN MAINTENU avec nouvelle palette */}
              {!post.canContact && (
                <div className="mt-3 p-3 bg-[#E63946]/10 border border-[#E63946]/20 rounded-lg">
                  <div className="flex items-center gap-2 text-[#E63946]">
                    <Crown className="w-4 h-4" />
                    <span className="text-sm font-medium">Fonctionnalité premium</span>
                  </div>
                  <p className="text-[#212529] text-sm mt-1">
                    {post.contactRestriction}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal de création de post */}
      <CreatePostModal
        open={showCreatePostModal}
        onClose={() => setShowCreatePostModal(false)}
        onPostCreated={handlePostCreated}
      />

      {/* Modal Premium */}
      <PremiumUpgradeModal
        open={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        userCountry={countryInfo?.country}
      />
    </div>
  );
};

export default FeedSection;
