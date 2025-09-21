/**
 * Hook de traduction global simple
 * Remplace Google Translate par un système manuel fiable
 */

import { useLanguage } from '@/contexts/LanguageContext';

// Traductions centralisées pour TOUTE l'interface utilisateur
const globalTranslations = {
  fr: {
    // Navigation et commun
    welcome: "Bienvenue",
    back: "Retour",
    save: "Sauvegarder",
    cancel: "Annuler",
    edit: "Modifier",
    delete: "Supprimer",
    loading: "Chargement...",
    error: "Erreur",
    success: "Succès",
    
    // Dashboard
    welcomeUser: "Bienvenue, {user} ! 👋",
    discoverCommunity: "Découvrez votre communauté multiculturelle et trouvez l'amour sans frontières.",
    createPost: "Créer une publication",
    culturalSpace: "🎭 Espace Culturel",
    discoverEvents: "Découvrez les événements culturels près de chez vous",
    exploreEvents: "Explorer les événements",
    postCreated: "Publication créée !",
    postCreatedDesc: "Votre post a été publié avec succès.",
    newPost: "Nouvelle publication",
    notConnected: "Non connecté",
    
    // CreatePostModal
    editPost: "Modifier la publication",
    publish: "Publier", 
    update: "Mettre à jour",
    saving: "Enregistrement...",
    postPlaceholder: "Que voulez-vous partager avec la communauté ?",
    feedTitle: "📱 Fil d'actualité",
    feedSubtitle: "Découvrez les dernières publications",
    feed: "Fil d'actualité",
    matching: "Correspondances",
    
    // Messages
    messages: "Messages",
    backToFeed: "Retour au fil d'actualité",
    
    // Profile
    myProfile: "Mon Profil",
    editProfile: "Modifier le profil",
    profileUpdated: "✅ Profil actualisé",
    profileUpdatedDesc: "Les données ont été rechargées avec succès.",
    profileError: "❌ Erreur",
    profileErrorDesc: "Impossible de rafraîchir le profil.",
    loadingProfile: "Chargement du profil...",
    profileLoadError: "Erreur lors du chargement du profil",
    
    // Settings
    settings: "Paramètres",
    preferredLanguage: "Langue préférée",
    notifications: "Notifications",
    pushNotifications: "Notifications push",
    emailNotifications: "Notifications par email",
    pushNotificationsDesc: "Recevoir des notifications sur votre appareil",
    emailNotificationsDesc: "Recevoir des emails pour les événements importants",
    settingsSaved: "Paramètres sauvegardés",
    settingsSavedDesc: "Vos modifications ont été enregistrées avec succès",

    // Navigation
    home: "Accueil",
    search: "Recherche", 
    messages: "Messages",
    visits: "Visites",
    likes: "J'aime",
    favorites: "Favoris",
    chatOnline: "Chat en ligne",
    matches: "Correspondances",
    profile: "Profil",
    myPosts: "Mes Publications",
    settings: "Paramètres",
    helpCenter: "Centre d'aide",
    emailSupport: "Support par email",
    logout: "Déconnexion",
    logoutSuccess: "Déconnexion réussie",
    logoutSuccessDesc: "Vous avez été déconnecté avec succès"
  },
  
  en: {
    // Navigation et commun
    welcome: "Welcome",
    back: "Back",
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    
    // Dashboard
    welcomeUser: "Welcome, {user}! 👋",
    discoverCommunity: "Discover your multicultural community and find love without borders.",
    createPost: "Create a post",
    culturalSpace: "🎭 Cultural Space",
    discoverEvents: "Discover cultural events near you",
    exploreEvents: "Explore events",
    postCreated: "Post created!",
    postCreatedDesc: "Your post has been published successfully.",
    newPost: "New post",
    notConnected: "Not connected",
    
    // CreatePostModal
    editPost: "Edit post",
    publish: "Publish",
    update: "Update",
    saving: "Saving...",
    postPlaceholder: "What do you want to share with the community?",
    feedTitle: "📱 Fil d'actualité",
    feedSubtitle: "Découvrez les dernières publications",
    feed: "Feed",
    matching: "Matches",
    
    // Messages
    messages: "Messages",
    backToFeed: "Back to feed",
    
    // Profile
    myProfile: "My Profile",
    editProfile: "Edit profile",
    profileUpdated: "✅ Profile updated",
    profileUpdatedDesc: "Data has been reloaded successfully.",
    profileError: "❌ Error",
    profileErrorDesc: "Unable to refresh profile.",
    loadingProfile: "Loading profile...",
    profileLoadError: "Error loading profile",
    
    // Settings
    settings: "Settings",
    preferredLanguage: "Preferred language",
    notifications: "Notifications",
    pushNotifications: "Push notifications",
    emailNotifications: "Email notifications",
    pushNotificationsDesc: "Receive notifications on your device",
    emailNotificationsDesc: "Receive emails for important events",
    settingsSaved: "Settings saved",
    settingsSavedDesc: "Your changes have been saved successfully",

    // Navigation
    home: "Home",
    search: "Search",
    messages: "Messages", 
    visits: "Visits",
    likes: "Likes",
    favorites: "Favorites",
    chatOnline: "Live Chat",
    matches: "Matches",
    profile: "Profile",
    myPosts: "My Posts",
    settings: "Settings",
    helpCenter: "Help Center",
    emailSupport: "Email Support",
    logout: "Logout",
    logoutSuccess: "Logout Successful",
    logoutSuccessDesc: "You have been logged out successfully"
  },
  
  es: {
    // Navigation et commun
    welcome: "Bienvenido",
    back: "Atrás",
    save: "Guardar",
    cancel: "Cancelar",
    edit: "Editar",
    delete: "Eliminar",
    loading: "Cargando...",
    error: "Error",
    success: "Éxito",
    
    // Dashboard
    welcomeUser: "¡Bienvenido, {user}! 👋",
    discoverCommunity: "Descubre tu comunidad multicultural y encuentra el amor sin fronteras.",
    createPost: "Crear una publicación",
    culturalSpace: "🎭 Espacio Cultural",
    discoverEvents: "Descubre eventos culturales cerca de ti",
    exploreEvents: "Explorar eventos",
    postCreated: "¡Publicación creada!",
    postCreatedDesc: "Tu publicación se ha publicado exitosamente.",
    
    // CreatePostModal
    editPost: "Editar publicación",
    publish: "Publicar",
    update: "Actualizar",
    saving: "Guardando...",
    postPlaceholder: "¿Qué quieres compartir con la comunidad?",
    feedTitle: "�� Fil d'actualité",
    feedSubtitle: "Découvrez les dernières publications",
    feed: "Feed",
    matching: "Coincidencias",
    
    // Messages
    messages: "Mensajes",
    backToFeed: "Volver al feed",
    
    // Profile
    myProfile: "Mi Perfil",
    editProfile: "Editar perfil",
    profileUpdated: "✅ Perfil actualizado",
    profileUpdatedDesc: "Los datos se han recargado exitosamente.",
    profileError: "❌ Error",
    profileErrorDesc: "No se pudo actualizar el perfil.",
    loadingProfile: "Cargando perfil...",
    profileLoadError: "Error al cargar el perfil",
    
    // Settings
    settings: "Configuración",
    preferredLanguage: "Idioma preferido",
    notifications: "Notificaciones",
    pushNotifications: "Notificaciones push",
    emailNotifications: "Notificaciones por email",
    pushNotificationsDesc: "Recibir notificaciones en tu dispositivo",
    emailNotificationsDesc: "Recibir emails para eventos importantes",
    settingsSaved: "Configuración guardada",
    settingsSavedDesc: "Tus cambios han sido guardados exitosamente",

    // Navigation
    home: "Inicio",
    search: "Buscar",
    messages: "Mensajes",
    visits: "Visitas", 
    likes: "Me gusta",
    favorites: "Favoritos",
    chatOnline: "Chat en vivo",
    matches: "Coincidencias",
    profile: "Perfil",
    myPosts: "Mis Publicaciones",
    settings: "Configuración",
    helpCenter: "Centro de Ayuda",
    emailSupport: "Soporte por Email",
    logout: "Cerrar Sesión",
    logoutSuccess: "Cierre de Sesión Exitoso",
    logoutSuccessDesc: "Has cerrado sesión exitosamente"
  },
  
  pt: {
    // Navigation et commun
    welcome: "Bem-vindo",
    back: "Voltar",
    save: "Salvar",
    cancel: "Cancelar",
    edit: "Editar",
    delete: "Excluir",
    loading: "Carregando...",
    error: "Erro",
    success: "Sucesso",
    
    // Dashboard
    welcomeUser: "Bem-vindo, {user}! 👋",
    discoverCommunity: "Descubra sua comunidade multicultural e encontre o amor sem fronteiras.",
    createPost: "Criar uma publicação",
    culturalSpace: "🎭 Espaço Cultural",
    discoverEvents: "Descubra eventos culturais perto de você",
    exploreEvents: "Explorar eventos",
    postCreated: "Publicação criada!",
    postCreatedDesc: "Sua publicação foi publicada com sucesso.",
    
    // CreatePostModal
    editPost: "Editar publicação",
    publish: "Publicar",
    update: "Atualizar",
    saving: "Salvando...",
    postPlaceholder: "O que você quer compartilhar com a comunidade?",
    feedTitle: "�� Fil d'actualité",
    feedSubtitle: "Découvrez les dernières publications",
    feed: "Feed",
    matching: "Correspondências",
    
    // Messages
    messages: "Mensagens",
    backToFeed: "Voltar ao feed",
    
    // Profile
    myProfile: "Meu Perfil",
    editProfile: "Editar perfil",
    profileUpdated: "✅ Perfil atualizado",
    profileUpdatedDesc: "Os dados foram recarregados com sucesso.",
    profileError: "❌ Erro",
    profileErrorDesc: "Não foi possível atualizar o perfil.",
    loadingProfile: "Carregando perfil...",
    profileLoadError: "Erro ao carregar perfil",
    
    // Settings
    settings: "Configurações",
    preferredLanguage: "Idioma preferido",
    notifications: "Notificações",
    pushNotifications: "Notificações push",
    emailNotifications: "Notificações por email",
    pushNotificationsDesc: "Receber notificações no seu dispositivo",
    emailNotificationsDesc: "Receber emails para eventos importantes",
    settingsSaved: "Configurações salvas",
    settingsSavedDesc: "Suas alterações foram salvas com sucesso",

    // Navigation
    home: "Início",
    search: "Buscar",
    messages: "Mensagens",
    visits: "Visitas",
    likes: "Curtidas",
    favorites: "Favoritos", 
    chatOnline: "Chat ao vivo",
    matches: "Correspondências",
    profile: "Perfil",
    myPosts: "Minhas Publicações",
    settings: "Configurações",
    helpCenter: "Central de Ajuda",
    emailSupport: "Suporte por Email",
    logout: "Sair",
    logoutSuccess: "Logout Bem-sucedido",
    logoutSuccessDesc: "Você foi desconectado com sucesso"
  },
  
  ptBR: {
    // Même chose que pt
    welcome: "Bem-vindo",
    back: "Voltar",
    save: "Salvar",
    cancel: "Cancelar",
    edit: "Editar",
    delete: "Excluir",
    loading: "Carregando...",
    error: "Erro",
    success: "Sucesso",
    welcomeUser: "Bem-vindo, {user}! 👋",
    discoverCommunity: "Descubra sua comunidade multicultural e encontre o amor sem fronteiras.",
    createPost: "Criar uma publicação",
    culturalSpace: "🎭 Espaço Cultural",
    discoverEvents: "Descubra eventos culturais perto de você",
    exploreEvents: "Explorar eventos",
    postCreated: "Publicação criada!",
    postCreatedDesc: "Sua publicação foi publicada com sucesso.",
    messages: "Mensagens",
    backToFeed: "Voltar ao feed",
    myProfile: "Meu Perfil",
    editProfile: "Editar perfil",
    profileUpdated: "✅ Perfil atualizado",
    profileUpdatedDesc: "Os dados foram recarregados com sucesso.",
    profileError: "❌ Erro",
    profileErrorDesc: "Não foi possível atualizar o perfil.",
    loadingProfile: "Carregando perfil...",
    profileLoadError: "Erro ao carregar perfil",
    settings: "Configurações",
    preferredLanguage: "Idioma preferido",
    notifications: "Notificações",
    pushNotifications: "Notificações push",
    emailNotifications: "Notificações por email",
    pushNotificationsDesc: "Receber notificações no seu dispositivo",
    emailNotificationsDesc: "Receber emails para eventos importantes",
    settingsSaved: "Configurações salvas",
    settingsSavedDesc: "Suas alterações foram salvas com sucesso",

    // Navigation
    home: "Bem-vindo",
    search: "Voltar",
    messages: "Mensagens",
    visits: "Voltar ao feed",
    likes: "Salvar",
    favorites: "Cancelar",
    chatOnline: "Editar perfil",
    matches: "Salvar",
    profile: "Meu Perfil",
    myPosts: "Minhas Publicações",
    settings: "Configurações",
    helpCenter: "Central de Ajuda",
    emailSupport: "Suporte por Email",
    logout: "Sair",
    logoutSuccess: "Logout Bem-sucedido",
    logoutSuccessDesc: "Suas alterações foram salvas com sucesso"
  },
  
  ht: {
    // Navigation et commun
    welcome: "Byenveni",
    back: "Retounen",
    save: "Sove",
    cancel: "Anile",
    edit: "Modifye",
    delete: "Efase",
    loading: "K ap chaje...",
    error: "Erè",
    success: "Siksè",
    
    // Dashboard
    welcomeUser: "Byenveni, {user}! 👋",
    discoverCommunity: "Dekouvri kominote multikiltirèl ou ak jwenn lanmou san fwontyè.",
    createPost: "Kreye yon piblikasyon",
    culturalSpace: "🎭 Espas Kiltirèl",
    discoverEvents: "Dekouvri evenman kiltirèl yo tou pre ou",
    exploreEvents: "Eksplore evenman yo",
    postCreated: "Piblikasyon kreye!",
    postCreatedDesc: "Piblikasyon ou pibliye ak siksè.",
    
    // CreatePostModal
    editPost: "Modifye piblikasyon",
    publish: "Publie",
    update: "Mete ajou",
    saving: "Enregistreman...",
    postPlaceholder: "Ki jan ou vle partage ak kominote la?",
    feedTitle: "📱 Fil d'actualité",
    feedSubtitle: "Découvri les dernières publications",
    feed: "Fil d'actualité",
    matching: "Match yo",
    
    // Messages
    messages: "Mesaj yo",
    backToFeed: "Retounen nan feed la",
    
    // Profile
    myProfile: "Pwofil Mwen",
    editProfile: "Modifye pwofil",
    profileUpdated: "✅ Pwofil mete ajou",
    profileUpdatedDesc: "Done yo rechaje ak siksè.",
    profileError: "❌ Erè",
    profileErrorDesc: "Nou pa ka mete ajou pwofil la.",
    loadingProfile: "K ap chaje pwofil...",
    profileLoadError: "Erè nan chajman pwofil",
    
    // Settings
    settings: "Paramèt yo",
    preferredLanguage: "Lang ou renmen",
    notifications: "Notifikasyon yo",
    pushNotifications: "Notifikasyon push",
    emailNotifications: "Notifikasyon pa email",
    pushNotificationsDesc: "Resevwa notifikasyon sou aparèy ou",
    emailNotificationsDesc: "Resevwa email pou evenman enpòtan yo",
    settingsSaved: "Paramèt yo sove",
    settingsSavedDesc: "Chanjman ou yo anrejistre ak siksè",

    // Navigation
    home: "Akèy",
    search: "Rechèch",
    messages: "Mesaj yo",
    visits: "Vizit yo",
    likes: "Renmen yo",
    favorites: "Favori yo",
    chatOnline: "Chat an dirèk",
    matches: "Match yo",
    profile: "Pwofil",
    myPosts: "Piblikasyon Mwen yo",
    settings: "Paramèt yo",
    helpCenter: "Sant Èd",
    emailSupport: "Sipò pa Email",
    logout: "Dekonekte",
    logoutSuccess: "Dekoneksyon Reyisi",
    logoutSuccessDesc: "Ou dekonekte ak siksè"
  }
};

export const useTranslation = () => {
  const { selectedLanguage } = useLanguage();
  const t = globalTranslations[selectedLanguage as keyof typeof globalTranslations] || globalTranslations.fr;
  
  // ✅ DEBUG TEMPORAIRE - À SUPPRIMER APRÈS TEST
  console.log('🌐 useTranslation called with language:', selectedLanguage);
  console.log('🌐 Sample translation:', t.welcome);
  
  return {
    t,
    currentLanguage: selectedLanguage,
    translate: (key: string, variables?: Record<string, string>) => {
      let text = t[key as keyof typeof t] as string || key;
      
      if (variables) {
        Object.entries(variables).forEach(([varKey, varValue]) => {
          text = text.replace(`{${varKey}}`, varValue);
        });
      }
      
      console.log('🔤 Translating:', key, '→', text); // DEBUG TEMPORAIRE
      return text;
    }
  };
};
