import { useState, useEffect } from "react";
import { Heart, User, Mail, MapPin, Calendar, FileText, Users, Globe, Languages, Lock, ChevronRight, ChevronLeft, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLoader } from "@/hooks/use-loader";
import { useNavigate } from "react-router-dom";
import { Loader, LoaderOverlay } from "@/components/ui/loader";
import { LoadingButton } from "@/components/ui/loading-button";
import { EnhancedInterestsSelector } from '@/components/profile/EnhancedInterestsSelector';
import { analytics } from '@/lib/analytics';
import { RegionAutocomplete } from '@/components/ui/region-autocomplete';

interface SignupFormProps {
  language: string;
  onClose?: () => void;
}

// ✅ NOUVELLE STRUCTURE: Traductions améliorées
const translations = {
  fr: {
    title: "Créer votre compte Amora",
    subtitle: "Rejoignez la communauté multiculturelle de l'amour",
    welcome: "Bienvenue sur Amora !",
    welcomeSubtitle: "Créez votre profil en quelques étapes simples",
    
    // Étapes
    steps: {
      personal: "Informations personnelles",
      preferences: "Préférences de recherche", 
      interests: "Centres d'intérêt",
      review: "Vérification finale"
    },
    
    // Champs
    fullName: "Nom complet",
    email: "Adresse email",
    password: "Mot de passe",
    confirmPassword: "Confirmer le mot de passe",
    country: "Pays",
    region: "Région/Province",
    city: "Ville",
    language: "Langue principale",
    bio: "Biographie courte",
    gender: "Genre",
    seekingGender: "Genre recherché",
    age: "Âge",
    targetCountry: "Pays cible(s)",
    
    // Placeholders
    fullNamePlaceholder: "Votre nom complet",
    emailPlaceholder: "votre@email.com",
    passwordPlaceholder: "Minimum 6 caractères",
    bioPlaceholder: "Parlez-nous un peu de vous...",
    cityPlaceholder: "Votre ville",
    
    // Options
    male: "Homme",
    female: "Femme",
    any: "Peu importe",
    
    // Boutons
    createAccount: "Créer mon compte",
    continue: "Continuer",
    previous: "Précédent",
    finish: "Terminer l'inscription",
    
    // Messages de validation
    validation: {
      required: "Ce champ est requis",
      emailInvalid: "Format d'email invalide",
      passwordWeak: "Le mot de passe doit contenir au moins 6 caractères",
      passwordMismatch: "Les mots de passe ne correspondent pas",
      ageInvalid: "L'âge doit être entre 18 et 100 ans",
      bioTooLong: "La biographie ne peut pas dépasser 500 caractères"
    },
    
    // Messages d'erreur
    errors: {
      emailAlreadyExists: "Cette adresse email est déjà utilisée.",
      weakPassword: "Le mot de passe doit contenir au moins 6 caractères.",
      invalidEmail: "Veuillez entrer une adresse email valide.",
      passwordMismatch: "Les mots de passe ne correspondent pas.",
      networkError: "Erreur de connexion. Veuillez réessayer.",
      generalError: "Une erreur est survenue lors de l'inscription.",
      success: "Inscription réussie ! Vérifiez votre email pour confirmer votre compte."
    },
    
    // Messages de succès
    success: {
      step1: "✅ Informations personnelles validées",
      step2: "✅ Préférences enregistrées", 
      step3: "✅ Centres d'intérêt sélectionnés",
      final: "🎉 Votre compte a été créé avec succès !"
    }
  },
  en: {
    title: "Create your Amora account",
    subtitle: "Join the multicultural love community",
    welcome: "Welcome to Amora!",
    welcomeSubtitle: "Create your profile in a few simple steps",
    
    steps: {
      personal: "Personal information",
      preferences: "Search preferences",
      interests: "Interests",
      review: "Final review"
    },
    
    fullName: "Full name",
    email: "Email address",
    password: "Password",
    confirmPassword: "Confirm password",
    country: "Country",
    region: "Region/Province",
    city: "City",
    language: "Primary language",
    bio: "Short biography",
    gender: "Gender",
    seekingGender: "Seeking gender",
    age: "Age",
    targetCountry: "Target country(ies)",
    
    fullNamePlaceholder: "Your full name",
    emailPlaceholder: "your@email.com",
    passwordPlaceholder: "Minimum 6 characters",
    bioPlaceholder: "Tell us a bit about yourself...",
    cityPlaceholder: "Your city",
    
    male: "Male",
    female: "Female",
    any: "Any",
    
    createAccount: "Create my account",
    continue: "Continue",
    previous: "Previous",
    finish: "Complete registration",
    
    validation: {
      required: "This field is required",
      emailInvalid: "Invalid email format",
      passwordWeak: "Password must be at least 6 characters",
      passwordMismatch: "Passwords do not match",
      ageInvalid: "Age must be between 18 and 100",
      bioTooLong: "Biography cannot exceed 500 characters"
    },
    
    errors: {
      emailAlreadyExists: "This email address is already in use.",
      weakPassword: "Password must be at least 6 characters.",
      invalidEmail: "Please enter a valid email address.",
      passwordMismatch: "Passwords do not match.",
      networkError: "Connection error. Please try again.",
      generalError: "An error occurred during registration.",
      success: "Registration successful! Check your email to confirm your account."
    },
    
    success: {
      step1: "✅ Personal information validated",
      step2: "✅ Preferences saved",
      step3: "✅ Interests selected",
      final: "🎉 Your account has been created successfully!"
    }
  }
};

// ✅ NOUVELLE STRUCTURE: Données organisées
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

// ✅ NOUVELLE STRUCTURE: Validation en temps réel
const validateField = (field: string, value: any, formData: any): string | null => {
  switch (field) {
    case 'fullName':
      return !value || value.trim().length < 2 ? 'required' : null;
    case 'email':
      if (!value) return 'required';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return !emailRegex.test(value) ? 'emailInvalid' : null;
    case 'password':
      return !value || value.length < 6 ? 'passwordWeak' : null;
    case 'confirmPassword':
      return !value || value !== formData.password ? 'passwordMismatch' : null;
    case 'age':
      const age = parseInt(value);
      return !value || isNaN(age) || age < 18 || age > 100 ? 'ageInvalid' : null;
    case 'bio':
      return value && value.length > 500 ? 'bioTooLong' : null;
    default:
      return !value ? 'required' : null;
  }
};

// ✅ NOUVELLE STRUCTURE: Gestion d'erreur améliorée
const getErrorMessage = (error: any, t: any): string => {
  if (!error) {
    console.error('❌ No error object provided');
    return t.errors.generalError;
  }
  
  const errorMessage = error.message?.toLowerCase() || '';
  const errorCode = error.code || error.error_code || '';
  
  console.log('🔍 Error details:', { error, errorMessage, errorCode });
  
  if (errorCode === 'user_already_exists' || 
      errorMessage.includes('email') && (errorMessage.includes('already') || errorMessage.includes('exists'))) {
    return t.errors.emailAlreadyExists;
  }
  
  if (errorCode === 'password_too_weak' || 
      errorMessage.includes('password') && errorMessage.includes('weak')) {
    return t.errors.weakPassword;
  }
  
  if (errorCode === 'invalid_email' || 
      errorMessage.includes('email') && errorMessage.includes('invalid')) {
    return t.errors.invalidEmail;
  }
  
  if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
    return t.errors.networkError;
  }
  
  const finalCode = errorCode || 'UNKNOWN';
  return `${t.errors.generalError} (Code: ${finalCode})`;
};

export function SignupForm({ language, onClose }: SignupFormProps) {
  // ✅ NOUVELLE STRUCTURE: État du formulaire
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: '',
    region: '',
    city: '',
    primaryLanguage: 'fr',
    bio: '',
    gender: '',
    seekingGender: 'any',
    age: '',
    seekingCountry: [] as string[],
    interests: [] as string[]
  });
  
  // ✅ NOUVELLE STRUCTURE: État de validation
  const [validationErrors, setValidationErrors] = useState<Record<string, string | null>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stepCompleted, setStepCompleted] = useState<Record<number, boolean>>({});
  
  const { showLoader, hideLoader } = useLoader();
  const { toast } = useToast();
  const navigate = useNavigate();
  const t = translations[language as keyof typeof translations] || translations.fr;

  // ✅ NOUVELLE STRUCTURE: Validation en temps réel
  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Validation en temps réel
    const error = validateField(field, value, { ...formData, [field]: value });
    setValidationErrors(prev => ({ ...prev, [field]: error }));
  };

  // ✅ NOUVELLE STRUCTURE: Validation d'étape
  const validateStep = (step: number): boolean => {
    const errors: Record<string, string | null> = {};
    
    switch (step) {
      case 1: // Informations personnelles
        errors.fullName = validateField('fullName', formData.fullName, formData);
        errors.email = validateField('email', formData.email, formData);
        errors.password = validateField('password', formData.password, formData);
        errors.confirmPassword = validateField('confirmPassword', formData.confirmPassword, formData);
        errors.age = validateField('age', formData.age, formData);
        errors.gender = validateField('gender', formData.gender, formData);
        break;
      case 2: // Préférences
        errors.country = validateField('country', formData.country, formData);
        break;
      case 3: // Centres d'intérêt
        // Optionnel, pas de validation stricte
        break;
    }
    
    setValidationErrors(errors);
    const hasErrors = Object.values(errors).some(error => error !== null);
    
    if (!hasErrors) {
      setStepCompleted(prev => ({ ...prev, [step]: true }));
    }
    
    return !hasErrors;
  };

  // ✅ NOUVELLE STRUCTURE: Navigation entre étapes
  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // ✅ NOUVELLE STRUCTURE: Soumission finale
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) {
      return;
    }

    setLoading(true);
    showLoader("Création de votre compte...", "heart");

    try {
      console.log('🚀 Starting signup process...');
      
      // Analytics avec vérification
      try {
        if (analytics && typeof analytics.userSignup === 'function') {
          analytics.userSignup('email', {
            country: formData.country,
            language: formData.primaryLanguage,
            gender: formData.gender,
            hasInterests: formData.interests.length > 0
          });
        }
      } catch (analyticsError) {
        console.log('⚠️ Analytics error, continuing without analytics:', analyticsError);
      }

      // Créer l'utilisateur auth
      console.log('🚀 Creating auth user...');
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            age: parseInt(formData.age),
            gender: formData.gender
          }
        }
      });

      if (authError) {
        console.error('❌ Auth error:', authError);
        throw authError;
      }

      if (!authData.user) {
        throw new Error('No user data returned');
      }

      // Créer le profil directement
      console.log('🚀 Creating profile directly...');
      const profileData = {
        user_id: authData.user.id,
        email: formData.email,
        full_name: formData.fullName,
        gender: formData.gender,
        age: parseInt(formData.age),
        bio: formData.bio || null,
        country: formData.country || null,
        region: formData.region || null,
        city: formData.city || null,
        language: formData.primaryLanguage || 'fr',
        seeking_gender: formData.seekingGender || 'any',
        interests: formData.interests || [],
        plan: 'free',
        is_active: true
      };

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'user_id' });

      if (profileError) {
        console.error('❌ Profile error:', profileError);
        throw profileError;
      }

      console.log('✅ Profile created successfully');

      toast({
        title: "✅ Inscription réussie !",
        description: t.success.final,
      });

      // Redirection vers le dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (error: any) {
      console.error('❌ Complete signup error:', error);
      
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

  // ✅ NOUVELLE STRUCTURE: Rendu des étapes
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.steps.personal}</h2>
              <p className="text-gray-600">Commençons par vos informations de base</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {t.fullName} *
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder={t.fullNamePlaceholder}
                  value={formData.fullName}
                  onChange={(e) => handleFieldChange('fullName', e.target.value)}
                  className={validationErrors.fullName ? 'border-red-500' : ''}
                />
                {validationErrors.fullName && (
                  <p className="text-sm text-red-500">{t.validation[validationErrors.fullName as keyof typeof t.validation]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {t.email} *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t.emailPlaceholder}
                  value={formData.email}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                  className={validationErrors.email ? 'border-red-500' : ''}
                />
                {validationErrors.email && (
                  <p className="text-sm text-red-500">{t.validation[validationErrors.email as keyof typeof t.validation]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  {t.password} *
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t.passwordPlaceholder}
                    value={formData.password}
                    onChange={(e) => handleFieldChange('password', e.target.value)}
                    className={validationErrors.password ? 'border-red-500' : ''}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {validationErrors.password && (
                  <p className="text-sm text-red-500">{t.validation[validationErrors.password as keyof typeof t.validation]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  {t.confirmPassword} *
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder={t.passwordPlaceholder}
                    value={formData.confirmPassword}
                    onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
                    className={validationErrors.confirmPassword ? 'border-red-500' : ''}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {validationErrors.confirmPassword && (
                  <p className="text-sm text-red-500">{t.validation[validationErrors.confirmPassword as keyof typeof t.validation]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="age" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {t.age} *
                </Label>
                <Input
                  id="age"
                  type="number"
                  min="18"
                  max="100"
                  placeholder="25"
                  value={formData.age}
                  onChange={(e) => handleFieldChange('age', e.target.value)}
                  className={validationErrors.age ? 'border-red-500' : ''}
                />
                {validationErrors.age && (
                  <p className="text-sm text-red-500">{t.validation[validationErrors.age as keyof typeof t.validation]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {t.gender} *
                </Label>
                <Select value={formData.gender} onValueChange={(value) => handleFieldChange('gender', value)}>
                  <SelectTrigger className={validationErrors.gender ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Sélectionnez votre genre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">{t.male}</SelectItem>
                    <SelectItem value="female">{t.female}</SelectItem>
                  </SelectContent>
                </Select>
                {validationErrors.gender && (
                  <p className="text-sm text-red-500">{t.validation[validationErrors.gender as keyof typeof t.validation]}</p>
                )}
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
                onChange={(e) => handleFieldChange('bio', e.target.value)}
                maxLength={500}
                className={validationErrors.bio ? 'border-red-500' : ''}
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>{formData.bio.length}/500 caractères</span>
                {validationErrors.bio && (
                  <span className="text-red-500">{t.validation[validationErrors.bio as keyof typeof t.validation]}</span>
                )}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.steps.preferences}</h2>
              <p className="text-gray-600">Dites-nous ce que vous recherchez</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {t.country} *
                </Label>
                <Select value={formData.country} onValueChange={(value) => handleFieldChange('country', value)}>
                  <SelectTrigger className={validationErrors.country ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Sélectionnez votre pays" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {validationErrors.country && (
                  <p className="text-sm text-red-500">{t.validation[validationErrors.country as keyof typeof t.validation]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="region" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {t.region}
                </Label>
                <RegionAutocomplete
                  country={formData.country}
                  value={formData.region}
                  onChange={(value) => handleFieldChange('region', value)}
                  placeholder="Sélectionnez votre région"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {t.city}
                </Label>
                <Input
                  id="city"
                  type="text"
                  placeholder={t.cityPlaceholder}
                  value={formData.city}
                  onChange={(e) => handleFieldChange('city', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="primaryLanguage" className="flex items-center gap-2">
                  <Languages className="w-4 h-4" />
                  {t.language}
                </Label>
                <Select value={formData.primaryLanguage} onValueChange={(value) => handleFieldChange('primaryLanguage', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="seekingGender" className="flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  {t.seekingGender}
                </Label>
                <Select value={formData.seekingGender} onValueChange={(value) => handleFieldChange('seekingGender', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">{t.male}</SelectItem>
                    <SelectItem value="female">{t.female}</SelectItem>
                    <SelectItem value="any">{t.any}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                {t.targetCountry}
              </Label>
              <div className="flex flex-wrap gap-2">
                {countries.map((country) => (
                  <Button
                    key={country}
                    type="button"
                    variant={formData.seekingCountry.includes(country) ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      const newCountries = formData.seekingCountry.includes(country)
                        ? formData.seekingCountry.filter(c => c !== country)
                        : [...formData.seekingCountry, country];
                      handleFieldChange('seekingCountry', newCountries);
                    }}
                  >
                    {country}
                  </Button>
                ))}
              </div>
              {formData.seekingCountry.length > 0 && (
                <p className="text-sm text-gray-600">
                  {formData.seekingCountry.length} pays sélectionné(s)
                </p>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.steps.interests}</h2>
              <p className="text-gray-600">Sélectionnez vos centres d'intérêt</p>
            </div>

            <EnhancedInterestsSelector
              selectedInterests={formData.interests}
              onInterestsChange={(interests) => handleFieldChange('interests', interests)}
            />
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Vérification finale</h2>
              <p className="text-gray-600">Vérifiez vos informations avant de créer votre compte</p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Informations personnelles</h3>
                  <p><strong>Nom:</strong> {formData.fullName}</p>
                  <p><strong>Email:</strong> {formData.email}</p>
                  <p><strong>Âge:</strong> {formData.age} ans</p>
                  <p><strong>Genre:</strong> {formData.gender === 'male' ? t.male : t.female}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Localisation</h3>
                  <p><strong>Pays:</strong> {formData.country}</p>
                  {formData.region && <p><strong>Région:</strong> {formData.region}</p>}
                  {formData.city && <p><strong>Ville:</strong> {formData.city}</p>}
                </div>
              </div>
              
              {formData.bio && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Biographie</h3>
                  <p className="text-gray-700">{formData.bio}</p>
                </div>
              )}

              {formData.interests.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Centres d'intérêt</h3>
                  <div className="flex flex-wrap gap-2">
                    {formData.interests.map((interest) => (
                      <Badge key={interest} variant="secondary">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 text-pink-500 mr-2" />
            <CardTitle className="text-3xl font-bold text-gray-900">{t.title}</CardTitle>
          </div>
          <CardDescription className="text-lg text-gray-600">
            {t.subtitle}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* ✅ NOUVELLE STRUCTURE: Barre de progression */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    step <= currentStep 
                      ? 'bg-pink-500 text-white' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {stepCompleted[step] ? <CheckCircle className="w-5 h-5" /> : step}
                  </div>
                  {step < 4 && (
                    <div className={`w-16 h-1 mx-2 ${
                      step < currentStep ? 'bg-pink-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <Progress value={(currentStep / 4) * 100} className="h-2" />
          </div>

          {/* ✅ NOUVELLE STRUCTURE: Contenu de l'étape */}
          <form onSubmit={handleSubmit}>
            {renderStep()}

            {/* ✅ NOUVELLE STRUCTURE: Navigation */}
            <div className="flex justify-between mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                {t.previous}
              </Button>

              {currentStep < 4 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600"
                >
                  {t.continue}
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <LoadingButton
                  type="submit"
                  loading={loading}
                  className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600"
                >
                  <Heart className="w-4 h-4" />
                  {t.finish}
                </LoadingButton>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {loading && <LoaderOverlay />}
    </div>
  );
}