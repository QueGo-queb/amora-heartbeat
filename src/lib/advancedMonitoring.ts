/**
 * ✅ SYSTÈME DE MONITORING AVANCÉ
 * Surveille les performances, erreurs et métriques business
 */

interface MetricData {
  name: string;
  value: number;
  timestamp: number;
  tags: Record<string, string>;
  metadata?: Record<string, any>;
}

interface ErrorData {
  message: string;
  stack?: string;
  timestamp: number;
  userId?: string;
  url: string;
  userAgent: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: Record<string, any>;
}

interface BusinessMetric {
  event: string;
  userId?: string;
  timestamp: number;
  properties: Record<string, any>;
  value?: number;
}

class AdvancedMonitoring {
  private static instance: AdvancedMonitoring;
  private metrics: MetricData[] = [];
  private errors: ErrorData[] = [];
  private businessMetrics: BusinessMetric[] = [];
  private maxStorageSize = 1000;
  private flushInterval: NodeJS.Timeout;

  static getInstance(): AdvancedMonitoring {
    if (!AdvancedMonitoring.instance) {
      AdvancedMonitoring.instance = new AdvancedMonitoring();
    }
    return AdvancedMonitoring.instance;
  }

  constructor() {
    // Flush périodique des données
    this.flushInterval = setInterval(() => {
      this.flush();
    }, 30000); // Toutes les 30 secondes

    // Écouter les erreurs globales
    this.setupGlobalErrorHandling();
    
    // Écouter les métriques de performance
    this.setupPerformanceMonitoring();
  }

  // Enregistrer une métrique
  recordMetric(
    name: string,
    value: number,
    tags: Record<string, string> = {},
    metadata?: Record<string, any>
  ): void {
    const metric: MetricData = {
      name,
      value,
      timestamp: Date.now(),
      tags,
      metadata
    };

    this.metrics.push(metric);
    this.trimArray(this.metrics);

    // Logger en développement
    if (import.meta.env.DEV) {
      console.log(`📊 Metric: ${name} = ${value}`, { tags, metadata });
    }
  }

  // Enregistrer une erreur
  recordError(
    error: Error | string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    context?: Record<string, any>
  ): void {
    const errorData: ErrorData = {
      message: typeof error === 'string' ? error : error.message,
      stack: typeof error === 'object' ? error.stack : undefined,
      timestamp: Date.now(),
      userId: this.getCurrentUserId(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      severity,
      context
    };

    this.errors.push(errorData);
    this.trimArray(this.errors);

    // Logger selon la sévérité
    if (severity === 'critical' || severity === 'high') {
      console.error(`🚨 Error (${severity}):`, errorData);
    } else {
      console.warn(`⚠️ Error (${severity}):`, errorData);
    }
  }

  // Enregistrer une métrique business
  recordBusinessMetric(
    event: string,
    properties: Record<string, any> = {},
    value?: number
  ): void {
    const businessMetric: BusinessMetric = {
      event,
      userId: this.getCurrentUserId(),
      timestamp: Date.now(),
      properties,
      value
    };

    this.businessMetrics.push(businessMetric);
    this.trimArray(this.businessMetrics);

    // Logger en développement
    if (import.meta.env.DEV) {
      console.log(`�� Business: ${event}`, { properties, value });
    }
  }

  // Mesurer le temps d'exécution d'une fonction
  measureFunction<T>(
    name: string,
    fn: () => T,
    tags: Record<string, string> = {}
  ): T {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    
    this.recordMetric(`function.${name}.duration`, end - start, tags);
    return result;
  }

  // Mesurer le temps d'exécution d'une fonction async
  async measureAsyncFunction<T>(
    name: string,
    fn: () => Promise<T>,
    tags: Record<string, string> = {}
  ): Promise<T> {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    
    this.recordMetric(`async.${name}.duration`, end - start, tags);
    return result;
  }

  // Surveiller les erreurs globales
  private setupGlobalErrorHandling(): void {
    // Erreurs JavaScript non capturées
    window.addEventListener('error', (event) => {
      this.recordError(
        new Error(event.message),
        'high',
        {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          type: 'javascript_error'
        }
      );
    });

    // Promesses rejetées non capturées
    window.addEventListener('unhandledrejection', (event) => {
      this.recordError(
        new Error(event.reason?.message || 'Unhandled promise rejection'),
        'high',
        {
          reason: event.reason,
          type: 'unhandled_rejection'
        }
      );
    });
  }

  // Surveiller les performances
  private setupPerformanceMonitoring(): void {
    // Core Web Vitals
    if ('PerformanceObserver' in window) {
      try {
        // LCP
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.recordMetric('web_vitals.lcp', lastEntry.startTime, {
            element: lastEntry.element?.tagName || 'unknown'
          });
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // FID
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            this.recordMetric('web_vitals.fid', entry.processingStart - entry.startTime, {
              eventType: entry.name
            });
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

        // CLS
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          this.recordMetric('web_vitals.cls', clsValue);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });

      } catch (error) {
        console.warn('Performance monitoring not supported:', error);
      }
    }

    // Métriques de navigation
    if ('performance' in window) {
      window.addEventListener('load', () => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        this.recordMetric('navigation.dom_content_loaded', navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart);
        this.recordMetric('navigation.load_complete', navigation.loadEventEnd - navigation.loadEventStart);
        this.recordMetric('navigation.total_time', navigation.loadEventEnd - navigation.fetchStart);
      });
    }
  }

  // Obtenir l'ID utilisateur actuel
  private getCurrentUserId(): string | undefined {
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

  // Trier les tableaux pour éviter la surcharge mémoire
  private trimArray<T>(array: T[]): void {
    if (array.length > this.maxStorageSize) {
      array.splice(0, array.length - this.maxStorageSize);
    }
  }

  // Envoyer les données au serveur
  private async flush(): Promise<void> {
    if (this.metrics.length === 0 && this.errors.length === 0 && this.businessMetrics.length === 0) {
      return;
    }

    try {
      const payload = {
        metrics: this.metrics.splice(0),
        errors: this.errors.splice(0),
        businessMetrics: this.businessMetrics.splice(0),
        timestamp: Date.now(),
        sessionId: this.getSessionId()
      };

      // En production, envoyer à un endpoint de monitoring
      if (import.meta.env.PROD) {
        // TODO: Implémenter l'envoi vers un service de monitoring
        console.log('📤 Sending monitoring data:', payload);
      }

    } catch (error) {
      console.error('❌ Error flushing monitoring data:', error);
    }
  }

  // Obtenir l'ID de session
  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('monitoring_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('monitoring_session_id', sessionId);
    }
    return sessionId;
  }

  // Obtenir les statistiques
  getStats(): {
    metricsCount: number;
    errorsCount: number;
    businessMetricsCount: number;
    errorSeverityBreakdown: Record<string, number>;
    topMetrics: Array<{ name: string; count: number; avgValue: number }>;
  } {
    const errorSeverityBreakdown = this.errors.reduce((acc, error) => {
      acc[error.severity] = (acc[error.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const metricGroups = this.metrics.reduce((acc, metric) => {
      if (!acc[metric.name]) {
        acc[metric.name] = { count: 0, totalValue: 0 };
      }
      acc[metric.name].count++;
      acc[metric.name].totalValue += metric.value;
      return acc;
    }, {} as Record<string, { count: number; totalValue: number }>);

    const topMetrics = Object.entries(metricGroups)
      .map(([name, data]) => ({
        name,
        count: data.count,
        avgValue: data.totalValue / data.count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      metricsCount: this.metrics.length,
      errorsCount: this.errors.length,
      businessMetricsCount: this.businessMetrics.length,
      errorSeverityBreakdown,
      topMetrics
    };
  }

  // Nettoyer les ressources
  destroy(): void {
    clearInterval(this.flushInterval);
    this.flush();
  }
}

export const advancedMonitoring = AdvancedMonitoring.getInstance();

// Hook pour utiliser le monitoring avancé
export const useAdvancedMonitoring = () => {
  return {
    recordMetric: (name: string, value: number, tags?: Record<string, string>, metadata?: Record<string, any>) =>
      advancedMonitoring.recordMetric(name, value, tags, metadata),
    
    recordError: (error: Error | string, severity?: 'low' | 'medium' | 'high' | 'critical', context?: Record<string, any>) =>
      advancedMonitoring.recordError(error, severity, context),
    
    recordBusinessMetric: (event: string, properties?: Record<string, any>, value?: number) =>
      advancedMonitoring.recordBusinessMetric(event, properties, value),
    
    measureFunction: <T>(name: string, fn: () => T, tags?: Record<string, string>) =>
      advancedMonitoring.measureFunction(name, fn, tags),
    
    measureAsyncFunction: <T>(name: string, fn: () => Promise<T>, tags?: Record<string, string>) =>
      advancedMonitoring.measureAsyncFunction(name, fn, tags),
    
    getStats: () => advancedMonitoring.getStats()
  };
};
