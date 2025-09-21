import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { X, Camera, Video, Image, Globe, Users, Eye, AlertCircle } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface CreatePostModalProps {
  open: boolean;
  onClose: () => void;
  onPostCreated: () => void;
  editPost?: any; // ✅ AJOUT - Post à éditer
}

// Langues disponibles dans le système - VERSION SPÉCIFIQUE
const AVAILABLE_LANGUAGES = [
  { code: 'en', name: 'Anglais' },
  { code: 'fr', name: 'Français' },
  { code: 'ht', name: 'Créole haïtien' },
  { code: 'es', name: 'Espagnol' },
  { code: 'pt', name: 'Portugais' }
];

// Pays disponibles - VERSION SPÉCIFIQUE
const AVAILABLE_COUNTRIES = [
  // Amérique du Nord
  { code: 'US', name: 'États-Unis' },
  { code: 'CA', name: 'Canada' },
  { code: 'MX', name: 'Mexique' },
  { code: 'GT', name: 'Guatemala' },
  { code: 'BZ', name: 'Belize' },
  { code: 'SV', name: 'El Salvador' },
  { code: 'HN', name: 'Honduras' },
  { code: 'NI', name: 'Nicaragua' },
  { code: 'CR', name: 'Costa Rica' },
  { code: 'PA', name: 'Panama' },
  
  // Amérique latine
  { code: 'AR', name: 'Argentine' },
  { code: 'BO', name: 'Bolivie' },
  { code: 'BR', name: 'Brésil' },
  { code: 'CL', name: 'Chili' },
  { code: 'CO', name: 'Colombie' },
  { code: 'EC', name: 'Équateur' },
  { code: 'FK', name: 'Îles Malouines' },
  { code: 'GF', name: 'Guyane française' },
  { code: 'GY', name: 'Guyana' },
  { code: 'PY', name: 'Paraguay' },
  { code: 'PE', name: 'Pérou' },
  { code: 'SR', name: 'Suriname' },
  { code: 'UY', name: 'Uruguay' },
  { code: 'VE', name: 'Venezuela' },
  
  // Caraïbes spécifiques
  { code: 'HT', name: 'Haïti' },
  { code: 'DO', name: 'République dominicaine' },
  
  // Europe francophone
  { code: 'FR', name: 'France' },
  { code: 'CH', name: 'Suisse' },
  { code: 'BE', name: 'Belgique' },
  
  // Afrique francophone
  { code: 'DZ', name: 'Algérie' },
  { code: 'BJ', name: 'Bénin' },
  { code: 'BF', name: 'Burkina Faso' },
  { code: 'BI', name: 'Burundi' },
  { code: 'CM', name: 'Cameroun' },
  { code: 'CF', name: 'République centrafricaine' },
  { code: 'TD', name: 'Tchad' },
  { code: 'KM', name: 'Comores' },
  { code: 'CG', name: 'République du Congo' },
  { code: 'CD', name: 'République démocratique du Congo' },
  { code: 'CI', name: 'Côte d\'Ivoire' },
  { code: 'DJ', name: 'Djibouti' },
  { code: 'GA', name: 'Gabon' },
  { code: 'GN', name: 'Guinée' },
  { code: 'GQ', name: 'Guinée équatoriale' },
  { code: 'MG', name: 'Madagascar' },
  { code: 'ML', name: 'Mali' },
  { code: 'MC', name: 'Monaco' },
  { code: 'MA', name: 'Maroc' },
  { code: 'NE', name: 'Niger' },
  { code: 'SN', name: 'Sénégal' },
  { code: 'SC', name: 'Seychelles' },
  { code: 'TG', name: 'Togo' },
  { code: 'TN', name: 'Tunisie' },
  { code: 'VU', name: 'Vanuatu' },
  { code: 'RW', name: 'Rwanda' },
  { code: 'LU', name: 'Luxembourg' }
];

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  open,
  onClose,
  onPostCreated,
  editPost // ✅ AJOUT
}) => {
  // ✅ AJOUT - Initialiser les états avec les données du post à éditer
  const [content, setContent] = useState(editPost?.content || '');
  const [loading, setLoading] = useState(false);
  // ✅ CORRIGÉ - Utiliser les noms de colonnes qui existent réellement
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(editPost?.languages || []);
  const [selectedCountries, setSelectedCountries] = useState<string[]>(editPost?.target_countries || []);
  const [visibility, setVisibility] = useState<'all' | 'male' | 'female'>(editPost?.target_gender || 'all');
  const [ageRange, setAgeRange] = useState({
    min: editPost?.age_range_min || 18, 
    max: editPost?.age_range_max || 65
  });
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [hasRestrictedContent, setHasRestrictedContent] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();

  // ✅ AJOUT - Réinitialiser les états quand editPost change
  useEffect(() => {
    if (editPost) {
      setContent(editPost.content || '');
      setSelectedLanguages(editPost.languages || []);
      setSelectedCountries(editPost.target_countries || []);
      setVisibility(editPost.target_gender || 'all');
      setAgeRange({ min: editPost.age_range_min || 18, max: editPost.age_range_max || 65 });
    } else {
      // Reset pour nouveau post
      setContent('');
      setSelectedLanguages([]);
      setSelectedCountries([]);
      setVisibility('all');
      setAgeRange({ min: 18, max: 65 });
    }
    setMediaFiles([]);
    setHasRestrictedContent(false);
  }, [editPost]);

  // Fonction pour vérifier si l'utilisateur a un plan premium
  const isPremiumUser = user?.user_metadata?.subscription_plan === 'premium';

  // Fonction pour détecter le contenu restreint
  const checkForRestrictedContent = (text: string): boolean => {
    if (isPremiumUser) {
      return false; // Les utilisateurs premium peuvent tout publier
    }

    // Détecter les numéros de téléphone
    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
    const hasPhone = phoneRegex.test(text);

    // Détecter les liens
    const linkRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,})/g;
    const hasLink = linkRegex.test(text);

    return hasPhone || hasLink;
  };

  // Vérifier le contenu à chaque changement
  useEffect(() => {
    setHasRestrictedContent(checkForRestrictedContent(content));
  }, [content, isPremiumUser]);

  const handleLanguageToggle = (languageCode: string) => {
    setSelectedLanguages(prev => 
      prev.includes(languageCode) 
        ? prev.filter(lang => lang !== languageCode)
        : [...prev, languageCode]
    );
  };

  const handleCountryToggle = (countryCode: string) => {
    setSelectedCountries(prev => 
      prev.includes(countryCode) 
        ? prev.filter(country => country !== countryCode)
        : [...prev, countryCode]
    );
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    const videoFiles = files.filter(file => file.type.startsWith('video/'));
    
    setMediaFiles(prev => [...prev, ...imageFiles, ...videoFiles]);
  };

  const handleCameraCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setMediaFiles(prev => [...prev, ...files]);
  };

  const removeMediaFile = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  // ✅ VERSION ULTRA-SIMPLE - Fonctionne avec le schéma existant
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast({
        title: "Erreur",
        description: "Le contenu ne peut pas être vide",
        variant: "destructive",
      });
      return;
    }

    if (hasRestrictedContent) {
      toast({
        title: "Contenu restreint",
        description: "Veuillez retirer les numéros de téléphone ou liens pour publier",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      // ✅ DONNÉES ABSOLUMENT MINIMALES - Seulement les colonnes qui existent à coup sûr
      const minimalPost = {
        user_id: user?.id,
        content: content.trim()
      };

      console.log('🚀 Données minimales absolues:', minimalPost);
      console.log('🚀 User ID:', user?.id);

      const { data, error } = await supabase
        .from('posts')
        .insert([minimalPost])
        .select();

      if (error) {
        console.error('❌ Erreur Supabase complète:', error);
        
        // ✅ DIAGNOSTIC DÉTAILLÉ
        if (error.message.includes('column') && error.message.includes('not found')) {
          const columnName = error.message.split("'")[1];
          console.error(`❌ Colonne manquante: ${columnName}`);
          console.error('❌ Schéma actuel de la table posts:');
          
          // Essayer de récupérer le schéma actuel
          const { data: schemaData, error: schemaError } = await supabase
            .from('information_schema.columns')
            .select('column_name, data_type')
            .eq('table_name', 'posts');
          
          if (!schemaError && schemaData) {
            console.table(schemaData);
          }
        }
        
        throw error;
      }

      console.log('✅ Publication créée avec succès:', data);

      toast({
        title: "Succès",
        description: "Publication créée avec succès",
      });

      // Reset du formulaire
      setContent('');
      setSelectedLanguages([]);
      setSelectedCountries([]);
      setVisibility('all');
      setAgeRange({ min: 18, max: 65 });
      setMediaFiles([]);
      setHasRestrictedContent(false);
      
      onPostCreated();
      onClose();
      
    } catch (error) {
      console.error('❌ Erreur complète:', error);
      
      let errorMessage = 'Une erreur est survenue lors de la sauvegarde';
      
      if (error.message) {
        if (error.message.includes('column') && error.message.includes('not found')) {
          const columnName = error.message.split("'")[1];
          errorMessage = `Colonne '${columnName}' n'existe pas dans la table posts. Migration nécessaire.`;
        } else if (error.message.includes('relation') && error.message.includes('does not exist')) {
          errorMessage = 'Table posts n\'existe pas. Appliquez les migrations.';
        } else if (error.message.includes('permission')) {
          errorMessage = 'Permission refusée. Vérifiez vos droits.';
        } else if (error.message.includes('foreign key')) {
          errorMessage = 'Utilisateur non trouvé. Reconnectez-vous.';
        } else {
          errorMessage = `Erreur: ${error.message}`;
        }
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

  // Version de test ultra-simplifiée pour identifier le problème
  const handleSubmitTest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast({
        title: "Erreur",
        description: "Le contenu ne peut pas être vide",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      // ✅ VERSION TEST - Données minimales
      const newPost = {
        user_id: user?.id,
        content: content.trim(),
        publication_language: 'fr',
        target_gender: 'all',
        target_countries: [],
        media_urls: [],
        media_types: [],
        likes_count: 0,
        comments_count: 0,
        views_count: 0,
        is_active: true
      };

      console.log('🧪 TEST - Données minimales:', newPost);
      console.log('🧪 TEST - User ID:', user?.id);

      const { data, error } = await supabase
        .from('posts')
        .insert([newPost])
        .select();

      if (error) {
        console.error('❌ Erreur Supabase détaillée:', error);
        throw error;
      }

      console.log('✅ SUCCESS - Données insérées:', data);

      toast({
        title: "Succès",
        description: "Publication créée avec succès (version test)",
      });

      // Reset du formulaire
      setContent('');
      setSelectedLanguages([]);
      setSelectedCountries([]);
      setVisibility('all');
      setAgeRange({ min: 18, max: 65 });
      setMediaFiles([]);
      setHasRestrictedContent(false);
      
      onPostCreated();
      onClose();
      
    } catch (error) {
      console.error('❌ Erreur test:', error);
      toast({
        title: "Erreur",
        description: `Erreur test: ${error.message || 'Erreur inconnue'}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setContent('');
    setSelectedLanguages([]);
    setSelectedCountries([]);
    setVisibility('all');
    setAgeRange({ min: 18, max: 65 });
    setMediaFiles([]);
    setHasRestrictedContent(false);
    onClose();
  };

  // Vérifier si le bouton doit être désactivé
  const isSubmitDisabled = loading || 
    !content.trim() || 
    selectedLanguages.length === 0 || 
    hasRestrictedContent;

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Globe className="w-5 h-5 text-[#E91E63]" />
            {/* ✅ MODIFICATION - Titre dynamique */}
            {editPost ? t.editPost : t.createPost}
          </h2>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Contenu du post */}
          <div className="space-y-2">
            <Label htmlFor="content" className="text-base font-medium">
              Votre message
            </Label>
            <Textarea
              id="content"
              placeholder={t.postPlaceholder}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px] text-base"
              maxLength={1000}
              autoFocus
            />
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">
                {content.length}/1000 caractères
              </span>
              
              {/* Alerte pour contenu restreint */}
              {hasRestrictedContent && (
                <div className="flex items-center gap-1 text-orange-600">
                  <AlertCircle className="w-4 h-4" />
                  <span>Contenu restreint détecté</span>
                </div>
              )}
            </div>
          </div>

          {/* Langues */}
          <div className="space-y-3">
            <Label className="text-base font-medium flex items-center gap-2">
              <Users className="w-4 h-4" />
              Langues ciblées
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto border rounded-lg p-3">
              {AVAILABLE_LANGUAGES.map((lang) => (
                <div key={lang.code} className="flex items-center space-x-2">
                  <Checkbox
                    id={`lang-${lang.code}`}
                    checked={selectedLanguages.includes(lang.code)}
                    onCheckedChange={() => handleLanguageToggle(lang.code)}
                  />
                  <Label htmlFor={`lang-${lang.code}`} className="text-sm">
                    {lang.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Pays */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Pays ciblés</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-32 overflow-y-auto border rounded-lg p-3">
              {AVAILABLE_COUNTRIES.map((country) => (
                <div key={country.code} className="flex items-center space-x-2">
                  <Checkbox
                    id={`country-${country.code}`}
                    checked={selectedCountries.includes(country.code)}
                    onCheckedChange={() => handleCountryToggle(country.code)}
                  />
                  <Label htmlFor={`country-${country.code}`} className="text-sm">
                    {country.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Visibilité */}
          <div className="space-y-3">
            <Label className="text-base font-medium flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Qui peut voir votre publication ?
            </Label>
            
            {/* Options de visibilité */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="visibility-all"
                  name="visibility"
                  value="all"
                  checked={visibility === 'all'}
                  onChange={(e) => setVisibility(e.target.value as 'all')}
                  className="w-4 h-4 text-[#E91E63] focus:ring-[#E91E63]"
                />
                <Label htmlFor="visibility-all" className="text-sm font-medium">
                  Tous les utilisateurs
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="visibility-male"
                  name="visibility"
                  value="male"
                  checked={visibility === 'male'}
                  onChange={(e) => setVisibility(e.target.value as 'male')}
                  className="w-4 h-4 text-[#E91E63] focus:ring-[#E91E63]"
                />
                <Label htmlFor="visibility-male" className="text-sm font-medium">
                  Hommes uniquement
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="visibility-female"
                  name="visibility"
                  value="female"
                  checked={visibility === 'female'}
                  onChange={(e) => setVisibility(e.target.value as 'female')}
                  className="w-4 h-4 text-[#E91E63] focus:ring-[#E91E63]"
                />
                <Label htmlFor="visibility-female" className="text-sm font-medium">
                  Femmes uniquement
                </Label>
              </div>
            </div>
          </div>

          {/* Tranche d'âge */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Tranche d'âge ciblée</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age-min" className="text-sm">Âge minimum</Label>
                <Input
                  id="age-min"
                  type="number"
                  min="18"
                  max="100"
                  value={ageRange.min}
                  onChange={(e) => setAgeRange(prev => ({ ...prev, min: parseInt(e.target.value) || 18 }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age-max" className="text-sm">Âge maximum</Label>
                <Input
                  id="age-max"
                  type="number"
                  min="18"
                  max="100"
                  value={ageRange.max}
                  onChange={(e) => setAgeRange(prev => ({ ...prev, max: parseInt(e.target.value) || 65 }))}
                />
              </div>
            </div>
          </div>

          {/* Médias */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Médias (photos/vidéos)</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2"
              >
                <Image className="w-4 h-4" />
                Ajouter fichiers
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => cameraInputRef.current?.click()}
                className="flex items-center gap-2"
              >
                <Camera className="w-4 h-4" />
                Prendre photo
              </Button>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*,video/*"
              capture="environment"
              onChange={handleCameraCapture}
              className="hidden"
            />

            {/* Aperçu des médias */}
            {mediaFiles.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {mediaFiles.map((file, index) => (
                  <div key={index} className="relative">
                    {file.type.startsWith('image/') ? (
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Media ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg"
                      />
                    ) : (
                      <video
                        src={URL.createObjectURL(file)}
                        className="w-full h-20 object-cover rounded-lg"
                        controls
                      />
                    )}
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                      onClick={() => removeMediaFile(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              {t.cancel}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitDisabled}
              className="bg-[#E91E63] hover:bg-[#C2185B] disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {/* ✅ MODIFICATION - Texte dynamique */}
              {loading ? 'Enregistrement...' : editPost ? t.update : t.publish}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;
