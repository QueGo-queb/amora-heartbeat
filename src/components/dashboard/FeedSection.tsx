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
  Edit3,
  ChevronLeft,
  ChevronRight
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
import CreatePostModal from '@/components/feed/CreatePostModal';

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
  
  // État pour le scroll horizontal des profils
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);

  // Fonction pour gérer la création de post
  const handlePostCreated = () => {
    setShowCreatePostModal(false);
    refresh();
    toast({
      title: "Post créé avec succès",
      description: "Votre post a été ajouté au fil d'actualité",
    });
  };

  // Fonction pour ouvrir le modal de création de post
  const handleCreatePostClick = () => {
    setShowCreatePostModal(true);
  };

  const handleContact = async (post: any) => {
    if (!post.canContact) {
      setShowPremiumModal(true);
      return;
    }

    try {
      await sendContactRequest(post.author_id);
      toast({
        title: "Demande envoyée",
        description: `Votre demande de contact a été envoyée à ${post.author_name}`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer la demande de contact",
        variant: "destructive",
      });
    }
  };

  const handleLike = async (post: any) => {
    toast({
      title: "Like ajouté",
      description: `Vous avez liké le post de ${post.author_name}`,
    });
  };

  const handleShare = async (post: any) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Post de ${post.author_name}`,
          text: post.content,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Partage annulé');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Lien copié",
        description: "Le lien a été copié dans le presse-papiers",
      });
    }
  };

  const handleAudioCall = async (post: any) => {
    if (!post.canContact) {
      setShowPremiumModal(true);
      return;
    }
    await startAudioCall(post.author_id);
  };

  const handleVideoCall = async (post: any) => {
    if (!post.canContact) {
      setShowPremiumModal(true);
      return;
    }
    await startVideoCall(post.author_id);
  };

  // Navigation des profils
  const nextProfile = () => {
    setCurrentProfileIndex((prev) => (prev + 1) % posts.length);
  };

  const prevProfile = () => {
    setCurrentProfileIndex((prev) => (prev - 1 + posts.length) % posts.length);
  };

  if (loading) {
    return (
      <div className={`space-y-4 lg:space-y-6 ${className}`}>
        <div className="flex items-center justify-center h-32 lg:h-64">
          <div className="flex items-center gap-2 text-[#212529]">
            <RefreshCw className="w-4 h-4 lg:w-5 lg:h-5 animate-spin" />
            <span className="text-sm lg:text-base">Chargement du fil d'actualité...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-4 lg:space-y-6 ${className}`}>
        <Card className="bg-[#F8F9FA] border-[#E63946] border-2">
          <CardContent className="p-4 lg:p-6 text-center">
            <div className="text-[#E63946] mb-2 text-sm lg:text-base">⚠️ Erreur de chargement</div>
            <p className="text-[#212529] mb-4 text-xs lg:text-base">{error}</p>
            <Button 
              onClick={refresh}
              className="bg-[#E63946] hover:bg-[#E63946]/90 text-white border-0 text-sm lg:text-base"
            >
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className={`space-y-4 lg:space-y-6 ${className}`}>
        <Card className="bg-[#F8F9FA] border-[#CED4DA]">
          <CardContent className="p-4 lg:p-6 text-center">
            <div className="text-[#212529] mb-2 text-sm lg:text-base">📭 Aucun post disponible</div>
            <p className="text-[#CED4DA] mb-4 text-xs lg:text-sm">Il n'y a pas encore de posts dans votre fil d'actualité.</p>
            <Button 
              onClick={handleCreatePostClick}
              className="bg-[#E63946] hover:bg-[#E63946]/90 text-white border-0 text-sm lg:text-base"
            >
              <Plus className="w-4 h-4 mr-2" />
              Créer le premier post
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-4 lg:space-y-6 ${className}`}>
      {/* Header avec refresh */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg lg:text-2xl font-bold text-[#212529]">Candidates</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={refresh}
          disabled={loading}
          className="flex items-center gap-2 border-[#CED4DA] text-[#212529] hover:bg-[#52B788] hover:text-white hover:border-[#52B788] text-xs lg:text-sm"
        >
          <RefreshCw className={`w-3 h-3 lg:w-4 lg:h-4 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Actualiser</span>
        </Button>
      </div>

      {/* Section des profils avec scroll horizontal - RESPONSIVE */}
      <div className="relative">
        {/* Boutons de navigation - masqués sur mobile très petit */}
        <Button
          variant="outline"
          size="icon"
          onClick={prevProfile}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-[#E63946] hover:bg-[#E63946]/90 text-white border-0 rounded-full w-8 h-8 lg:w-10 lg:h-10 hidden sm:flex"
        >
          <ChevronLeft className="w-4 h-4 lg:w-5 lg:h-5" />
        </Button>

        {/* Container des profils avec scroll horizontal */}
        <div className="flex overflow-x-auto gap-3 lg:gap-4 px-2 sm:px-12 py-4 scrollbar-hide">
          {posts.map((post, index) => (
            <Card 
              key={post.id} 
              className="min-w-[240px] sm:min-w-[280px] max-w-[240px] sm:max-w-[280px] hover:shadow-lg transition-all duration-300 bg-[#F8F9FA] border-[#CED4DA] rounded-xl flex flex-col"
            >
              {/* Section image/avatar */}
              <div className="relative p-3 lg:p-4 pb-2">
                <div className="relative h-24 lg:h-32 bg-gradient-to-br from-[#E63946]/20 to-[#52B788]/20 rounded-lg mb-2 lg:mb-3 overflow-hidden">
                  <div className="absolute -bottom-4 lg:-bottom-6 left-1/2 -translate-x-1/2">
                    <Avatar className="h-12 w-12 lg:h-16 lg:w-16 border-2 lg:border-4 border-[#F8F9FA] shadow-lg">
                      <AvatarImage src={post.author_avatar} alt={post.author_name} />
                      <AvatarFallback className="bg-[#E63946] text-white text-sm lg:text-lg font-semibold">
                        {post.author_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
              </div>

              {/* Informations utilisateur */}
              <CardContent className="pt-6 lg:pt-8 pb-3 lg:pb-4 text-center flex-1">
                <div className="mb-2">
                  <h3 className="font-semibold text-[#212529] text-sm lg:text-lg">{post.author_name}</h3>
                  <p className="text-xs lg:text-sm text-[#CED4DA]">
                    {post.author_age} ans • {post.author_location || 'Localisation'}
                  </p>
                </div>

                {/* Badges d'intérêts communs */}
                {post.commonInterests.length > 0 && (
                  <div className="mb-2 lg:mb-3">
                    <div className="flex flex-wrap gap-1 justify-center">
                      {post.commonInterests.slice(0, 2).map((interest, idx) => (
                        <Badge key={idx} className="text-xs bg-[#52B788] text-white border-0">
                          {interest}
                        </Badge>
                      ))}
                      {post.commonInterests.length > 2 && (
                        <Badge className="text-xs bg-[#CED4DA] text-[#212529] border-0">
                          +{post.commonInterests.length - 2}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Score de compatibilité */}
                <Badge className="text-xs bg-[#E63946] text-white border-0 mb-2 lg:mb-3">
                  Score: {post.compatibilityScore}%
                </Badge>

                {/* Contenu du post */}
                <p className="text-xs lg:text-sm text-[#212529] line-clamp-2 leading-relaxed">
                  {post.content}
                </p>
              </CardContent>

              {/* Boutons d'action */}
              <div className="p-3 lg:p-4 pt-0">
                <div className="flex gap-2 justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleLike(post)}
                    className="flex-1 bg-[#F8F9FA] border-[#CED4DA] text-[#E63946] hover:bg-[#E63946] hover:text-white hover:border-[#E63946] rounded-full h-8 lg:h-10"
                  >
                    <Heart className="h-3 w-3 lg:h-4 lg:w-4" />
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleContact(post)}
                    disabled={sending}
                    className="flex-1 bg-[#F8F9FA] border-[#CED4DA] text-[#E63946] hover:bg-[#E63946] hover:text-white hover:border-[#E63946] rounded-full h-8 lg:h-10"
                  >
                    <MessageCircle className="h-3 w-3 lg:h-4 lg:w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Bouton de navigation droite */}
        <Button
          variant="outline"
          size="icon"
          onClick={nextProfile}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-[#E63946] hover:bg-[#E63946]/90 text-white border-0 rounded-full w-8 h-8 lg:w-10 lg:h-10 hidden sm:flex"
        >
          <ChevronRight className="w-4 h-4 lg:w-5 lg:h-5" />
        </Button>
      </div>

      {/* Section "You may like" - RESPONSIVE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Section "You may like" */}
        <Card className="bg-[#F8F9FA] border-[#CED4DA] rounded-xl">
          <CardHeader className="pb-3">
            <h3 className="text-base lg:text-lg font-semibold text-[#212529]">You may like</h3>
          </CardHeader>
          <CardContent className="space-y-3">
            {posts.slice(0, 3).map((post, index) => (
              <div key={index} className="flex items-center gap-3">
                <Avatar className="h-8 w-8 lg:h-10 lg:w-10">
                  <AvatarImage src={post.author_avatar} alt={post.author_name} />
                  <AvatarFallback className="bg-[#E63946] text-white text-xs lg:text-sm">
                    {post.author_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[#212529] text-xs lg:text-sm truncate">{post.author_name}</p>
                  <p className="text-xs text-[#CED4DA] truncate">{post.author_location || 'Localisation'}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleLike(post)}
                  className="w-6 h-6 lg:w-8 lg:h-8 p-0 bg-[#E63946] hover:bg-[#E63946]/90 text-white border-0 rounded-full"
                >
                  <Plus className="h-3 w-3 lg:h-4 lg:w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Section "Chat request" */}
        <Card className="bg-[#F8F9FA] border-[#CED4DA] rounded-xl">
          <CardHeader className="pb-3">
            <h3 className="text-base lg:text-lg font-semibold text-[#212529]">Chat request</h3>
          </CardHeader>
          <CardContent className="space-y-3">
            {posts.slice(0, 2).map((post, index) => (
              <div key={index} className="flex items-center gap-3">
                <Avatar className="h-8 w-8 lg:h-10 lg:w-10">
                  <AvatarImage src={post.author_avatar} alt={post.author_name} />
                  <AvatarFallback className="bg-[#E63946] text-white text-xs lg:text-sm">
                    {post.author_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[#212529] text-xs lg:text-sm truncate">{post.author_name}</p>
                  <p className="text-xs text-[#CED4DA] truncate">{post.author_location || 'Localisation'}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleContact(post)}
                  className="text-xs bg-[#52B788] hover:bg-[#52B788]/90 text-white border-0 rounded-full px-2 lg:px-3"
                >
                  Reply
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Section "My Profile" */}
        <Card className="bg-[#F8F9FA] border-[#CED4DA] rounded-xl sm:col-span-2 lg:col-span-1">
          <CardHeader className="pb-3">
            <h3 className="text-base lg:text-lg font-semibold text-[#212529]">My Profile</h3>
          </CardHeader>
          <CardContent className="text-center">
            <Avatar className="h-12 w-12 lg:h-16 lg:w-16 mx-auto mb-2 lg:mb-3">
              <AvatarImage src={userProfile?.avatar_url} alt={userProfile?.full_name} />
              <AvatarFallback className="bg-[#E63946] text-white text-sm lg:text-lg">
                {userProfile?.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2 text-xs lg:text-sm">
              <div className="flex justify-between">
                <span className="text-[#212529]">Followers</span>
                <span className="font-semibold text-[#E63946]">200</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#212529]">Following</span>
                <span className="font-semibold text-[#E63946]">40</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#212529]">Friends</span>
                <span className="font-semibold text-[#E63946]">340+</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <PremiumUpgradeModal 
        open={showPremiumModal} 
        onClose={() => setShowPremiumModal(false)} 
      />
      
      <CreatePostModal 
        open={showCreatePostModal} 
        onClose={() => setShowCreatePostModal(false)}
        onPostCreated={handlePostCreated}
      />
    </div>
  );
};

export default FeedSection;
