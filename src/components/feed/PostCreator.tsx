import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera, Video, Crown, AlertTriangle, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePremium } from '@/hooks/usePremium';
import { validatePostContent } from '@/utils/contentValidation';
import { supabase } from '@/integrations/supabase/client';
import { SearchPostCreator } from './SearchPostCreator';

interface PostCreatorProps {
  onPostCreated?: () => void;
}

export function PostCreator({ onPostCreated }: PostCreatorProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showSearchPostCreator, setShowSearchPostCreator] = useState(false);
  const { toast } = useToast();
  const { isPremium, plan } = usePremium();
  const navigate = useNavigate();

  const handleContentChange = (value: string) => {
    setContent(value);
    setValidationError(null);

    // Validation en temps réel
    const validation = validatePostContent(value, isPremium);
    if (!validation.isValid) {
      setValidationError(validation.message);
    }
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir du contenu pour votre publication",
        variant: "destructive",
      });
      return;
    }

    // Validation finale
    const validation = validatePostContent(content, isPremium);
    if (!validation.isValid) {
      toast({
        title: "Contenu restreint",
        description: validation.message,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      // Créer le post
      const { error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content: content.trim(),
          visibility: 'public'
        });

      if (error) throw error;

      toast({
        title: "Publication créée",
        description: "Votre publication a été ajoutée au fil d'actualité",
      });

      setContent('');
      onPostCreated?.();
    } catch (error) {
      console.error('Erreur création post:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la publication",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePremiumRedirect = () => {
    navigate('/premium');
  };

  return (
    <>
      <Card className="culture-card mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>Créer une publication</span>
            {isPremium && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                <Crown className="w-3 h-3 mr-1" />
                Premium
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Partagez vos pensées, vos expériences, vos passions..."
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            rows={4}
            className={validationError ? 'border-red-500' : ''}
          />

          {validationError && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-red-700 font-medium">Contenu restreint</p>
                <p className="text-sm text-red-600">{validationError}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                  onClick={handlePremiumRedirect}
                >
                  <Crown className="w-4 h-4 mr-1" />
                  Passer au Premium
                </Button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={!isPremium}>
                <Camera className="w-4 h-4 mr-1" />
                Photo
              </Button>
              <Button variant="outline" size="sm" disabled={!isPremium}>
                <Video className="w-4 h-4 mr-1" />
                Vidéo
              </Button>
              
              {/* NOUVEAU: Bouton de publication de recherche */}
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowSearchPostCreator(true)}
                className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700"
              >
                <Search className="w-4 h-4" />
                Recherche ciblée
              </Button>
              
              {!isPremium && (
                <span 
                  className="text-xs text-gray-500 cursor-pointer hover:text-blue-600 hover:underline transition-colors"
                  onClick={handlePremiumRedirect}
                  title="Cliquez pour passer au Premium"
                >
                  (Premium requis pour les médias)
                </span>
              )}
            </div>

            <Button 
              onClick={handleSubmit}
              disabled={loading || !!validationError || !content.trim()}
              className="btn-hero"
            >
              {loading ? 'Publication...' : 'Publier'}
            </Button>
          </div>

          {!isPremium && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Plan Gratuit :</strong> Vous pouvez publier du texte uniquement. 
                Passez au Premium pour inclure des liens, numéros de téléphone, photos et vidéos.
              </p>
            </div>
          )}

          {/* NOUVEAU: Information sur les publications de recherche */}
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Search className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-green-700 font-medium">Publications de recherche ciblée</p>
                <p className="text-sm text-green-600">
                  Créez des publications visibles uniquement par les personnes correspondant à vos critères spécifiques (âge, pays, langues, centres d'intérêt).
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de création de publication de recherche */}
      <SearchPostCreator 
        open={showSearchPostCreator}
        onClose={() => setShowSearchPostCreator(false)}
        onPostCreated={onPostCreated}
      />
    </>
  );
}
