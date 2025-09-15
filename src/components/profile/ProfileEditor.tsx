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
  Globe,
  Camera
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
import { AvatarUpload } from './AvatarUpload';
import { useAvatar } from '@/hooks/useAvatar';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { EnhancedInterestsSelector } from './EnhancedInterestsSelector';

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
  // Pays ajoutés depuis la liste "Pays ciblés"
  { code: 'DO', name: 'République Dominicaine' },
  { code: 'CD', name: 'Congo (RDC)' },
  { code: 'CG', name: 'Congo (Brazzaville)' },
  { code: 'CM', name: 'Cameroun' },
  { code: 'DZ', name: 'Algérie' },
  { code: 'UG', name: 'Ouganda' },
  { code: 'CI', name: 'Côte d\'Ivoire' },
  { code: 'SN', name: 'Sénégal' },
  { code: 'ML', name: 'Mali' },
  { code: 'BF', name: 'Burkina Faso' },
  { code: 'NE', name: 'Niger' },
  { code: 'GN', name: 'Guinée' },
  { code: 'BJ', name: 'Bénin' },
  { code: 'TG', name: 'Togo' },
  { code: 'RW', name: 'Rwanda' },
  { code: 'BI', name: 'Burundi' },
];

// ✅ CORRIGÉ: Interface qui correspond à la structure réelle de la table
interface ProfileData {
  id: string;
  user_id: string; // ✅ AJOUT: user_id est la clé de référence
  email?: string;
  full_name: string;
  interests: string[];
  avatar_url?: string;
  bio?: string;
  location?: string;
  age?: number;
  gender?: string;
  seeking_gender?: string;
  language?: string;
  plan?: string;
  is_active?: boolean;
  // Champs de localisation
  country?: string;
  region?: string;
  city?: string;
  created_at?: string;
  updated_at?: string;
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
    city: profile.city || '',
    interests: Array.isArray(profile.interests) ? profile.interests : []
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [userEmail, setUserEmail] = useState<string>('');
  const { toast } = useToast();
  const navigate = useNavigate();

  const { avatarUrl, updateAvatar } = useAvatar();

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

  // Synchroniser formData avec les changements de profile
  useEffect(() => {
    setFormData({
      ...profile,
      country: profile.country || '',
      region: profile.region || '',
      city: profile.city || '',
      interests: Array.isArray(profile.interests) ? profile.interests : []
    });
  }, [profile]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = "Le nom est requis";
    }

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

      // ✅ CORRIGÉ: Vérifier que l'utilisateur modifie son propre profil
      if (user.id !== profile.user_id) {
        throw new Error("Vous ne pouvez modifier que votre propre profil");
      }

      // ✅ CORRIGÉ: Structure de données qui correspond à la table
      const profileData = {
        full_name: formData.full_name,
        interests: formData.interests,
        bio: formData.bio || null,
        age: formData.age || null,
        gender: formData.gender || null,
        seeking_gender: formData.seeking_gender || null,
        language: formData.language || 'fr',
        // Champs de localisation
        country: formData.country || null,
        region: formData.region || null,
        city: formData.city || null,
        // Construire la localisation complète
        location: [formData.city, formData.region, countries.find(c => c.code === formData.country)?.name]
          .filter(Boolean)
          .join(', ') || null,
        updated_at: new Date().toISOString()
      };

      console.log('🔧 ProfileData à sauvegarder:', profileData);
      console.log('🔧 User ID:', user.id);
      console.log('🔧 Profile user_id:', profile.user_id);

      // ✅ CORRIGÉ: Utiliser user_id pour la mise à jour
      const { error: updateError } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('user_id', user.id); // ✅ CORRIGÉ: utiliser user_id au lieu de id

      console.log('🔧 Résultat mise à jour:', { updateError });

      if (updateError) {
        console.error('🔧 Erreur mise à jour:', updateError);
        throw new Error(`Impossible de sauvegarder le profil: ${updateError.message}`);
      }

      console.log('🔧 Mise à jour réussie !');

      // Notification de succès
      toast({
        title: "✅ Profil mis à jour",
        description: "Vos modifications ont été sauvegardées avec succès.",
      });

      // Mettre à jour le profil local
      const updatedProfile = {
        ...formData,
        ...profileData,
        updated_at: new Date().toISOString()
      };
      onProfileUpdate(updatedProfile);
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

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Effacer l'erreur pour ce champ
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleInterestChange = (interests: string[]) => {
    handleInputChange('interests', interests);
  };

  const handleCountryChange = (countryCode: string) => {
    handleInputChange('country', countryCode);
    // Réinitialiser la région quand le pays change
    handleInputChange('region', '');
  };

  const getRegionsForCountry = (countryCode: string) => {
    const regionsMap: Record<string, string[]> = {
      CA: ['Alberta', 'Colombie-Britannique', 'Manitoba', 'Nouveau-Brunswick', 'Terre-Neuve-et-Labrador', 'Nouvelle-Écosse', 'Ontario', 'Île-du-Prince-Édouard', 'Québec', 'Saskatchewan', 'Territoires du Nord-Ouest', 'Nunavut', 'Yukon'],
      US: ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'Californie', 'Colorado', 'Connecticut', 'Delaware', 'Floride', 'Géorgie', 'Hawaï', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiane', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvanie', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'],
      FR: ['Auvergne-Rhône-Alpes', 'Bourgogne-Franche-Comté', 'Bretagne', 'Centre-Val de Loire', 'Corse', 'Grand Est', 'Hauts-de-France', 'Île-de-France', 'Normandie', 'Nouvelle-Aquitaine', 'Occitanie', 'Pays de la Loire', 'Provence-Alpes-Côte d\'Azur'],
      DE: ['Bade-Wurtemberg', 'Bavière', 'Berlin', 'Brandebourg', 'Brême', 'Hambourg', 'Hesse', 'Mecklembourg-Poméranie-Occidentale', 'Basse-Saxe', 'Rhénanie-du-Nord-Westphalie', 'Rhénanie-Palatinat', 'Sarre', 'Saxe', 'Saxe-Anhalt', 'Schleswig-Holstein', 'Thuringe'],
      ES: ['Andalousie', 'Aragon', 'Asturies', 'Îles Baléares', 'Pays basque', 'Îles Canaries', 'Cantabrie', 'Castille-La Manche', 'Castille-et-León', 'Catalogne', 'Estrémadure', 'Galice', 'La Rioja', 'Madrid', 'Murcie', 'Navarre', 'Communauté valencienne'],
      IT: ['Abruzzes', 'Basilicate', 'Calabre', 'Campanie', 'Émilie-Romagne', 'Frioul-Vénétie Julienne', 'Lazio', 'Ligurie', 'Lombardie', 'Marches', 'Molise', 'Piémont', 'Pouilles', 'Sardaigne', 'Sicile', 'Toscane', 'Trentin-Haut-Adige', 'Ombrie', 'Vallée d\'Aoste', 'Vénétie'],
      GB: ['Angleterre', 'Écosse', 'Pays de Galles', 'Irlande du Nord'],
      CH: ['Appenzell Rhodes-Extérieures', 'Appenzell Rhodes-Intérieures', 'Argovie', 'Bâle-Campagne', 'Bâle-Ville', 'Berne', 'Fribourg', 'Genève', 'Glaris', 'Grisons', 'Jura', 'Lucerne', 'Neuchâtel', 'Nidwald', 'Obwald', 'Saint-Gall', 'Schaffhouse', 'Schwytz', 'Soleure', 'Tessin', 'Thurgovie', 'Uri', 'Valais', 'Vaud', 'Zoug', 'Zurich'],
      BE: ['Anvers', 'Brabant flamand', 'Brabant wallon', 'Bruxelles-Capitale', 'Flandre occidentale', 'Flandre orientale', 'Hainaut', 'Liège', 'Limbourg', 'Luxembourg', 'Namur'],
      NL: ['Drenthe', 'Flevoland', 'Frise', 'Gueldre', 'Groningue', 'Limbourg', 'Brabant-Septentrional', 'Hollande-Septentrionale', 'Overijssel', 'Utrecht', 'Zélande', 'Hollande-Méridionale'],
      AU: ['Nouvelle-Galles du Sud', 'Victoria', 'Queensland', 'Australie-Occidentale', 'Australie-Méridionale', 'Tasmanie', 'Territoire de la capitale australienne', 'Territoire du Nord'],
      NZ: ['Auckland', 'Bay of Plenty', 'Canterbury', 'Gisborne', 'Hawke\'s Bay', 'Manawatu-Wanganui', 'Marlborough', 'Nelson', 'Northland', 'Otago', 'Southland', 'Taranaki', 'Tasman', 'Waikato', 'Wellington', 'West Coast'],
      HT: ['Artibonite', 'Centre', 'Grand\'Anse', 'Nippes', 'Nord', 'Nord-Est', 'Nord-Ouest', 'Ouest', 'Sud', 'Sud-Est'],
      CL: ['Arica y Parinacota', 'Tarapacá', 'Antofagasta', 'Atacama', 'Coquimbo', 'Valparaíso', 'Región Metropolitana', 'O\'Higgins', 'Maule', 'Ñuble', 'Biobío', 'La Araucanía', 'Los Ríos', 'Los Lagos', 'Aysén', 'Magallanes'],
      BR: ['Acre', 'Alagoas', 'Amapá', 'Amazonas', 'Bahia', 'Ceará', 'Distrito Federal', 'Espírito Santo', 'Goiás', 'Maranhão', 'Mato Grosso', 'Mato Grosso do Sul', 'Minas Gerais', 'Pará', 'Paraíba', 'Paraná', 'Pernambuco', 'Piauí', 'Rio de Janeiro', 'Rio Grande do Norte', 'Rio Grande do Sul', 'Rondônia', 'Roraima', 'Santa Catarina', 'São Paulo', 'Sergipe', 'Tocantins'],
      MX: ['Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas', 'Chihuahua', 'Coahuila', 'Colima', 'Durango', 'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco', 'México', 'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca', 'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas'],
      JP: ['Hokkaido', 'Tohoku', 'Kanto', 'Chubu', 'Kansai', 'Chugoku', 'Shikoku', 'Kyushu'],
      KR: ['Séoul', 'Busan', 'Daegu', 'Incheon', 'Gwangju', 'Daejeon', 'Ulsan', 'Gyeonggi', 'Gangwon', 'Chungbuk', 'Chungnam', 'Jeonbuk', 'Jeonnam', 'Gyeongbuk', 'Gyeongnam', 'Jeju'],
      DO: ['Azua', 'Baoruco', 'Barahona', 'Dajabón', 'Distrito Nacional', 'Duarte', 'El Seibo', 'Espaillat', 'Hato Mayor', 'Hermanas Mirabal', 'Independencia', 'La Altagracia', 'La Romana', 'La Vega', 'María Trinidad Sánchez', 'Monseñor Nouel', 'Monte Cristi', 'Monte Plata', 'Pedernales', 'Peravia', 'Puerto Plata', 'Samaná', 'San Cristóbal', 'San José de Ocoa', 'San Juan', 'San Pedro de Macorís', 'Sánchez Ramírez', 'Santiago', 'Santiago Rodríguez', 'Santo Domingo', 'Valverde'],
      CD: ['Bas-Uele', 'Équateur', 'Haut-Katanga', 'Haut-Lomami', 'Haut-Uele', 'Ituri', 'Kasaï', 'Kasaï-Central', 'Kasaï-Oriental', 'Kinshasa', 'Kongo-Central', 'Kwango', 'Kwilu', 'Lomami', 'Lualaba', 'Mai-Ndombe', 'Maniema', 'Mongala', 'Nord-Kivu', 'Nord-Ubangi', 'Sankuru', 'Sud-Kivu', 'Sud-Ubangi', 'Tanganyika', 'Tshopo', 'Tshuapa'],
      CG: ['Bouenza', 'Brazzaville', 'Cuvette', 'Cuvette-Ouest', 'Kouilou', 'Lékoumou', 'Likouala', 'Niari', 'Plateaux', 'Pointe-Noire', 'Pool', 'Sangha'],
      CM: ['Adamaoua', 'Centre', 'Est', 'Extrême-Nord', 'Littoral', 'Nord', 'Nord-Ouest', 'Ouest', 'Sud', 'Sud-Ouest'],
      DZ: ['Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa', 'Biskra', 'Béchar', 'Blida', 'Bouira', 'Tamanrasset', 'Tébessa', 'Tlemcen', 'Tiaret', 'Tizi Ouzou', 'Alger', 'Djelfa', 'Jijel', 'Sétif', 'Saïda', 'Skikda', 'Sidi Bel Abbès', 'Annaba', 'Guelma', 'Constantine', 'Médéa', 'Mostaganem', 'M\'Sila', 'Mascara', 'Ouargla', 'Oran', 'El Bayadh', 'Illizi', 'Bordj Bou Arréridj', 'Boumerdès', 'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued', 'Khenchela', 'Souk Ahras', 'Tipaza', 'Mila', 'Aïn Defla', 'Naâma', 'Aïn Témouchent', 'Ghardaïa', 'Relizane'],
      UG: ['Central', 'Eastern', 'Northern', 'Western'],
      CI: ['Bas-Sassandra', 'Comoé', 'Denguélé', 'Gôh-Djiboua', 'Lacs', 'Lagunes', 'Montagnes', 'Sassandra-Marahoué', 'Savanes', 'Vallée du Bandama', 'Woroba', 'Yamoussoukro', 'Zanzan'],
      SN: ['Dakar', 'Diourbel', 'Fatick', 'Kaffrine', 'Kaolack', 'Kédougou', 'Kolda', 'Louga', 'Matam', 'Saint-Louis', 'Sédhiou', 'Tambacounda', 'Thiès', 'Ziguinchor'],
      ML: ['Bamako', 'Gao', 'Kayes', 'Kidal', 'Koulikoro', 'Ménaka', 'Mopti', 'Ségou', 'Sikasso', 'Taoudéni', 'Tombouctou'],
      BF: ['Boucle du Mouhoun', 'Cascades', 'Centre', 'Centre-Est', 'Centre-Nord', 'Centre-Ouest', 'Centre-Sud', 'Est', 'Hauts-Bassins', 'Nord', 'Plateau-Central', 'Sahel', 'Sud-Ouest'],
      NE: ['Agadez', 'Diffa', 'Dosso', 'Maradi', 'Niamey', 'Tahoua', 'Tillabéri', 'Zinder'],
      GN: ['Boké', 'Conakry', 'Faranah', 'Kankan', 'Kindia', 'Labé', 'Mamou', 'Nzérékoré'],
      BJ: ['Alibori', 'Atacora', 'Atlantique', 'Borgou', 'Collines', 'Couffo', 'Donga', 'Littoral', 'Mono', 'Ouémé', 'Plateau', 'Zou'],
      TG: ['Centrale', 'Kara', 'Maritime', 'Plateaux', 'Savanes'],
      RW: ['Est', 'Kigali', 'Nord', 'Ouest', 'Sud'],
      BI: ['Bubanza', 'Bujumbura Mairie', 'Bujumbura Rural', 'Bururi', 'Cankuzo', 'Cibitoke', 'Gitega', 'Karuzi', 'Kayanza', 'Kirundo', 'Makamba', 'Muramvya', 'Muyinga', 'Mwaro', 'Ngozi', 'Rumonge', 'Rutana', 'Ruyigi']
    };
    
    return regionsMap[countryCode] || [];
  };

    return (
    <div className={`space-y-6 ${className}`}>
      {/* Header avec boutons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="p-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-xl font-semibold text-gray-900">Modifier le profil</h2>
          </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(false)}
                disabled={loading}
              >
                <X className="w-4 h-4 mr-1" />
                Annuler
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={loading}
                className="bg-pink-500 hover:bg-pink-600"
              >
                <Save className="w-4 h-4 mr-1" />
                {loading ? 'Sauvegarde...' : 'Sauvegarder'}
              </Button>
            </>
          ) : (
            <Button 
              size="sm"
              onClick={() => setIsEditing(true)}
              className="bg-pink-500 hover:bg-pink-600"
            >
              <Edit3 className="w-4 h-4 mr-1" />
              Modifier
            </Button>
          )}
            </div>
          </div>

      {/* Contenu du formulaire */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche - Avatar et infos de base */}
        <div className="lg:col-span-1 space-y-6">
          {/* Avatar */}
          <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Photo de profil
                </CardTitle>
              </CardHeader>
            <CardContent className="text-center">
              <div className="flex flex-col items-center space-y-4">
                <UserAvatar
                  user={profile}
                  size="xl"
                  className="w-24 h-24"
                />
                {isEditing && (
                  <AvatarUpload
                    onUpload={updateAvatar}
                    currentAvatar={avatarUrl}
                  />
                )}
              </div>
              </CardContent>
            </Card>

          {/* Informations de base */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Informations de base
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Email (lecture seule) */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  value={userEmail}
                  disabled
                  className="bg-gray-50"
                />
              </div>

            {/* Nom complet */}
              <div className="space-y-2">
                <Label htmlFor="full_name" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Nom complet
              </Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                  disabled={!isEditing}
                className={errors.full_name ? 'border-red-500' : ''}
              />
              {errors.full_name && (
                  <p className="text-sm text-red-500">{errors.full_name}</p>
              )}
            </div>

              {/* Âge */}
              <div className="space-y-2">
                <Label htmlFor="age">Âge</Label>
              <Input
                  id="age"
                  type="number"
                  min="18"
                  max="100"
                  value={formData.age || ''}
                  onChange={(e) => handleInputChange('age', parseInt(e.target.value) || null)}
                  disabled={!isEditing}
                />
              </div>

              {/* Genre */}
              <div className="space-y-2">
                <Label>Genre</Label>
                <Select
                  value={formData.gender || ''}
                  onValueChange={(value) => handleInputChange('gender', value)}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez votre genre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Homme</SelectItem>
                    <SelectItem value="female">Femme</SelectItem>
                    <SelectItem value="other">Autre</SelectItem>
                  </SelectContent>
                </Select>
            </div>

              {/* Genre recherché */}
              <div className="space-y-2">
                <Label>Genre recherché</Label>
                <Select
                  value={formData.seeking_gender || ''}
                  onValueChange={(value) => handleInputChange('seeking_gender', value)}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez le genre recherché" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Homme</SelectItem>
                    <SelectItem value="female">Femme</SelectItem>
                    <SelectItem value="any">Peu importe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
            </div>

        {/* Colonne droite - Localisation et intérêts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Localisation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Localisation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Pays */}
                <div className="space-y-2">
                  <Label>Pays</Label>
                  <Select
                    value={formData.country || ''}
                    onValueChange={handleCountryChange}
                    disabled={!isEditing}
                  >
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

                {/* Région */}
                <div className="space-y-2">
                  <Label>Région/Province</Label>
                  <Select 
                    value={formData.region || ''}
                    onValueChange={(value) => handleInputChange('region', value)}
                    disabled={!isEditing || !formData.country}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une région" />
                    </SelectTrigger>
                    <SelectContent>
                      {getRegionsForCountry(formData.country || '').map((region) => (
                        <SelectItem key={region} value={region}>
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Ville */}
                <div className="space-y-2">
                  <Label>Ville</Label>
                  <Input
                    value={formData.city || ''}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Saisissez votre ville"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Biographie */}
          <Card>
            <CardHeader>
              <CardTitle>Biographie</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={formData.bio || ''}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                disabled={!isEditing}
                placeholder="Parlez-nous un peu de vous..."
                className="w-full p-3 border border-gray-300 rounded-md resize-none h-24 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 disabled:bg-gray-50"
              />
            </CardContent>
          </Card>

          {/* Centres d'intérêt */}
          <Card>
            <CardHeader>
              <CardTitle>Centres d'intérêt</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
            <EnhancedInterestsSelector
                  selectedInterests={formData.interests}
                  onInterestsChange={handleInterestChange}
                  maxSelections={10}
                  showCategories={false}
                />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {formData.interests.map((interest) => (
                    <Badge key={interest} variant="secondary">
                      {interest}
                    </Badge>
                  ))}
                </div>
              )}
              {errors.interests && (
                <p className="text-sm text-red-500 mt-2">{errors.interests}</p>
              )}
              </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditor;
