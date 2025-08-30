import { useState } from "react";
import { Heart, User, Mail, MapPin, Calendar, Users, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
    country: "Pays",
    region: "Région",
    city: "Ville",
    language: "Langue principale",
    bio: "Petite biographie",
    gender: "Sexe",
    seekingGender: "Sexe recherché",
    age: "Âge",
    ageRange: "Tranche d'âge recherchée",
    targetCountry: "Pays ciblé",
    createAccount: "Créer mon compte",
    male: "Homme",
    female: "Femme",
    bioPlaceholder: "Parlez-nous un peu de vous...",
    connecting: "Connexion à Supabase requise",
    connectMessage: "Pour créer votre compte, vous devez d'abord connecter votre projet à Supabase."
  },
  en: {
    title: "Create your Amora account",
    subtitle: "Join the multicultural love community",
    fullName: "Full name",
    email: "Email address",
    country: "Country",
    region: "Region",
    city: "City",
    language: "Primary language",
    bio: "Short biography",
    gender: "Gender",
    seekingGender: "Seeking gender",
    age: "Age",
    ageRange: "Preferred age range",
    targetCountry: "Target country",
    createAccount: "Create my account",
    male: "Male",
    female: "Female",
    bioPlaceholder: "Tell us a bit about yourself...",
    connecting: "Supabase connection required",
    connectMessage: "To create your account, you need to connect your project to Supabase first."
  },
  ht: {
    title: "Kreye kont Amora ou",
    subtitle: "Vin nan kominote lanmou miltikiltirèl la",
    fullName: "Non konplè",
    email: "Adrès imel",
    country: "Peyi",
    region: "Rejyon",
    city: "Vil",
    language: "Lang prensipal",
    bio: "Ti byografi",
    gender: "Sèks",
    seekingGender: "Sèks w ap chèche",
    age: "Laj",
    ageRange: "Laj w ap chèche",
    targetCountry: "Peyi ki vize",
    createAccount: "Kreye kont mwen",
    male: "Gason",
    female: "Fanm",
    bioPlaceholder: "Di nou yon ti kras sou ou...",
    connecting: "Konneksyon Supabase obligatwa",
    connectMessage: "Pou kreye kont ou, ou bezwen konekte pwojè ou ak Supabase an premye."
  },
  es: {
    title: "Crear tu cuenta Amora",
    subtitle: "Únete a la comunidad multicultural del amor",
    fullName: "Nombre completo",
    email: "Dirección de correo",
    country: "País",
    region: "Región",
    city: "Ciudad",
    language: "Idioma principal",
    bio: "Biografía breve",
    gender: "Género",
    seekingGender: "Género buscado",
    age: "Edad",
    ageRange: "Rango de edad preferido",
    targetCountry: "País objetivo",
    createAccount: "Crear mi cuenta",
    male: "Hombre",
    female: "Mujer",
    bioPlaceholder: "Cuéntanos un poco sobre ti...",
    connecting: "Conexión a Supabase requerida",
    connectMessage: "Para crear tu cuenta, necesitas conectar tu proyecto a Supabase primero."
  }
};

const countries = [
  "États-Unis", "Canada", "Haïti", "Chili", "Brésil", "Mexique", 
  "République Dominicaine", "Congo (RDC)", "Congo (Brazzaville)", 
  "Cameroun", "Algérie", "Ouganda", "France", "Suisse", "Espagne"
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
    country: "",
    region: "",
    city: "",
    primaryLanguage: language,
    bio: "",
    gender: "",
    seekingGender: "",
    age: "",
    ageMin: "",
    ageMax: "",
    targetCountry: ""
  });

  const t = translations[language as keyof typeof translations] || translations.fr;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // This will be implemented when Supabase is connected
    console.log("Form data:", formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
        <div className="mb-6 p-4 bg-muted rounded-lg border border-accent">
          <div className="flex items-center gap-2 text-accent mb-2">
            <Users className="w-5 h-5" />
            <span className="font-medium">{t.connecting}</span>
          </div>
          <p className="text-sm text-muted-foreground">{t.connectMessage}</p>
        </div>

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
                </SelectContent>
              </Select>
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

          <Button type="submit" className="btn-hero w-full" disabled>
            {t.createAccount}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}