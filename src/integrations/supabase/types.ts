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
          media_types?: string[]
          publication_language?: string
          gender_targeting?: string
          target_countries?: string[]
          languages?: string[]
          age_range_min?: number
          age_range_max?: number
          phone_number?: string
          is_premium_post?: boolean
          is_active?: boolean
          updated_at?: string
          views_count?: number
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
          media_types?: string[]
          publication_language?: string
          gender_targeting?: string
          target_countries?: string[]
          languages?: string[]
          age_range_min?: number
          age_range_max?: number
          phone_number?: string
          is_premium_post?: boolean
          is_active?: boolean
          updated_at?: string
          views_count?: number
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
          media_types?: string[]
          publication_language?: string
          gender_targeting?: string
          target_countries?: string[]
          languages?: string[]
          age_range_min?: number
          age_range_max?: number
          phone_number?: string
          is_premium_post?: boolean
          is_active?: boolean
          updated_at?: string
          views_count?: number
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
      // ✅ TABLES AJOUTÉES CORRECTEMENT
      locals_available_for_travelers: {
        Row: {
          id: string
          user_id: string
          full_name: string
          age: number | null
          destination_city: string | null
          destination_country: string | null
          travel_type: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name: string
          age?: number | null
          destination_city?: string | null
          destination_country?: string | null
          travel_type?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string
          age?: number | null
          destination_city?: string | null
          destination_country?: string | null
          travel_type?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      video_profiles: {
        Row: {
          id: string
          user_id: string
          video_profile_url: string | null
          storage_path: string | null
          thumbnail_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          video_profile_url?: string | null
          storage_path?: string | null
          thumbnail_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          video_profile_url?: string | null
          storage_path?: string | null
          thumbnail_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      live_chat_messages: {
        Row: {
          id: string
          user_id: string
          message: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          message: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          message?: string
          created_at?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          favorite_user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          favorite_user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          favorite_user_id?: string
          created_at?: string
        }
        Relationships: []
      }
      matches: {
        Row: {
          id: string
          user_id: string
          matched_user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          matched_user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          matched_user_id?: string
          created_at?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          id: string
          user_id: string
          notifications_enabled: boolean
          email_notifications: boolean
          push_notifications: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          notifications_enabled?: boolean
          email_notifications?: boolean
          push_notifications?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          notifications_enabled?: boolean
          email_notifications?: boolean
          push_notifications?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      legal_pages: {
        Row: {
          id: string
          slug: string
          title: string
          content: string
          meta_description: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          content: string
          meta_description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          content?: string
          meta_description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          id: string
          reporter_id: string
          reported_user_id: string | null
          reported_post_id: string | null
          report_type: string
          reason: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          reporter_id: string
          reported_user_id?: string | null
          reported_post_id?: string | null
          report_type: string
          reason: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          reporter_id?: string
          reported_user_id?: string | null
          reported_post_id?: string | null
          report_type?: string
          reason?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
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
    }
    Enums: {
      gender_type: ["homme", "femme"],
      plan_type: ["free", "premium"],
      subscription_status: ["active", "inactive", "canceled"],
    },
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

      // ✅ AJOUT - Tables manquantes
      locals_available_for_travelers: {
        Row: {
          id: string;
          user_id: string;
          full_name: string;
          age: number | null;
          destination_city: string | null;
          destination_country: string | null;
          travel_type: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          full_name: string;
          age?: number | null;
          destination_city?: string | null;
          destination_country?: string | null;
          travel_type?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          full_name?: string;
          age?: number | null;
          destination_city?: string | null;
          destination_country?: string | null;
          travel_type?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      video_profiles: {
        Row: {
          id: string;
          user_id: string;
          video_profile_url: string | null;
          storage_path: string | null;
          thumbnail_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          video_profile_url?: string | null;
          storage_path?: string | null;
          thumbnail_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          video_profile_url?: string | null;
          storage_path?: string | null;
          thumbnail_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      live_chat_messages: {
        Row: {
          id: string;
          user_id: string;
          message: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          message: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          message?: string;
          created_at?: string;
        };
      };

      favorites: {
        Row: {
          id: string;
          user_id: string;
          favorite_user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          favorite_user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          favorite_user_id?: string;
          created_at?: string;
        };
      };

      matches: {
        Row: {
          id: string;
          user_id: string;
          matched_user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          matched_user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          matched_user_id?: string;
          created_at?: string;
        };
      };

      user_settings: {
        Row: {
          id: string;
          user_id: string;
          notifications_enabled: boolean;
          email_notifications: boolean;
          push_notifications: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          notifications_enabled?: boolean;
          email_notifications?: boolean;
          push_notifications?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          notifications_enabled?: boolean;
          email_notifications?: boolean;
          push_notifications?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };

      legal_pages: {
        Row: {
          id: string;
          slug: string;
          title: string;
          content: string;
          meta_description: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          content: string;
          meta_description?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          content?: string;
          meta_description?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };

      reports: {
        Row: {
          id: string;
          reporter_id: string;
          reported_user_id: string | null;
          reported_post_id: string | null;
          report_type: string;
          reason: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          reporter_id: string;
          reported_user_id?: string | null;
          reported_post_id?: string | null;
          report_type: string;
          reason: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          reporter_id?: string;
          reported_user_id?: string | null;
          reported_post_id?: string | null;
          report_type?: string;
          reason?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
