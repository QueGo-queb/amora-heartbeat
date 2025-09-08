import { redisClient, isRedisAvailable } from './redis';

// Cache en mémoire de secours
const memoryCache = new Map<string, { data: any; expiry: number }>();

// Nettoyage périodique du cache mémoire
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of memoryCache.entries()) {
    if (value.expiry < now) {
      memoryCache.delete(key);
    }
  }
}, 60000); // Nettoyage toutes les minutes

export class CacheService {
  private static PREFIX = 'amora:';

  /**
   * Construire une clé de cache avec préfixe
   */
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
    const fullKey = this.buildKey(key);
    
    try {
      if (await isRedisAvailable()) {
        const client = await redisClient.getClient();
        await client.setEx(fullKey, ttlSeconds, JSON.stringify(value));
        return true;
      } else {
        // Fallback vers le cache mémoire
        const expiry = Date.now() + (ttlSeconds * 1000);
        memoryCache.set(fullKey, { data: value, expiry });
        return true;
      }
    } catch (error) {
      console.error('❌ Cache set error:', error);
      return false;
    }
  }

  /**
   * Récupérer une valeur du cache
   */
  static async get<T = any>(key: string): Promise<T | null> {
    const fullKey = this.buildKey(key);
    
    try {
      if (await isRedisAvailable()) {
        const client = await redisClient.getClient();
        const result = await client.get(fullKey);
        return result ? JSON.parse(result.toString()) : null;
      } else {
        // Fallback vers le cache mémoire
        const cached = memoryCache.get(fullKey);
        if (cached && cached.expiry > Date.now()) {
          return cached.data;
        }
        if (cached) {
          memoryCache.delete(fullKey); // Supprimer si expiré
        }
        return null;
      }
    } catch (error) {
      console.error('❌ Cache get error:', error);
      return null;
    }
  }

  /**
   * Supprimer une clé du cache
   */
  static async delete(key: string): Promise<boolean> {
    const fullKey = this.buildKey(key);
    
    try {
      if (await isRedisAvailable()) {
        const client = await redisClient.getClient();
        await client.del(fullKey);
      } else {
        memoryCache.delete(fullKey);
      }
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
    const fullPattern = this.buildKey(pattern);
    
    try {
      if (await isRedisAvailable()) {
        const client = await redisClient.getClient();
        const keys = await client.keys(fullPattern);
        if (keys.length > 0) {
          return Number(await client.del(keys));
        }
        return 0;
      } else {
        // Pour le cache mémoire, simuler pattern matching
        let deleted = 0;
        const regex = new RegExp(fullPattern.replace('*', '.*'));
        for (const key of memoryCache.keys()) {
          if (regex.test(key)) {
            memoryCache.delete(key);
            deleted++;
          }
        }
        return deleted;
      }
    } catch (error) {
      console.error('❌ Cache deletePattern error:', error);
      return 0;
    }
  }

  /**
   * Vérifier si une clé existe
   */
  static async exists(key: string): Promise<boolean> {
    const fullKey = this.buildKey(key);
    
    try {
      if (await isRedisAvailable()) {
        const client = await redisClient.getClient();
        return (await client.exists(fullKey)) === 1;
      } else {
        const cached = memoryCache.get(fullKey);
        return cached !== undefined && cached.expiry > Date.now();
      }
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
   * Invalidation de cache par tags
   */
  static async invalidateTags(tags: string[]): Promise<void> {
    for (const tag of tags) {
      await this.deletePattern(`*:${tag}:*`);
    }
  }
}
