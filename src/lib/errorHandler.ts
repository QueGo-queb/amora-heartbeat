// ✅ SYSTÈME CENTRALISÉ DE GESTION D'ERREURS
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  userId?: string;
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  
  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  // Gérer les erreurs de manière centralisée
  handleError(error: any, context?: string): AppError {
    const appError: AppError = {
      code: this.getErrorCode(error),
      message: this.getUserFriendlyMessage(error),
      details: this.getErrorDetails(error),
      timestamp: new Date().toISOString(),
      userId: this.getCurrentUserId()
    };

    // Logger l'erreur
    console.error(`[${context || 'Unknown'}] Error:`, appError);

    // Envoyer à Sentry en production
    if (import.meta.env.PROD) {
      // TODO: Intégrer Sentry
    }

    return appError;
  }

  private getErrorCode(error: any): string {
    if (error?.code) return error.code;
    if (error?.status) return `HTTP_${error.status}`;
    if (error?.name) return error.name;
    return 'UNKNOWN_ERROR';
  }

  private getUserFriendlyMessage(error: any): string {
    const errorCode = this.getErrorCode(error);
    
    const messages: Record<string, string> = {
      'network_error': 'Problème de connexion. Vérifiez votre internet.',
      'unauthorized': 'Accès non autorisé. Veuillez vous reconnecter.',
      'not_found': 'Ressource non trouvée.',
      'validation_error': 'Données invalides. Vérifiez vos informations.',
      'rate_limit': 'Trop de tentatives. Veuillez patienter.',
      'server_error': 'Erreur serveur. Veuillez réessayer plus tard.',
      'UNKNOWN_ERROR': 'Une erreur inattendue s\'est produite.'
    };

    return messages[errorCode] || messages['UNKNOWN_ERROR'];
  }

  private getErrorDetails(error: any): any {
    return {
      originalError: error?.message || error,
      stack: error?.stack,
      url: window.location.href,
      userAgent: navigator.userAgent
    };
  }

  private getCurrentUserId(): string | undefined {
    // Récupérer l'ID utilisateur depuis le localStorage ou le contexte
    try {
      const session = localStorage.getItem('sb-auth-token');
      if (session) {
        const parsed = JSON.parse(session);
        return parsed?.user?.id;
      }
    } catch {
      // Ignorer les erreurs de parsing
    }
    return undefined;
  }
}

// Hook pour utiliser le gestionnaire d'erreurs
export const useErrorHandler = () => {
  const errorHandler = ErrorHandler.getInstance();
  
  return {
    handleError: (error: any, context?: string) => errorHandler.handleError(error, context)
  };
};
