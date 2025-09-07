// Nouveau fichier: src/hooks/usePerformanceMonitor.ts
import { useEffect, useRef } from 'react';
import { useAnalytics } from '@/utils/analytics';

export const usePerformanceMonitor = (operationName: string) => {
  const startTime = useRef<number>(Date.now());
  const { trackPerformance } = useAnalytics();

  useEffect(() => {
    startTime.current = Date.now();

    return () => {
      const duration = Date.now() - startTime.current;
      trackPerformance(operationName, duration);
    };
  }, [operationName, trackPerformance]);

  const measureAsync = async <T>(
    operation: () => Promise<T>,
    operationLabel?: string
  ): Promise<T> => {
    const start = Date.now();
    try {
      const result = await operation();
      const duration = Date.now() - start;
      trackPerformance(operationLabel || operationName, duration, { success: true });
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      trackPerformance(operationLabel || operationName, duration, { success: false });
      throw error;
    }
  };

  return { measureAsync };
};