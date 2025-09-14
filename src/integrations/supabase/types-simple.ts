// Types simplifiés pour éviter les erreurs TypeScript
export interface SimpleProfile {
  id: string;
  full_name: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  age?: number;
  gender?: string;
  interests?: string[];
  created_at: string;
  updated_at: string;
}

export interface SimplePost {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
}

export interface SimpleUser {
  id: string;
  email: string;
  created_at: string;
}

// Types pour les fonctionnalités de base
export interface BasicTables {
  profiles: SimpleProfile[];
  posts: SimplePost[];
  users: SimpleUser[];
}
