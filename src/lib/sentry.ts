import * as Sentry from '@sentry/react';

// Configuration de base
const SENTRY_CONFIG = {
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.VITE_ENVIRONMENT || 'development',
  tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  beforeSend(event) {
    // Ne pas envoyer en développement si pas de DSN
    if (!SENTRY_CONFIG.dsn && import.meta.env.DEV) {
      console.log('🐛 Sentry event (dev):', event);
      return null;
    }
    return event;
  },
};

/**
 * Initialise Sentry avec configuration de base
 */
export function initSentry() {
  try {
    if (!SENTRY_CONFIG.dsn) {
      console.warn('⚠️ Sentry DSN non configuré - monitoring désactivé');
      return;
    }

    Sentry.init({
      ...SENTRY_CONFIG,
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          maskAllText: false,
          blockAllMedia: false,
        }),
      ],
    });

    console.log('✅ Sentry initialisé avec succès');
  } catch (error) {
    console.error('❌ Erreur initialisation Sentry:', error);
  }
}

/**
 * Helper pour tracker les erreurs manuellement avec contexte riche
 */
export const trackError = (error: Error, context?: {
  userId?: string;
  page?: string;
  action?: string;
  metadata?: Record<string, any>;
}) => {
  Sentry.withScope((scope) => {
    if (context) {
      scope.setContext('error_context', context);
      if (context.userId) scope.setUser({ id: context.userId });
      if (context.page) scope.setTag('page', context.page);
      if (context.action) scope.setTag('action', context.action);
    }
    Sentry.captureException(error);
  });
};

/**
 * Helper pour tracker les événements personnalisés
 */
export const trackEvent = (message: string, level: 'info' | 'warning' | 'error' = 'info', context?: Record<string, any>) => {
  Sentry.withScope((scope) => {
    if (context) {
      scope.setContext('event_context', context);
    }
    Sentry.captureMessage(message, level);
  });
};

/**
 * Helper pour définir l'utilisateur actuel
 */
export const setSentryUser = (user: { id: string; email?: string; name?: string }) => {
  Sentry.setUser(user);
};

/**
 * Helper pour effacer les données utilisateur (logout)
 */
export const clearSentryUser = () => {
  Sentry.setUser(null);
};
