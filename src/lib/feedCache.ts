import { CacheService } from './cache';
import type { FeedPost, FeedFilters, FeedResponse } from '../../types/feed';

export class FeedCacheService {
  private static FEED_TTL = 300; // 5 minutes
  private static USER_FEED_TTL = 600; // 10 minutes
  private static TRENDING_TTL = 900; // 15 minutes

  /**
   * Cache du feed utilisateur personnalisé
   */
  static async getUserFeed(
    userId: string,
    filters?: any
  ): Promise<FeedPost[] | null> {
    const filtersKey = filters ? `:${JSON.stringify(filters)}` : '';
    const key = `feed:user:${userId}${filtersKey}`;
    return await CacheService.get<FeedPost[]>(key);
  }

  static async setUserFeed(
    userId: string,
    posts: FeedPost[],
    filters?: any
  ): Promise<void> {
    const filtersKey = filters ? `:${JSON.stringify(filters)}` : '';
    const key = `feed:user:${userId}${filtersKey}`;
    await CacheService.set(key, posts, this.USER_FEED_TTL);
  }

  /**
   * Cache des posts populaires/tendance
   */
  static async getTrendingPosts(): Promise<FeedPost[] | null> {
    return await CacheService.get<FeedPost[]>('feed:trending');
  }

  static async setTrendingPosts(posts: FeedPost[]): Promise<void> {
    await CacheService.set('feed:trending', posts, this.TRENDING_TTL);
  }

  /**
   * Cache des scores de posts
   */
  static async getPostScore(postId: string, userId: string): Promise<number | null> {
    const key = `score:${postId}:${userId}`;
    return await CacheService.get<number>(key);
  }

  static async setPostScore(postId: string, userId: string, score: number): Promise<void> {
    const key = `score:${postId}:${userId}`;
    await CacheService.set(key, score, this.FEED_TTL);
  }

  /**
   * Invalidation du cache feed
   */
  static async invalidateUserFeed(userId: string): Promise<void> {
    await CacheService.deletePattern(`feed:user:${userId}*`);
  }

  static async invalidatePostCaches(postId: string): Promise<void> {
    await CacheService.deletePattern(`*:${postId}:*`);
    await CacheService.delete('feed:trending');
  }

  /**
   * Cache warm-up pour les posts populaires
   */
  static async warmUpCache(): Promise<void> {
    try {
      // Ici vous pouvez pré-charger les posts populaires
      // const trendingPosts = await fetchTrendingPostsFromDB();
      // await this.setTrendingPosts(trendingPosts);
      
      } catch (error) {
      console.error('❌ Error warming up cache:', error);
    }
  }
}
