/**
 * Types Supabase - Version Temporaire
 * ⚠️ Ce fichier contient des types de base pour permettre la compilation
 * 📝 À remplacer par les types générés depuis le Dashboard Supabase
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          email: string
          full_name: string
          avatar_url: string | null
          bio: string | null
          birthdate: string | null
          gender: string | null
          age: number | null
          city: string | null
          region: string | null
          country: string | null
          language: string | null
          looking_for: string | null
          interests: string[] | null
          plan: string | null
          premium_since: string | null
          role: string | null
          subscription_plan: string | null
          is_active: boolean | null
          last_login: string | null
          profile_visibility: string | null
          location: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          email?: string
          full_name?: string
          avatar_url?: string | null
          bio?: string | null
          birthdate?: string | null
          gender?: string | null
          age?: number | null
          city?: string | null
          region?: string | null
          country?: string | null
          language?: string | null
          looking_for?: string | null
          interests?: string[] | null
          plan?: string | null
          premium_since?: string | null
          role?: string | null
          subscription_plan?: string | null
          is_active?: boolean | null
          last_login?: string | null
          profile_visibility?: string | null
          location?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email?: string
          full_name?: string
          avatar_url?: string | null
          bio?: string | null
          birthdate?: string | null
          gender?: string | null
          age?: number | null
          city?: string | null
          region?: string | null
          country?: string | null
          language?: string | null
          looking_for?: string | null
          interests?: string[] | null
          plan?: string | null
          premium_since?: string | null
          role?: string | null
          subscription_plan?: string | null
          is_active?: boolean | null
          last_login?: string | null
          profile_visibility?: string | null
          location?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          id: string
          user_id: string
          content: string
          image_url: string | null
          video_url: string | null
          media_urls: string[] | null
          media_types: string[] | null
          visibility: string
          likes_count: number
          comments_count: number
          shares_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          image_url?: string | null
          video_url?: string | null
          media_urls?: string[] | null
          media_types?: string[] | null
          visibility?: string
          likes_count?: number
          comments_count?: number
          shares_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content?: string
          image_url?: string | null
          video_url?: string | null
          media_urls?: string[] | null
          media_types?: string[] | null
          visibility?: string
          likes_count?: number
          comments_count?: number
          shares_count?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      likes: {
        Row: {
          id: string
          user_id: string
          post_id: string
          liked_user_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          post_id: string
          liked_user_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          post_id?: string
          liked_user_id?: string | null
          created_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          content: string
          is_read: boolean
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          content: string
          is_read?: boolean
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          receiver_id?: string
          content?: string
          is_read?: boolean
          read_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      matches: {
        Row: {
          id: string
          user1_id: string
          user2_id: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          user1_id: string
          user2_id: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          user1_id?: string
          user2_id?: string
          status?: string
          created_at?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_id: string
          status: string
          start_date: string
          end_date: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_id: string
          status?: string
          start_date?: string
          end_date?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_id?: string
          status?: string
          start_date?: string
          end_date?: string | null
          created_at?: string
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          id: string
          name: string
          price_usd: number
          currency: string
          duration_months: number
          features: Json
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          price_usd: number
          currency?: string
          duration_months: number
          features?: Json
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          price_usd?: number
          currency?: string
          duration_months?: number
          features?: Json
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          amount_cents: number
          currency: string
          status: string
          payment_method: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount_cents: number
          currency?: string
          status?: string
          payment_method?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount_cents?: number
          currency?: string
          status?: string
          payment_method?: string | null
          created_at?: string
        }
        Relationships: []
      }
      ads: {
        Row: {
          id: string
          title: string
          content: string | null
          type: string
          media: Json
          target_tags: string[]
          target_location: Json | null
          start_at: string
          end_at: string
          is_active: boolean
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          content?: string | null
          type: string
          media?: Json
          target_tags?: string[]
          target_location?: Json | null
          start_at: string
          end_at: string
          is_active?: boolean
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string | null
          type?: string
          media?: Json
          target_tags?: string[]
          target_location?: Json | null
          start_at?: string
          end_at?: string
          is_active?: boolean
          created_by?: string
          created_at?: string
        }
        Relationships: []
      }
      promotions: {
        Row: {
          id: string
          title: string
          description: string | null
          discount_percent: number
          is_active: boolean
          start_date: string
          end_date: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          discount_percent: number
          is_active?: boolean
          start_date: string
          end_date: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          discount_percent?: number
          is_active?: boolean
          start_date?: string
          end_date?: string
          created_at?: string
        }
        Relationships: []
      }
      admin_transfers: {
        Row: {
          id: string
          from_user_id: string
          to_user_id: string
          amount: number
          currency: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          from_user_id: string
          to_user_id: string
          amount: number
          currency?: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          from_user_id?: string
          to_user_id?: string
          amount?: number
          currency?: string
          status?: string
          created_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role_id: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role_id: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role_id?: string
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      roles: {
        Row: {
          id: string
          name: string
          display_name: string
          description: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          display_name: string
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          display_name?: string
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          id: string
          user_id: string
          endpoint: string
          keys: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          endpoint: string
          keys: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          endpoint?: string
          keys?: Json
          created_at?: string
        }
        Relationships: []
      }
      legal_pages: {
        Row: {
          id: string
          title: string
          content: string
          slug: string
          category: string
          is_active: boolean
          order_index: number
          meta_description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          slug: string
          category?: string
          is_active?: boolean
          order_index?: number
          meta_description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          slug?: string
          category?: string
          is_active?: boolean
          order_index?: number
          meta_description?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      admins: {
        Row: {
          id: string
          user_id: string
          full_name: string
          role: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name?: string
          role?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string
          role?: string
          created_at?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          id: string
          title: string
          description: string
          date: string
          location: string
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          date: string
          location: string
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          date?: string
          location?: string
          created_by?: string
          created_at?: string
        }
        Relationships: []
      }
      groups: {
        Row: {
          id: string
          name: string
          description: string | null
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_by?: string
          created_at?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          id: string
          email: string
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
        }
        Relationships: []
      }
      locals_available_for_travelers: {
        Row: {
          id: string
          user_id: string
          location: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          location: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          location?: string
          created_at?: string
        }
        Relationships: []
      }
      video_profiles: {
        Row: {
          id: string
          user_id: string
          video_url: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          video_url: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          video_url?: string
          created_at?: string
        }
        Relationships: []
      }
      live_chat_messages: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          receiver_id?: string
          content?: string
          created_at?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          favorited_user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          favorited_user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          favorited_user_id?: string
          created_at?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          id: string
          user_id: string
          allow_calls_from: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          allow_calls_from?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          allow_calls_from?: string
          created_at?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          id: string
          reporter_id: string
          reported_user_id: string
          reason: string
          report_type: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          reporter_id: string
          reported_user_id: string
          reason: string
          report_type: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          reporter_id?: string
          reported_user_id?: string
          reason?: string
          report_type?: string
          status?: string
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

