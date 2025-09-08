// Cache simple en mémoire pour le frontend
const memoryCache = new Map<string, { data: any; expiry: number }>();

// Nettoyage périodique
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of memoryCache.entries()) {
    if (value.expiry < now) {
      memoryCache.delete(key);
    }
  }
}, 60000); // Nettoyage toutes les minutes

export class SimpleCacheService {
  private static PREFIX = 'amora:';

  private static buildKey(key: string): string {
    return `${this.PREFIX}${key}`;
  }

  /**
   * Stocker une valeur dans le cache
   */
  static async set(
    key: string, 
    value: any, 
    ttlSeconds: number = 3600
  ): Promise<boolean> {
    try {
      const fullKey = this.buildKey(key);
      const expiry = Date.now() + (ttlSeconds * 1000);
      memoryCache.set(fullKey, { data: value, expiry });
      return true;
    } catch (error) {
      console.error('❌ Cache set error:', error);
      return false;
    }
  }

  /**
   * Récupérer une valeur du cache
   */
  static async get<T = any>(key: string): Promise<T | null> {
    try {
      const fullKey = this.buildKey(key);
      const cached = memoryCache.get(fullKey);
      
      if (cached && cached.expiry > Date.now()) {
        return cached.data;
      }
      
      if (cached) {
        memoryCache.delete(fullKey); // Supprimer si expiré
      }
      
      return null;
    } catch (error) {
      console.error('❌ Cache get error:', error);
      return null;
    }
  }

  /**
   * Supprimer une clé du cache
   */
  static async delete(key: string): Promise<boolean> {
    try {
      const fullKey = this.buildKey(key);
      memoryCache.delete(fullKey);
      return true;
    } catch (error) {
      console.error('❌ Cache delete error:', error);
      return false;
    }
  }

  /**
   * Supprimer toutes les clés avec un pattern
   */
  static async deletePattern(pattern: string): Promise<number> {
    try {
      const fullPattern = this.buildKey(pattern);
      let deleted = 0;
      const regex = new RegExp(fullPattern.replace('*', '.*'));
      
      for (const key of memoryCache.keys()) {
        if (regex.test(key)) {
          memoryCache.delete(key);
          deleted++;
        }
      }
      
      return deleted;
    } catch (error) {
      console.error('❌ Cache deletePattern error:', error);
      return 0;
    }
  }

  /**
   * Vérifier si une clé existe
   */
  static async exists(key: string): Promise<boolean> {
    try {
      const fullKey = this.buildKey(key);
      const cached = memoryCache.get(fullKey);
      return cached !== undefined && cached.expiry > Date.now();
    } catch (error) {
      console.error('❌ Cache exists error:', error);
      return false;
    }
  }

  /**
   * Obtenir ou calculer une valeur (pattern cache-aside)
   */
  static async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlSeconds: number = 3600
  ): Promise<T> {
    // Essayer de récupérer depuis le cache
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Si pas en cache, calculer la valeur
    const value = await fetcher();
    
    // Stocker en cache pour la prochaine fois
    await this.set(key, value, ttlSeconds);
    
    return value;
  }

  /**
   * Obtenir les statistiques du cache
   */
  static getStats() {
    const now = Date.now();
    let validKeys = 0;
    let expiredKeys = 0;
    
    for (const [, value] of memoryCache.entries()) {
      if (value.expiry > now) {
        validKeys++;
      } else {
        expiredKeys++;
      }
    }
    
    return {
      totalKeys: memoryCache.size,
      validKeys,
      expiredKeys,
      type: 'memory'
    };
  }

  /**
   * Vider tout le cache
   */
  static async clear(): Promise<void> {
    memoryCache.clear();
  }
}
