import { useState } from "react";
import { Heart, User, Mail, MapPin, Calendar, FileText, Users, Globe, Languages, Lock, ChevronRight, ChevronLeft } from "lucide-react";
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
import { EnhancedInterestsSelector } from '@/components/profile/EnhancedInterestsSelector';
import { analytics } from '@/lib/analytics';

interface SignupFormProps {
  language: string;
  onClose?: () => void;
}

const translations = {
  fr: {
    title: "Créer votre compte Amora",
    subtitle: "Rejoignez la communauté multiculturelle de l'amour",
    fullName: "Nom complet",
    email: "Adresse email",
    password: "Mot de passe",
    confirmPassword: "Confirmer le mot de passe",
    country: "Pays",
    region: "Région",
    city: "Ville",
    language: "Langue principale",
    bio: "Biographie courte",
    gender: "Genre",
    seekingGender: "Genre recherché",
    age: "Âge",
    ageRange: "Tranche d'âge préférée",
    ageRangeMin: "Âge minimum recherché",
    ageRangeMax: "Âge maximum recherché",
    targetCountry: "Pays cible",
    seekingLanguages: "Langues recherchées",
    createAccount: "Créer mon compte",
    male: "Homme",
    female: "Femme",
    any: "Peu importe",
    bioPlaceholder: "Parlez-nous un peu de vous...",
    preferences: "Préférences de recherche",
    step1: "Informations personnelles",
    step2: "Préférences de recherche",
    step3: "Centres d'intérêt",
    continue: "Continuer",
    previous: "Précédent",
    // Messages d'erreur
    errors: {
      emailAlreadyExists: "Cette adresse email est déjà utilisée.",
      weakPassword: "Le mot de passe doit contenir au moins 6 caractères.",
      invalidEmail: "Veuillez entrer une adresse email valide.",
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
    step1: "Personal information",
    step2: "Search preferences",
    step3: "Interests",
    continue: "Continue",
    previous: "Previous",
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
    subtitle: "Rantre nan kominote miltikiltirèl lanmou an",
    fullName: "Non konplè",
    email: "Adrès imel",
    password: "Mo de pase",
    confirmPassword: "Konfime mo de pase",
    country: "Peyi",
    region: "Rejyon",
    city: "Vil",
    language: "Lang prensipal",
    bio: "Kout byografi",
    gender: "Sèks",
    seekingGender: "Sèks w ap chèche",
    age: "Laj",
    ageRange: "Tranche laj ou pi renmen",
    ageRangeMin: "Laj minimòm w ap chèche",
    ageRangeMax: "Laj maksimòm w ap chèche",
    targetCountry: "Peyi sib",
    seekingLanguages: "Lang w ap chèche",
    createAccount: "Kreye kont mwen",
    male: "Gason",
    female: "Fi",
    any: "Nenpòt",
    bioPlaceholder: "Di nou yon ti jan sou ou...",
    preferences: "Preferans rechèch",
    step1: "Enfòmasyon pèsonèl",
    step2: "Preferans rechèch",
    step3: "Entegè",
    continue: "Kontinye",
    previous: "Anvan",
    errors: {
      emailAlreadyExists: "Adrès imel sa a deja ap itilize.",
      weakPassword: "Mo de pase a dwe gen omwen 6 karaktè.",
      invalidEmail: "Tanpri antre yon adrès imel valid.",
      passwordMismatch: "Mo de pase yo pa koreye.",
      networkError: "Erè konneksyon. Tanpri eseye ankò.",
      generalError: "Yon erè te rive pandan enskripsyon an.",
      success: "Enskripsyon reyisi ! Verifye imel ou pou konfime kont ou."
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
    bio: "Biografía corta",
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
    step1: "Información personal",
    step2: "Preferencias de búsqueda",
    step3: "Intereses",
    continue: "Continuar",
    previous: "Anterior",
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
    step1: "Informações pessoais",
    step2: "Preferências de busca",
    step3: "Interesses",
    continue: "Continuar",
    previous: "Anterior",
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

const languages = [
  { code: "fr", name: "Français" },
  { code: "en", name: "English" },
  { code: "ht", name: "Kreyòl" },
  { code: "es", name: "Español" },
  { code: "ptBR", name: "Português (BR)" }
];

const getErrorMessage = (error: any, t: any): string => {
  if (!error) return t.errors.generalError;
  
  const errorMessage = error.message?.toLowerCase() || '';
  
  // Email déjà utilisé
  if (errorMessage.includes('email') && errorMessage.includes('already')) {
    return t.errors.emailAlreadyExists;
  }
  
  // Mot de passe trop faible
  if (errorMessage.includes('password') && (errorMessage.includes('weak') || errorMessage.includes('short'))) {
    return t.errors.weakPassword;
  }
  
  // Email invalide
  if (errorMessage.includes('email') && errorMessage.includes('invalid')) {
    return t.errors.invalidEmail;
  }
  
  // Problème de réseau
  if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('connection')) {
    return t.errors.networkError;
  }
  
  // Erreurs spécifiques Supabase
  if (errorMessage.includes('user_already_exists')) {
    return t.errors.emailAlreadyExists;
  }
  
  if (errorMessage.includes('signup_disabled')) {
    return "Les inscriptions sont temporairement désactivées.";
  }
  
  if (errorMessage.includes('rate_limit')) {
    return "Trop de tentatives. Veuillez attendre avant de réessayer.";
  }

  
  // Erreur par défaut
  return t.errors.generalError;
};

export function SignupForm({ language, onClose }: SignupFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
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
    interests: [] as string[]
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
      // Analyser les événements d'inscription
      analytics.userSignup('email', {
        country: formData.country,
        language: formData.primaryLanguage,
        gender: formData.gender,
        hasInterests: formData.interests.length > 0
      });

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            primary_language: formData.primaryLanguage
          }
        }
      });

      if (authError) {
        throw authError;
      }

      if (authData.user) {
        // Créer le profil utilisateur
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            full_name: formData.fullName,
            bio: formData.bio,
            country: formData.country,
            region: formData.region,
            city: formData.city,
            primary_language: formData.primaryLanguage,
            gender: formData.gender,
            age: parseInt(formData.age),
            seeking_gender: formData.seekingGender,
            seeking_age_min: formData.seekingAgeMin ? parseInt(formData.seekingAgeMin) : null,
            seeking_age_max: formData.seekingAgeMax ? parseInt(formData.seekingAgeMax) : null,
            seeking_country: formData.seekingCountry,
            seeking_languages: formData.seekingLanguages,
            interests: formData.interests,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          // Ne pas bloquer l'inscription si le profil échoue
        }

        toast({
          title: "Inscription réussie !",
          description: t.errors.success,
        });

        // Tentative de connexion automatique
        await handleAutoLogin(formData.email, formData.password);
      }

    } catch (error: any) {
      console.error('Signup error:', error);
      
      const errorMessage = getErrorMessage(error, t);
      
      toast({
        title: "Erreur d'inscription",
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

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            {/* Nom et Email */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="flex items-center gap-2 text-[#212529]">
                  <User className="w-4 h-4 text-[#E63946]" />
                  {t.fullName}
                </Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  required
                  className="border-[#CED4DA] focus:border-[#E63946] focus:ring-[#E63946]"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2 text-[#212529]">
                  <Mail className="w-4 h-4 text-[#E63946]" />
                  {t.email}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                  className="border-[#CED4DA] focus:border-[#E63946] focus:ring-[#E63946]"
                />
              </div>
            </div>

            {/* Mots de passe */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2 text-[#212529]">
                  <Lock className="w-4 h-4 text-[#E63946]" />
                  {t.password}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  required
                  className="border-[#CED4DA] focus:border-[#E63946] focus:ring-[#E63946]"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="flex items-center gap-2 text-[#212529]">
                  <Lock className="w-4 h-4 text-[#E63946]" />
                  {t.confirmPassword}
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  required
                  className="border-[#CED4DA] focus:border-[#E63946] focus:ring-[#E63946]"
                />
              </div>
            </div>

            {/* Localisation */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-[#212529]">
                  <MapPin className="w-4 h-4 text-[#E63946]" />
                  {t.country}
                </Label>
                <Select value={formData.country} onValueChange={(value) => handleInputChange("country", value)}>
                  <SelectTrigger className="border-[#CED4DA] focus:border-[#E63946] focus:ring-[#E63946]">
                    <SelectValue placeholder={t.country} />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country} value={country}>{country}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="region" className="text-[#212529]">{t.region}</Label>
                  <Input
                    id="region"
                    value={formData.region}
                    onChange={(e) => handleInputChange("region", e.target.value)}
                    className="border-[#CED4DA] focus:border-[#E63946] focus:ring-[#E63946]"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-[#212529]">{t.city}</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    className="border-[#CED4DA] focus:border-[#E63946] focus:ring-[#E63946]"
                  />
                </div>
              </div>
            </div>

            {/* Langue et âge */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[#212529]">{t.language}</Label>
                <Select value={formData.primaryLanguage} onValueChange={(value) => handleInputChange("primaryLanguage", value)}>
                  <SelectTrigger className="border-[#CED4DA] focus:border-[#E63946] focus:ring-[#E63946]">
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
                <Label className="flex items-center gap-2 text-[#212529]">
                  <Calendar className="w-4 h-4 text-[#E63946]" />
                  {t.age}
                </Label>
                <Input
                  type="number"
                  min="18"
                  max="100"
                  value={formData.age}
                  onChange={(e) => handleInputChange("age", e.target.value)}
                  required
                  className="border-[#CED4DA] focus:border-[#E63946] focus:ring-[#E63946]"
                />
              </div>
            </div>

            {/* Genre */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[#212529]">{t.gender}</Label>
                <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                  <SelectTrigger className="border-[#CED4DA] focus:border-[#E63946] focus:ring-[#E63946]">
                    <SelectValue placeholder={t.gender} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">{t.male}</SelectItem>
                    <SelectItem value="female">{t.female}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-[#212529]">{t.seekingGender}</Label>
                <Select value={formData.seekingGender} onValueChange={(value) => handleInputChange("seekingGender", value)}>
                  <SelectTrigger className="border-[#CED4DA] focus:border-[#E63946] focus:ring-[#E63946]">
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
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2 text-[#212529] flex items-center justify-center gap-2">
                <Users className="w-5 h-5 text-[#E63946]" />
                {t.preferences}
              </h3>
            </div>
            
            <div className="space-y-4">
              {/* Tranche d'âge */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="seekingAgeMin" className="text-[#212529]">{t.ageRangeMin}</Label>
                  <Input
                    id="seekingAgeMin"
                    type="number"
                    min="18"
                    max="99"
                    value={formData.seekingAgeMin}
                    onChange={(e) => handleInputChange("seekingAgeMin", e.target.value)}
                    className="border-[#CED4DA] focus:border-[#E63946] focus:ring-[#E63946]"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="seekingAgeMax" className="text-[#212529]">{t.ageRangeMax}</Label>
                  <Input
                    id="seekingAgeMax"
                    type="number"
                    min="18"
                    max="99"
                    value={formData.seekingAgeMax}
                    onChange={(e) => handleInputChange("seekingAgeMax", e.target.value)}
                    className="border-[#CED4DA] focus:border-[#E63946] focus:ring-[#E63946]"
                  />
                </div>
              </div>

              {/* Pays cible */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-[#212529]">
                  <Globe className="w-4 h-4 text-[#E63946]" />
                  {t.targetCountry}
                </Label>
                <Select value={formData.seekingCountry} onValueChange={(value) => handleInputChange("seekingCountry", value)}>
                  <SelectTrigger className="border-[#CED4DA] focus:border-[#E63946] focus:ring-[#E63946]">
                    <SelectValue placeholder={t.targetCountry} />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country} value={country}>{country}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Langues recherchées */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-[#212529]">
                  <Languages className="w-4 h-4 text-[#E63946]" />
                  {t.seekingLanguages}
                </Label>
                <div className="grid grid-cols-1 gap-2">
                  {languages.map((lang) => (
                    <Button
                      key={lang.code}
                      type="button"
                      variant={formData.seekingLanguages.includes(lang.code) ? "default" : "outline"}
                      className={`justify-start ${
                        formData.seekingLanguages.includes(lang.code)
                          ? "bg-[#E63946] hover:bg-[#E63946]/90 text-white border-[#E63946]"
                          : "border-[#CED4DA] text-[#212529] hover:bg-[#E63946] hover:text-white hover:border-[#E63946]"
                      }`}
                      onClick={() => handleLanguageToggle(lang.code)}
                    >
                      {lang.name}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2 text-[#212529] flex items-center justify-center gap-2">
                <Heart className="w-5 h-5 text-[#E63946]" />
                Vos centres d'intérêt
              </h3>
              <p className="text-sm text-[#CED4DA] mb-4">
                Sélectionnez vos centres d'intérêt pour nous aider à vous proposer des profils compatibles.
              </p>
            </div>
            
            <EnhancedInterestsSelector
              selectedInterests={formData.interests}
              onInterestsChange={(interests) => handleInputChange("interests", interests)}
              maxSelections={10}
              showCategories={false}  // ← CHANGEMENT: désactive les onglets pour mobile
              className="mb-4"
            />
            
            {formData.interests.length > 0 && (
              <div className="mt-3 p-3 bg-[#52B788]/10 border border-[#52B788]/20 rounded-lg">
                <p className="text-sm text-[#52B788] font-medium">
                  ✅ {formData.interests.length} centre{formData.interests.length > 1 ? 's' : ''} d'intérêt sélectionné{formData.interests.length > 1 ? 's' : ''}
                </p>
              </div>
            )}

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio" className="flex items-center gap-2 text-[#212529]">
                <FileText className="w-4 h-4 text-[#E63946]" />
                {t.bio}
              </Label>
              <Textarea
                id="bio"
                placeholder={t.bioPlaceholder}
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                rows={3}
                className="border-[#CED4DA] focus:border-[#E63946] focus:ring-[#E63946] resize-none"
              />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="bg-[#F8F9FA] border-[#CED4DA] shadow-lg rounded-xl">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Heart className="w-6 h-6 text-[#E63946]" />
            <CardTitle className="text-xl md:text-2xl text-[#212529]">{t.title}</CardTitle>
          </div>
          <CardDescription className="text-[#CED4DA]">{t.subtitle}</CardDescription>
          
          {/* Progress indicator */}
          <div className="flex justify-center mt-4 space-x-2">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`w-3 h-3 rounded-full ${
                  step <= currentStep ? "bg-[#E63946]" : "bg-[#CED4DA]"
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-[#CED4DA] mt-2">
            {currentStep === 1 && t.step1}
            {currentStep === 2 && t.step2}
            {currentStep === 3 && t.step3}
          </p>
        </CardHeader>
        
        <CardContent className="px-4 md:px-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {renderStepContent()}

            {/* Navigation buttons */}
            <div className="flex justify-between pt-4">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  className="border-[#CED4DA] text-[#212529] hover:bg-[#CED4DA] hover:text-[#212529]"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  {t.previous}
                </Button>
              )}
              
              {currentStep < 3 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="bg-[#E63946] hover:bg-[#E63946]/90 text-white border-0 ml-auto"
                >
                  {t.continue}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <LoadingButton 
                  type="submit" 
                  className="bg-[#E63946] hover:bg-[#E63946]/90 text-white border-0 ml-auto" 
                  loading={loading}
                  loadingText="Création en cours..."
                  loadingVariant="heart"
                >
                  {t.createAccount}
                </LoadingButton>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}