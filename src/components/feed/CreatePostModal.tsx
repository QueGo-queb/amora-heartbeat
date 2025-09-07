import React, { useState, useEffect, useRef } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Crown, 
  Lock, 
  Globe, 
  Users, 
  Languages, 
  Phone, 
  Link as LinkIcon,
  X,
  Image as ImageIcon,
  Video,
  Upload,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CreatePostModalProps {
  open: boolean;
  onClose: () => void;
  onPostCreated: () => void;
}

interface PostFormData {
  content: string;
  target_group: string;
  target_countries: string[];
  target_languages: string[];
  phone_number?: string;
  external_links?: string[];
  media_files?: File[];
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  open,
  onClose,
  onPostCreated
}) => {
  const [formData, setFormData] = useState<PostFormData>({
    content: '',
    target_group: 'all',
    target_countries: [],
    target_languages: ['fr'],
    phone_number: '',
    external_links: [],
    media_files: []
  });
  
  const [loading, setLoading] = useState(false);
  const [userPlan, setUserPlan] = useState<'free' | 'premium'>('free');
  const [newLink, setNewLink] = useState('');
  const [contentValidationError, setContentValidationError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Patterns pour détecter téléphones et liens
  const phonePattern = /(\+?[0-9\s\-\(\)]{7,})/g;
  const urlPattern = /(https?:\/\/[^\s]+)/g;


// Charger le plan utilisateur depuis la vue unifiée avec cache
useEffect(() => {
  const loadUserPlan = async () => {
    try {
      // Vérifier le cache local d'abord
      const cachedPlan = localStorage.getItem('userPlan');
      const cacheTimestamp = localStorage.getItem('userPlanTimestamp');
      const now = Date.now();
      
      // Si le cache est valide (moins de 5 minutes), l'utiliser
      if (cachedPlan && cacheTimestamp && (now - parseInt(cacheTimestamp)) < 5 * 60 * 1000) {
        setUserPlan(cachedPlan as 'free' | 'premium');
        console.log('Plan utilisateur chargé depuis le cache:', cachedPlan);
        return;
      }

      // Sinon, récupérer depuis la base de données via notre fonction RPC
      const { data, error } = await supabase.rpc('get_current_user_unified');
      
      if (error) {
        console.error('Erreur lors du chargement du plan:', error);
        setUserPlan('free');
        return;
      }

      if (data && data.length > 0) {
        const plan = data[0].plan || 'free';
        setUserPlan(plan as 'free' | 'premium');
        
        // Mettre en cache pour 5 minutes
        localStorage.setItem('userPlan', plan);
        localStorage.setItem('userPlanTimestamp', now.toString());
        
        console.log('Plan utilisateur chargé depuis la DB:', plan, 'User ID:', data[0].id);
      } else {
        console.warn('Aucune donnée utilisateur trouvée');
        setUserPlan('free');
      }
    } catch (error) {
      console.error('Erreur inattendue lors du chargement du plan:', error);
      setUserPlan('free');
    }
  };

  if (open) {
    loadUserPlan();
  }
}, [open]);

  // Validation intelligente du contenu en temps réel
  useEffect(() => {
    if (userPlan === 'free' && formData.content) {
      const errors: string[] = [];
      
      if (phonePattern.test(formData.content)) {
        errors.push('Les numéros de téléphone ne sont pas autorisés avec le plan gratuit');
      }
      
      if (urlPattern.test(formData.content)) {
        errors.push('Les liens externes ne sont pas autorisés avec le plan gratuit');
      }
      
      setContentValidationError(errors.join('. '));
    } else {
      setContentValidationError('');
    }
  }, [formData.content, userPlan]);

  // Réinitialiser le formulaire à la fermeture
  useEffect(() => {
    if (!open) {
      setFormData({
        content: '',
        target_group: 'all',
        target_countries: [],
        target_languages: ['fr'],
        phone_number: '',
        external_links: [],
        media_files: []
      });
      setNewLink('');
      setContentValidationError('');
    }
  }, [open]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      const isValidSize = file.size <= 50 * 1024 * 1024;
      
      return (isImage || isVideo) && isValidSize;
    });

    if (validFiles.length !== files.length) {
      toast({
        title: "Fichiers non valides",
        description: "Seules les images et vidéos de moins de 50MB sont acceptées",
        variant: "destructive",
      });
    }

    setFormData(prev => ({
      ...prev,
      media_files: [...(prev.media_files || []), ...validFiles]
    }));
  };

  const removeMediaFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      media_files: prev.media_files?.filter((_, i) => i !== index) || []
    }));
  };

  const uploadMediaFiles = async (postId: string): Promise<string[]> => {
    if (!formData.media_files || formData.media_files.length === 0) {
      return [];
    }

    const uploadPromises = formData.media_files.map(async (file, index) => {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${postId}_${index}.${fileExt}`;
        const filePath = `posts/${fileName}`;

        const { data, error } = await supabase.storage
          .from('media')
          .upload(filePath, file);

        if (error) {
          console.error('Erreur upload:', error);
          return null;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('media')
          .getPublicUrl(filePath);

        return publicUrl;
      } catch (error) {
        console.error('Erreur upload fichier:', error);
        return null;
      }
    });

    const uploadedUrls = await Promise.all(uploadPromises);
    return uploadedUrls.filter(url => url !== null) as string[];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation de base
    if (!formData.content.trim() && (!formData.media_files || formData.media_files.length === 0)) {
      toast({
        title: "Contenu requis",
        description: "Veuillez saisir du texte ou ajouter des médias",
        variant: "destructive",
      });
      return;
    }

    // Validation pour utilisateurs gratuits
    if (contentValidationError) {
      toast({
        title: "Contenu non autorisé",
        description: contentValidationError,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      // CORRECTION : Vérification authentification renforcée
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('Erreur authentification:', authError);
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }
      
      if (!user) {
        throw new Error('Utilisateur non authentifié. Veuillez vous reconnecter.');
      }

      console.log('✅ Utilisateur authentifié:', user.id);

      // CORRECTION : Structure ultra-simple du post
      const postData: any = {
        user_id: user.id,
        content: formData.content.trim()
      };

      // Ajouter les champs Premium seulement si Premium
      if (userPlan === 'premium') {
        if (formData.phone_number?.trim()) {
          postData.phone_number = formData.phone_number.trim();
        }
        if (formData.external_links && formData.external_links.length > 0) {
          postData.external_links = formData.external_links;
        }
      }

      console.log('📤 Données du post à insérer:', postData);

      // CORRECTION : Insertion avec gestion d'erreur détaillée
      const { data: insertedPost, error: insertError } = await supabase
        .from('posts')
        .insert(postData)
        .select()
        .single();

      if (insertError) {
        console.error('❌ Erreur détaillée insertion:', {
          code: insertError.code,
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint
        });
        throw insertError;
      }

      console.log('✅ Post créé avec succès:', insertedPost.id);

      // Upload des médias (non-bloquant)
      if (formData.media_files && formData.media_files.length > 0) {
        try {
          console.log('📁 Upload de', formData.media_files.length, 'fichiers...');
          const mediaUrls = await uploadMediaFiles(insertedPost.id);
          
          if (mediaUrls.length > 0) {
            const mediaTypes = formData.media_files.map(file => 
              file.type.startsWith('image/') ? 'image' : 'video'
            );

            const { error: updateError } = await supabase
              .from('posts')
              .update({
                media_urls: mediaUrls,
                media_types: mediaTypes
              })
              .eq('id', insertedPost.id);

            if (updateError) {
              console.error('⚠️ Erreur mise à jour médias (non-bloquante):', updateError);
            } else {
              console.log('✅ Médias uploadés:', mediaUrls.length, 'fichiers');
            }
          }
        } catch (mediaError) {
          console.error('⚠️ Erreur upload médias (non-bloquante):', mediaError);
        }
      }

      toast({
        title: "Publication créée",
        description: "Votre publication a été publiée avec succès",
      });

      onPostCreated();
      onClose();
    } catch (error: any) {
      console.error('❌ Erreur complète création post:', error);
      
      // CORRECTION : Messages d'erreur spécifiques et clairs
      let errorMessage = "Erreur lors de la création de la publication";
      
      if (error.message?.includes('Session expirée') || error.message?.includes('non authentifié')) {
        errorMessage = error.message;
      } else if (error.code === 'PGRST301' || error.code === '401') {
        errorMessage = "Session expirée. Veuillez vous reconnecter.";
      } else if (error.code === '42501') {
        errorMessage = "Permissions insuffisantes. Veuillez vous reconnecter.";
      } else if (error.code === '23503') {
        errorMessage = "Erreur de référence utilisateur. Veuillez vous reconnecter.";
      } else if (error.code === '23514') {
        errorMessage = "Le contenu ne respecte pas les contraintes.";
      } else if (error.code === '23505') {
        errorMessage = "Cette publication existe déjà.";
      } else if (error.message?.includes('JWT') || error.message?.includes('token')) {
        errorMessage = "Token d'authentification invalide. Veuillez vous reconnecter.";
      } else if (error.message) {
        errorMessage = `Erreur: ${error.message}`;
      }
      
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addCountry = (country: string) => {
    if (!formData.target_countries.includes(country)) {
      setFormData(prev => ({
        ...prev,
        target_countries: [...prev.target_countries, country]
      }));
    }
  };

  const removeCountry = (country: string) => {
    setFormData(prev => ({
      ...prev,
      target_countries: prev.target_countries.filter(c => c !== country)
    }));
  };

  const addLanguage = (language: string) => {
    if (!formData.target_languages.includes(language)) {
      setFormData(prev => ({
        ...prev,
        target_languages: [...prev.target_languages, language]
      }));
    }
  };

  const removeLanguage = (language: string) => {
    setFormData(prev => ({
      ...prev,
      target_languages: prev.target_languages.filter(l => l !== language)
    }));
  };

  const addExternalLink = () => {
    if (newLink.trim() && !formData.external_links?.includes(newLink.trim())) {
      setFormData(prev => ({
        ...prev,
        external_links: [...(prev.external_links || []), newLink.trim()]
      }));
      setNewLink('');
    }
  };

  const removeExternalLink = (link: string) => {
    setFormData(prev => ({
      ...prev,
      external_links: prev.external_links?.filter(l => l !== link) || []
    }));
  };

  const countries = [
    'France', 'Canada', 'Haïti', 'États-Unis', 'Belgique', 'Suisse',
    'Sénégal', 'Côte d\'Ivoire', 'Cameroun', 'République Démocratique du Congo'
  ];

  const languages = [
    { code: 'fr', name: 'Français' },
    { code: 'en', name: 'Anglais' },
    { code: 'es', name: 'Espagnol' },
    { code: 'ht', name: 'Créole haïtien' },
    { code: 'pt', name: 'Portugais' }
  ];

  const targetGroups = [
    { value: 'all', label: 'Tout le monde' },
    { value: 'friends', label: 'Amis seulement' },
    { value: 'same_country', label: 'Même pays' },
    { value: 'same_interests', label: 'Mêmes intérêts' },
    { value: 'premium_only', label: 'Premium seulement' }
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>Créer une publication</span>
            {userPlan === 'premium' && (
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                <Crown className="w-3 h-3 mr-1" />
                Premium
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Validation d'erreur pour le contenu */}
          {contentValidationError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {contentValidationError}
              </AlertDescription>
            </Alert>
          )}

          {/* Contenu de la publication */}
          <div className="space-y-2">
            <Label htmlFor="content">Contenu de la publication</Label>
            <Textarea
              id="content"
              placeholder="Que voulez-vous partager ?"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              className={`min-h-[120px] ${contentValidationError ? 'border-red-500' : ''}`}
            />
            <div className="text-xs text-gray-500">
              {userPlan === 'free' && (
                <span className="text-orange-600">
                  ⚠️ Plan gratuit : Les numéros de téléphone et liens ne sont pas autorisés dans le texte
                </span>
              )}
            </div>
          </div>

          {/* Médias */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Photos et Vidéos
            </Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                Ajouter des photos/vidéos
              </Button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Images et vidéos acceptées (max 50MB par fichier)
              </p>
            </div>
            
            {/* Aperçu des médias sélectionnés */}
            {formData.media_files && formData.media_files.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {formData.media_files.map((file, index) => (
                  <div key={index} className="relative bg-gray-100 rounded p-2">
                    <div className="flex items-center gap-2">
                      {file.type.startsWith('image/') ? (
                        <ImageIcon className="w-4 h-4 text-blue-500" />
                      ) : (
                        <Video className="w-4 h-4 text-purple-500" />
                      )}
                      <span className="text-xs truncate flex-1">{file.name}</span>
                      <X 
                        className="w-4 h-4 cursor-pointer text-red-500 hover:text-red-700" 
                        onClick={() => removeMediaFile(index)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Champs Premium */}
          <Card className={`${userPlan === 'free' ? 'opacity-50' : ''}`}>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-2 mb-3">
                {userPlan === 'premium' ? (
                  <Crown className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Lock className="w-5 h-5 text-gray-400" />
                )}
                <span className="font-medium">
                  Fonctionnalités Premium
                </span>
                {userPlan === 'free' && (
                  <Badge variant="outline" className="text-xs">
                    Premium requis
                  </Badge>
                )}
              </div>

              {/* Numéro de téléphone */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Numéro de téléphone
                </Label>
                <Input
                  type="tel"
                  placeholder="+33 1 23 45 67 89"
                  value={formData.phone_number || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone_number: e.target.value }))}
                  disabled={userPlan === 'free'}
                />
              </div>

              {/* Liens externes */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" />
                  Liens externes
                </Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="https://example.com"
                    value={newLink}
                    onChange={(e) => setNewLink(e.target.value)}
                    disabled={userPlan === 'free'}
                  />
                  <Button
                    type="button"
                    onClick={addExternalLink}
                    disabled={userPlan === 'free' || !newLink.trim()}
                    size="sm"
                  >
                    Ajouter
                  </Button>
                </div>
                {formData.external_links && formData.external_links.length > 0 && (
                  <div className="space-y-1">
                    {formData.external_links.map((link, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm truncate">{link}</span>
                        <X 
                          className="w-4 h-4 cursor-pointer text-gray-500 hover:text-red-500" 
                          onClick={() => removeExternalLink(link)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {userPlan === 'free' && (
                <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
                  💡 Passez au plan Premium pour ajouter votre numéro de téléphone et des liens externes à vos publications.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Boutons d'action */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={loading || contentValidationError !== '' || (!formData.content.trim() && (!formData.media_files || formData.media_files.length === 0))}
            >
              {loading ? 'Publication...' : 'Publier'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
