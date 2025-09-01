/**
 * Types TypeScript pour le système d'administration
 * Définit les interfaces pour les publicités, promotions et données d'admin
 */

export interface AdminUser {
  id: string;
  email: string;
  full_name: string | null;
  role: 'user' | 'admin' | 'moderator';
  plan: 'free' | 'premium';
  created_at: string;
  last_login: string | null;
  is_suspended: boolean;
}

export interface Advertisement {
  id: string;
  title: string;
  content?: string;
  type: 'text' | 'image' | 'gif' | 'video' | 'lottie';
  media: {
    url?: string;
    width?: number;
    height?: number;
    duration?: number;
    thumbnail?: string;
    loop?: boolean;
    autoplay?: boolean;
    alt?: string;
  };
  target_tags: string[];
  target_location?: {
    latitude: number;
    longitude: number;
    radius: number;
  };
  start_at: string;
  end_at: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Promotion {
  id: string;
  title: string;
  description?: string;
  promo_type: 'discount' | 'featured' | 'boost' | 'premium';
  params: {
    discount_percent?: number;
    duration_months?: number;
    code?: string;
    boost_duration_days?: number;
    visibility_multiplier?: number;
    featured_position?: boolean;
    featured_duration_hours?: number;
    priority_score?: number;
    highlighted?: boolean;
  };
  start_at: string;
  end_at: string;
  is_active: boolean;
  created_by: string;
  price_cents?: number;
  stripe_product_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Report {
  id: string;
  reporter_id: string;
  reported_user_id?: string;
  reported_post_id?: string;
  report_type: 'spam' | 'inappropriate' | 'harassment' | 'fake' | 'other';
  description?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
}

export interface AdImpression {
  id: string;
  ad_id: string;
  user_id: string;
  ip_address: string;
  user_agent: string;
  viewed_at: string;
}

export interface AdClick {
  id: string;
  ad_id: string;
  user_id: string;
  ip_address: string;
  user_agent: string;
  clicked_at: string;
}

export interface AdminStats {
  total_users: number;
  premium_users: number;
  total_posts: number;
  active_ads: number;
  active_promotions: number;
  pending_reports: number;
  total_revenue_cents: number;
}

export interface Transaction {
  id: string;
  user_id: string;
  amount_cents: number;
  currency: string;
  stripe_payment_intent_id: string;
  status: 'created' | 'succeeded' | 'failed';
  created_at: string;
}

export interface CreateAdRequest {
  title: string;
  content?: string;
  type: 'text' | 'image' | 'gif' | 'video' | 'lottie';
  media?: {
    url: string;
    width?: number;
    height?: number;
    duration?: number;
    thumbnail?: string;
    loop?: boolean;
    autoplay?: boolean;
    alt?: string;
  };
  target_tags: string[];
  target_location?: {
    latitude: number;
    longitude: number;
    radius: number;
  };
  start_at: string;
  end_at: string;
  is_active: boolean;
}

export interface CreatePromotionRequest {
  title: string;
  description?: string;
  promo_type: 'discount' | 'featured' | 'boost' | 'premium';
  params: Record<string, any>;
  start_at: string;
  end_at: string;
  is_active: boolean;
  price_cents?: number;
}

export interface FeedItem {
  type: 'post' | 'ad';
  payload: any;
  relevance_score?: number;
}

export interface FeedResponse {
  items: FeedItem[];
  nextCursor?: string;
  hasMore: boolean;
}

