import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Eye, Heart, MessageCircle, Share2, Clock, MapPin, Globe, Phone, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { fr, enUS, es, ptBR } from 'date-fns/locale';
import { CreatePostModal } from '@/components/feed/CreatePostModal';

const MyPosts = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [postToDelete, setPostToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // ✅ AJOUT - États pour l'édition
  const [showEditModal, setShowEditModal] = useState(false);
  const [postToEdit, setPostToEdit] = useState<any>(null);

  useEffect(() => {
    loadMyPosts();
  }, []);

  // ✅ Charger les publications de l'utilisateur
  const loadMyPosts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('❌ Aucun utilisateur connecté');
        return;
      }

      console.log('📝 Chargement des publications pour user:', user.id);

      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      console.log('📝 Résultat requête:', { data, error });

      if (error) {
        console.error('❌ Erreur chargement publications:', error);
        toast({
          title: "Erreur",
          description: `Impossible de charger vos publications: ${error.message}`,
          variant: "destructive"
        });
        setPosts([]);
      } else {
        console.log('✅ Publications chargées:', data?.length || 0);
        setPosts(data || []);
      }
    } catch (error: any) {
      console.error('❌ Erreur:', error);
      toast({
        title: "Erreur",
        description: `Erreur inattendue: ${error.message}`,
        variant: "destructive"
      });
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fonction pour ouvrir le modal d'édition
  const handleEditPost = (post: any) => {
    setPostToEdit(post);
    setShowEditModal(true);
  };

  // ✅ Fonction appelée après édition d'un post
  const handlePostUpdated = () => {
    console.log(' Post mis à jour avec succès');
    setShowEditModal(false);
    setPostToEdit(null);
    loadMyPosts(); // Recharger la liste
    toast({
      title: "Publication mise à jour !",
      description: "Votre publication a été modifiée avec succès.",
    });
  };

  // ✅ Fonction pour fermer le modal d'édition
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setPostToEdit(null);
  };

  // ✅ Supprimer une publication
  const handleDeletePost = async () => {
    if (!postToDelete) return;

    setIsDeleting(true);
    try {
      // Supprimer les médias associés s'il y en a
      if (postToDelete.media_urls && postToDelete.media_urls.length > 0) {
        const filePaths = postToDelete.media_urls.map((url: string) => {
          const urlParts = url.split('/');
          return urlParts.slice(-2).join('/'); // user_id/filename
        });

        const { error: deleteMediaError } = await supabase.storage
          .from('post-media')
          .remove(filePaths);

        if (deleteMediaError) {
          console.warn('Erreur suppression médias:', deleteMediaError);
        }
      }

      // Supprimer le post de la base de données
      const { error: deleteError } = await supabase
        .from('posts')
        .delete()
        .eq('id', postToDelete.id);

      if (deleteError) {
        throw deleteError;
      }

      toast({
        title: "Publication supprimée",
        description: "Votre publication a été supprimée avec succès"
      });

      // Mettre à jour la liste
      setPosts(prevPosts => prevPosts.filter(post => post.id !== postToDelete.id));

    } catch (error: any) {
      console.error('Erreur suppression post:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer la publication",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
      setPostToDelete(null);
    }
  };

  // ✅ Copier le lien du post
  const copyToClipboard = async (text: string) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Publication Amora',
          text: 'Regardez ma publication sur Amora',
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(text);
        toast({
          title: "Lien copié",
          description: "Le lien a été copié dans le presse-papiers"
        });
      }
    } catch (error) {
      console.error('Erreur partage:', error);
      toast({
        title: "Erreur",
        description: "Impossible de partager la publication",
        variant: "destructive"
      });
    }
  };

  // ✅ Formater la date
  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { 
      addSuffix: true,
      locale: fr
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Button>
          <h1 className="text-2xl font-bold">Mes Publications</h1>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Chargement de vos publications...</p>
          </div>
        ) : posts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-600">Vous n'avez pas encore de publications.</p>
              <Button 
                onClick={() => navigate('/dashboard')}
                className="mt-4"
              >
                Créer votre première publication
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <Card key={post.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback>
                          {post.user_id?.slice(0, 2).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">Votre publication</p>
                        <p className="text-sm text-gray-600">
                          {formatDistanceToNow(new Date(post.created_at), { 
                            addSuffix: true, 
                            locale: fr 
                          })}
                        </p>
                      </div>
                    </div>
                    
                    {/* Menu actions - AJOUT du bouton Modifier */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditPost(post)}
                        className="text-blue-600 hover:text-blue-700"
                        title="Modifier cette publication"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.href);
                          toast({
                            title: "Lien copié",
                            description: "Le lien a été copié dans le presse-papiers"
                          });
                        }}
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setPostToDelete(post);
                          setShowDeleteDialog(true);
                        }}
                        className="text-red-600 hover:text-red-700"
                        title="Supprimer cette publication"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <p className="text-gray-800 mb-4">{post.content}</p>
                  
                  {/* Informations de ciblage */}
                  {(post.languages || post.target_countries || post.visibility) && (
                    <div className="space-y-2 text-sm text-gray-600">
                      {post.languages && post.languages.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          <span>Langues: {post.languages.join(', ')}</span>
                        </div>
                      )}
                      {post.target_countries && post.target_countries.length > 0 && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>Pays: {post.target_countries.join(', ')}</span>
                        </div>
                      )}
                      {post.visibility && (
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4" />
                          <span>Visibilité: {
                            post.visibility === 'all' ? 'Tous' :
                            post.visibility === 'male' ? 'Hommes' :
                            post.visibility === 'female' ? 'Femmes' : post.visibility
                          }</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Médias */}
                  {post.media_urls && post.media_urls.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {post.media_urls.map((url: string, index: number) => (
                        <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                          <img 
                            src={url} 
                            alt={`Média ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Dialog de suppression */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer la publication</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir supprimer cette publication ? Cette action est irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeletePost}
                disabled={isDeleting}
                className="bg-red-500 hover:bg-red-600"
              >
                {isDeleting ? 'Suppression...' : 'Supprimer'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* ✅ AJOUT - Modal d'édition */}
        {postToEdit && (
          <CreatePostModal
            open={showEditModal}
            onClose={handleCloseEditModal}
            onPostCreated={handlePostUpdated}
            editPost={postToEdit} // ✅ Passer les données du post à éditer
          />
        )}
      </div>
    </div>
  );
};

export default MyPosts;
