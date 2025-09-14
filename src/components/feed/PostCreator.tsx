// src/components/feed/PostCreator.tsx - VERSION ULTRA-SIMPLE
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Send, PenTool } from 'lucide-react';

interface PostCreatorProps {
  onPostCreated?: () => void;
  forceExpanded?: boolean;
}

export function PostCreator({ onPostCreated, forceExpanded = false }: PostCreatorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [content, setContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  const { toast } = useToast();

  // Récupérer l'utilisateur directement
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      console.log('🎯 PostCreator user:', user);
    };
    getUser();
  }, []);

  // Gérer le forceExpanded
  useEffect(() => {
    if (forceExpanded && user) {
      setIsExpanded(true);
    }
  }, [forceExpanded, user]);

  const handleSubmit = async () => {
    if (!content.trim() || !user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté et saisir du contenu.",
        variant: "destructive"
      });
      return;
    }

    setIsPosting(true);
    try {
      const { error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content: content.trim(),
          visibility: 'public',
          likes_count: 0,
          comments_count: 0
        });

      if (error) {
        console.error('Erreur Supabase:', error);
        throw error;
      }

      setContent('');
      setIsExpanded(false);

      toast({
        title: "Post publié !",
        description: "Votre publication a été ajoutée au fil d'actualité.",
      });

      onPostCreated?.();

    } catch (error: any) {
      console.error('Erreur lors de la publication:', error);
      toast({
        title: "Erreur",
        description: `Impossible de publier: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsPosting(false);
    }
  };

  // Toujours afficher le composant pour le debug
  return (
    <Card className="mb-6 border-2 border-green-300 bg-green-50">
      <CardContent className="p-4">
        <div className="mb-2 text-sm text-green-700 font-semibold">
          🎯 PostCreator - {user ? `✅ Connecté: ${user.email}` : '❌ Non connecté'}
        </div>
        
        {!isExpanded ? (
          // Version compacte
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <Button
              variant="outline"
              className="flex-1 justify-start text-gray-500"
              onClick={() => setIsExpanded(true)}
              disabled={!user}
            >
              <PenTool className="w-4 h-4 mr-2" />
              {user ? "Que voulez-vous partager ?" : "Connectez-vous pour publier"}
            </Button>
          </div>
        ) : (
          // Version étendue
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1">
                <p className="font-semibold">{user?.email || 'Utilisateur'}</p>
                <p className="text-sm text-gray-500">🌍 Public</p>
              </div>
            </div>

            <Textarea
              placeholder="Que voulez-vous partager ?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px] text-lg"
              maxLength={5000}
              autoFocus={forceExpanded}
            />

            <div className="flex items-center justify-between pt-3 border-t">
              <span className="text-xs text-gray-500">
                {content.length}/5000
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsExpanded(false)}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!content.trim() || isPosting || !user}
                  className="gap-2"
                >
                  {isPosting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Publication...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Publier
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
