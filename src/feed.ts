/**
 * Types pour le système de feed
 * Définit les interfaces pour les posts, likes, commentaires et filtres
 */

export interface FeedPost {
  id: string;
  user_id: string;
  content: string;
  media: MediaItem[];
  tags: string[];
  visibility: 'public' | 'friends' | 'private';
  location?: Location;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  is_premium: boolean;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    full_name: string;
    avatar_url?: string;
    is_premium: boolean;
  };
  is_liked?: boolean;
  is_shared?: boolean;
}

export interface MediaItem {
  type: 'image' | 'video' | 'gif';
  url: string;
  thumbnail?: string;
  alt?: string;
  duration?: number; // pour les vidéos
}

export interface Location {
  lat: number;
  lng: number;
  city: string;
  country: string;
}

export interface PostLike {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

export interface PostComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  replies?: PostComment[];
}

export interface FeedFilters {
  media_type?: 'all' | 'image' | 'video' | 'gif';
  tags?: string[];
  sort_by?: 'recent' | 'popular' | 'trending';
  location?: Location;
  max_distance?: number;
  premium_only?: boolean;
}

export interface FeedPreferences {
  looking_for_gender?: string;
  age_min: number;
  age_max: number;
  interests: string[];
  location_preference?: string;
  max_distance: number;
}

export interface FeedResponse {
  posts: FeedPost[];
  has_more: boolean;
  next_cursor?: string;
  total_count: number;
}

export interface CreatePostData {
  content: string;
  media?: MediaItem[];
  tags?: string[];
  visibility?: 'public' | 'friends' | 'private';
  location?: Location;
}
