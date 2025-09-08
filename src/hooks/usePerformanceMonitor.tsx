// Nouveau fichier: src/hooks/usePerformanceMonitor.ts
import { useEffect, useRef } from 'react';
import { analytics } from '@/lib/analytics';

export const usePerformanceMonitor = (operationName: string) => {
  const startTime = useRef<number>(Date.now());

  useEffect(() => {
    startTime.current = Date.now();

    return () => {
      const duration = Date.now() - startTime.current;
      analytics.track('performance', {
        operation: operationName,
        duration,
        timestamp: Date.now()
      });
    };
  }, [operationName]);

  const measureAsync = async <T,>(
    operation: () => Promise<T>,
    operationLabel?: string
  ): Promise<T> => {
    const start = Date.now();
    try {
      const result = await operation();
      const duration = Date.now() - start;
      analytics.track('performance', {
        operation: operationLabel || operationName,
        duration,
        success: true,
        timestamp: Date.now()
      });
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      analytics.track('performance', {
        operation: operationLabel || operationName,
        duration,
        success: false,
        timestamp: Date.now()
      });
      throw error;
    }
  };

  return { measureAsync };
};