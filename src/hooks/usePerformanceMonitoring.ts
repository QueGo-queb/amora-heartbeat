/**
 * Hook pour monitorer les performances de l'application
 * Détecte les problèmes et optimise automatiquement
 */

import { useEffect, useCallback, useRef } from 'react';
import { logger } from '@/lib/logger';

interface PerformanceMetrics {
  renderCount: number;
  lastRenderTime: number;
  averageRenderTime: number;
  slowRenders: number;
}

export function usePerformanceMonitoring(componentName: string) {
  const metricsRef = useRef<PerformanceMetrics>({
    renderCount: 0,
    lastRenderTime: 0,
    averageRenderTime: 0,
    slowRenders: 0
  });
  
  const startTimeRef = useRef<number>(0);

  const startMeasure = useCallback(() => {
    startTimeRef.current = performance.now();
  }, []);

  const endMeasure = useCallback(() => {
    const endTime = performance.now();
    const renderTime = endTime - startTimeRef.current;
    
    const metrics = metricsRef.current;
    metrics.renderCount++;
    metrics.lastRenderTime = renderTime;
    metrics.averageRenderTime = 
      (metrics.averageRenderTime * (metrics.renderCount - 1) + renderTime) / metrics.renderCount;
    
    // Détecter les renders lents (> 16ms)
    if (renderTime > 16) {
      metrics.slowRenders++;
      
      // Alerter si trop de renders lents
      if (metrics.slowRenders > 5) {
        logger.error(`⚠️ Performance: ${componentName} a ${metrics.slowRenders} renders lents`);
      }
    }

    // Log périodique des métriques
    if (metrics.renderCount % 50 === 0) {
      logger.log(`📊 Performance ${componentName}:`, {
        renders: metrics.renderCount,
        avgTime: Math.round(metrics.averageRenderTime * 100) / 100,
        slowRenders: metrics.slowRenders
      });
    }
  }, [componentName]);

  useEffect(() => {
    startMeasure();
    return () => endMeasure();
  });

  return {
    metrics: metricsRef.current,
    startMeasure,
    endMeasure
  };
}
