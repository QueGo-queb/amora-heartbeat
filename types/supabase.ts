// Import du type Database principal
import type { Database as MainDatabase } from '@/integrations/supabase/types';

// Export du type principal
export type Database = MainDatabase;

// Types supplémentaires pour compatibilité
export interface CustomTables {
  moncash_config: {
    Row: {
      id: string;
      phone_number: string;
      account_name: string;
      is_active: boolean;
      is_paused: boolean;
      created_at: string;
      updated_at: string;
    };
    Insert: Omit<CustomTables['moncash_config']['Row'], 'id' | 'created_at'>;
    Update: Partial<CustomTables['moncash_config']['Insert']>;
  };
  moncash_payments: {
    Row: {
      id: string;
      config_id: string;
      amount: number;
      status: 'pending' | 'completed' | 'failed';
      created_at: string;
    };
    Insert: Omit<CustomTables['moncash_payments']['Row'], 'id' | 'created_at'>;
    Update: Partial<CustomTables['moncash_payments']['Insert']>;
  };
  footer_links: {
    Row: {
      id: string;
      title: string;
      url: string;
      order: number;
      is_active: boolean;
      created_at: string;
    };
    Insert: Omit<CustomTables['footer_links']['Row'], 'id' | 'created_at'>;
    Update: Partial<CustomTables['footer_links']['Insert']>;
  };
  footer_socials: {
    Row: {
      id: string;
      platform: string;
      url: string;
      icon: string;
      order: number;
      is_active: boolean;
      created_at: string;
    };
    Insert: Omit<CustomTables['footer_socials']['Row'], 'id' | 'created_at'>;
    Update: Partial<CustomTables['footer_socials']['Insert']>;
  };
}
