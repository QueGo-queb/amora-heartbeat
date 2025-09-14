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
import { useInterestsFeed } from '@/hooks/useInterestsFeed';
import { useToast } from '@/hooks/use-toast';
import { CreatePostModal } from '@/components/feed/CreatePostModal';

interface FeedSectionProps {
  className?: string;
}

export function FeedSection({ className = '' }: FeedSectionProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { posts, loading, error, refetch } = useInterestsFeed();
  
  // État pour le modal de création de post
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);

  // Fonction pour ouvrir le modal de création de post
  const handleCreatePostClick = () => {
    console.log('🎯 Ouverture du modal de création de post');
    setShowCreatePostModal(true);
  };

  // Fonction pour fermer le modal
  const handleCloseModal = () => {
    setShowCreatePostModal(false);
  };

  // Fonction appelée après création d'un post
  const handlePostCreated = () => {
    console.log('🎯 Post créé avec succès, fermeture du modal et refresh');
    setShowCreatePostModal(false);
    refetch(); // Rafraîchir la liste des posts
    toast({
      title: "Publication créée !",
      description: "Votre post a été publié avec succès.",
    });
  };

  // Fonction pour gérer les erreurs de chargement
  const handleRetry = () => {
    refetch();
  };

  return (
    <div className={`space-y-4 lg:space-y-6 ${className}`}>
      {/* HEADER SUPPRIMÉ - Plus de "Fil d'actualité" ni de bouton "Créer" */}

      {/* Gestion des erreurs */}
      {error && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4 text-center">
            <div className="text-red-600 mb-2">⚠️ Erreur de chargement</div>
            <p className="text-red-500 text-sm mb-3">{error}</p>
            <Button onClick={handleRetry} variant="outline" size="sm">
              Réessayer
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loading state */}
      {loading && (
        <Card className="bg-[#F8F9FA] border-[#CED4DA]">
          <CardContent className="p-4 text-center">
            <div className="text-[#6C757D]">Chargement des publications...</div>
          </CardContent>
        </Card>
      )}

      {/* Affichage des posts */}
      {!loading && !error && posts && posts.length > 0 && (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id} className="bg-white border-[#E9ECEF] hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={post.profiles?.avatar_url} />
                      <AvatarFallback>
                        {post.profiles?.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-[#212529]">
                        {post.profiles?.full_name || 'Utilisateur anonyme'}
                      </h3>
                      <p className="text-xs text-[#6C757D]">
                        {new Date(post.created_at).toLocaleString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-[#495057] mb-4">{post.content}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="sm" className="text-[#6C757D] hover:text-[#E91E63]">
                      <Heart className="w-4 h-4 mr-1" />
                      {post.likes_count || 0}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-[#6C757D] hover:text-[#007BFF]">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      {post.comments_count || 0}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-[#6C757D] hover:text-[#28A745]">
                      <Share2 className="w-4 h-4 mr-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Message quand il n'y a pas de posts - BOUTON SUPPRIMÉ */}
      {!loading && !error && (!posts || posts.length === 0) && (
        <Card className="bg-[#F8F9FA] border-[#CED4DA]">
          <CardContent className="p-4 lg:p-6 text-center">
            <div className="text-[#212529] mb-2 text-sm lg:text-base"> Aucun post disponible</div>
            <p className="text-[#6C757D] text-xs lg:text-sm">
              Il n'y a pas encore de posts dans votre fil d'actualité.
            </p>
            {/* BOUTON "Créer le premier post" SUPPRIMÉ */}
          </CardContent>
        </Card>
      )}

      {/* MODAL DE CRÉATION DE POST */}
      <CreatePostModal
        open={showCreatePostModal}
        onClose={handleCloseModal}
        onPostCreated={handlePostCreated}
      />
    </div>
  );
}
