import { onCLS, onFCP, onLCP, onTTFB, onINP } from 'web-vitals'; // Retirer onFID
import { analytics } from './analytics';

interface VitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
}

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export function initWebVitals() {
  // Core Web Vitals
  onCLS((metric) => {
    reportWebVital('CLS', metric);
  });

  onFCP((metric) => {
    reportWebVital('FCP', metric);
  });

  onLCP((metric) => {
    reportWebVital('LCP', metric);
  });

  onTTFB((metric) => {
    reportWebVital('TTFB', metric);
  });

  // Interaction to Next Paint (remplace FID)
  onINP((metric) => {
    reportWebVital('INP', metric);
  });

  console.log('📊 Web Vitals tracking initialized');
}

function reportWebVital(name: string, metric: any) {
  const vital: VitalMetric = {
    name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta
  };

  // Envoyer à analytics
  analytics.trackEvent('web_vital', {
    metric_name: name,
    metric_value: metric.value,
    metric_rating: metric.rating
  });

  // Envoyer à Google Analytics si disponible
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', name, {
      value: Math.round(metric.value),
      metric_rating: metric.rating,
      metric_delta: metric.delta
    });
  }

  console.log(`📊 ${name}:`, vital);
}

// Bundle size monitoring
export const trackBundleSize = () => {
  if (typeof window !== 'undefined' && 'performance' in window) {
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      const metrics = {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        timeToFirstByte: navigation.responseStart - navigation.requestStart,
        transferSize: navigation.transferSize,
        encodedBodySize: navigation.encodedBodySize,
        decodedBodySize: navigation.decodedBodySize
      };

      analytics.trackEvent('performance_metrics', metrics);
    });
  }
};
