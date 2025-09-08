import { createClient } from 'redis';

// Configuration Redis selon l'environnement
const getRedisConfig = () => {
  if (import.meta.env.MODE === 'production') {
    return {
      url: import.meta.env.VITE_REDIS_URL || 'redis://localhost:6379',
      password: import.meta.env.VITE_REDIS_PASSWORD,
    };
  }
  
  // Configuration locale pour développement
  return {
    url: 'redis://localhost:6379',
  };
};

// Client Redis singleton
class RedisClient {
  private client: ReturnType<typeof createClient> | null = null;
  private isConnected = false;

  async getClient() {
    if (!this.client) {
      this.client = createClient(getRedisConfig());
      
      this.client.on('error', (err) => {
        console.error('❌ Redis Client Error:', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        });

      this.client.on('ready', () => {
        this.isConnected = true;
      });

      this.client.on('end', () => {
        this.isConnected = false;
      });
    }

    if (!this.isConnected) {
      try {
        await this.client.connect();
      } catch (error) {
        console.error('❌ Failed to connect to Redis:', error);
        throw error;
      }
    }

    return this.client;
  }

  async disconnect() {
    if (this.client && this.isConnected) {
      await this.client.disconnect();
      this.client = null;
      this.isConnected = false;
    }
  }

  isReady() {
    return this.isConnected;
  }
}

// Instance singleton
export const redisClient = new RedisClient();

// Helper pour vérifier si Redis est disponible
export const isRedisAvailable = async (): Promise<boolean> => {
  try {
    const client = await redisClient.getClient();
    await client.ping();
    return true;
  } catch (error) {
    return false;
  }
};
