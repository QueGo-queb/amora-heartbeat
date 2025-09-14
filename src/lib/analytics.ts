import { trackEvent } from './sentry';

// Analytics spécifiques à AMORA
export const analytics = {
  userSignUp: (method: 'email' | 'social') => {
    console.log('📊 User Sign Up:', { method });
  },
  
  userLogin: (method: 'email' | 'social') => {
    console.log('📊 User Login:', { method });
  },
  
  profileView: (viewedUserId: string) => {
    console.log('📊 Profile View:', { viewedUserId });
  },
  
  swipeAction: (action: 'like' | 'dislike', targetUserId: string) => {
    console.log('📊 Swipe Action:', { action, targetUserId });
  },
  
  messagesSent: () => {
    console.log('📊 Message Sent');
  },
  
  premiumUpgrade: (userId: string, amount: number) => {
    analytics.track('premium_upgrade', {
      user_id: userId,
      amount: amount,
      currency: 'USD'
    });
  },
  
  paymentFailed: (error: string, amount?: number) => {
    console.log('📊 Payment Failed:', { error, amount });
  },
  
  track: (eventName: string, properties?: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, properties);
    }
    
    console.log(`📊 Analytics - ${eventName}:`, properties);
  },
  
  trackEvent: (eventName: string, properties?: Record<string, any>) => {
    analytics.track(eventName, properties);
  }
};

// Ajouter la déclaration globale
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

// ✅ CORRIGÉ - Fonction trackEvent avec signature correcte
export const trackEvent = (eventName: string, metadata?: Record<string, any>) => {
  try {
    console.log('📊 Analytics Event:', eventName, metadata);
    
    // Implémentation basique - peut être étendue avec un service d'analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, metadata);
    }
  } catch (error) {
    console.error('Analytics error:', error);
  }
};

// ✅ CORRIGÉ - Fonction trackError avec signature correcte
export const trackError = (error: Error, context?: Record<string, any>) => {
  try {
    console.error('❌ Error tracked:', error.message, context);
    
    // Implémentation basique - peut être étendue avec Sentry ou autre service
  } catch (trackingError) {
    console.error('Error tracking failed:', trackingError);
  }
};
