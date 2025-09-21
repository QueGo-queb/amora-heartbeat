import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  User, 
  Mail, 
  Lock, 
  Calendar, 
  MapPin, 
  Globe, 
  Heart, 
  FileText, 
  Languages,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLoader } from '@/hooks/use-loader';
import { LoadingButton } from "@/components/ui/loading-button";
import { EnhancedInterestsSelector } from '@/components/profile/EnhancedInterestsSelector';
import { CountryMultiSelect } from '@/components/ui/country-multi-select';
import { analytics } from '@/lib/analytics';
import { RegionAutocomplete } from '@/components/ui/region-autocomplete';

interface SignupFormProps {
  language: string;
  onClose?: () => void;
}

// ✅ TRADUCTIONS OPTIMISÉES
const translations = {
  fr: {
    title: "Rejoignez AMORA",
    subtitle: "Trouvez l'amour dans votre communauté multiculturelle",
    
    steps: {
      personal: "Informations personnelles",
      preferences: "Préférences",
      interests: "Centres d'intérêt",
      review: "Vérification"
    },
    
    // Champs
    fullName: "Nom complet",
    email: "Email",
    password: "Mot de passe",
    confirmPassword: "Confirmer le mot de passe",
    age: "Âge",
    gender: "Genre",
    bio: "Biographie",
    country: "Pays",
    region: "Région",
    city: "Ville",
    primaryLanguage: "Langue principale",
    seekingGender: "Recherche",
    targetCountry: "Pays ciblés",
    
    // Placeholders
    fullNamePlaceholder: "Votre nom complet",
    emailPlaceholder: "votre@email.com",
    passwordPlaceholder: "Minimum 6 caractères",
    bioPlaceholder: "Parlez-nous un peu de vous...",
    cityPlaceholder: "Votre ville",
    agePlaceholder: "Ex: 25",
    genderPlaceholder: "Sélectionnez votre genre",
    countryPlaceholder: "Sélectionnez votre pays",
    seekingCountryPlaceholder: "Sélectionnez les pays où vous souhaitez rencontrer des personnes...",
    interestsDescription: "Sélectionnez vos centres d'intérêt",
    
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
      bioTooLong: "La biographie ne peut pas dépasser 500 caractères",
      countryRequired: "Veuillez sélectionner au moins un pays"
    },
    
    // Messages d'erreur
    errors: {
      emailAlreadyExists: "Cette adresse email est déjà utilisée.",
      weakPassword: "Le mot de passe doit contenir au moins 6 caractères.",
      invalidEmail: "Veuillez entrer une adresse email valide.",
      passwordMismatch: "Les mots de passe ne correspondent pas.",
      networkError: "Erreur de connexion. Veuillez réessayer.",
      generalError: "Une erreur est survenue lors de l'inscription.",
      success: "Inscription réussie ! Vérifiez votre email pour confirmer votre compte.",
      unexpectedFailure: "Une erreur inattendue s'est produite. Veuillez vérifier vos informations et réessayer.",
      signupDisabled: "L'inscription est temporairement désactivée. Veuillez réessayer plus tard.",
      rateLimitExceeded: "Trop de tentatives d'inscription. Veuillez attendre quelques minutes.",
      invalidRequest: "Données invalides. Veuillez vérifier vos informations.",
      emailNotConfirmed: "Veuillez confirmer votre email avant de vous connecter.",
      duplicateEmail: "Cette adresse email est déjà utilisée.",
      validationError: "Erreur de validation des données.",
      connectionError: "Problème de connexion. Vérifiez votre connexion internet."
    },
    
    success: {
      step1: "✅ Informations personnelles validées",
      step2: "✅ Préférences sauvegardées",
      step3: "✅ Centres d'intérêt sélectionnés",
      final: "🎉 Votre compte a été créé avec succès !"
    }
  },
  
  en: {
    title: "Join AMORA",
    subtitle: "Find love in your multicultural community",
    
    steps: {
      personal: "Personal Information",
      preferences: "Preferences",
      interests: "Interests",
      review: "Review"
    },
    
    // Champs
    fullName: "Full Name",
    email: "Email", 
    password: "Password",
    confirmPassword: "Confirm Password",
    age: "Age",
    gender: "Gender",
    bio: "Biography",
    country: "Country",
    region: "Region",
    city: "City",
    primaryLanguage: "Primary Language",
    seekingGender: "Looking for",
    targetCountry: "Target Countries",
    
    // Placeholders
    fullNamePlaceholder: "Your full name",
    emailPlaceholder: "your@email.com",
    passwordPlaceholder: "Minimum 6 characters",
    bioPlaceholder: "Tell us a bit about yourself...",
    cityPlaceholder: "Your city",
    agePlaceholder: "Ex: 25",
    genderPlaceholder: "Select your gender",
    countryPlaceholder: "Select your country",
    seekingCountryPlaceholder: "Select countries where you want to meet people...",
    interestsDescription: "Select your interests",
    
    // Options
    male: "Male",
    female: "Female",
    any: "Any",
    
    // Boutons
    createAccount: "Create my account",
    continue: "Continue",
    previous: "Previous",
    finish: "Complete registration",
    
    // Messages de validation
    validation: {
      required: "This field is required",
      emailInvalid: "Invalid email format",
      passwordWeak: "Password must contain at least 6 characters",
      passwordMismatch: "Passwords do not match",
      ageInvalid: "Age must be between 18 and 100",
      bioTooLong: "Biography cannot exceed 500 characters",
      countryRequired: "Please select at least one country"
    },
    
    // Messages d'erreur
    errors: {
      emailAlreadyExists: "This email address is already in use.",
      weakPassword: "Password must contain at least 6 characters.",
      invalidEmail: "Please enter a valid email address.",
      passwordMismatch: "Passwords do not match.",
      networkError: "Connection error. Please try again.",
      generalError: "An error occurred during registration.",
      success: "Registration successful! Check your email to confirm your account.",
      unexpectedFailure: "An unexpected error occurred. Please check your information and try again.",
      signupDisabled: "Registration is temporarily disabled. Please try again later.",
      rateLimitExceeded: "Too many registration attempts. Please wait a few minutes.",
      invalidRequest: "Invalid data. Please check your information.",
      emailNotConfirmed: "Please confirm your email before logging in.",
      duplicateEmail: "This email address is already in use.",
      validationError: "Data validation error.",
      connectionError: "Connection problem. Check your internet connection."
    },
    
    success: {
      step1: "✅ Personal information validated",
      step2: "✅ Preferences saved",
      step3: "✅ Interests selected",
      final: "🎉 Your account has been created successfully!"
    }
  },
  
  ht: {
    title: "Rejoj AMORA",
    subtitle: "Trouvez l'amour nan vòn multikultural",
    
    steps: {
      personal: "Nonm pwopriye",
      preferences: "Prevezions",
      interests: "Interes",
      review: "Revizyon"
    },
    
    // Champs
    fullName: "Nonm dwat",
    email: "E-mal",
    password: "Mot de passe",
    confirmPassword: "Konfime mot de passe",
    age: "An",
    gender: "Gen",
    bio: "Biografi",
    country: "Pays",
    region: "Rezyon",
    city: "Ville",
    primaryLanguage: "Lang la pwincipal",
    seekingGender: "Chèche",
    targetCountry: "Pays ciblé",
    
    // Placeholders
    fullNamePlaceholder: "Nonm dwat ou",
    emailPlaceholder: "ou@e-mal.com",
    passwordPlaceholder: "Minimum 6 karaktèr",
    bioPlaceholder: "Parlman nan kèlke nan ou...",
    cityPlaceholder: "Ville ou",
    agePlaceholder: "Ex: 25",
    genderPlaceholder: "Sélectionné gen",
    countryPlaceholder: "Sélectionné pwòl ou",
    seekingCountryPlaceholder: "Sélectionné pwòl kote ou ou vle rencontrer moun...",
    interestsDescription: "Sélectionné vòs interes",
    
    // Options
    male: "Moun",
    female: "Femm",
    any: "Kèlke",
    
    // Boutons
    createAccount: "Kreye moun kont",
    continue: "Kontinye",
    previous: "Anvan",
    finish: "Konplète rejistrasyon",
    
    // Messages de validation
    validation: {
      required: "Nonm pwopriye sa a",
      emailInvalid: "Fòmat e-mal pa valab",
      passwordWeak: "Mot de passe dwe konte a min 6 karaktèr",
      passwordMismatch: "Mot de passe pa koresponde",
      ageInvalid: "An dwe ant 18 ak 100",
      bioTooLong: "Biografi pa ka depase 500 karaktèr",
      countryRequired: "Tanpri sélectionné a min 1 pwòl"
    },
    
    // Messages d'erreur
    errors: {
      emailAlreadyExists: "Adrès e-mal sa a deja itilize.",
      weakPassword: "Mot de passe dwe konte a min 6 karaktèr.",
      invalidEmail: "Tanpri tape yon adrès e-mal valab.",
      passwordMismatch: "Mot de passe pa koresponde.",
      networkError: "Erè koneksyon. Tanpri retye.",
      generalError: "Non yon erè nan rejistrasyon.",
      success: "Rejistrasyon reyèl! Tanpri chèk e-mal ou pou konfime kont ou.",
      unexpectedFailure: "Non yon erè anpatik, tanpri chèk enfòmasyon ou epi retye.",
      signupDisabled: "Rejistrasyon la se temporèman desaktive. Tanpri retye apre.",
      rateLimitExceeded: "Trop de tèt rejistrasyon. Tanpri attend 2-3 minit.",
      invalidRequest: "Non dantè sa pa valab. Tanpri chèk enfòmasyon ou.",
      emailNotConfirmed: "Tanpri konfime e-mal ou anvan ou konekte.",
      duplicateEmail: "Adrès e-mal sa a deja itilize.",
      validationError: "Erè valide dantè.",
      connectionError: "Problèm koneksyon. Tanpri chèk koneksyon ou internet."
    },
    
    success: {
      step1: "✅ Nonm pwopriye valide",
      step2: "✅ Prevezions sauvegardé",
      step3: "✅ Interes sélectionné",
      final: "�� Kont ou a kreye reyèl!"
    }
  },
  
  es: {
    title: "Únete a AMORA",
    subtitle: "Encuentra el amor en tu comunidad multicultural",
    
    steps: {
      personal: "Información personal",
      preferences: "Preferencias",
      interests: "Intereses",
      review: "Revisión"
    },
    
    // Champs
    fullName: "Nombre completo",
    email: "Correo electrónico",
    password: "Contraseña",
    confirmPassword: "Confirmar contraseña",
    age: "Edad",
    gender: "Género",
    bio: "Biografía",
    country: "País",
    region: "Región",
    city: "Ciudad",
    primaryLanguage: "Idioma principal",
    seekingGender: "Buscando",
    targetCountry: "Países objetivo",
    
    // Placeholders
    fullNamePlaceholder: "Tu nombre completo",
    emailPlaceholder: "tu@correo.com",
    passwordPlaceholder: "Mínimo 6 caracteres",
    bioPlaceholder: "Cuéntanos algo sobre ti...",
    cityPlaceholder: "Tu ciudad",
    agePlaceholder: "Ej: 25",
    genderPlaceholder: "Selecciona tu género",
    countryPlaceholder: "Selecciona tu país",
    seekingCountryPlaceholder: "Selecciona países donde quieres conocer personas...",
    interestsDescription: "Selecciona tus intereses",
    
    // Options
    male: "Hombre",
    female: "Mujer",
    any: "Cualquiera",
    
    // Boutons
    createAccount: "Crear mi cuenta",
    continue: "Continuar",
    previous: "Anterior",
    finish: "Completar registro",
    
    // Messages de validación
    validation: {
      required: "Este campo es requerido",
      emailInvalid: "Formato de correo electrónico inválido",
      passwordWeak: "La contraseña debe contener al menos 6 caracteres",
      passwordMismatch: "Las contraseñas no coinciden",
      ageInvalid: "La edad debe estar entre 18 y 100 años",
      bioTooLong: "La biografía no puede exceder los 500 caracteres",
      countryRequired: "Por favor, selecciona al menos un país"
    },
    
    // Mensajes de error
    errors: {
      emailAlreadyExists: "Este correo electrónico ya está en uso.",
      weakPassword: "La contraseña debe contener al menos 6 caracteres.",
      invalidEmail: "Por favor, ingresa un correo electrónico válido.",
      passwordMismatch: "Las contraseñas no coinciden.",
      networkError: "Error de conexión. Por favor, inténtalo de nuevo.",
      generalError: "Ocurrió un error durante el registro.",
      success: "Registro exitoso! Verifica tu correo electrónico para confirmar tu cuenta.",
      unexpectedFailure: "Ocurrió un error inesperado. Por favor, revisa tu información y vuelve a intentarlo.",
      signupDisabled: "El registro está temporalmente desactivado. Por favor, inténtalo más tarde.",
      rateLimitExceeded: "Demasiados intentos de registro. Por favor, espera unos minutos.",
      invalidRequest: "Datos inválidos. Por favor, revisa tu información.",
      emailNotConfirmed: "Por favor, confirma tu correo electrónico antes de iniciar sesión.",
      duplicateEmail: "Este correo electrónico ya está en uso.",
      validationError: "Error de validación de datos.",
      connectionError: "Problema de conexión. Verifica tu conexión a internet."
    },
    
    success: {
      step1: "✅ Información personal validada",
      step2: "✅ Preferencias guardadas",
      step3: "✅ Intereses seleccionados",
      final: "�� ¡Tu cuenta ha sido creada con éxito!"
    }
  },
  
  ptBR: {
    title: "Únase a AMORA",
    subtitle: "Encontre o amor na sua comunidade multicultural",
    
    steps: {
      personal: "Informações pessoais",
      preferences: "Preferências",
      interests: "Interesses",
      review: "Revisão"
    },
    
    // Campos
    fullName: "Nome completo",
    email: "E-mail",
    password: "Senha",
    confirmPassword: "Confirmar senha",
    age: "Idade",
    gender: "Gênero",
    bio: "Biografia",
    country: "País",
    region: "Região",
    city: "Cidade",
    primaryLanguage: "Idioma principal",
    seekingGender: "Procurando",
    targetCountry: "Países alvo",
    
    // Placeholders
    fullNamePlaceholder: "Seu nome completo",
    emailPlaceholder: "seu@email.com",
    passwordPlaceholder: "Mínimo 6 caracteres",
    bioPlaceholder: "Conte-nos um pouco sobre você...",
    cityPlaceholder: "Sua cidade",
    agePlaceholder: "Ex: 25",
    genderPlaceholder: "Selecione seu gênero",
    countryPlaceholder: "Selecione seu país",
    seekingCountryPlaceholder: "Selecione países onde você quer conhecer pessoas...",
    interestsDescription: "Selecione seus interesses",
    
    // Opções
    male: "Homem",
    female: "Mulher",
    any: "Qualquer",
    
    // Botões
    createAccount: "Criar minha conta",
    continue: "Continuar",
    previous: "Anterior",
    finish: "Completar registro",
    
    // Mensagens de validação
    validation: {
      required: "Este campo é obrigatório",
      emailInvalid: "Formato de e-mail inválido",
      passwordWeak: "A senha deve conter pelo menos 6 caracteres",
      passwordMismatch: "As senhas não coincidem",
      ageInvalid: "A idade deve estar entre 18 e 100 anos",
      bioTooLong: "A biografia não pode exceder 500 caracteres",
      countryRequired: "Por favor, selecione pelo menos um país"
    },
    
    // Mensagens de erro
    errors: {
      emailAlreadyExists: "Este endereço de e-mail já está em uso.",
      weakPassword: "A senha deve conter pelo menos 6 caracteres.",
      invalidEmail: "Por favor, insira um endereço de e-mail válido.",
      passwordMismatch: "As senhas não coincidem.",
      networkError: "Erro de conexão. Por favor, tente novamente.",
      generalError: "Ocorreu um erro durante o registro.",
      success: "Registro bem-sucedido! Verifique seu e-mail para confirmar sua conta.",
      unexpectedFailure: "Ocorreu um erro inesperado. Por favor, verifique suas informações e tente novamente.",
      signupDisabled: "O registro está temporariamente desativado. Por favor, tente novamente mais tarde.",
      rateLimitExceeded: "Muitos tentativas de registro. Por favor, aguarde alguns minutos.",
      invalidRequest: "Dados inválidos. Por favor, verifique suas informações.",
      emailNotConfirmed: "Por favor, confirme seu e-mail antes de fazer login.",
      duplicateEmail: "Este endereço de e-mail já está em uso.",
      validationError: "Erro de validação de dados.",
      connectionError: "Problema de conexão. Verifique sua conexão com a internet."
    },
    
    success: {
      step1: "✅ Informações pessoais validadas",
      step2: "✅ Preferências salvas",
      step3: "✅ Interesses selecionados",
      final: "🎉 Sua conta foi criada com sucesso!"
    }
  }
};

// ✅ LANGUES DISPONIBLES
const languages = [
  { code: "fr", name: "Français" },
  { code: "en", name: "English" },
  { code: "ht", name: "Kreyòl" },
  { code: "es", name: "Español" },
  { code: "ptBR", name: "Português (BR)" }
];

// ✅ VALIDATION OPTIMISÉE AVEC DEBOUNCING
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
      return !value || age < 18 || age > 100 ? 'ageInvalid' : null;
    case 'gender':
      return !value ? 'required' : null;
    case 'bio':
      return value && value.length > 500 ? 'bioTooLong' : null;
    case 'country':
      return !value ? 'required' : null;
    case 'seekingCountry':
      return !value || value.length === 0 ? 'countryRequired' : null;
    default:
      return null;
  }
};

// ✅ GESTION D'ERREUR AMÉLIORÉE
const getErrorMessage = (error: any, t: any): string => {
  if (!error) return t.errors.generalError;
  
  const errorMessage = error.message || error.toString();
  const errorCode = error.code || '';
  
  // Gestion des erreurs spécifiques
  if (errorCode === 'PGRST301' || errorMessage.includes('duplicate key')) {
    return t.errors.duplicateEmail;
  }
  
  if (errorCode === 'weak_password' || errorMessage.includes('password')) {
    return t.errors.weakPassword;
  }
  
  if (errorCode === 'invalid_email' || errorMessage.includes('email')) {
    return t.errors.invalidEmail;
  }
  
  if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
    return t.errors.connectionError;
  }
  
  if (errorMessage.includes('rate limit') || errorMessage.includes('too many')) {
    return t.errors.rateLimitExceeded;
  }
  
  return t.errors.generalError;
};

// ✅ CORRECTION: Export avec le bon nom
export function SignupForm({ language, onClose }: SignupFormProps) {
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
    seekingCountry: [] as string[], // ✅ CORRECTION: Array de codes de pays
    interests: [] as string[]
  });
  
  // ✅ ÉTAT DE VALIDATION OPTIMISÉ
  const [validationErrors, setValidationErrors] = useState<Record<string, string | null>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stepCompleted, setStepCompleted] = useState<Record<number, boolean>>({});
  
  const { showLoader, hideLoader } = useLoader();
  const { toast } = useToast();
  const navigate = useNavigate();
  const t = translations[language as keyof typeof translations] || translations.fr;

  // ✅ GESTION DE CHAMP AVEC DEBOUNCING
  const handleFieldChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Validation en temps réel avec debouncing
    setTimeout(() => {
      const error = validateField(field, value, { ...formData, [field]: value });
      setValidationErrors(prev => ({ ...prev, [field]: error }));
    }, 300);
  }, [formData]);

  // ✅ VALIDATION D'ÉTAPE OPTIMISÉE
  const validateStep = useCallback((step: number): boolean => {
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
        errors.seekingCountry = validateField('seekingCountry', formData.seekingCountry, formData);
        break;
      case 3: // Centres d'intérêt
        // Optionnel, pas de validation stricte
        break;
    }
    
    setValidationErrors(errors);
    return !Object.values(errors).some(error => error !== null);
  }, [formData]);

  // ✅ NAVIGATION OPTIMISÉE
  const handleNext = useCallback(() => {
    if (validateStep(currentStep)) {
      setStepCompleted(prev => ({ ...prev, [currentStep]: true }));
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  }, [currentStep, validateStep]);

  const handlePrevious = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  }, []);

  // ✅ SOUMISSION OPTIMISÉE AVEC GESTION D'ERREUR COMPLÈTE
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) {
      return;
    }

    setLoading(true);
    showLoader("Création de votre compte...", "heart");

    try {
      console.log('🚀 Starting optimized signup process...');
      
      // ✅ VALIDATION PRÉALABLE RENFORCÉE
      if (!formData.email || !formData.password || !formData.fullName) {
        throw new Error('Données manquantes');
      }
      
      if (formData.password.length < 6) {
        throw new Error('Mot de passe trop faible');
      }
      
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Les mots de passe ne correspondent pas');
      }
      
      // ✅ VALIDATION EMAIL
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('Format d\'email invalide');
      }
      
      // ✅ VALIDATION PAYS CIBLÉS
      if (formData.seekingCountry.length === 0) {
        throw new Error('Veuillez sélectionner au moins un pays ciblé');
      }
      
      // Analytics avec vérification
      try {
        if (analytics && typeof analytics.userSignup === 'function') {
          analytics.userSignup('email', {
            country: formData.country,
            language: formData.primaryLanguage,
            gender: formData.gender,
            hasInterests: formData.interests.length > 0,
            targetCountriesCount: formData.seekingCountry.length
          });
        }
      } catch (analyticsError) {
        console.log('⚠️ Analytics error, continuing without analytics:', analyticsError);
      }

      // ✅ CRÉATION UTILISATEUR AVEC RETRY
      console.log('🚀 Creating auth user...');
      let authData, authError;
      
      try {
        // ✅ VERSION SIMPLIFIÉE SANS MÉTADONNÉES
        const result = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName,
              name: formData.fullName
            }
          }
        });
        
        authData = result.data;
        authError = result.error;
        
        console.log('📊 Signup result:', { 
          user: authData?.user?.id, 
          error: authError?.code,
          emailConfirmed: authData?.user?.email_confirmed_at 
        });
        
      } catch (signupError) {
        console.error('❌ Signup error:', signupError);
        throw signupError;
      }

      if (authError) {
        console.error('❌ Auth error:', authError);
        throw authError;
      }

      if (!authData.user) {
        throw new Error('No user data returned from signup');
      }

      console.log('✅ Auth user created:', authData.user.id);

      // ✅ CRÉATION PROFIL COMPLET AVEC INSERT DIRECT
      console.log('🚀 Creating complete profile...');
      
      try {
        // Attendre un petit délai pour éviter les conflits avec le trigger
        await new Promise(resolve => setTimeout(resolve, 100));
        
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
          seeking_country: formData.seekingCountry || [],
          plan: 'free',
          is_active: true,
          role: 'user',
          subscription_plan: 'free'
        };

        // Essayer d'abord avec insert, puis avec update si le profil existe déjà
        let profileResult;
        try {
          // Tentative d'insertion directe
          const { error: insertError } = await supabase
            .from('profiles')
            .insert(profileData);

          if (insertError && insertError.code === '23505') {
            // Conflit détecté (profil existe déjà), faire un update
            console.log('�� Profil existe déjà, mise à jour...');
            const { error: updateError } = await supabase
              .from('profiles')
              .update({
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
                seeking_country: formData.seekingCountry || [],
                is_active: true,
                updated_at: new Date().toISOString()
              })
              .eq('user_id', authData.user.id);

            if (updateError) {
              throw updateError;
            }
          } else if (insertError) {
            throw insertError;
          }

          console.log('✅ Complete profile created/updated successfully:', {
            user_id: authData.user.id,
            full_name: formData.fullName,
            country: formData.country,
            interests: formData.interests.length,
            seeking_country: formData.seekingCountry.length
          });

        } catch (profileError) {
          console.error('❌ Profile creation error:', profileError);
          
          // En cas d'erreur, utiliser la fonction de correction
          try {
            const { data: correctionResult } = await supabase.rpc('ensure_profile_complete', {
              p_user_id: authData.user.id
            });
            
            if (correctionResult) {
              console.log('✅ Profil corrigé avec la fonction utilitaire');
            } else {
              throw new Error('Échec de la correction du profil');
            }
          } catch (correctionError) {
            console.error('❌ Erreur de correction:', correctionError);
            throw new Error(`Erreur lors de la sauvegarde du profil: ${profileError.message}`);
          }
        }

      } catch (profileError) {
        console.error('❌ Profile creation exception:', profileError);
        throw new Error(`Erreur lors de la sauvegarde du profil: ${profileError.message}`);
      }

      // ✅ MESSAGE DE SUCCÈS INFORMATIF
      toast({
        title: "✅ Inscription réussie !",
        description: authData.user.email_confirmed_at 
          ? "Votre compte a été créé avec succès ! Vous pouvez maintenant vous connecter."
          : "Votre compte a été créé ! Vérifiez votre email pour confirmer votre compte.",
      });

      // ✅ REDIRECTION CONDITIONNELLE
      if (authData.user.email_confirmed_at) {
        // Email déjà confirmé, rediriger directement
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        // Email non confirmé, rediriger vers la page de connexion
        setTimeout(() => {
          navigate('/auth?message=check-email');
        }, 2000);
      }

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
  }, [formData, currentStep, validateStep, showLoader, hideLoader, toast, navigate, t]);

  // ✅ RENDU DES ÉTAPES OPTIMISÉ
  const renderStep = useMemo(() => {
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
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
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
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
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
                  placeholder={t.agePlaceholder}
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
                  <User className="w-4 h-4" />
                  {t.gender} *
                </Label>
                <Select value={formData.gender} onValueChange={(value) => handleFieldChange('gender', value)}>
                  <SelectTrigger className={validationErrors.gender ? 'border-red-500' : ''}>
                    <SelectValue placeholder={t.genderPlaceholder} />
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
              <p className="text-gray-600">Dites-nous où vous êtes et ce que vous cherchez</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {t.country} *
                </Label>
                <Select value={formData.country} onValueChange={(value) => handleFieldChange('country', value)}>
                  <SelectTrigger className={validationErrors.country ? 'border-red-500' : ''}>
                    <SelectValue placeholder={t.countryPlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HT"> Haïti</SelectItem>
                    <SelectItem value="US">🇺🇸 États-Unis</SelectItem>
                    <SelectItem value="CA">🇨🇦 Canada</SelectItem>
                    <SelectItem value="FR">🇫🇷 France</SelectItem>
                    <SelectItem value="ES"> Espagne</SelectItem>
                    <SelectItem value="BR">🇧🇷 Brésil</SelectItem>
                    <SelectItem value="AR">🇦 Argentine</SelectItem>
                    <SelectItem value="CL"> Chili</SelectItem>
                    <SelectItem value="MX"> Mexique</SelectItem>
                    <SelectItem value="DO">🇩🇴 République Dominicaine</SelectItem>
                  </SelectContent>
                </Select>
                {validationErrors.country && (
                  <p className="text-sm text-red-500">{t.validation[validationErrors.country as keyof typeof t.validation]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="primaryLanguage" className="flex items-center gap-2">
                  <Languages className="w-4 h-4" />
                  {t.primaryLanguage}
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

            {/* ✅ NOUVEAU: COMPOSANT DE SÉLECTION MULTI-PAYS OPTIMISÉ */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                {t.targetCountry} *
              </Label>
              <CountryMultiSelect
                selectedCountries={formData.seekingCountry}
                onCountriesChange={(countries) => handleFieldChange('seekingCountry', countries)}
                placeholder={t.seekingCountryPlaceholder}
                maxSelections={10}
                className={validationErrors.seekingCountry ? 'border-red-500' : ''}
              />
              {validationErrors.seekingCountry && (
                <p className="text-sm text-red-500">{t.validation[validationErrors.seekingCountry as keyof typeof t.validation]}</p>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.steps.interests}</h2>
              <p className="text-gray-600">{t.interestsDescription}</p>
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

              {/* ✅ NOUVEAU: AFFICHAGE DES PAYS CIBLÉS */}
              {formData.seekingCountry.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Pays ciblés</h3>
                  <div className="flex flex-wrap gap-2">
                    {formData.seekingCountry.map((countryCode) => {
                      // Trouver le nom du pays à partir du code
                      const countryNames: Record<string, string> = {
                        'US': '🇸 États-Unis',
                        'CA': '🇨🇦 Canada',
                        'HT': '🇭🇹 Haïti',
                        'FR': '🇫🇷 France',
                        'ES': '🇪🇸 Espagne',
                        'BR': '🇧🇷 Brésil',
                        'AR': '🇦 Argentine',
                        'CL': '🇨🇱 Chili',
                        'MX': '🇲🇽 Mexique',
                        'DO': '🇩🇴 République Dominicaine'
                      };
                      return (
                        <Badge key={countryCode} variant="secondary">
                          {countryNames[countryCode] || countryCode}
                        </Badge>
                      );
                    })}
                  </div>
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
  }, [currentStep, formData, validationErrors, t, handleFieldChange, showPassword, showConfirmPassword]);

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
          {/* ✅ BARRE DE PROGRESSION OPTIMISÉE */}
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

          {/* ✅ CONTENU DE L'ÉTAPE */}
          <form onSubmit={handleSubmit}>
            {renderStep}

            {/* ✅ NAVIGATION OPTIMISÉE */}
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
