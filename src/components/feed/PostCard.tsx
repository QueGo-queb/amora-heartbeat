/**
 * Composant pour afficher un post individuel
 * Inclut l'auteur, le contenu, les interactions et les actions
 */

import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, Clock, MapPin } from 'lucide-react';
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

interface PostCardProps {
  post: FeedPost;
  onLike: (postId: string) => void;
  currentUserId?: string;
}

const locales = { fr, en: enUS, es, 'pt-BR': ptBR };

export function PostCard({ post, onLike, currentUserId }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false); // TODO: Récupérer depuis l'API
  const [showFullContent, setShowFullContent] = useState(false);
  const [currentUserInterests, setCurrentUserInterests] = useState<string[]>([]);
  
  const isAuthor = currentUserId === post.user_id;
  const isPremium = post.profiles.plan === 'premium';

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
              <AvatarImage src={post.profiles.avatar_url} />
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
                {post.profiles.location && (
                  <>
                    <span>•</span>
                    <MapPin className="w-3 h-3" />
                    <span>{post.profiles.location}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Menu des options */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Signaler</DropdownMenuItem>
              {isAuthor && <DropdownMenuItem>Modifier</DropdownMenuItem>}
            </DropdownMenuContent>
          </DropdownMenu>
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

        {/* Médias */}
        {post.media && post.media.length > 0 && (
          <div className="mb-4">
            <div className="grid grid-cols-1 gap-2">
              {post.media.map((media, index) => (
                <div key={index} className="relative">
                  {media.type === 'image' ? (
                    <img
                      src={media.url}
                      alt={`Media ${index + 1}`}
                      className="w-full h-64 object-cover rounded-lg"
                      loading="lazy"
                    />
                  ) : media.type === 'video' ? (
                    <video
                      src={media.url}
                      controls
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`flex items-center gap-2 ${
                isLiked ? 'text-heart-red' : 'text-muted-foreground'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-sm">{post.likes_count}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 text-muted-foreground"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm">{post.comments_count}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 text-muted-foreground"
            >
              <Share2 className="w-4 h-4" />
              <span className="text-sm">Partager</span>
            </Button>
          </div>

          {/* Score de pertinence (optionnel, pour debug) */}
          {process.env.NODE_ENV === 'development' && (
            <Badge variant="outline" className="text-xs">
              Score: {post.relevance_score}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
