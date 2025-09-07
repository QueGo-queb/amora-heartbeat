import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Save, 
  X, 
  Edit3, 
  CheckCircle, 
  AlertCircle,
  ArrowLeft,
  MapPin,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import InterestsEditor from './InterestsEditor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Ajouter les données de localisation
const countries = [
  { code: 'CA', name: 'Canada' },
  { code: 'US', name: 'États-Unis' },
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Allemagne' },
  { code: 'ES', name: 'Espagne' },
  { code: 'IT', name: 'Italie' },
  { code: 'GB', name: 'Royaume-Uni' },
  { code: 'CH', name: 'Suisse' },
  { code: 'BE', name: 'Belgique' },
  { code: 'NL', name: 'Pays-Bas' },
  { code: 'AU', name: 'Australie' },
  { code: 'NZ', name: 'Nouvelle-Zélande' },
  { code: 'HT', name: 'Haïti' },
  { code: 'CL', name: 'Chili' },
  { code: 'BR', name: 'Brésil' },
  { code: 'MX', name: 'Mexique' },
  { code: 'JP', name: 'Japon' },
  { code: 'KR', name: 'Corée du Sud' },
  // Ajouter d'autres pays selon les besoins
];

const regions = {
  CA: ['Alberta', 'Colombie-Britannique', 'Manitoba', 'Nouveau-Brunswick', 'Terre-Neuve-et-Labrador', 'Territoires du Nord-Ouest', 'Nouvelle-Écosse', 'Nunavut', 'Ontario', 'Île-du-Prince-Édouard', 'Québec', 'Saskatchewan', 'Yukon'],
  US: ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'Californie', 'Colorado', 'Connecticut', 'Delaware', 'Floride', 'Géorgie', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiane', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'Nouveau-Mexique', 'New York', 'Caroline du Nord', 'Dakota du Nord', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvanie', 'Rhode Island', 'Caroline du Sud', 'Dakota du Sud', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginie', 'Washington', 'Virginie-Occidentale', 'Wisconsin', 'Wyoming'],
  FR: ['Auvergne-Rhône-Alpes', 'Bourgogne-Franche-Comté', 'Bretagne', 'Centre-Val de Loire', 'Corse', 'Grand Est', 'Hauts-de-France', 'Île-de-France', 'Normandie', 'Nouvelle-Aquitaine', 'Occitanie', 'Pays de la Loire', 'Provence-Alpes-Côte d\'Azur'],
  HT: ['Artibonite', 'Centre', 'Grand\'Anse', 'Nippes', 'Nord', 'Nord-Est', 'Nord-Ouest', 'Ouest', 'Sud', 'Sud-Est'],
  CL: ['Arica y Parinacota', 'Tarapacá', 'Antofagasta', 'Atacama', 'Coquimbo', 'Valparaíso', 'Región Metropolitana', 'O\'Higgins', 'Maule', 'Ñuble', 'Biobío', 'Araucanía', 'Los Ríos', 'Los Lagos', 'Aysén', 'Magallanes']
};

interface ProfileData {
  id: string;
  full_name: string;
  interests: string[];
  avatar_url?: string;
  bio?: string;
  location?: string;
  age?: number;
  // Nouveaux champs de localisation
  country?: string;
  region?: string;
  city?: string;
}

interface ProfileEditorProps {
  profile: ProfileData;
  onProfileUpdate: (updatedProfile: ProfileData) => void;
  onCancel: () => void;
  className?: string;
}

const ProfileEditor: React.FC<ProfileEditorProps> = ({
  profile,
  onProfileUpdate,
  onCancel,
  className = ''
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ProfileData>({
    ...profile,
    country: profile.country || '',
    region: profile.region || '',
    city: profile.city || ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [userEmail, setUserEmail] = useState<string>(''); // Email séparé depuis auth
  const { toast } = useToast();
  const navigate = useNavigate();

  // Récupérer l'email de l'utilisateur connecté
  useEffect(() => {
    const getUserEmail = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserEmail(user.email || '');
        }
      } catch (error) {
        console.error('Erreur récupération email:', error);
      }
    };
    getUserEmail();
  }, []);

  useEffect(() => {
    setFormData(profile);
  }, [profile]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = "Le nom est requis";
    }

    // SUPPRESSION de la validation email car il n'est pas modifiable

    if (formData.interests.length === 0) {
      newErrors.interests = "Sélectionnez au moins un intérêt";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast({
        title: "Erreur de validation",
        description: "Veuillez corriger les erreurs dans le formulaire.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Vérifier que l'utilisateur est connecté
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error("Utilisateur non authentifié");
      }

      // Vérifier que l'utilisateur modifie son propre profil
      if (user.id !== profile.id) {
        throw new Error("Vous ne pouvez modifier que votre propre profil");
      }

      // CORRECTION : Mise à jour du profil dans Supabase (sans email)
      const profileData = {
        full_name: formData.full_name,
        interests: formData.interests,
        bio: formData.bio || null,
        age: formData.age || null,
        // Nouveaux champs de localisation
        country: formData.country || null,
        region: formData.region || null,
        city: formData.city || null,
        // Construire la localisation complète pour l'affichage
        location: [formData.city, formData.region, countries.find(c => c.code === formData.country)?.name]
          .filter(Boolean)
          .join(', ') || null,
        updated_at: new Date().toISOString()
      };

      // Essayer d'abord la mise à jour
      let { error: updateError } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', profile.id);

      // Si la mise à jour échoue, essayer l'insertion
      if (updateError) {
        console.log('Mise à jour échouée, tentative d\'insertion:', updateError);
        
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([{
            id: profile.id,
            ...profileData,
            created_at: new Date().toISOString()
          }]);

        if (insertError) {
          throw new Error(`Impossible de sauvegarder le profil: ${insertError.message}`);
        }
      }

      // SUPPRESSION de la mise à jour de l'email dans auth

      // Notification de succès
      toast({
        title: "✅ Profil mis à jour",
        description: "Vos modifications ont été sauvegardées avec succès.",
      });

      // Mettre à jour le profil local
      onProfileUpdate(formData);
      setIsEditing(false);

    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      
      toast({
        title: "❌ Erreur",
        description: error instanceof Error ? error.message : "Impossible de mettre à jour le profil",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(profile); // Restaurer les données originales
    setErrors({});
    setIsEditing(false);
    onCancel();
  };

  const handleInputChange = (field: keyof ProfileData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Effacer l'erreur pour ce champ
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleInterestsChange = (interests: string[]) => {
    handleInputChange('interests', interests);
  };

  const handleCountryChange = (countryCode: string) => {
    setFormData(prev => ({
      ...prev,
      country: countryCode,
      region: '', // Reset region when country changes
      city: '' // Reset city when country changes
    }));
  };

  const handleRegionChange = (region: string) => {
    setFormData(prev => ({
      ...prev,
      region,
      city: '' // Reset city when region changes
    }));
  };

  if (!isEditing) {
    return (
      <Card className={`culture-card ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Mon Profil
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Informations du profil */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">Nom complet</Label>
              <p className="text-gray-900">{profile.full_name}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Email</Label>
              <p className="text-gray-900">{profile.email}</p>
            </div>
            {profile.bio && (
              <div className="md:col-span-2">
                <Label className="text-sm font-medium text-gray-700">Bio</Label>
                <p className="text-gray-900">{profile.bio}</p>
              </div>
            )}
            {/* Localisation */}
            {(profile.country || profile.region || profile.city) && (
              <div className="md:col-span-2">
                <Label className="text-sm font-medium text-gray-700">Localisation</Label>
                <div className="flex items-center gap-2 text-gray-900">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span>
                    {[profile.city, profile.region, countries.find(c => c.code === profile.country)?.name]
                      .filter(Boolean)
                      .join(', ')}
                  </span>
                </div>
              </div>
            )}
            {profile.age && (
              <div>
                <Label className="text-sm font-medium text-gray-700">Âge</Label>
                <p className="text-gray-900">{profile.age} ans</p>
              </div>
            )}
          </div>

          {/* Intérêts actuels */}
          <div>
            <Label className="text-sm font-medium text-gray-700">Centres d'intérêt</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {profile.interests.length > 0 ? (
                profile.interests.map((interest) => (
                  <Badge key={interest} variant="secondary">
                    {interest}
                  </Badge>
                ))
              ) : (
                <p className="text-gray-500 text-sm">Aucun intérêt défini</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t border-gray-200">
            <Button 
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2"
            >
              <Edit3 className="w-4 h-4" />
              Modifier mon profil
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour au Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* En-tête d'édition */}
      <Card className="culture-card bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <Edit3 className="w-6 h-6 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-blue-800">
                Modification du profil
              </h3>
              <p className="text-blue-600 text-sm">
                Modifiez vos informations personnelles et centres d'intérêt
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formulaire d'édition */}
      {isEditing && (
        <Card className="culture-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit3 className="w-5 h-5" />
              Modifier le Profil
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Nom complet */}
            <div>
              <Label htmlFor="full_name" className="text-sm font-medium">
                Nom complet *
              </Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                className={errors.full_name ? 'border-red-500' : ''}
                placeholder="Votre nom complet"
              />
              {errors.full_name && (
                <p className="text-red-500 text-sm mt-1">{errors.full_name}</p>
              )}
            </div>

            {/* Email en lecture seule */}
            <div>
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                value={userEmail}
                disabled
                className="bg-gray-50 text-gray-600 cursor-not-allowed"
                placeholder="votre@email.com"
              />
              <p className="text-xs text-gray-500 mt-1">
                L'email ne peut pas être modifié depuis cette interface
              </p>
            </div>

            {/* Bio */}
            <div>
              <Label htmlFor="bio" className="text-sm font-medium">
                Bio
              </Label>
              <Input
                id="bio"
                value={formData.bio || ''}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Parlez-nous de vous..."
              />
            </div>

            {/* Localisation détaillée - SECTION REMPLACÉE */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Localisation
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Pays */}
                <div>
                  <Label htmlFor="country">Pays *</Label>
                  <Select value={formData.country} onValueChange={handleCountryChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un pays" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Région/Province */}
                <div>
                  <Label htmlFor="region">Région/Province</Label>
                  <Select 
                    value={formData.region} 
                    onValueChange={handleRegionChange}
                    disabled={!formData.country || !regions[formData.country as keyof typeof regions]}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une région" />
                    </SelectTrigger>
                    <SelectContent>
                      {formData.country && regions[formData.country as keyof typeof regions]?.map((region) => (
                        <SelectItem key={region} value={region}>
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Ville */}
                <div>
                  <Label htmlFor="city">Ville</Label>
                  <Input
                    id="city"
                    value={formData.city || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="Nom de votre ville"
                    disabled={!formData.region}
                  />
                </div>
              </div>

              {/* Message d'information sur la confidentialité */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 text-blue-800 mb-1">
                  <Globe className="w-4 h-4" />
                  <span className="text-sm font-medium">Protection de la vie privée</span>
                </div>
                <p className="text-blue-700 text-xs">
                  Seules votre ville et région seront visibles par les autres utilisateurs. 
                  Votre adresse exacte ne sera jamais demandée ni partagée.
                </p>
              </div>
            </div>

            {/* Éditeur d'intérêts */}
            <InterestsEditor
              selectedInterests={formData.interests}
              onInterestsChange={handleInterestsChange}
            />

            {/* Actions */}
            <Card className="culture-card">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center gap-2 flex-1"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sauvegarde...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Enregistrer les modifications
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={loading}
                    className="flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Annuler
                  </Button>
                </div>

                {/* Avertissement */}
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Important</span>
                  </div>
                  <p className="text-yellow-700 text-sm mt-1">
                    La modification de vos centres d'intérêt mettra à jour automatiquement 
                    le contenu de votre fil d'actualité pour afficher des publications plus pertinentes.
                  </p>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProfileEditor;
