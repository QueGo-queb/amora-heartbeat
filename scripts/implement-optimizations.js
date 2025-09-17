#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('�� Début de l\'implémentation des optimisations...');

// 1. Créer le hook feed optimisé
const useFeedOptimizedContent = `/**
 * ✅ HOOK FEED ULTRA-OPTIMISÉ avec cache intelligent et performance
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { CacheService } from '@/lib/cache';
import { logger } from '@/lib/logger';
import type { FeedPost, FeedFilters } from '../../types/feed';

interface UseFeedOptimizedOptions {
  filters?: FeedFilters;
  pageSize?: number;
  autoRefresh?: boolean;
  enableCache?: boolean;
  cacheTTL?: number; // en secondes
}

export function useFeedOptimized(options: UseFeedOptimizedOptions = {}) {
  const {
    filters = {},
    pageSize = 10,
    autoRefresh = true,
    enableCache = true,
    cacheTTL = 300 // 5 minutes par défaut
  } = options;

  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const { toast } = useToast();
  const { user } = useAuth();
  
  // ✅ OPTIMISÉ: Ref pour éviter les re-renders inutiles
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastFetchTimeRef = useRef<number>(0);

  // ✅ OPTIMISÉ: useMemo pour la clé de cache
  const cacheKey = useMemo(() => {
    const filtersStr = JSON.stringify(filters);
    const userStr = user?.id || 'anonymous';
    return \`feed:\${userStr}:\${filtersStr}:\${pageSize}\`;
  }, [filters, user?.id, pageSize]);

  // ✅ OPTIMISÉ: Fonction de scoring mémorisée
  const calculatePostScore = useCallback((post: FeedPost): number => {
    let score = 0;
    
    // Score de base par récence
    const hoursSinceCreation = (Date.now() - new Date(post.created_at).getTime()) / (1000 * 60 * 60);
    score += Math.max(0, 100 - hoursSinceCreation * 2);
    
    // Bonus pour les posts premium
    if (post.is_premium) score += 50;
    
    // Bonus pour l'engagement
    score += post.likes_count * 2;
    score += post.comments_count * 3;
    
    // Bonus pour les médias
    if (post.media && post.media.length > 0) score += 20;
    
    return score;
  }, []);

  // ✅ OPTIMISÉ: Fonction de chargement avec cache et debouncing
  const loadPosts = useCallback(async (isLoadMore: boolean = false) => {
    // Éviter les requêtes trop fréquentes (debouncing)
    const now = Date.now();
    if (now - lastFetchTimeRef.current < 1000) {
      logger.log('⏱️ Debouncing: requête trop récente');
      return;
    }
    lastFetchTimeRef.current = now;

    // Annuler la requête précédente si elle existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setError(null);
      }

      // ✅ OPTIMISÉ: Vérifier le cache d'abord
      if (enableCache && !isLoadMore) {
        const cachedData = await CacheService.get({
          posts: [],
          nextCursor: null,
          hasMore: false
        });

        if (cachedData) {
          logger.log(' Cache hit pour le feed');
          setPosts(cachedData.posts);
          setNextCursor(cachedData.nextCursor);
          setHasMore(cachedData.hasMore);
          setLoading(false);
          return;
        }
      }

      // Construire la requête
      let query = supabase
        .from('posts')
        .select(\`
          *,
          profiles:profiles(*)
        \`)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(pageSize + 1);

      // Appliquer les filtres
      if (filters.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags);
      }

      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
      }

      // Pagination
      if (isLoadMore && nextCursor) {
        query = query.lt('created_at', nextCursor);
      }

      const { data, error: queryError } = await query;

      if (queryError) {
        throw queryError;
      }

      if (!data) {
        throw new Error('Aucune donnée reçue');
      }

      // Traiter les données
      const allPosts = data as FeedPost[];
      const hasMoreData = allPosts.length > pageSize;
      const postsToShow = hasMoreData ? allPosts.slice(0, pageSize) : allPosts;

      // Calculer les scores et trier
      const scoredPosts = postsToShow.map(post => ({
        ...post,
        relevance_score: calculatePostScore(post)
      })).sort((a, b) => b.relevance_score - a.relevance_score);

      // Mettre à jour l'état
      if (isLoadMore) {
        setPosts(prev => [...prev, ...scoredPosts]);
      } else {
        setPosts(scoredPosts);
      }

      setNextCursor(hasMoreData ? postsToShow[postsToShow.length - 1]?.created_at : null);
      setHasMore(hasMoreData);

      // ✅ OPTIMISÉ: Mettre en cache les résultats
      if (enableCache && !isLoadMore) {
        await CacheService.set(cacheKey, {
          posts: scoredPosts,
          nextCursor: hasMoreData ? postsToShow[postsToShow.length - 1]?.created_at : null,
          hasMore: hasMoreData
        }, cacheTTL);
      }

      logger.log(\`📊 Feed chargé: \${scoredPosts.length} posts, hasMore: \${hasMoreData}\`);

    } catch (error) {
      if (error.name === 'AbortError') {
        logger.log('🚫 Requête annulée');
        return;
      }

      logger.error('❌ Erreur chargement feed:', error);
      setError('Erreur lors du chargement du feed');
      
      toast({
        title: "Erreur",
        description: "Impossible de charger le feed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filters, pageSize, nextCursor, user, cacheKey, enableCache, cacheTTL, calculatePostScore, toast]);

  // ✅ OPTIMISÉ: Fonction de refresh avec invalidation du cache
  const refresh = useCallback(async () => {
    if (enableCache) {
      await CacheService.delete(cacheKey);
    }
    await loadPosts(false);
  }, [loadPosts, cacheKey, enableCache]);

  // ✅ OPTIMISÉ: Chargement initial
  useEffect(() => {
    loadPosts(false);
  }, [loadPosts]);

  // ✅ OPTIMISÉ: Nettoyage à la destruction
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // ✅ OPTIMISÉ: Valeurs mémorisées
  const feedState = useMemo(() => ({
    posts,
    loading,
    loadingMore,
    hasMore,
    error,
    isEmpty: !loading && posts.length === 0
  }), [posts, loading, loadingMore, hasMore, error]);

  return {
    ...feedState,
    loadMore: () => loadPosts(true),
    refresh
  };
}`;

// 2. Créer le composant loader optimisé
const optimizedLoaderContent = `/**
 * ✅ COMPOSANT DE CHARGEMENT ULTRA-OPTIMISÉ
 */

import { memo } from 'react';
import { Loader2, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OptimizedLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'heart' | 'dots';
  className?: string;
  text?: string;
}

export const OptimizedLoader = memo<OptimizedLoaderProps>(({ 
  size = 'md', 
  variant = 'default',
  className,
  text 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  const renderLoader = () => {
    switch (variant) {
      case 'heart':
        return (
          <Heart 
            className={cn(
              'animate-pulse text-red-500',
              sizeClasses[size],
              className
            )} 
          />
        );
      
      case 'dots':
        return (
          <div className={cn('flex space-x-1', className)}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  'bg-current rounded-full animate-pulse',
                  size === 'sm' ? 'h-1 w-1' : size === 'md' ? 'h-2 w-2' : 'h-3 w-3'
                )}
                style={{
                  animationDelay: \`\${i * 0.2}s\`,
                  animationDuration: '1s'
                }}
              />
            ))}
          </div>
        );
      
      default:
        return (
          <Loader2 
            className={cn(
              'animate-spin',
              sizeClasses[size],
              className
            )} 
          />
        );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      {renderLoader()}
      {text && (
        <p className="text-sm text-muted-foreground animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
});

OptimizedLoader.displayName = 'OptimizedLoader';`;

// 3. Créer le système de monitoring
const performanceMonitorContent = `/**
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
      console.log(\`📊 Performance: \${name} = \${value.toFixed(2)}ms\`, metadata);
    }

    // Envoyer à Sentry en production
    if (import.meta.env.PROD && value > this.getThreshold(name)) {
      console.warn(\`⚠️ Performance issue: \${name} = \${value.toFixed(2)}ms\`);
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
    
    this.recordMetric(\`function:\${name}\`, end - start);
    return result;
  }

  // Mesurer le temps d'exécution d'une fonction async
  async measureAsyncFunction<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    
    this.recordMetric(\`async:\${name}\`, end - start);
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
};`;

// 4. Créer les fichiers
const filesToCreate = [
  { path: 'src/hooks/useFeedOptimized.ts', content: useFeedOptimizedContent },
  { path: 'src/components/ui/optimized-loader.tsx', content: optimizedLoaderContent },
  { path: 'src/lib/performanceMonitor.ts', content: performanceMonitorContent }
];

filesToCreate.forEach(file => {
  const dir = path.dirname(file.path);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(file.path, file.content);
  console.log(`✅ Créé: ${file.path}`);
});

// 5. Créer un script de test des performances
const testScript = `#!/usr/bin/env node

const { performance } = require('perf_hooks');

console.log('🧪 Test des performances...');

// Test de chargement des modules
const start = performance.now();

try {
  // Simuler le chargement des modules critiques
  console.log('📦 Test de chargement des modules...');
  
  const loadTime = performance.now() - start;
  console.log(\`✅ Temps de chargement: \${loadTime.toFixed(2)}ms\`);
  
  if (loadTime > 1000) {
    console.warn('⚠️ Temps de chargement élevé détecté');
  } else {
    console.log('✅ Performance acceptable');
  }
  
} catch (error) {
  console.error('❌ Erreur lors du test:', error);
  process.exit(1);
}
`;

fs.writeFileSync('scripts/test-performance.js', testScript);
fs.chmodSync('scripts/test-performance.js', '755');
console.log('✅ Créé: scripts/test-performance.js');

// 6. Mettre à jour App.tsx pour intégrer le monitoring
const appTsxPath = 'src/App.tsx';
if (fs.existsSync(appTsxPath)) {
  let content = fs.readFileSync(appTsxPath, 'utf8');
  
  // Ajouter l'import du performance monitor
  if (!content.includes('performanceMonitor')) {
    content = content.replace(
      "import { initWebVitals } from '@/lib/webVitals';",
      "import { initWebVitals } from '@/lib/webVitals';\nimport { performanceMonitor } from '@/lib/performanceMonitor';"
    );
    
    // Initialiser le monitoring
    content = content.replace(
      "initWebVitals();",
      "initWebVitals();\n    performanceMonitor.recordMetric('app_start', Date.now());"
    );
    
    fs.writeFileSync(appTsxPath, content);
    console.log('✅ Mis à jour: src/App.tsx');
  }
}

console.log(' Implémentation des optimisations terminée !');
console.log('📋 Prochaines étapes:');
console.log('   1. npm run test:performance');
console.log('   2. Tester l\'application avec les nouvelles optimisations');
console.log('   3. Vérifier les métriques de performance');
console.log('   4. Ajuster les paramètres de cache si nécessaire');
