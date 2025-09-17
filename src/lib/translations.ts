// ✅ NOUVEAU SYSTÈME SIMPLE - Remplace complètement i18n
export const translations = {
  fr: {
    // Textes communs
    loading: 'Chargement...',
    error: 'Une erreur est survenue',
    save: 'Enregistrer',
    cancel: 'Annuler',
    delete: 'Supprimer',
    edit: 'Modifier',
    back: 'Retour',
    next: 'Suivant',
    retry: 'Réessayer',
    
    // Authentification
    login: 'Connexion',
    signup: 'Inscription',
    logout: 'Déconnexion',
    email: 'Email',
    password: 'Mot de passe',
    forgotPassword: 'Mot de passe oublié ?',
    
    // Dashboard
    welcome: 'Bienvenue sur AMORA',
    newMessages: 'Nouveaux messages',
    newMatches: 'Nouveaux matchs',
    recentActivity: 'Activité récente',
    
    // Navigation
    home: 'Accueil',
    search: 'Recherche',
    messages: 'Messages',
    visits: 'Visites',
    likes: 'J\'aime',
    favorites: 'Favoris',
    videoChat: 'Chat vidéo',
    matching: 'Correspondances',
    profile: 'Profil',
    settings: 'Paramètres',
    help: 'Centre d\'aide',
    
    // Erreurs
    generalError: 'Une erreur est survenue',
    networkError: 'Erreur de connexion',
    validationError: 'Données invalides',
    unauthorizedError: 'Accès non autorisé',
    notFoundError: 'Page non trouvée',
    
    // Succès
    saved: 'Enregistré avec succès',
    updated: 'Mis à jour avec succès',
    deleted: 'Supprimé avec succès'
  },
  
  en: {
    // Common texts
    loading: 'Loading...',
    error: 'An error occurred',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    back: 'Back',
    next: 'Next',
    retry: 'Retry',
    
    // Authentication
    login: 'Login',
    signup: 'Sign up',
    logout: 'Logout',
    email: 'Email',
    password: 'Password',
    forgotPassword: 'Forgot password?',
    
    // Dashboard
    welcome: 'Welcome to AMORA',
    newMessages: 'New messages',
    newMatches: 'New matches',
    recentActivity: 'Recent activity',
    
    // Navigation
    home: 'Home',
    search: 'Search',
    messages: 'Messages',
    visits: 'Visits',
    likes: 'Likes',
    favorites: 'Favorites',
    videoChat: 'Video Chat',
    matching: 'Matches',
    profile: 'Profile',
    settings: 'Settings',
    help: 'Help Center',
    
    // Errors
    generalError: 'An error occurred',
    networkError: 'Connection error',
    validationError: 'Invalid data',
    unauthorizedError: 'Unauthorized access',
    notFoundError: 'Page not found',
    
    // Success
    saved: 'Successfully saved',
    updated: 'Successfully updated',
    deleted: 'Successfully deleted'
  }
};

// Hook simple pour les traductions
export const useTranslation = (lang: string = 'fr') => {
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[lang] || translations.fr;
    
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) {
        // Fallback vers français si la clé n'existe pas
        value = translations.fr;
        for (const fallbackKey of keys) {
          value = value?.[fallbackKey];
        }
        break;
      }
    }
    
    return value || key; // Retourne la clé si aucune traduction trouvée
  };
  
  return { t };
};

// Fonction utilitaire pour changer la langue
export const setLanguage = (lang: string) => {
  localStorage.setItem('amora_language', lang);
  window.location.reload(); // Rechargement simple pour appliquer la langue
};

// Fonction pour récupérer la langue actuelle
export const getCurrentLanguage = (): string => {
  return localStorage.getItem('amora_language') || 'fr';
};
