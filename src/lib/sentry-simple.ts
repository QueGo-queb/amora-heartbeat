// Version simplifiée du tracking pour éviter les erreurs TypeScript
export function trackEvent(eventName: string, properties?: Record<string, any>) {
  try {
    console.log('📊 Event tracked:', eventName, properties);
  } catch (error) {
    console.warn('Erreur tracking:', error);
  }
}

export function trackError(error: Error, context?: Record<string, any>) {
  try {
    console.error('🚨 Error tracked:', error, context);
  } catch (trackingError) {
    console.warn('Erreur tracking d\'erreur:', trackingError);
  }
}