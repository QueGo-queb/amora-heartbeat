/**
 * ✅ SYSTÈME DE RATE LIMITING CÔTÉ CLIENT
 */

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  key: string;
}

class RateLimiter {
  private static instance: RateLimiter;
  private requests: Map<string, number[]> = new Map();

  static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }

  // Vérifier si une action est autorisée
  isAllowed(config: RateLimitConfig): boolean {
    const now = Date.now();
    const key = config.key;
    
    // Récupérer les requêtes existantes
    let requests = this.requests.get(key) || [];
    
    // Supprimer les requêtes expirées
    requests = requests.filter(time => now - time < config.windowMs);
    
    // Vérifier la limite
    if (requests.length >= config.maxRequests) {
      return false;
    }
    
    // Ajouter la nouvelle requête
    requests.push(now);
    this.requests.set(key, requests);
    
    return true;
  }

  // Obtenir le temps d'attente restant
  getWaitTime(config: RateLimitConfig): number {
    const now = Date.now();
    const key = config.key;
    const requests = this.requests.get(key) || [];
    
    if (requests.length < config.maxRequests) {
      return 0;
    }
    
    const oldestRequest = Math.min(...requests);
    return Math.max(0, config.windowMs - (now - oldestRequest));
  }

  // Réinitialiser le rate limit pour une clé
  reset(key: string): void {
    this.requests.delete(key);
  }
}

export const rateLimiter = RateLimiter.getInstance();

// Configurations prédéfinies
export const rateLimitConfigs = {
  login: { maxRequests: 5, windowMs: 15 * 60 * 1000, key: 'login' }, // 5 tentatives par 15min
  signup: { maxRequests: 3, windowMs: 60 * 60 * 1000, key: 'signup' }, // 3 tentatives par heure
  post: { maxRequests: 10, windowMs: 60 * 1000, key: 'post' }, // 10 posts par minute
  message: { maxRequests: 20, windowMs: 60 * 1000, key: 'message' }, // 20 messages par minute
  like: { maxRequests: 50, windowMs: 60 * 1000, key: 'like' } // 50 likes par minute
};

// Hook pour utiliser le rate limiting
export const useRateLimit = (config: RateLimitConfig) => {
  const isAllowed = rateLimiter.isAllowed(config);
  const waitTime = rateLimiter.getWaitTime(config);
  
  return {
    isAllowed,
    waitTime,
    reset: () => rateLimiter.reset(config.key)
  };
};
