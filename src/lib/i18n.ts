import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    lng: 'fr',
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false,
    },
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    resources: {
      fr: {
        common: {
          title: 'AMORA - Rencontres sans frontières',
          loading: 'Chargement...',
          error: 'Une erreur est survenue',
          save: 'Enregistrer',
          cancel: 'Annuler',
          delete: 'Supprimer',
          edit: 'Modifier',
        },
        auth: {
          login: 'Connexion',
          signup: 'Inscription',
          logout: 'Déconnexion',
          email: 'Email',
          password: 'Mot de passe',
          forgotPassword: 'Mot de passe oublié ?',
        },
        dashboard: {
          welcome: 'Bienvenue sur AMORA',
          newMessages: 'Nouveaux messages',
          newMatches: 'Nouveaux matchs',
          recentActivity: 'Activité récente',
        }
      },
      en: {
        common: {
          title: 'AMORA - Borderless Dating',
          loading: 'Loading...',
          error: 'An error occurred',
          save: 'Save',
          cancel: 'Cancel',
          delete: 'Delete',
          edit: 'Edit',
        },
        auth: {
          login: 'Login',
          signup: 'Sign up',
          logout: 'Logout',
          email: 'Email',
          password: 'Password',
          forgotPassword: 'Forgot password?',
        },
        dashboard: {
          welcome: 'Welcome to AMORA',
          newMessages: 'New messages',
          newMatches: 'New matches',
          recentActivity: 'Recent activity',
        }
      },
      ht: {
        common: {
          title: 'AMORA - Rankontre san fwontyè',
          loading: 'Y ap chaje...',
          error: 'Gen yon erè ki rive',
          save: 'Anrejistre',
          cancel: 'Anile',
          delete: 'Efase',
          edit: 'Modifye',
        }
      }
    }
  });

export default i18n;
