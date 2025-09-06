import { useState } from "react";
import { Heart, User, Mail, MapPin, Calendar, FileText, Users, Globe, Languages, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLoader } from "@/hooks/use-loader";
import { useNavigate } from "react-router-dom";
import { Loader, LoaderOverlay } from "@/components/ui/loader";
import { LoadingButton } from "@/components/ui/loading-button";
import InterestsSelector from './InterestsSelector';

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
    preferences: "Préférences de recherche",
    // Messages d'erreur
    errors: {
      emailAlreadyExists: "Cette adresse email est déjà utilisée.",
      weakPassword: "Le mot de passe doit contenir au moins 6 caractères.",
      invalidEmail: "Veuillez saisir une adresse email valide.",
      passwordMismatch: "Les mots de passe ne correspondent pas.",
      networkError: "Erreur de connexion. Veuillez réessayer.",
      generalError: "Une erreur est survenue lors de l'inscription.",
      success: "Inscription réussie ! Vérifiez votre email pour confirmer votre compte."
    }
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
    preferences: "Search preferences",
    // Error messages
    errors: {
      emailAlreadyExists: "This email address is already in use.",
      weakPassword: "Password must contain at least 6 characters.",
      invalidEmail: "Please enter a valid email address.",
      passwordMismatch: "Passwords do not match.",
      networkError: "Connection error. Please try again.",
      generalError: "An error occurred during registration.",
      success: "Registration successful! Check your email to confirm your account."
    }
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
    preferences: "Preferans rechèch",
    // Mesaj erè
    errors: {
      emailAlreadyExists: "Adrès imel sa a deja itilize.",
      weakPassword: "Mo kle a dwe gen omwen 6 karaktè.",
      invalidEmail: "Tanpri antre yon adrès imel ki valab.",
      passwordMismatch: "Mo kle yo pa matche.",
      networkError: "Erè koneksyon. Tanpri eseye ankò.",
      generalError: "Yon erè te fèt pandan enskripsyon an.",
      success: "Enskripsyon reyisi! Tcheke imel ou pou konfime kont ou."
    }
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
    preferences: "Preferencias de búsqueda",
    // Mensajes de error
    errors: {
      emailAlreadyExists: "Esta dirección de correo ya está en uso.",
      weakPassword: "La contraseña debe contener al menos 6 caracteres.",
      invalidEmail: "Por favor ingresa una dirección de correo válida.",
      passwordMismatch: "Las contraseñas no coinciden.",
      networkError: "Error de conexión. Por favor intenta de nuevo.",
      generalError: "Ocurrió un error durante el registro.",
      success: "¡Registro exitoso! Revisa tu correo para confirmar tu cuenta."
    }
  },
  ptBR: {
    title: "Criar sua conta Amora",
    subtitle: "Junte-se à comunidade multicultural do amor",
    fullName: "Nome completo",
    email: "Endereço de email",
    password: "Senha",
    confirmPassword: "Confirmar senha",
    country: "País",
    region: "Região",
    city: "Cidade",
    language: "Idioma principal",
    bio: "Biografia breve",
    gender: "Gênero",
    seekingGender: "Gênero procurado",
    age: "Idade",
    ageRange: "Faixa etária preferida",
    ageRangeMin: "Idade mínima procurada",
    ageRangeMax: "Idade máxima procurada",
    targetCountry: "País objetivo",
    seekingLanguages: "Idiomas procurados",
    createAccount: "Criar minha conta",
    male: "Masculino",
    female: "Feminino",
    any: "Qualquer",
    bioPlaceholder: "Conte-nos um pouco sobre você...",
    preferences: "Preferências de busca",
    // Mensagens de erro
    errors: {
      emailAlreadyExists: "Este endereço de email já está em uso.",
      weakPassword: "A senha deve conter pelo menos 6 caracteres.",
      invalidEmail: "Por favor, insira um endereço de email válido.",
      passwordMismatch: "As senhas não coincidem.",
      networkError: "Erro de conexão. Por favor, tente novamente.",
      generalError: "Ocorreu um erro durante o registro.",
      success: "Registro bem-sucedido! Verifique seu email para confirmar sua conta."
    }
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
  { code: "es", name: "Español" },
  { code: "ptBR", name: "Português" }
];

// Fonction pour analyser et traduire les erreurs Supabase
const getErrorMessage = (error: any, language: string): string => {
  const t = translations[language as keyof typeof translations] || translations.fr;
  
  if (!error) return t.errors.generalError;
  
  const errorMessage = error.message?.toLowerCase() || '';
  const errorCode = error.status || error.code;
  
  // Erreurs d'email
  if (errorMessage.includes('email') && errorMessage.includes('already')) {
    return t.errors.emailAlreadyExists;
  }
  
  if (errorMessage.includes('invalid email') || errorMessage.includes('email format')) {
    return t.errors.invalidEmail;
  }
  
  // Erreurs de mot de passe
  if (errorMessage.includes('password') && errorMessage.includes('weak')) {
    return t.errors.weakPassword;
  }
  
  if (errorMessage.includes('password') && errorMessage.includes('length')) {
    return t.errors.weakPassword;
  }
  
  // Erreurs de réseau
  if (errorMessage.includes('network') || errorMessage.includes('connection')) {
    return t.errors.networkError;
  }
  
  if (errorCode === 500 || errorCode === 502 || errorCode === 503) {
    return t.errors.networkError;
  }
  
  // Erreurs spécifiques Supabase
  if (errorCode === 422) {
    if (errorMessage.includes('email')) {
      return t.errors.invalidEmail;
    }
    if (errorMessage.includes('password')) {
      return t.errors.weakPassword;
    }
  }
  
  // Erreur par défaut
  return t.errors.generalError;
};

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
    seekingLanguages: [] as string[],
    interests: [] as string[] // Ajout du champ intérêts
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { showLoader, hideLoader } = useLoader();
  const navigate = useNavigate();

  const t = translations[language as keyof typeof translations] || translations.fr;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation du mot de passe
    if (formData.password.length < 6) {
      toast({
        title: "Erreur",
        description: t.errors.weakPassword,
        variant: "destructive",
      });
      return;
    }

    // Validation de la correspondance des mots de passe
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Erreur",
        description: t.errors.passwordMismatch,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    showLoader("Création de votre compte...", "heart");
    
    try {
      // Étape 1: Créer le compte utilisateur
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
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
            seeking_languages: formData.seekingLanguages,
            interests: formData.interests // Ajout des intérêts
          }
        }
      });

      if (signUpError) {
        const errorMessage = getErrorMessage(signUpError, language);
        toast({
          title: "Erreur d'inscription",
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }

      // Étape 2: Vérifier si l'email nécessite confirmation
      if (signUpData.user && !signUpData.user.email_confirmed_at) {
        // Email nécessite confirmation
        toast({
          title: "Inscription réussie",
          description: "Veuillez vérifier votre email et cliquer sur le lien de confirmation pour activer votre compte.",
        });
        
        if (onClose) {
          onClose();
        } else {
          navigate('/auth');
        }
        return;
      }

      // Étape 3: Si l'email est déjà confirmé ou pas de confirmation requise, connecter automatiquement
      if (signUpData.user && signUpData.user.email_confirmed_at) {
        // L'utilisateur est déjà connecté après l'inscription
        await handleAutoLogin(formData.email, formData.password);
      } else {
        // Tentative de connexion automatique
        await handleAutoLogin(formData.email, formData.password);
      }

      // Ajout du console.log pour tester
      console.log('Intérêts sélectionnés:', formData.interests);
      alert(`Intérêts sélectionnés: ${formData.interests.join(', ')}`);

    } catch (error) {
      const errorMessage = getErrorMessage(error, language);
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      hideLoader();
    }
  };

  // Fonction pour la connexion automatique
  const handleAutoLogin = async (email: string, password: string) => {
    try {
      showLoader("Connexion automatique...", "heart");
      
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (signInError) {
        // Si la connexion automatique échoue, afficher un message
        toast({
          title: "Inscription réussie",
          description: "Votre compte a été créé. Veuillez vous connecter manuellement.",
        });
        
        if (onClose) {
          onClose();
        } else {
          navigate('/auth');
        }
        return;
      }

      // Connexion réussie - rediriger vers le dashboard
      if (signInData.user) {
        toast({
          title: "Inscription réussie",
          description: "Votre compte a été créé et vous êtes maintenant connecté !",
        });

        // Rediriger vers le dashboard
        navigate('/dashboard');
      }

    } catch (error) {
      console.error('Erreur lors de la connexion automatique:', error);
      
      // Fallback: afficher un message de succès et rediriger vers la page de connexion
      toast({
        title: "Inscription réussie",
        description: "Votre compte a été créé. Veuillez vous connecter manuellement.",
      });
      
      if (onClose) {
        onClose();
      } else {
        navigate('/auth');
      }
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

  const handleInterestToggle = (interest: string) => {
    const currentInterests = formData.interests;
    if (currentInterests.includes(interest)) {
      handleInputChange("interests", currentInterests.filter(int => int !== interest));
    } else {
      handleInputChange("interests", [...currentInterests, interest]);
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

          {/* Ajouter cette section après la section des préférences et avant le champ bio */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5" />
              Vos intérêts
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Sélectionnez vos centres d'intérêt et passions
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {[
                { value: "listening-music", label: "Listening Music", icon: "🎵" },
                { value: "books", label: "Books", icon: "📚" },
                { value: "parties", label: "Parties", icon: "🍸" },
                { value: "self-care", label: "Self Care", icon: "🧖‍♀️" },
                { value: "message", label: "Message", icon: "✉️" },
                { value: "hot-yoga", label: "Hot Yoga", icon: "🧘‍♂️" },
                { value: "gymnastics", label: "Gymnastics", icon: "🤸" },
                { value: "hockey", label: "Hockey", icon: "🏒" },
                { value: "football", label: "Football", icon: "⚽" },
                { value: "meditation", label: "Meditation", icon: "🧘" },
                { value: "spotify", label: "Spotify", icon: "🎧" },
                { value: "sushi", label: "Sushi", icon: "🍣" },
                { value: "painting", label: "Painting", icon: "🎨" },
                { value: "basketball", label: "Basketball", icon: "🏀" },
                { value: "theater", label: "Theater", icon: "🎭" },
                { value: "playing-music-instrument", label: "Playing Music Instrument", icon: "🎸" },
                { value: "aquarium", label: "Aquarium", icon: "🐠" },
                { value: "fitness", label: "Fitness", icon: "🏋️" },
                { value: "travel", label: "Travel", icon: "✈️" },
                { value: "coffee", label: "Coffee", icon: "☕" },
                { value: "instagram", label: "Instagram", icon: "📸" },
                { value: "walking", label: "Walking", icon: "🚶" },
                { value: "running", label: "Running", icon: "🏃" },
                { value: "church", label: "Church", icon: "⛪" },
                { value: "cooking", label: "Cooking", icon: "🍳" },
                { value: "singing", label: "Singing", icon: "🎤" }
              ].map((interest) => (
                <button
                  key={interest.value}
                  type="button"
                  onClick={() => handleInterestToggle(interest.value)}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 flex flex-col items-center gap-2 text-sm font-medium ${
                    formData.interests.includes(interest.value)
                      ? 'bg-heart-red border-heart-red text-white shadow-lg transform scale-105'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-heart-red/50 hover:bg-heart-red/5'
                  }`}
                >
                  <span className="text-2xl">{interest.icon}</span>
                  <span className="text-center leading-tight">{interest.label}</span>
                </button>
              ))}
            </div>
            
            {formData.interests.length > 0 && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">
                  Intérêts sélectionnés ({formData.interests.length}) :
                </p>
                <div className="flex flex-wrap gap-2">
                  {formData.interests.map((interest) => {
                    const interestData = [
                      { value: "listening-music", label: "Listening Music", icon: "🎵" },
                      { value: "books", label: "Books", icon: "📚" },
                      { value: "parties", label: "Parties", icon: "🍸" },
                      { value: "self-care", label: "Self Care", icon: "🧖‍♀️" },
                      { value: "message", label: "Message", icon: "✉️" },
                      { value: "hot-yoga", label: "Hot Yoga", icon: "🧘‍♂️" },
                      { value: "gymnastics", label: "Gymnastics", icon: "🤸" },
                      { value: "hockey", label: "Hockey", icon: "🏒" },
                      { value: "football", label: "Football", icon: "⚽" },
                      { value: "meditation", label: "Meditation", icon: "🧘" },
                      { value: "spotify", label: "Spotify", icon: "🎧" },
                      { value: "sushi", label: "Sushi", icon: "🍣" },
                      { value: "painting", label: "Painting", icon: "🎨" },
                      { value: "basketball", label: "Basketball", icon: "🏀" },
                      { value: "theater", label: "Theater", icon: "🎭" },
                      { value: "playing-music-instrument", label: "Playing Music Instrument", icon: "🎸" },
                      { value: "aquarium", label: "Aquarium", icon: "🐠" },
                      { value: "fitness", label: "Fitness", icon: "🏋️" },
                      { value: "travel", label: "Travel", icon: "✈️" },
                      { value: "coffee", label: "Coffee", icon: "☕" },
                      { value: "instagram", label: "Instagram", icon: "📸" },
                      { value: "walking", label: "Walking", icon: "🚶" },
                      { value: "running", label: "Running", icon: "🏃" },
                      { value: "church", label: "Church", icon: "⛪" },
                      { value: "cooking", label: "Cooking", icon: "🍳" },
                      { value: "singing", label: "Singing", icon: "🎤" }
                    ].find(item => item.value === interest);
                    
                    return (
                      <span
                        key={interest}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-heart-red text-white text-xs rounded-full"
                      >
                        <span>{interestData?.icon}</span>
                        <span>{interestData?.label}</span>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
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

          <LoadingButton 
            type="submit" 
            className="btn-hero w-full" 
            loading={loading}
            loadingText="Création en cours..."
            loadingVariant="heart"
          >
            {t.createAccount}
          </LoadingButton>
        </form>
      </CardContent>
    </Card>
  );
}