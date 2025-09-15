/**
 * Types TypeScript pour le système de feed
 */

export interface FeedPost {
  id: string;
  content: string;
  user_id?: string;
  created_at: string;
  updated_at?: string;
  likes_count?: number;
  comments_count?: number;
  visibility?: 'public' | 'private' | 'friends';
  post_type?: 'text' | 'image' | 'video';
  media_urls?: string[];
  target_age_min?: number;
  target_age_max?: number;
  target_countries?: string[];
  target_languages?: string[];
  target_interests?: string[];
  target_genders?: string[];
  author_name?: string;
  profiles?: {
    id: string;
    full_name: string;
    avatar_url?: string;
    interests?: string[];
  };
  is_premium?: boolean;
  media?: string[];
  is_liked?: boolean;
  user?: {
    id: string;
    full_name: string;
    avatar_url?: string;
    is_premium: boolean;
  };
  score?: number;
  user_has_liked?: boolean;
  tags?: string[];
}

export interface SocialFeedPost extends FeedPost {
  commonInterests: string[];
  relevanceScore: number;
}

export interface SearchPost extends FeedPost {
  author_name: string;
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
  media_type?: 'all' | 'image' | 'video' | 'text' | 'gif';
  premium_only?: boolean;
  sort_by?: 'recent' | 'popular' | 'trending';
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

export interface PostContactRequest {
  id: string;
  post_id: string;
  requester_id: string;
  recipient_id: string;
  message?: string;
  status: 'pending' | 'accepted' | 'declined' | 'ignored';
  created_at: string;
  updated_at: string;
  requester_profile?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  recipient_profile?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  post?: {
    id: string;
    content: string;
    created_at: string;
  };
}

export interface PostInitiatedConversation {
  id: string;
  contact_request_id: string;
  conversation_id?: string;
  created_at: string;
}

export interface ContactRequestResponse {
  success: boolean;
  contact_request_id?: string;
  message?: string;
}

// Étendre FeedPost pour inclure les informations de contact
export interface FeedPostWithContact extends FeedPost {
  contact_request_status?: 'none' | 'pending' | 'accepted' | 'declined';
  can_contact?: boolean;
}
