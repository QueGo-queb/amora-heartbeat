import { useState } from "react";
import { Heart, User, Mail, MapPin, Calendar, FileText, Users, Globe, Languages, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface SignupFormProps {
  language: string;
  onClose?: () => void;
}

const translations = {
  fr: {
    title: "Créer votre compte Amora",
    subtitle: "Rejoignez la communauté multiculturelle de l'amour",
    fullName: "Nom complet",
    email: "Adresse e-mail",
    password: "Mot de passe",
    confirmPassword: "Confirmer le mot de passe",
    country: "Pays",
    region: "Région",
    city: "Ville",
    language: "Langue principale",
    bio: "Petite biographie",
    gender: "Sexe",
    seekingGender: "Sexe recherché",
    age: "Âge",
    ageRange: "Tranche d'âge recherchée",
    ageRangeMin: "Âge minimum recherché",
    ageRangeMax: "Âge maximum recherché",
    targetCountry: "Pays recherché",
    seekingLanguages: "Langues recherchées",
    createAccount: "Créer mon compte",
    male: "Homme",
    female: "Femme",
    any: "Peu importe",
    bioPlaceholder: "Parlez-nous un peu de vous...",
    preferences: "Préférences de recherche"
  },
  en: {
    title: "Create your Amora account",
    subtitle: "Join the multicultural love community",
    fullName: "Full name",
    email: "Email address",
    password: "Password",
    confirmPassword: "Confirm password",
    country: "Country",
    region: "Region",
    city: "City",
    language: "Primary language",
    bio: "Short biography",
    gender: "Gender",
    seekingGender: "Seeking gender",
    age: "Age",
    ageRange: "Preferred age range",
    ageRangeMin: "Minimum age sought",
    ageRangeMax: "Maximum age sought",
    targetCountry: "Target country",
    seekingLanguages: "Seeking languages",
    createAccount: "Create my account",
    male: "Male",
    female: "Female",
    any: "Any",
    bioPlaceholder: "Tell us a bit about yourself...",
    preferences: "Search preferences"
  },
  ht: {
    title: "Kreye kont Amora ou",
    subtitle: "Vin nan kominote lanmou miltikiltirèl la",
    fullName: "Non konplè",
    email: "Adrès imel",
    password: "Mo kle",
    confirmPassword: "Konfime mo kle",
    country: "Peyi",
    region: "Rejyon",
    city: "Vil",
    language: "Lang prensipal",
    bio: "Ti byografi",
    gender: "Sèks",
    seekingGender: "Sèks w ap chèche",
    age: "Laj",
    ageRange: "Laj w ap chèche",
    ageRangeMin: "Laj minimòm w ap chèche",
    ageRangeMax: "Laj maksimòm w ap chèche",
    targetCountry: "Peyi ki vize",
    seekingLanguages: "Lang yo w ap chèche",
    createAccount: "Kreye kont mwen",
    male: "Gason",
    female: "Fanm",
    any: "Nenpòt sa",
    bioPlaceholder: "Di nou yon ti kras sou ou...",
    preferences: "Preferans rechèch"
  },
  es: {
    title: "Crear tu cuenta Amora",
    subtitle: "Únete a la comunidad multicultural del amor",
    fullName: "Nombre completo",
    email: "Dirección de correo",
    password: "Contraseña",
    confirmPassword: "Confirmar contraseña",
    country: "País",
    region: "Región",
    city: "Ciudad",
    language: "Idioma principal",
    bio: "Biografía breve",
    gender: "Género",
    seekingGender: "Género buscado",
    age: "Edad",
    ageRange: "Rango de edad preferido",
    ageRangeMin: "Edad mínima buscada",
    ageRangeMax: "Edad máxima buscada",
    targetCountry: "País objetivo",
    seekingLanguages: "Idiomas buscados",
    createAccount: "Crear mi cuenta",
    male: "Hombre",
    female: "Mujer",
    any: "Cualquiera",
    bioPlaceholder: "Cuéntanos un poco sobre ti...",
    preferences: "Preferencias de búsqueda"
  }
};

const countries = [
  "États-Unis", "Canada", "Haïti", "Chili", "Brésil", "Mexique", 
  "République Dominicaine", "Congo (RDC)", "Congo (Brazzaville)", 
  "Cameroun", "Algérie", "Ouganda", "France", "Suisse", "Espagne",
  "Belgique", "Côte d'Ivoire", "Sénégal", "Mali", "Burkina Faso",
  "Niger", "Guinée", "Bénin", "Togo", "Rwanda", "Burundi"
];

const ageRanges = [
  { label: "18-25", min: 18, max: 25 },
  { label: "26-35", min: 26, max: 35 },
  { label: "36-45", min: 36, max: 45 },
  { label: "46-55", min: 46, max: 55 },
  { label: "56+", min: 56, max: 99 }
];

const languages = [
  { code: "fr", name: "Français" },
  { code: "en", name: "English" },
  { code: "ht", name: "Kreyòl" },
  { code: "es", name: "Español" }
];

export function SignupForm({ language, onClose }: SignupFormProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    country: "",
    region: "",
    city: "",
    primaryLanguage: language,
    bio: "",
    gender: "",
    seekingGender: "",
    age: "",
    seekingAgeMin: "",
    seekingAgeMax: "",
    seekingCountry: "",
    seekingLanguages: [] as string[]
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const t = translations[language as keyof typeof translations] || translations.fr;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas.",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins 6 caractères.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: formData.fullName,
            country: formData.country,
            region: formData.region,
            city: formData.city,
            language: formData.primaryLanguage,
            bio: formData.bio,
            gender: formData.gender,
            age: parseInt(formData.age),
            seeking_gender: formData.seekingGender,
            seeking_age_min: parseInt(formData.seekingAgeMin),
            seeking_age_max: parseInt(formData.seekingAgeMax),
            seeking_country: formData.seekingCountry,
            seeking_languages: formData.seekingLanguages
          }
        }
      });

      if (error) {
        toast({
          title: "Erreur d'inscription",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Inscription réussie",
          description: "Vérifiez votre email pour confirmer votre compte.",
        });
        navigate('/');
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'inscription.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLanguageToggle = (languageCode: string) => {
    const currentLanguages = formData.seekingLanguages;
    if (currentLanguages.includes(languageCode)) {
      handleInputChange("seekingLanguages", currentLanguages.filter(lang => lang !== languageCode));
    } else {
      handleInputChange("seekingLanguages", [...currentLanguages, languageCode]);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto culture-card">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Heart className="w-6 h-6 text-heart-red" />
          <CardTitle className="text-2xl">{t.title}</CardTitle>
        </div>
        <CardDescription>{t.subtitle}</CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {t.fullName}
              </Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {t.email}
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {t.country}
              </Label>
              <Select value={formData.country} onValueChange={(value) => handleInputChange("country", value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t.country} />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country} value={country}>{country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="region">{t.region}</Label>
              <Input
                id="region"
                value={formData.region}
                onChange={(e) => handleInputChange("region", e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="city">{t.city}</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t.language}</Label>
              <Select value={formData.primaryLanguage} onValueChange={(value) => handleInputChange("primaryLanguage", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {t.age}
              </Label>
              <Input
                type="number"
                min="18"
                max="100"
                value={formData.age}
                onChange={(e) => handleInputChange("age", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                {t.password}
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                {t.confirmPassword}
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t.gender}</Label>
              <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t.gender} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">{t.male}</SelectItem>
                  <SelectItem value="female">{t.female}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>{t.seekingGender}</Label>
              <Select value={formData.seekingGender} onValueChange={(value) => handleInputChange("seekingGender", value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t.seekingGender} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">{t.male}</SelectItem>
                  <SelectItem value="female">{t.female}</SelectItem>
                  <SelectItem value="any">{t.any}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Preferences Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              {t.preferences}
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="seekingAgeMin">{t.ageRangeMin}</Label>
                  <Input
                    id="seekingAgeMin"
                    type="number"
                    min="18"
                    max="99"
                    value={formData.seekingAgeMin}
                    onChange={(e) => handleInputChange("seekingAgeMin", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="seekingAgeMax">{t.ageRangeMax}</Label>
                  <Input
                    id="seekingAgeMax"
                    type="number"
                    min="18"
                    max="99"
                    value={formData.seekingAgeMax}
                    onChange={(e) => handleInputChange("seekingAgeMax", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  {t.targetCountry}
                </Label>
                <Select value={formData.seekingCountry} onValueChange={(value) => handleInputChange("seekingCountry", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t.targetCountry} />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country} value={country}>{country}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Languages className="w-4 h-4" />
                  {t.seekingLanguages}
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {languages.map((lang) => (
                    <Button
                      key={lang.code}
                      type="button"
                      variant={formData.seekingLanguages.includes(lang.code) ? "default" : "outline"}
                      className="justify-start"
                      onClick={() => handleLanguageToggle(lang.code)}
                    >
                      {lang.name}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              {t.bio}
            </Label>
            <Textarea
              id="bio"
              placeholder={t.bioPlaceholder}
              value={formData.bio}
              onChange={(e) => handleInputChange("bio", e.target.value)}
              rows={3}
            />
          </div>

          <Button type="submit" className="btn-hero w-full" disabled={loading}>
            {loading ? "Création en cours..." : t.createAccount}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}