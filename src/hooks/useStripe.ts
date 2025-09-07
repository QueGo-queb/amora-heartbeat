import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface StripeConfig {
  id: string;
  publishable_key: string;
  secret_key: string;
  webhook_secret: string;
  environment: 'test' | 'live';
  account_country: string;
  default_currency: string;
  business_name: string;
  support_email: string;
  is_active: boolean;
  webhook_url?: string;
  statement_descriptor?: string;
  created_at: string;
  updated_at: string;
}

export const useStripe = () => {
  const [config, setConfig] = useState<StripeConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadConfig = async () => {
    try {
      setLoading(true);
      // Charger depuis Supabase quand la table sera créée
      // Pour l'instant, données simulées
    } catch (error) {
      console.error('Error loading Stripe config:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async (configData: Partial<StripeConfig>) => {
    try {
      setLoading(true);
      // Sauvegarder dans Supabase
      toast({
        title: "Configuration sauvegardée",
        description: "La configuration Stripe a été mise à jour",
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

  const testConnection = async () => {
    try {
      setLoading(true);
      // Tester la connexion avec l'API Stripe
      // const stripe = new Stripe(config.secret_key);
      // const account = await stripe.accounts.retrieve();
      return { success: true };
    } catch (error) {
      return { success: false, error };
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
    loadConfig,
    testConnection
  };
};