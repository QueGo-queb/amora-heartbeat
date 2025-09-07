interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp?: string;
  userId?: string;
}

class Analytics {
  private events: AnalyticsEvent[] = [];
  private isEnabled: boolean = process.env.NODE_ENV === 'production';

  // Tracker un événement
  track(event: string, properties?: Record<string, any>) {
    if (!this.isEnabled) {
      console.log(`📊 [Analytics] ${event}`, properties);
      return;
    }

    const analyticsEvent: AnalyticsEvent = {
      event,
      properties,
      timestamp: new Date().toISOString(),
      userId: this.getCurrentUserId(),
    };

    this.events.push(analyticsEvent);
    this.sendToBackend(analyticsEvent);
  }

  // Tracker les performances
  trackPerformance(operation: string, duration: number, metadata?: Record<string, any>) {
    this.track('performance', {
      operation,
      duration,
      ...metadata
    });
  }

  // Tracker les erreurs
  trackError(error: Error, context?: string) {
    this.track('error', {
      message: error.message,
      stack: error.stack,
      context,
      url: window.location.href,
      userAgent: navigator.userAgent
    });
  }

  // Tracker l'engagement utilisateur
  trackEngagement(action: string, target?: string, value?: number) {
    this.track('engagement', {
      action,
      target,
      value,
      page: window.location.pathname
    });
  }

  // Tracker les conversions (Premium, etc.)
  trackConversion(type: string, value?: number, metadata?: Record<string, any>) {
    this.track('conversion', {
      type,
      value,
      ...metadata
    });
  }

  private getCurrentUserId(): string | undefined {
    // Récupérer l'ID utilisateur depuis le localStorage ou autre
    return localStorage.getItem('userId') || undefined;
  }

  private async sendToBackend(event: AnalyticsEvent) {
    try {
      // En production, envoyer à un service d'analytics (Mixpanel, Amplitude, etc.)
      // Pour maintenant, on stocke localement
      const storedEvents = JSON.parse(localStorage.getItem('analytics_events') || '[]');
      storedEvents.push(event);
      
      // Garder seulement les 1000 derniers événements
      if (storedEvents.length > 1000) {
        storedEvents.splice(0, storedEvents.length - 1000);
      }
      
      localStorage.setItem('analytics_events', JSON.stringify(storedEvents));
    } catch (error) {
      console.error('Erreur envoi analytics:', error);
    }
  }

  // Récupérer les métriques pour l'admin
  getMetrics() {
    const events = JSON.parse(localStorage.getItem('analytics_events') || '[]');
    
    const metrics = {
      totalEvents: events.length,
      errorRate: events.filter((e: AnalyticsEvent) => e.event === 'error').length / events.length,
      avgPerformance: this.calculateAvgPerformance(events),
      topActions: this.getTopActions(events),
      conversionRate: this.calculateConversionRate(events)
    };

    return metrics;
  }

  private calculateAvgPerformance(events: AnalyticsEvent[]) {
    const perfEvents = events.filter(e => e.event === 'performance');
    if (perfEvents.length === 0) return 0;
    
    const totalDuration = perfEvents.reduce((sum, e) => sum + (e.properties?.duration || 0), 0);
    return totalDuration / perfEvents.length;
  }

  private getTopActions(events: AnalyticsEvent[]) {
    const actionCounts: Record<string, number> = {};
    
    events.filter(e => e.event === 'engagement').forEach(e => {
      const action = e.properties?.action;
      if (action) {
        actionCounts[action] = (actionCounts[action] || 0) + 1;
      }
    });

    return Object.entries(actionCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);
  }

  private calculateConversionRate(events: AnalyticsEvent[]) {
    const conversions = events.filter(e => e.event === 'conversion').length;
    const totalUsers = new Set(events.map(e => e.userId)).size;
    
    return totalUsers > 0 ? conversions / totalUsers : 0;
  }
}

// Instance singleton
export const analytics = new Analytics();

// Hook pour utiliser les analytics
export const useAnalytics = () => {
  return {
    track: analytics.track.bind(analytics),
    trackPerformance: analytics.trackPerformance.bind(analytics),
    trackError: analytics.trackError.bind(analytics),
    trackEngagement: analytics.trackEngagement.bind(analytics),
    trackConversion: analytics.trackConversion.bind(analytics),
    getMetrics: analytics.getMetrics.bind(analytics)
  };
};
