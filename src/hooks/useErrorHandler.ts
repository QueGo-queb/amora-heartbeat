/**
 * Hook pour gérer les erreurs de manière uniforme
 * Centralise la gestion d'erreurs et améliore l'UX
 */

import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { trackError } from '@/lib/sentry';

interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
}

export function useErrorHandler() {
  const { toast } = useToast();

  const handleError = useCallback((
    error: any, 
    context: ErrorContext = {},
    customMessage?: string
  ) => {
    // Log l'erreur
    console.error(`❌ Erreur ${context.component || 'Unknown'}:`, error);

    // Tracker avec Sentry
    trackError(error, {
      component: context.component,
      action: context.action,
      userId: context.userId
    });

    // Déterminer le message d'erreur
    let userMessage = customMessage;
    
    if (!userMessage) {
      if (error.message?.includes('not authenticated')) {
        userMessage = 'Vous devez être connecté pour effectuer cette action.';
      } else if (error.message?.includes('network')) {
        userMessage = 'Problème de connexion. Vérifiez votre internet.';
      } else if (error.message?.includes('premium')) {
        userMessage = 'Cette fonctionnalité nécessite un abonnement Premium.';
      } else if (error.message?.includes('limit')) {
        userMessage = 'Limite quotidienne atteinte. Passez au Premium pour plus d\'actions.';
      } else {
        userMessage = 'Une erreur inattendue s\'est produite.';
      }
    }

    // Afficher le toast
    toast({
      title: "Erreur",
      description: userMessage,
      variant: "destructive",
    });

    return { handled: true, message: userMessage };
  }, [toast]);

  const handleSuccess = useCallback((
    message: string,
    context: ErrorContext = {}
  ) => {
    console.log(`✅ Succès ${context.component || 'Unknown'}:`, message);
    
    toast({
      title: "Succès",
      description: message,
    });
  }, [toast]);

  return {
    handleError,
    handleSuccess
  };
}
