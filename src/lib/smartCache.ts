/**
 * ✅ SYSTÈME DE CACHE INTELLIGENT AVEC PRÉDICTION
 * Prédit et précharge les données selon les patterns d'usage
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
  ttl: number;
  priority: 'high' | 'medium' | 'low';
  dependencies: string[];
}

interface PredictionRule {
  pattern: string;
  confidence: number;
  nextData: string[];
  trigger: 'access' | 'time' | 'user_action';
}

class SmartCache {
  private static instance: SmartCache;
  private cache = new Map<string, CacheEntry<any>>();
  private accessPatterns = new Map<string, number[]>();
  private predictionRules: PredictionRule[] = [];
  private maxCacheSize = 100;
  private cleanupInterval: NodeJS.Timeout;

  static getInstance(): SmartCache {
    if (!SmartCache.instance) {
      SmartCache.instance = new SmartCache();
    }
    return SmartCache.instance;
  }

  constructor() {
    // Règles de prédiction basées sur les patterns d'usage
    this.predictionRules = [
      {
        pattern: 'user_profile',
        confidence: 0.9,
        nextData: ['user_posts', 'user_friends', 'user_preferences'],
        trigger: 'access'
      },
      {
        pattern: 'feed_posts',
        confidence: 0.8,
        nextData: ['user_profile', 'post_comments', 'post_likes'],
        trigger: 'access'
      },
      {
        pattern: 'messages_list',
        confidence: 0.85,
        nextData: ['message_details', 'user_profile'],
        trigger: 'access'
      },
      {
        pattern: 'admin_users',
        confidence: 0.7,
        nextData: ['admin_stats', 'user_details'],
        trigger: 'access'
      }
    ];

    // Nettoyage périodique du cache
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000); // Toutes les minutes
  }

  // Mettre en cache une donnée
  set<T>(
    key: string, 
    data: T, 
    options: {
      ttl?: number;
      priority?: 'high' | 'medium' | 'low';
      dependencies?: string[];
    } = {}
  ): void {
    const {
      ttl = 300000, // 5 minutes par défaut
      priority = 'medium',
      dependencies = []
    } = options;

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      accessCount: 0,
      lastAccessed: Date.now(),
      ttl,
      priority,
      dependencies
    };

    this.cache.set(key, entry);
    this.recordAccess(key);

    // Vérifier la taille du cache
    if (this.cache.size > this.maxCacheSize) {
      this.evictLeastUsed();
    }

    // Déclencher la prédiction
    this.predictAndPreload(key);
  }

  // Récupérer une donnée du cache
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.recordAccess(key);
      return null;
    }

    // Vérifier l'expiration
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.recordAccess(key);
      return null;
    }

    // Mettre à jour les statistiques d'accès
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    this.recordAccess(key);

    return entry.data;
  }

  // Enregistrer l'accès à une clé
  private recordAccess(key: string): void {
    const now = Date.now();
    const accesses = this.accessPatterns.get(key) || [];
    accesses.push(now);
    
    // Garder seulement les 50 derniers accès
    if (accesses.length > 50) {
      accesses.splice(0, accesses.length - 50);
    }
    
    this.accessPatterns.set(key, accesses);
  }

  // Prédire et précharger les données
  private predictAndPreload(accessedKey: string): void {
    const rule = this.predictionRules.find(r => 
      accessedKey.includes(r.pattern)
    );

    if (!rule || rule.confidence < 0.7) {
      return;
    }

    // Précharger les données prédites
    rule.nextData.forEach(dataKey => {
      if (!this.cache.has(dataKey)) {
        this.preloadData(dataKey);
      }
    });
  }

  // Précharger une donnée
  private async preloadData(key: string): Promise<void> {
    try {
      // Simuler le préchargement selon le type de donnée
      if (key.includes('user_profile')) {
        // Précharger le profil utilisateur
        console.log(`🔮 Préchargement prédictif: ${key}`);
      } else if (key.includes('feed_posts')) {
        // Précharger les posts du feed
        console.log(`🔮 Préchargement prédictif: ${key}`);
      }
      // Ajouter d'autres types de préchargement selon les besoins
    } catch (error) {
      console.error(`❌ Erreur préchargement ${key}:`, error);
    }
  }

  // Nettoyer le cache
  private cleanup(): void {
    const now = Date.now();
    const toDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      // Supprimer les entrées expirées
      if (now - entry.timestamp > entry.ttl) {
        toDelete.push(key);
      }
      
      // Supprimer les entrées peu utilisées (plus de 10 minutes sans accès)
      if (now - entry.lastAccessed > 600000 && entry.accessCount < 2) {
        toDelete.push(key);
      }
    }

    toDelete.forEach(key => this.cache.delete(key));

    if (toDelete.length > 0) {
      console.log(`🧹 Cache nettoyé: ${toDelete.length} entrées supprimées`);
    }
  }

  // Évincer les entrées les moins utilisées
  private evictLeastUsed(): void {
    const entries = Array.from(this.cache.entries());
    
    // Trier par priorité et fréquence d'accès
    entries.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b[1].priority] - priorityOrder[a[1].priority];
      
      if (priorityDiff !== 0) return priorityDiff;
      
      return a[1].accessCount - b[1].accessCount;
    });

    // Supprimer les 10% les moins utilisés
    const toEvict = Math.ceil(entries.length * 0.1);
    for (let i = 0; i < toEvict; i++) {
      this.cache.delete(entries[i][0]);
    }

    console.log(`🗑️ Éviction cache: ${toEvict} entrées supprimées`);
  }

  // Invalider le cache par pattern
  invalidatePattern(pattern: string): void {
    const toDelete: string[] = [];
    
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        toDelete.push(key);
      }
    }
    
    toDelete.forEach(key => this.cache.delete(key));
    
    if (toDelete.length > 0) {
      console.log(`🔄 Cache invalidé: ${toDelete.length} entrées supprimées (pattern: ${pattern})`);
    }
  }

  // Obtenir les statistiques du cache
  getStats(): {
    size: number;
    hitRate: number;
    totalAccesses: number;
    mostAccessed: Array<{ key: string; count: number }>;
    memoryUsage: number;
  } {
    const totalAccesses = Array.from(this.accessPatterns.values())
      .reduce((sum, accesses) => sum + accesses.length, 0);
    
    const mostAccessed = Array.from(this.accessPatterns.entries())
      .map(([key, accesses]) => ({ key, count: accesses.length }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Estimation de l'usage mémoire (approximatif)
    const memoryUsage = Array.from(this.cache.values())
      .reduce((sum, entry) => sum + JSON.stringify(entry).length, 0);

    return {
      size: this.cache.size,
      hitRate: this.calculateHitRate(),
      totalAccesses,
      mostAccessed,
      memoryUsage
    };
  }

  // Calculer le taux de hit
  private calculateHitRate(): number {
    const totalAccesses = Array.from(this.accessPatterns.values())
      .reduce((sum, accesses) => sum + accesses.length, 0);
    
    const cacheHits = Array.from(this.cache.values())
      .reduce((sum, entry) => sum + entry.accessCount, 0);
    
    return totalAccesses > 0 ? (cacheHits / totalAccesses) * 100 : 0;
  }

  // Nettoyer les ressources
  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.cache.clear();
    this.accessPatterns.clear();
  }
}

export const smartCache = SmartCache.getInstance();

// Hook pour utiliser le cache intelligent
export const useSmartCache = () => {
  return {
    set: <T>(key: string, data: T, options?: {
      ttl?: number;
      priority?: 'high' | 'medium' | 'low';
      dependencies?: string[];
    }) => smartCache.set(key, data, options),
    
    get: <T>(key: string) => smartCache.get<T>(key),
    
    invalidatePattern: (pattern: string) => smartCache.invalidatePattern(pattern),
    
    getStats: () => smartCache.getStats(),
    
    preload: (key: string) => smartCache['preloadData'](key)
  };
};
