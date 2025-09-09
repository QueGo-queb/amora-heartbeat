import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackEvent, trackError } from '@/lib/sentry';
import { useAuth } from '@/hooks/useAuth';

export const useErrorTracking = () => {
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    // Tracker les changements de page
    trackEvent('page_view', {
      category: 'navigation',
      action: 'page_view',
      userId: user?.id,
      metadata: {
        path: location.pathname,
        search: location.search,
        timestamp: Date.now(),
      }
    });
  }, [location, user?.id]);

  // Fonction pour tracker les erreurs async
  const trackAsyncError = (error: Error, context?: string) => {
    trackError(error, {
      userId: user?.id,
      page: location.pathname,
      action: context || 'async_operation',
      metadata: {
        userAgent: navigator.userAgent,
        url: window.location.href,
      }
    });
  };

  // Fonction pour tracker les événements business
  const trackBusinessEvent = (eventName: string, data?: Record<string, any>) => {
    trackEvent(eventName, {
      category: 'business',
      action: eventName,
      userId: user?.id,
      metadata: {
        page: location.pathname,
        ...data,
      }
    });
  };

  return {
    trackAsyncError,
    trackBusinessEvent,
  };
};
