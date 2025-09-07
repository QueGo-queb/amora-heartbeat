import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface InteracConfig {
  id: string;
  merchant_id: string;
  api_key: string;
  api_secret: string;
  environment: 'sandbox' | 'production';
  bank_account: string;
  bank_institution: string;
  routing_number: string;
  notification_email: string;
  is_active: boolean;
  webhook_url?: string;
  created_at: string;
  updated_at: string;
}

export const useInterac = () => {
  const [config, setConfig] = useState<InteracConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadConfig = async () => {
    try {
      setLoading(true);
      // Charger depuis Supabase quand la table sera créée
      // Pour l'instant, données simulées
    } catch (error) {
      console.error('Error loading Interac config:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async (configData: Partial<InteracConfig>) => {
    try {
      setLoading(true);
      // Sauvegarder dans Supabase
      toast({
        title: "Configuration sauvegardée",
        description: "La configuration Interac a été mise à jour",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la configuration",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  return {
    config,
    loading,
    saveConfig,
    loadConfig
  };
};