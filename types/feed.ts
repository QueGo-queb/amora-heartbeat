/**
 * Types TypeScript pour le système de feed
 */

export interface FeedPost {
  id: string;
  user_id: string;
  content: string;
  media: any[];
  tags: string[];
  visibility: 'public' | 'friends' | 'private';
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
  relevance_score: number;
  profiles: {
    id: string;
    email: string;
    full_name: string | null;
    gender: 'male' | 'female' | 'other' | null;
    birthdate: string | null;
    location: string | null;
    interests: string[];
    plan: 'free' | 'premium';
    premium_since: string | null;
    created_at: string;
  };
}

export interface FeedResponse {
  posts: FeedPost[];
  nextCursor?: string;
  hasMore: boolean;
}

export interface FeedFilters {
  tags?: string[];
  dateRange?: 'today' | 'week' | 'month' | 'all';
  contentType?: 'all' | 'text' | 'media';
}

export interface LikeResponse {
  success: boolean;
  liked: boolean;
  likes_count: number;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  profiles: {
    id: string;
    full_name: string | null;
    email: string;
  };
}
