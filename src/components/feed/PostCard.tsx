/**
 * Composant pour afficher un post individuel
 * Inclut l'auteur, le contenu, les interactions et les actions
 */

import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, Clock, MapPin, Crown, Phone, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { fr, enUS, es, ptBR } from 'date-fns/locale';
import type { FeedPost } from '../../../types/feed';
import { supabase } from '@/integrations/supabase/client';
import { usePremium } from '@/hooks/usePremium';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { ContactButton } from './ContactButton';
import { LazyImage } from '@/components/ui/LazyImage';
import { CallButtonGroup } from '@/components/chat/CallButton';
import { usePremiumRestriction } from '@/hooks/usePremiumRestriction';
import { PremiumFeatureModal } from '@/components/ui/PremiumFeatureModal';
import { PostActions } from './PostActions';
import { getPostMedia, getFirstMedia, hasMedia } from '../../../utils/mediaUtils';

interface PostCardProps {
  post: FeedPost;
  onLike: (postId: string) => void;
  currentUserId?: string;
}

const locales = { fr, en: enUS, es, 'pt-BR': ptBR };

export function PostCard({ post, onLike, currentUserId }: PostCardProps) {
  // 🔍 DEBUG: Vérifier que le composant se rend
  console.log('🎯 PostCard rendu:', {
    postId: post.id,
    hasContent: !!post.content,
    hasAuthor: !!post.profiles?.full_name,
    currentUserId,
    isAuthor: currentUserId === post.user_id
  });

  const [isLiked, setIsLiked] = useState(false); // TODO: Récupérer depuis l'API
  const [showFullContent, setShowFullContent] = useState(false);
  const [currentUserInterests, setCurrentUserInterests] = useState<string[]>([]);
  
  const isAuthor = currentUserId === post.user_id;
  const { isPremium } = usePremium();
  const { 
    showPremiumModal, 
    restrictedFeature, 
    targetUserName,
    checkPremiumFeature, 
    closePremiumModal 
  } = usePremiumRestriction();

  // 🔍 DEBUG: Vérifier que le composant se rend
  console.log('🎯 PostCard rendu:', {
    postId: post.id,
    hasContent: !!post.content,
    hasAuthor: !!post.profiles?.full_name,
    currentUserId,
    isAuthor,
    isPremium
  });

  // Récupérer les intérêts de l'utilisateur actuel
  useEffect(() => {
    const getCurrentUserInterests = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('interests')
            .eq('id', user.id)
            .single();
          
          if (profile?.interests) {
            setCurrentUserInterests(profile.interests);
          }
        }
      } catch (err) {
        console.error('Error fetching current user interests:', err);
      }
    };

    getCurrentUserInterests();
  }, []);

  // Calculer les intérêts communs
  const commonInterests = post.profiles.interests?.filter(interest => 
    currentUserInterests.includes(interest)
  ) || [];

  // Formater la date relative
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { 
      addSuffix: true, 
      locale: locales.fr 
    });
  };

  // Gérer le like
  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike(post.id);
  };

  // Tronquer le contenu si nécessaire
  const shouldTruncate = post.content.length > 200;
  const displayContent = showFullContent 
    ? post.content 
    : post.content.slice(0, 200) + (shouldTruncate ? '...' : '');

  return (
    <Card className="culture-card hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <LazyImage 
                src={post.profiles.avatar_url} 
                alt="Avatar utilisateur"
                className="w-12 h-12 rounded-full"
              />
              <AvatarFallback>
                {post.profiles.full_name?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900 truncate">
                  {post.profiles.full_name || 'Utilisateur'}
                </h3>
                {isPremium && (
                  <Badge variant="default" className="bg-gradient-to-r from-yellow-400 to-orange-500">
                    PREMIUM
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="w-3 h-3" />
                <span>{formatDate(post.created_at)}</span>
                {/* Location temporairement désactivée - colonne non disponible */}
                {/* {post.profiles.location && (
                  <>
                    <span>•</span>
                    <MapPin className="w-3 h-3" />
                    <span>{post.profiles.location}</span>
                  </>
                )} */}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Badge Premium si nécessaire */}
            {!isPremium && (
              <Badge variant="outline" className="text-xs text-yellow-600 border-yellow-300">
                <Crown className="w-3 h-3 mr-1" />
                Premium requis
              </Badge>
            )}
            
            {/* Bouton Message simplifié */}
            {!isAuthor && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => {
                  if (isPremium) {
                    // Action normale
                    console.log('Message envoyé à', post.profiles.full_name);
                  } else {
                    // Incitation Premium
                    checkPremiumFeature('messages', () => {
                      console.log('Message envoyé à', post.profiles.full_name);
                    }, post.profiles.full_name);
                  }
                }}
                className="flex items-center gap-1"
              >
                <MessageCircle className="w-4 h-4" />
                Message
              </Button>
            )}
            
            {/* Bouton Appel Audio simplifié */}
            {!isAuthor && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => {
                  if (isPremium) {
                    // Action normale
                    console.log('Appel audio à', post.profiles.full_name);
                  } else {
                    // Incitation Premium
                    checkPremiumFeature('audio_call', () => {
                      console.log('Appel audio à', post.profiles.full_name);
                    }, post.profiles.full_name);
                  }
                }}
                className="flex items-center gap-1"
              >
                <Phone className="w-4 h-4" />
                Appel
              </Button>
            )}
            
            {/* Bouton Appel Vidéo simplifié */}
            {!isAuthor && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => {
                  if (isPremium) {
                    // Action normale
                    console.log('Appel vidéo à', post.profiles.full_name);
                  } else {
                    // Incitation Premium
                    checkPremiumFeature('video_call', () => {
                      console.log('Appel vidéo à', post.profiles.full_name);
                    }, post.profiles.full_name);
                  }
                }}
                className="flex items-center gap-1"
              >
                <Video className="w-4 h-4" />
                Vidéo
              </Button>
            )}

            {/* Bouton de contact avec restriction */}
            <ContactButton
              postId={post.id}
              authorId={post.user_id}
              authorName={post.profiles.full_name || 'Utilisateur'}
              currentUserId={currentUserId}
            />
            
            {/* Boutons d'appel avec restriction intégrée */}
            <CallButtonGroup
              userId={post.user_id}
              userName={post.profiles.full_name}
              size="sm"
            />

            {/* Menu options */}
            {!isAuthor && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Signaler</DropdownMenuItem>
                  <DropdownMenuItem>Partager</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Intérêts communs */}
        {commonInterests.length > 0 && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-4 h-4 text-heart-red" />
              <span className="text-sm font-medium text-gray-700">
                Intérêts communs ({commonInterests.length})
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {commonInterests.map((interest) => (
                <Badge key={interest} variant="secondary" className="text-xs">
                  {interest}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        {/* Contenu du post */}
        <div className="mb-4">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {displayContent}
          </p>
          
          {shouldTruncate && (
            <Button
              variant="link"
              className="p-0 h-auto text-xs text-muted-foreground"
              onClick={() => setShowFullContent(!showFullContent)}
            >
              {showFullContent ? 'Voir moins' : 'Voir plus'}
            </Button>
          )}
        </div>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        {/* ✅ NOUVEAU: Médias unifiés avec fallback automatique */}
        {hasMedia(post) && (
          <div className="mb-4">
            <div className="grid grid-cols-1 gap-2">
              {getPostMedia(post).map((media, index) => (
                <div key={index} className="relative group">
                  {media.type === 'image' ? (
                    <LazyImage
                      src={media.url}
                      alt={media.alt || `Image ${index + 1}`}
                      className="w-full h-64 object-cover rounded-lg"
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
                      poster={media.thumbnail}
                      onError={(e) => {
                        console.error('Erreur chargement vidéo:', media.url);
                        e.currentTarget.style.display = 'none';
                      }}
                    >
                      Votre navigateur ne supporte pas la lecture vidéo.
                    </video>
                  ) : media.type === 'gif' ? (
                    <LazyImage
                      src={media.url}
                      alt={media.alt || `GIF ${index + 1}`}
                      className="w-full h-64 object-cover rounded-lg"
                      onError={(e) => {
                        console.error('Erreur chargement GIF:', media.url);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <PostActions 
          post={post} 
          onLikeUpdate={(postId, newLikeCount, isLiked) => {
            // Mettre à jour l'état local si nécessaire
            console.log(`Post ${postId} liké: ${isLiked}, nouveau compte: ${newLikeCount}`);
          }}
          onShareUpdate={(postId, newShareCount) => {
            // Mettre à jour l'état local si nécessaire
            console.log(`Post ${postId} partagé, nouveau compte: ${newShareCount}`);
          }}
        />

        {/* Score de pertinence (optionnel, pour debug) */}
        {process.env.NODE_ENV === 'development' && (
          <Badge variant="outline" className="text-xs">
            Score: {post.score || 0}
          </Badge>
        )}
      </CardContent>

      {/*  AJOUT: Modal d'incitation Premium */}
      <PremiumFeatureModal
        open={showPremiumModal}
        onClose={closePremiumModal}
        feature={restrictedFeature || 'messages'}
        userName={targetUserName}
      />
    </Card>
  );
}
