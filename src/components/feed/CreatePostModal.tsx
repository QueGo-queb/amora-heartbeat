import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { X } from 'lucide-react';

interface CreatePostModalProps {
  open: boolean;
  onClose: () => void;
  onPostCreated: () => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  open,
  onClose,
  onPostCreated
}) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast({
        title: "Contenu requis",
        description: "Veuillez saisir du texte pour votre post",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('Vous devez être connecté pour créer un post');
      }

      const { data: insertedPost, error: insertError } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content: content.trim()
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      toast({
        title: "Post créé avec succès",
        description: "Votre post a été publié dans le fil d'actualité",
      });

      setContent('');
      onPostCreated();
      onClose();

    } catch (error: any) {
      console.error('Erreur création post:', error);
      
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la création du post",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setContent('');
    onClose();
  };

  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ zIndex: 9999 }}
    >
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
      />
      
      {/* Modal Content - RESPONSIVE */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 lg:p-6 border-b">
          <h2 className="text-base lg:text-lg font-semibold">Créer un nouveau post</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 lg:p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="content" className="text-sm lg:text-base">Votre message</Label>
            <Textarea
              id="content"
              placeholder="Que voulez-vous partager avec la communauté ?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px] lg:min-h-[120px] text-sm lg:text-base"
              maxLength={500}
            />
            <div className="text-xs text-gray-500 text-right">
              {content.length}/500 caractères
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="w-full sm:w-auto text-sm lg:text-base"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={loading || !content.trim()}
              className="w-full sm:w-auto text-sm lg:text-base"
            >
              {loading ? 'Publication...' : 'Publier'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;
