/**
 * ✅ SYSTÈME DE MONITORING DES PERFORMANCES
 */

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private observers: Map<string, PerformanceObserver> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  constructor() {
    this.initializeObservers();
  }

  private initializeObservers() {
    // Observer pour les Core Web Vitals
    if ('PerformanceObserver' in window) {
      try {
        // LCP (Largest Contentful Paint)
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.recordMetric('lcp', lastEntry.startTime, {
            element: lastEntry.element?.tagName
          });
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.set('lcp', lcpObserver);

        // FID (First Input Delay)
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            this.recordMetric('fid', entry.processingStart - entry.startTime, {
              eventType: entry.name
            });
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.set('fid', fidObserver);

        // CLS (Cumulative Layout Shift)
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          this.recordMetric('cls', clsValue);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.set('cls', clsObserver);

      } catch (error) {
        console.warn('Performance monitoring not supported:', error);
      }
    }
  }

  recordMetric(name: string, value: number, metadata?: Record<string, any>) {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      metadata
    };

    this.metrics.push(metric);

    // Garder seulement les 100 dernières métriques
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }

    // Logger en développement
    if (import.meta.env.DEV) {
      console.log(`📊 Performance: ${name} = ${value.toFixed(2)}ms`, metadata);
    }

    // Envoyer à Sentry en production
    if (import.meta.env.PROD && value > this.getThreshold(name)) {
      // TODO: Intégrer Sentry
      console.warn(`⚠️ Performance issue: ${name} = ${value.toFixed(2)}ms`);
    }
  }

  private getThreshold(metricName: string): number {
    const thresholds = {
      lcp: 2500, // 2.5s
      fid: 100,  // 100ms
      cls: 0.1,  // 0.1
      fcp: 1800, // 1.8s
      ttfb: 600  // 600ms
    };
    return thresholds[metricName as keyof typeof thresholds] || 1000;
  }

  // Mesurer le temps d'exécution d'une fonction
  measureFunction<T>(name: string, fn: () => T): T {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    
    this.recordMetric(`function:${name}`, end - start);
    return result;
  }

  // Mesurer le temps d'exécution d'une fonction async
  async measureAsyncFunction<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    
    this.recordMetric(`async:${name}`, end - start);
    return result;
  }

  // Obtenir les métriques récentes
  getMetrics(name?: string, lastMinutes: number = 5): PerformanceMetric[] {
    const cutoff = Date.now() - (lastMinutes * 60 * 1000);
    
    return this.metrics
      .filter(metric => 
        metric.timestamp > cutoff && 
        (!name || metric.name === name)
      )
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  // Obtenir la moyenne d'une métrique
  getAverage(name: string, lastMinutes: number = 5): number {
    const metrics = this.getMetrics(name, lastMinutes);
    if (metrics.length === 0) return 0;
    
    const sum = metrics.reduce((acc, metric) => acc + metric.value, 0);
    return sum / metrics.length;
  }

  // Nettoyer les observers
  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();

// Hook pour utiliser le monitoring
export const usePerformanceMonitor = () => {
  return {
    recordMetric: (name: string, value: number, metadata?: Record<string, any>) => 
      performanceMonitor.recordMetric(name, value, metadata),
    
    measureFunction: <T>(name: string, fn: () => T) => 
      performanceMonitor.measureFunction(name, fn),
    
    measureAsyncFunction: <T>(name: string, fn: () => Promise<T>) => 
      performanceMonitor.measureAsyncFunction(name, fn),
    
    getMetrics: (name?: string, lastMinutes?: number) => 
      performanceMonitor.getMetrics(name, lastMinutes),
    
    getAverage: (name: string, lastMinutes?: number) => 
      performanceMonitor.getAverage(name, lastMinutes)
  };
};
