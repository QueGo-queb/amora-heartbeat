export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admins: {
        Row: {
          created_at: string
          full_name: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name?: string
          id?: string
          role?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string
          created_by: string
          date: string
          description: string
          id: string
          location: string
          title: string
        }
        Insert: {
          created_at?: string
          created_by?: string
          date?: string
          description?: string
          id?: string
          location?: string
          title?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          date?: string
          description?: string
          id?: string
          location?: string
          title?: string
        }
        Relationships: []
      }
      groups: {
        Row: {
          created_at: string
          created_by: string
          description: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          created_by?: string
          description?: string
          id?: string
          name?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content?: string
          created_at?: string
          id?: string
          receiver_id?: string
          sender_id?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          receiver_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          content: string
          created_at: string
          id: string
          user_id: string
          media_urls?: string[]
          visibility?: string
          post_type?: string
          likes_count?: number
          comments_count?: number
        }
        Insert: {
          content?: string
          created_at?: string
          id?: string
          user_id?: string
          media_urls?: string[]
          visibility?: string
          post_type?: string
          likes_count?: number
          comments_count?: number
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          user_id?: string
          media_urls?: string[]
          visibility?: string
          post_type?: string
          likes_count?: number
          comments_count?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number
          bio: string
          city: string
          country: string
          created_at: string
          full_name: string
          gender: string
          id: string
          language: string
          looking_for: string
          region: string
          role: string
          subscription_plan: string
          user_id: string
          email: string
          plan: string
          is_active: boolean
          premium_since: string | null
          interests: string[] | null
          avatar_url: string | null
          seeking_gender: string | null
          location: string | null
          updated_at: string | null
        }
        Insert: {
          age?: number
          bio?: string
          city?: string
          country?: string
          created_at?: string
          full_name?: string
          gender?: string
          id?: string
          language?: string
          looking_for?: string
          region?: string
          role?: string
          subscription_plan?: string
          user_id?: string
          email?: string
          plan?: string
          is_active?: boolean
          premium_since?: string | null
          interests?: string[] | null
          avatar_url?: string | null
          seeking_gender?: string | null
          location?: string | null
          updated_at?: string | null
        }
        Update: {
          age?: number
          bio?: string
          city?: string
          country?: string
          created_at?: string
          full_name?: string
          gender?: string
          id?: string
          language?: string
          looking_for?: string
          region?: string
          role?: string
          subscription_plan?: string
          user_id?: string
          email?: string
          plan?: string
          is_active?: boolean
          premium_since?: string | null
          interests?: string[] | null
          avatar_url?: string | null
          seeking_gender?: string | null
          location?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          end_date: string
          id: string
          plan: "free" | "premium"
          start_date: string
          status: "active" | "inactive" | "canceled"
          user_id: string
        }
        Insert: {
          end_date?: string
          id?: string
          plan?: "free" | "premium"
          start_date?: string
          status?: "active" | "inactive" | "canceled"
          user_id?: string
        }
        Update: {
          end_date?: string
          id?: string
          plan?: "free" | "premium"
          start_date?: string
          status?: "active" | "inactive" | "canceled"
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          email: string
          id: string
          role: string
        }
        Insert: {
          created_at?: string
          email?: string
          id?: string
          role?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          role?: string
        }
        Relationships: []
      }
      // NOUVELLES TABLES AJOUTÉES
      subscription_plans: {
        Row: {
          id: string
          name: string
          description: string
          duration_type: 'monthly' | 'yearly' | 'lifetime'
          price_amount: number
          currency: string
          stripe_price_id: string | null
          is_active: boolean
          is_featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          duration_type: 'monthly' | 'yearly' | 'lifetime'
          price_amount: number
          currency?: string
          stripe_price_id?: string | null
          is_active?: boolean
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          duration_type?: 'monthly' | 'yearly' | 'lifetime'
          price_amount?: number
          currency?: string
          stripe_price_id?: string | null
          is_active?: boolean
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_id: string
          start_date: string
          end_date: string | null
          status: 'active' | 'inactive' | 'canceled'
          created_at: string
          plan?: string
          auto_renewal?: boolean
          updated_at?: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_id: string
          start_date?: string
          end_date?: string | null
          status?: 'active' | 'inactive' | 'canceled'
          created_at?: string
          plan?: string
          auto_renewal?: boolean
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_id?: string
          start_date?: string
          end_date?: string | null
          status?: 'active' | 'inactive' | 'canceled' | 'expired'
          auto_renewal?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      premium_notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          message: string
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          message?: string
          read_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      premium_subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_id: string
          status: 'active' | 'inactive' | 'canceled' | 'expired'
          start_date: string
          end_date: string
          notification_sent: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_id: string
          status?: 'active' | 'inactive' | 'canceled' | 'expired'
          start_date: string
          end_date: string
          notification_sent?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_id?: string
          status?: 'active' | 'inactive' | 'canceled' | 'expired'
          start_date?: string
          end_date?: string
          notification_sent?: boolean
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
          description: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          display_name: string
          description: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          display_name?: string
          description?: string
          created_at?: string
        }
        Relationships: []
      }
      permissions: {
        Row: {
          id: string
          name: string
          display_name: string
          description: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          display_name: string
          description: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          display_name?: string
          description?: string
          created_at?: string
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          id: string
          role_id: string
          permission_id: string
          created_at: string
        }
        Insert: {
          id?: string
          role_id: string
          permission_id: string
          created_at?: string
        }
        Update: {
          id?: string
          role_id?: string
          permission_id?: string
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
          status: 'pending' | 'succeeded' | 'failed'
          stripe_payment_intent_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount_cents: number
          currency?: string
          status?: 'pending' | 'succeeded' | 'failed'
          stripe_payment_intent_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount_cents?: number
          currency?: string
          status?: 'pending' | 'succeeded' | 'failed'
          stripe_payment_intent_id?: string
          created_at?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          id: string
          reporter_id: string
          reported_id: string
          type: string
          reason: string
          status: 'pending' | 'resolved' | 'dismissed'
          created_at: string
        }
        Insert: {
          id?: string
          reporter_id: string
          reported_id: string
          type: string
          reason: string
          status?: 'pending' | 'resolved' | 'dismissed'
          created_at?: string
        }
        Update: {
          id?: string
          reporter_id?: string
          reported_id?: string
          type?: string
          reason?: string
          status?: 'pending' | 'resolved' | 'dismissed'
          created_at?: string
        }
        Relationships: []
      }
      ads: {
        Row: {
          id: string
          title: string
          content: string
          type: string
          is_active: boolean
          start_at: string
          end_at: string
          target_tags: string[]
          created_at: string
          media?: string[]
          created_by?: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          type: string
          is_active?: boolean
          start_at: string
          end_at: string
          target_tags?: string[]
          created_at?: string
          media?: string[]
          created_by?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          type?: string
          is_active?: boolean
          start_at?: string
          end_at?: string
          target_tags?: string[]
          created_at?: string
          media?: string[]
          created_by?: string
        }
        Relationships: []
      }
      promotions: {
        Row: {
          id: string
          title: string
          description: string
          discount_percentage: number
          is_active: boolean
          start_date: string
          end_date: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          discount_percentage: number
          is_active?: boolean
          start_date: string
          end_date: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          discount_percentage?: number
          is_active?: boolean
          start_date?: string
          end_date?: string
          created_at?: string
        }
        Relationships: []
      }
      likes: {
        Row: {
          id: string
          user_id: string
          post_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          post_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          post_id?: string
          created_at?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          id: string
          user_id: string
          subscription: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subscription: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subscription?: string
          updated_at?: string
        }
        Relationships: []
      }
      paypal_config: {
        Row: {
          id: string
          client_id: string
          client_secret: string
          paypal_email: string
          environment: string
          is_active: boolean
          created_at: string
          created_by?: string
        }
        Insert: {
          id?: string
          client_id: string
          client_secret: string
          paypal_email: string
          environment?: string
          is_active?: boolean
          created_at?: string
          created_by?: string
        }
        Update: {
          id?: string
          client_id?: string
          client_secret?: string
          paypal_email?: string
          environment?: string
          is_active?: boolean
          created_at?: string
          created_by?: string
        }
        Relationships: []
      }
      paypal_payments: {
        Row: {
          id: string
          user_id: string
          order_id: string
          amount: number
          currency: string
          status: 'pending' | 'failed' | 'completed' | 'cancelled'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          order_id: string
          amount: number
          currency?: string
          status?: 'pending' | 'failed' | 'completed' | 'cancelled'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          order_id?: string
          amount?: number
          currency?: string
          status?: 'pending' | 'failed' | 'completed' | 'cancelled'
          created_at?: string
        }
        Relationships: []
      }
      premium_pricing: {
        Row: {
          id: string
          price_usd: number
          currency: string
          is_active: boolean
          updated_at: string
          created_at: string
          price_eur: number | null
          price_cad: number | null
          price_clp: number | null
          price_htg: number | null
        }
        Insert: {
          id?: string
          price_usd: number
          currency?: string
          is_active?: boolean
          updated_at?: string
          created_at?: string
          price_eur?: number | null
          price_cad?: number | null
          price_clp?: number | null
          price_htg?: number | null
        }
        Update: {
          id?: string
          price_usd?: number
          currency?: string
          is_active?: boolean
          updated_at?: string
          created_at?: string
          price_eur?: number | null
          price_cad?: number | null
          price_clp?: number | null
          price_htg?: number | null
        }
        Relationships: []
      }
      usdt_payment_links: {
        Row: {
          id: string
          trc20_address: string
          erc20_address: string
          trc20_qr_code: string
          erc20_qr_code: string
          is_active: boolean
          updated_at: string
          created_at: string
        }
        Insert: {
          id?: string
          trc20_address: string
          erc20_address: string
          trc20_qr_code?: string
          erc20_qr_code?: string
          is_active?: boolean
          updated_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          trc20_address?: string
          erc20_address?: string
          trc20_qr_code?: string
          erc20_qr_code?: string
          is_active?: boolean
          updated_at?: string
          created_at?: string
        }
        Relationships: []
      }
      user_visible_posts: {
        Row: {
          id: string
          content: string
          post_type: string
          target_age_min: number
          target_age_max: number
          created_at: string
          user_id: string
        }
        Insert: {
          id?: string
          content: string
          post_type: string
          target_age_min: number
          target_age_max: number
          created_at?: string
          user_id: string
        }
        Update: {
          id?: string
          content?: string
          post_type?: string
          target_age_min?: number
          target_age_max?: number
          created_at?: string
          user_id?: string
        }
        Relationships: []
      }
      footer_socials: {
        Row: {
          id: string
          platform: string
          url: string
          icon: string
          is_active: boolean
          created_at: string
          created_by?: string
          name: string
          icon_name: string
          href: string
          color_class: string
          order_index: number
          updated_at: string
        }
        Insert: {
          id?: string
          platform: string
          url: string
          icon: string
          is_active?: boolean
          created_at?: string
          created_by?: string
          name: string
          icon_name: string
          href: string
          color_class?: string
          order_index?: number
          updated_at?: string
        }
        Update: {
          id?: string
          platform?: string
          url?: string
          icon?: string
          is_active?: boolean
          created_at?: string
          created_by?: string
          name?: string
          icon_name?: string
          href?: string
          color_class?: string
          order_index?: number
          updated_at?: string
        }
        Relationships: []
      }
      footer_links: {
        Row: {
          id: string
          title: string
          url: string
          order: number
          is_active: boolean
          created_at: string
          created_by?: string
          category: 'quick_links' | 'support' | 'legal'
          name: string
          href: string
          order_index: number
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          url: string
          order?: number
          is_active?: boolean
          created_at?: string
          created_by?: string
          category: 'quick_links' | 'support' | 'legal'
          name: string
          href: string
          order_index?: number
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          url?: string
          order?: number
          is_active?: boolean
          created_at?: string
          created_by?: string
          category?: 'quick_links' | 'support' | 'legal'
          name?: string
          href?: string
          order_index?: number
          updated_at?: string
        }
        Relationships: []
      }
      moncash_config: {
        Row: {
          id: string
          phone_number: string
          account_name: string
          is_active: boolean
          is_paused: boolean
          created_at: string
          updated_at: string
          created_by?: string
        }
        Insert: {
          id?: string
          phone_number: string
          account_name: string
          is_active?: boolean
          is_paused?: boolean
          created_at?: string
          updated_at?: string
          created_by?: string
        }
        Update: {
          id?: string
          phone_number?: string
          account_name?: string
          is_active?: boolean
          is_paused?: boolean
          created_at?: string
          updated_at?: string
          created_by?: string
        }
        Relationships: []
      }
      moncash_payments: {
        Row: {
          id: string
          config_id: string
          user_id: string
          amount: number
          status: 'pending' | 'verified' | 'rejected'
          transaction_id: string
          created_at: string
        }
        Insert: {
          id?: string
          config_id: string
          user_id: string
          amount: number
          status?: 'pending' | 'verified' | 'rejected'
          transaction_id?: string
          created_at?: string
        }
        Update: {
          id?: string
          config_id?: string
          user_id?: string
          amount?: number
          status?: 'pending' | 'verified' | 'rejected'
          transaction_id?: string
          created_at?: string
        }
        Relationships: []
      }
      caja_vecina_payments: {
        Row: {
          id: string
          config_id: string
          user_id: string
          amount: number
          status: 'pending' | 'verified' | 'rejected'
          transaction_id: string
          created_at: string
          account_id: string
          receipt_image_url?: string
          transaction_reference?: string
        }
        Insert: {
          id?: string
          config_id: string
          user_id: string
          amount: number
          status?: 'pending' | 'verified' | 'rejected'
          transaction_id?: string
          created_at?: string
          account_id: string
          receipt_image_url?: string
          transaction_reference?: string
        }
        Update: {
          id?: string
          config_id?: string
          user_id?: string
          amount?: number
          status?: 'pending' | 'verified' | 'rejected'
          transaction_id?: string
          created_at?: string
          account_id?: string
          receipt_image_url?: string
          transaction_reference?: string
        }
        Relationships: []
      }
      post_likes: {
        Row: {
          id: string
          post_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          created_at?: string
        }
        Relationships: []
      }
      footer_content: {
        Row: {
          id: string
          company_name: string
          company_description: string
          company_stats: any
          is_active: boolean
          created_at: string
          updated_at: string
          created_by?: string
        }
        Insert: {
          id?: string
          company_name: string
          company_description: string
          company_stats: any
          is_active?: boolean
          created_at?: string
          updated_at?: string
          created_by?: string
        }
        Update: {
          id?: string
          company_name?: string
          company_description?: string
          company_stats?: any
          is_active?: boolean
          created_at?: string
          updated_at?: string
          created_by?: string
        }
        Relationships: []
      }
      caja_vecina_accounts: {
        Row: {
          id: string
          phone_number: string
          account_name: string
          is_active: boolean
          is_paused: boolean
          created_at: string
          updated_at: string
          account_number: string
          rut: string
          created_by?: string
        }
        Insert: {
          id?: string
          phone_number: string
          account_name: string
          is_active?: boolean
          is_paused?: boolean
          created_at?: string
          updated_at?: string
          account_number: string
          rut: string
          created_by?: string
        }
        Update: {
          id?: string
          phone_number?: string
          account_name?: string
          is_active?: boolean
          is_paused?: boolean
          created_at?: string
          updated_at?: string
          account_number?: string
          rut?: string
          created_by?: string
        }
        Relationships: []
      }
      admin_config: {
        Row: {
          id: string
          key: string
          value: any
          description: string
          updated_at: string
          created_at: string
        }
        Insert: {
          id?: string
          key: string
          value: any
          description?: string
          updated_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: any
          description?: string
          updated_at?: string
          created_at?: string
        }
        Relationships: []
      }
      call_sessions: {
        Row: {
          id: string
          caller_id: string
          receiver_id: string
          call_type: 'audio' | 'video'
          status: 'initiating' | 'ringing' | 'connecting' | 'active' | 'ended' | 'cancelled' | 'failed' | 'rejected'
          duration_seconds: number
          created_at: string
          started_at: string | null
          ended_at: string | null
          last_activity_at: string
          caller_sdp: Json | null
          receiver_sdp: Json | null
          ice_candidates: Json | null
          connection_quality: 'excellent' | 'good' | 'poor' | 'unknown' | null
        }
        Insert: {
          id?: string
          caller_id: string
          receiver_id: string
          call_type: 'audio' | 'video'
          status?: 'initiating' | 'ringing' | 'connecting' | 'active' | 'ended' | 'cancelled' | 'failed' | 'rejected'
          duration_seconds?: number
          created_at?: string
          started_at?: string | null
          ended_at?: string | null
          last_activity_at?: string
          caller_sdp?: Json | null
          receiver_sdp?: Json | null
          ice_candidates?: Json | null
          connection_quality?: 'excellent' | 'good' | 'poor' | 'unknown' | null
        }
        Update: {
          id?: string
          caller_id?: string
          receiver_id?: string
          call_type?: 'audio' | 'video'
          status?: 'initiating' | 'ringing' | 'connecting' | 'active' | 'ended' | 'cancelled' | 'failed' | 'rejected'
          duration_seconds?: number
          created_at?: string
          started_at?: string | null
          ended_at?: string | null
          last_activity_at?: string
          caller_sdp?: Json | null
          receiver_sdp?: Json | null
          ice_candidates?: Json | null
          connection_quality?: 'excellent' | 'good' | 'poor' | 'unknown' | null
        }
        Relationships: [
          {
            foreignKeyName: "call_sessions_caller_id_fkey"
            columns: ["caller_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_sessions_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      call_preferences: {
        Row: {
          user_id: string
          allow_calls_from: 'everyone' | 'matches' | 'premium' | 'none'
          auto_answer: boolean
          call_notifications: boolean
          video_quality: 'low' | 'medium' | 'high' | 'auto'
          audio_echo_cancellation: boolean
          available_for_calls: boolean
          available_hours_start: string
          available_hours_end: string
          timezone: string
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          allow_calls_from?: 'everyone' | 'matches' | 'premium' | 'none'
          auto_answer?: boolean
          call_notifications?: boolean
          video_quality?: 'low' | 'medium' | 'high' | 'auto'
          audio_echo_cancellation?: boolean
          available_for_calls?: boolean
          available_hours_start?: string
          available_hours_end?: string
          timezone?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          allow_calls_from?: 'everyone' | 'matches' | 'premium' | 'none'
          auto_answer?: boolean
          call_notifications?: boolean
          video_quality?: 'low' | 'medium' | 'high' | 'auto'
          audio_echo_cancellation?: boolean
          available_for_calls?: boolean
          available_hours_start?: string
          available_hours_end?: string
          timezone?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "call_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      user_has_permission: {
        Args: {
          user_id: string
          permission_name: string
        }
        Returns: boolean
      }
      get_feed_posts_optimized: {
        Args: {
          user_id: string
          limit_count?: number
          offset_count?: number
          page_size?: number
          cursor_date?: string
          user_filters?: any
        }
        Returns: any[]
      }
      get_all_premium_pricing: {
        Args: {}
        Returns: any[]
      }
      get_active_premium_pricing: {
        Args: {}
        Returns: any
      }
      save_premium_pricing: {
        Args: {
          pricing_data: any
          admin_email?: string
          p_price_usd?: number
          p_price_eur?: number
          p_price_cad?: number
          p_price_clp?: number
          p_price_htg?: number
          p_currency?: string
          p_exchange_rates?: any
        }
        Returns: any
      }
      activate_premium_pricing: {
        Args: {
          pricing_id: string
        }
        Returns: boolean
      }
      get_current_user_unified: {
        Args: {}
        Returns: any
      }
    }
    // NOUVELLES TABLES POUR LE SYSTÈME DE TRANSFERT D'ARGENT
    payment_methods: {
      Row: {
        id: string
        type: 'bank' | 'card' | 'interac'
        name: string
        details: string
        is_default: boolean
        is_active: boolean
        created_by: string
        created_at: string
        updated_at: string
      }
      Insert: {
        id?: string
        type: 'bank' | 'card' | 'interac'
        name: string
        details: string
        is_default?: boolean
        is_active?: boolean
        created_by: string
        created_at?: string
        updated_at?: string
      }
      Update: {
        id?: string
        type?: 'bank' | 'card' | 'interac'
        name?: string
        details?: string
        is_default?: boolean
        is_active?: boolean
        created_by?: string
        created_at?: string
        updated_at?: string
      }
      Relationships: []
    }
    admin_transfers: {
      Row: {
        id: string
        amount: number
        status: 'pending' | 'completed' | 'failed'
        transfer_method: string
        payment_method_id: string
        requested_by: string
        description: string
        created_at: string
        updated_at: string
      }
      Insert: {
        id?: string
        amount: number
        status?: 'pending' | 'completed' | 'failed'
        transfer_method: string
        payment_method_id: string
        requested_by: string
        description: string
        created_at?: string
        updated_at?: string
      }
      Update: {
        id?: string
        amount?: number
        status?: 'pending' | 'completed' | 'failed'
        transfer_method?: string
        payment_method_id?: string
        requested_by?: string
        description?: string
        created_at?: string
        updated_at?: string
      }
      Relationships: []
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
        Database["public"]["Views"])
    ? (Database["public"]["Tables"] &
        Database["public"]["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
    ? Database["public"]["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof Database["public"]["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof Database
}
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof Database["public"]["CompositeTypes"]
    ? Database["public"]["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      gender_type: ["homme", "femme"],
      plan_type: ["free", "premium"],
      subscription_status: ["active", "inactive", "canceled"],
    },
  },
} as const
