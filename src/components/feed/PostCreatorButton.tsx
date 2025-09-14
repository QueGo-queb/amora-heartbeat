import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { validatePostForPlan } from '@/schemas/postSchemas';
import { Send, Plus, X, Image as ImageIcon, Video, Camera, Square, Phone } from 'lucide-react';

interface PostCreatorButtonProps {
  onPostCreated?: () => void;
}

const LANGUAGES = [
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'ht', label: 'Kreyòl Ayisyen' },
  { value: 'pt-BR', label: 'Português (Brasil)' }
];

const COUNTRIES = [
  // Amérique du Nord
  { value: 'US', label: 'États-Unis' },
  { value: 'CA', label: 'Canada' },
  { value: 'MX', label: 'Mexique' },
  
  // Europe
  { value: 'FR', label: 'France' },
  { value: 'BE', label: 'Belgique' },
  { value: 'CH', label: 'Suisse' },
  
  // Caraïbes
  { value: 'HT', label: 'Haïti' },
  { value: 'DO', label: 'République Dominicaine' },
  
  // Amérique Latine
  { value: 'BR', label: 'Brésil' },
  { value: 'AR', label: 'Argentine' },
  { value: 'CL', label: 'Chili' },
  { value: 'CO', label: 'Colombie' },
  { value: 'PE', label: 'Pérou' },
  { value: 'VE', label: 'Venezuela' },
  { value: 'UY', label: 'Uruguay' },
  { value: 'PY', label: 'Paraguay' },
  { value: 'BO', label: 'Bolivie' },
  { value: 'EC', label: 'Équateur' },
  { value: 'GY', label: 'Guyana' },
  { value: 'SR', label: 'Suriname' },
  { value: 'GF', label: 'Guyane Française' },
  { value: 'CR', label: 'Costa Rica' },
  { value: 'PA', label: 'Panama' },
  { value: 'GT', label: 'Guatemala' },
  { value: 'HN', label: 'Honduras' },
  { value: 'NI', label: 'Nicaragua' },
  { value: 'SV', label: 'Salvador' },
  { value: 'BZ', label: 'Belize' },
  { value: 'CU', label: 'Cuba' },
  { value: 'JM', label: 'Jamaïque' },
  { value: 'TT', label: 'Trinité-et-Tobago' },
  { value: 'BB', label: 'Barbade' },
  
  // Afrique Francophone
  { value: 'SN', label: 'Sénégal' },
  { value: 'CI', label: 'Côte d\'Ivoire' },
  { value: 'ML', label: 'Mali' },
  { value: 'BF', label: 'Burkina Faso' },
  { value: 'NE', label: 'Niger' },
  { value: 'TD', label: 'Tchad' },
  { value: 'MG', label: 'Madagascar' },
  { value: 'CM', label: 'Cameroun' },
  { value: 'CD', label: 'République Démocratique du Congo' },
  { value: 'CG', label: 'République du Congo' },
  { value: 'CF', label: 'République Centrafricaine' },
  { value: 'GA', label: 'Gabon' },
  { value: 'GQ', label: 'Guinée Équatoriale' },
  { value: 'DJ', label: 'Djibouti' },
  { value: 'KM', label: 'Comores' },
  { value: 'SC', label: 'Seychelles' },
  { value: 'MU', label: 'Maurice' },
  { value: 'RW', label: 'Rwanda' },
  { value: 'BI', label: 'Burundi' },
  { value: 'TG', label: 'Togo' },
  { value: 'BJ', label: 'Bénin' },
  { value: 'GN', label: 'Guinée' },
  { value: 'GW', label: 'Guinée-Bissau' },
  { value: 'CV', label: 'Cap-Vert' },
  { value: 'ST', label: 'São Tomé-et-Príncipe' }
];

export const PostCreatorButton: React.FC<PostCreatorButtonProps> = ({ onPostCreated }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [content, setContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userPlan, setUserPlan] = useState<'free' | 'premium'>('free');
  const [targetLanguages, setTargetLanguages] = useState<string[]>(['fr']);
  const [targetCountries, setTargetCountries] = useState<string[]>([]);
  const [targetGender, setTargetGender] = useState<string>('all');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCamera, setShowCamera] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  // Refs pour la caméra
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  
  const { toast } = useToast();

  // ✅ CORRECTION : Charger l'utilisateur et son plan avec gestion d'erreur améliorée
  useEffect(() => {
    const getUser = async () => {
      try {
        console.log('🔍 DEBUG PostCreatorButton: Chargement utilisateur...');
        setIsLoading(true);
        
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error('❌ Erreur auth:', userError);
          setIsLoading(false);
          return;
        }
        
        if (!user) {
          console.warn('⚠️ Aucun utilisateur connecté');
          setIsLoading(false);
          return;
        }
        
        console.log('✅ Utilisateur trouvé:', user.email);
        setUser(user);
        
        // Charger le plan utilisateur
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('subscription_plan, plan')
          .eq('user_id', user.id)
          .single();
          
        if (profileError) {
          console.warn('⚠️ Erreur profil:', profileError);
          setUserPlan('free');
        } else {
          const plan = profile?.subscription_plan || profile?.plan || 'free';
          setUserPlan(plan === 'premium' ? 'premium' : 'free');
          console.log('✅ Plan utilisateur:', plan);
        }
      } catch (error) {
        console.error('❌ Erreur chargement utilisateur:', error);
        setUserPlan('free');
      } finally {
        setIsLoading(false);
      }
    };
    
    getUser();
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/') || file.type.startsWith('video/');
      const isValidSize = file.size <= 50 * 1024 * 1024;
      if (!isValidType || !isValidSize) return false;
      return true;
    });
    setSelectedFiles(prev => [...prev, ...validFiles].slice(0, 10));
    
    if (validFiles.length !== files.length) {
      toast({
        title: "Fichiers filtrés",
        description: "Certains fichiers ont été ignorés (taille ou type non supporté)",
        variant: "destructive"
      });
    }
  };

  const handleLanguageToggle = (language: string) => {
    setTargetLanguages(prev => {
      const newLanguages = prev.includes(language) 
        ? prev.filter(l => l !== language) 
        : [...prev, language];
      console.log('🔍 DEBUG: Langues sélectionnées:', newLanguages);
      return newLanguages;
    });
  };

  const handleCountryToggle = (country: string) => {
    setTargetCountries(prev => {
      const newCountries = prev.includes(country) 
        ? prev.filter(c => c !== country) 
        : [...prev, country];
      console.log('🔍 DEBUG: Pays sélectionnés:', newCountries);
      return newCountries;
    });
  };

  // ✅ NOUVELLES FONCTIONS : Gestion de la caméra
  const startCamera = async () => {
    try {
      console.log('🔍 DEBUG: Démarrage de la caméra...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720 },
        audio: false 
      });
      
      cameraStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setShowCamera(true);
      
      toast({
        title: "Caméra activée",
        description: "Vous pouvez maintenant prendre une photo ou enregistrer une vidéo",
      });
    } catch (error) {
      console.error('Erreur caméra:', error);
      toast({
        title: "Erreur caméra",
        description: "Impossible d'accéder à la caméra. Vérifiez les permissions.",
        variant: "destructive"
      });
    }
  };

  const stopCamera = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach(track => track.stop());
      cameraStreamRef.current = null;
    }
    setShowCamera(false);
    setIsRecording(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);
    
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
        setSelectedFiles(prev => [...prev, file].slice(0, 10));
        
        toast({
          title: "Photo capturée",
          description: "Photo ajoutée à votre publication",
        });
      }
    }, 'image/jpeg', 0.8);
  };

  const startVideoRecording = () => {
    if (!cameraStreamRef.current) return;
    
    try {
      const mediaRecorder = new MediaRecorder(cameraStreamRef.current);
      mediaRecorderRef.current = mediaRecorder;
      recordedChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const file = new File([blob], `video-${Date.now()}.webm`, { type: 'video/webm' });
        setSelectedFiles(prev => [...prev, file].slice(0, 10));
        
        toast({
          title: "Vidéo enregistrée",
          description: "Vidéo ajoutée à votre publication",
        });
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      
      toast({
        title: "Enregistrement démarré",
        description: "Cliquez sur arrêter pour terminer l'enregistrement",
      });
    } catch (error) {
      console.error('Erreur enregistrement:', error);
      toast({
        title: "Erreur enregistrement",
        description: "Impossible de démarrer l'enregistrement vidéo",
        variant: "destructive"
      });
    }
  };

  const stopVideoRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Nettoyer la caméra au démontage du composant
  useEffect(() => {
    return () => {
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleSubmit = async () => {
    console.log('🔍 DEBUG: handleSubmit appelé');
    console.log('🔍 DEBUG: Données du formulaire:', {
      content: content.length,
      targetLanguages,
      targetCountries,
      phoneNumber,
      selectedFiles: selectedFiles.length,
      userPlan
    });
    
    if (!user) {
      toast({ title: "Erreur", description: "Vous devez être connecté", variant: "destructive" });
      return;
    }
    if (!content.trim()) {
      toast({ title: "Erreur", description: "Contenu requis", variant: "destructive" });
      return;
    }

    try {
      const validationResult = validatePostForPlan({
        content,
        target_languages: targetLanguages,
        phone_number: phoneNumber,
        external_links: [],
        media_files: selectedFiles
      }, userPlan);

      if (!validationResult.success) {
        const errorMessage = validationResult.error?.issues?.[0]?.message || 'Validation échouée';
        toast({ title: "Validation échouée", description: errorMessage, variant: "destructive" });
        return;
      }

      setIsPosting(true);
      console.log('🔍 DEBUG: Début publication...');

      let mediaUrls: string[] = [];
      if (selectedFiles.length > 0) {
        console.log('🔍 DEBUG: Upload de', selectedFiles.length, 'fichiers...');
        const uploadPromises = selectedFiles.map(async (file) => {
          const fileExt = file.name.split('.').pop();
          const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
          const { error: uploadError } = await supabase.storage.from('post-media').upload(fileName, file);
          if (uploadError) throw uploadError;
          const { data: { publicUrl } } = supabase.storage.from('post-media').getPublicUrl(fileName);
          return publicUrl;
        });
        mediaUrls = await Promise.all(uploadPromises);
        console.log('✅ Médias uploadés:', mediaUrls.length);
      }

      // Déterminer les types de médias
      const mediaTypes = selectedFiles.map(file => 
        file.type.startsWith('image/') ? 'image' : 'video'
      );

      const { error: insertError } = await supabase.from('posts').insert({
        user_id: user.id,
        content,
        media_urls: mediaUrls.length > 0 ? mediaUrls : [],
        media_types: mediaTypes.length > 0 ? mediaTypes : [],
        publication_language: targetLanguages[0] || 'fr', // Langue principale
        target_gender: targetGender,
        target_countries: targetCountries,
        phone_number: userPlan === 'premium' ? phoneNumber : null,
        is_premium_post: userPlan === 'premium' && phoneNumber ? true : false
      });

      if (insertError) {
        console.error('❌ Erreur insertion post:', insertError);
        throw insertError;
      }

      console.log('✅ Post créé avec succès');
      toast({ title: "Publication créée", description: "Votre publication a été publiée avec succès" });
      
      // Reset form
      setContent('');
      setSelectedFiles([]);
      setTargetCountries([]);
      setTargetLanguages(['fr']);
      setTargetGender('all');
      setPhoneNumber('');
      setIsExpanded(false);
      stopCamera(); // Arrêter la caméra si elle est active
      
      // Callback
      onPostCreated?.();

    } catch (error: any) {
      console.error('❌ Erreur création post:', error);
      toast({ title: "Erreur", description: error.message || "Erreur création post", variant: "destructive" });
    } finally {
      setIsPosting(false);
    }
  };

  // ✅ CORRECTION : Rendu conditionnel amélioré avec loading
  console.log('🔍 DEBUG PostCreatorButton render:', {
    isLoading,
    isExpanded,
    user: !!user,
    userPlan,
    content: content.length
  });

  if (isLoading) {
    return (
      <div className="mb-6">
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">Chargement...</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardContent className="p-4">
          {!isExpanded ? (
            <div className="flex items-center justify-center">
              <Button
                onClick={() => {
                  console.log('🔍 DEBUG: Bouton cliqué, expansion...');
                  setIsExpanded(true);
                }}
                className="bg-gradient-to-r from-[#E63946] to-[#52B788] hover:from-[#D62828] hover:to-[#40916C] text-white w-full py-6 text-lg"
                disabled={!user}
              >
                <Plus className="w-5 h-5 mr-2" />
                {user ? 'Que voulez-vous partager ?' : 'Connectez-vous pour partager'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Créer une publication</h3>
                <Button variant="ghost" size="sm" onClick={() => setIsExpanded(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Contenu de votre publication</Label>
                <Textarea
                  placeholder="Partagez vos pensées..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[100px] resize-none"
                  maxLength={5000}
                />
                <p className="text-xs text-gray-500 text-right">
                  {content.length}/5000 caractères
                </p>
              </div>

              <div className="space-y-2">
                <Label>Langues cibles (multi-sélection)</Label>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map(lang => (
                    <div key={lang.value} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`lang-${lang.value}`}
                        checked={targetLanguages.includes(lang.value)} 
                        onCheckedChange={() => handleLanguageToggle(lang.value)} 
                      />
                      <Label htmlFor={`lang-${lang.value}`} className="text-sm cursor-pointer">
                        {lang.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Pays cibles (multi-sélection)</Label>
                <div className="flex flex-wrap gap-2">
                  {COUNTRIES.map(country => (
                    <div key={country.value} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`country-${country.value}`}
                        checked={targetCountries.includes(country.value)} 
                        onCheckedChange={() => handleCountryToggle(country.value)} 
                      />
                      <Label htmlFor={`country-${country.value}`} className="text-sm cursor-pointer">
                        {country.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Genre cible</Label>
                <Select value={targetGender} onValueChange={setTargetGender}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir le genre cible" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tout le monde</SelectItem>
                    <SelectItem value="male">Hommes</SelectItem>
                    <SelectItem value="female">Femmes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Numéro de téléphone</Label>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <input
                    id="phone"
                    type="tel"
                    placeholder="Votre numéro de téléphone"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={userPlan === 'free'}
                    className="flex-1 px-3 py-2 border rounded-md disabled:bg-gray-100 disabled:text-gray-500"
                  />
                </div>
                {userPlan === 'free' && (
                  <p className="text-xs text-gray-500">⚠️ Les numéros sont disponibles pour les utilisateurs premium</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="file-upload">Médias (images/vidéos)</Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('file-upload')?.click()}
                    className="flex items-center gap-2"
                  >
                    <ImageIcon className="w-4 h-4" />
                    Ajouter des médias
                  </Button>
                  {selectedFiles.length > 0 && (
                    <span className="text-sm text-gray-600">
                      {selectedFiles.length} fichier(s) sélectionné(s)
                    </span>
                  )}
                </div>
                {selectedFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-xs">
                        <span className="truncate max-w-20">{file.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== index))}
                          className="h-4 w-4 p-0"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Section Caméra */}
              <div className="space-y-2">
                <Label>Caméra</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={showCamera ? stopCamera : startCamera}
                    className="flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    {showCamera ? 'Arrêter caméra' : 'Ouvrir caméra'}
                  </Button>
                  
                  {showCamera && (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={capturePhoto}
                        className="flex items-center gap-2"
                      >
                        <ImageIcon className="w-4 h-4" />
                        Prendre photo
                      </Button>
                      
                      <Button
                        type="button"
                        variant="outline"
                        onClick={isRecording ? stopVideoRecording : startVideoRecording}
                        className="flex items-center gap-2"
                      >
                        <Square className="w-4 h-4" />
                        {isRecording ? 'Arrêter vidéo' : 'Enregistrer vidéo'}
                      </Button>
                    </>
                  )}
                </div>
                
                {/* Interface caméra */}
                {showCamera && (
                  <div className="relative bg-black rounded-lg overflow-hidden">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-48 object-cover"
                    />
                    <canvas
                      ref={canvasRef}
                      className="hidden"
                    />
                    {isRecording && (
                      <div className="absolute top-2 left-2 flex items-center gap-2 bg-red-500 text-white px-2 py-1 rounded">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        Enregistrement...
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSubmit}
                  disabled={isPosting || !content.trim()}
                  className="flex-1 bg-gradient-to-r from-[#E63946] to-[#52B788] hover:from-[#D62828] hover:to-[#40916C] text-white"
                >
                  {isPosting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Publication...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Publier
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          <input
            id="file-upload"
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </CardContent>
      </Card>
    </div>
  );
};

// ✅ CORRECTION : Export par défaut pour compatibilité
export default PostCreatorButton;
