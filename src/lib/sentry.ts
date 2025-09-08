import * as Sentry from "@sentry/react";
import { createBrowserRouter } from "react-router-dom";

// Configuration Sentry
export const initSentry = () => {
  if (!import.meta.env.VITE_SENTRY_DSN) {
    return;
  }
  
  try {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: import.meta.env.MODE,
      
      // Performance monitoring
      tracesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,
      
      // Session replay pour debug
      replaysSessionSampleRate: import.meta.env.MODE === 'production' ? 0.01 : 0.1,
      replaysOnErrorSampleRate: 1.0,
      
      // Intégrations spécifiques
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration(),
        Sentry.feedbackIntegration({
          colorScheme: "system",
          showBranding: false,
        }),
      ],
      
      // Filtrage des erreurs
      beforeSend(event) {
        // Filtrer les erreurs non critiques
        if (event.exception) {
          const error = event.exception.values?.[0];
          if (error?.value?.includes('Network Error')) {
            return null; // Ignorer les erreurs réseau temporaires
          }
        }
        return event;
      },
      
      // Tags par défaut
      initialScope: {
        tags: {
          component: "amora-frontend",
          version: "1.0.0"
        },
      },
    });
    
    } catch (error) {
    console.error('❌ Erreur initialisation Sentry:', error);
  }
};

// Router avec Sentry
export const createSentryRouter = createBrowserRouter;

// Helper pour tracker les erreurs manuellement
export const trackError = (error: Error, context?: Record<string, any>) => {
  try {
    Sentry.withScope((scope) => {
      if (context) {
        Object.entries(context).forEach(([key, value]) => {
          scope.setContext(key, value);
        });
      }
      Sentry.captureException(error);
      });
  } catch (err) {
    console.error('❌ Erreur lors de l\'envoi à Sentry:', err);
  }
};

// Helper pour tracker les événements business
export const trackEvent = (name: string, data?: Record<string, any>) => {
  try {
    Sentry.addBreadcrumb({
      message: name,
      level: 'info',
      data,
    });
    } catch (err) {
    console.error('❌ Erreur lors du tracking:', err);
  }
};
