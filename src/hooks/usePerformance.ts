import { useEffect, useState } from 'react';
import { analytics } from '@/lib/analytics';

interface PerformanceMetrics {
  loadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  memoryUsage?: number;
}

export const usePerformance = (pageName: string) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const measurePerformance = () => {
      // Web Vitals
      if ('performance' in window) {
        const perfObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const metric = entry as any;
            
            switch (metric.entryType) {
              case 'paint':
                if (metric.name === 'first-contentful-paint') {
                  setMetrics(prev => ({
                    ...prev,
                    firstContentfulPaint: metric.startTime
                  } as PerformanceMetrics));
                }
                break;
                
              case 'largest-contentful-paint':
                setMetrics(prev => ({
                  ...prev,
                  largestContentfulPaint: metric.startTime
                } as PerformanceMetrics));
                break;
                
              case 'layout-shift':
                if (!metric.hadRecentInput) {
                  setMetrics(prev => ({
                    ...prev,
                    cumulativeLayoutShift: (prev?.cumulativeLayoutShift || 0) + metric.value
                  } as PerformanceMetrics));
                }
                break;
                
              case 'first-input':
                setMetrics(prev => ({
                  ...prev,
                  firstInputDelay: metric.processingStart - metric.startTime
                } as PerformanceMetrics));
                break;
            }
          }
        });

        // Observer les métriques
        perfObserver.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'layout-shift', 'first-input'] });

        // Navigation Timing
        const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navTiming) {
          const loadTime = navTiming.loadEventEnd - navTiming.fetchStart;
          setMetrics(prev => ({
            ...prev,
            loadTime
          } as PerformanceMetrics));
        }

        // Memory usage (si disponible)
        if ('memory' in performance) {
          const memory = (performance as any).memory;
          setMetrics(prev => ({
            ...prev,
            memoryUsage: memory.usedJSHeapSize / 1024 / 1024 // MB
          } as PerformanceMetrics));
        }

        setIsLoading(false);

        // Nettoyage
        return () => perfObserver.disconnect();
      }
    };

    // Mesurer après le chargement complet
    if (document.readyState === 'complete') {
      measurePerformance();
    } else {
      window.addEventListener('load', measurePerformance);
      return () => window.removeEventListener('load', measurePerformance);
    }
  }, []);

  // Envoyer les métriques aux analytics
  useEffect(() => {
    if (metrics && !isLoading) {
      analytics.track('performance_metrics', {
        page: pageName,
        ...metrics,
        timestamp: Date.now()
      });

      // Alertes sur les performances dégradées
      if (metrics.largestContentfulPaint > 2500) {
        }
      if (metrics.cumulativeLayoutShift > 0.1) {
        }
      if (metrics.firstInputDelay > 100) {
        }
    }
  }, [metrics, isLoading, pageName]);

  return {
    metrics,
    isLoading,
    isGood: metrics ? (
      metrics.largestContentfulPaint < 2500 &&
      metrics.cumulativeLayoutShift < 0.1 &&
      metrics.firstInputDelay < 100
    ) : null
  };
};
