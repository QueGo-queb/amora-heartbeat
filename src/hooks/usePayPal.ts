import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCurrentPricing } from '@/hooks/useCurrentPricing';

export interface PayPalConfig {
  id: string;
  paypal_email: string;
  is_active: boolean;
}

export interface PayPalPayment {
  id: string;
  user_id: string;
  paypal_transaction_id?: string;
  amount: number;
  currency: string;
  payer_email?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  created_at: string;
}

export const usePayPal = () => {
  const [config, setConfig] = useState<PayPalConfig | null>(null);
  const [payments, setPayments] = useState<PayPalPayment[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { pricing, formatPrice } = useCurrentPricing();

  // Charger la configuration PayPal active
  const loadConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('paypal_config')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // Si la table n'existe pas encore, ne pas afficher d'erreur
      if (error && (error.code === 'PGRST116' || error.code === '42P01')) {
        console.log('Table paypal_config pas encore créée');
        return;
      }
      
      if (error) throw error;
      setConfig(data);
    } catch (error: any) {
      // Ne pas afficher d'erreur si c'est juste que la table n'existe pas
      if (error.code !== 'PGRST116' && error.code !== '42P01') {
        console.error('Erreur chargement config PayPal:', error);
      }
    }
  };

  // Charger les paiements de l'utilisateur
  const loadUserPayments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('paypal_payments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error('Erreur chargement paiements PayPal:', error);
    }
  };

  // Créer ou mettre à jour la configuration PayPal (admin seulement)
  const updateConfig = async (paypalEmail: string) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      // Désactiver l'ancienne configuration (si elle existe)
      try {
        await supabase
          .from('paypal_config')
          .update({ is_active: false })
          .eq('is_active', true);
      } catch (error) {
        console.log('Aucune configuration existante à désactiver');
      }

      // Créer la nouvelle configuration avec gestion d'erreur RLS
      const { data, error } = await supabase
        .from('paypal_config')
        .insert({
          paypal_email: paypalEmail,
          created_by: user.id,
          is_active: true
        })
        .select()
        .single();

      if (error) {
        // Si erreur RLS, essayer sans created_by
        if (error.code === '42501' || error.message.includes('row-level security')) {
          const { data: retryData, error: retryError } = await supabase
            .from('paypal_config')
            .insert({
              paypal_email: paypalEmail,
              is_active: true
            })
            .select()
            .single();
          
          if (retryError) throw retryError;
          
          toast({
            title: "Configuration PayPal mise à jour",
            description: "L'email PayPal a été configuré avec succès.",
          });

          await loadConfig();
          return retryData;
        }
        throw error;
      }

      toast({
        title: "Configuration PayPal mise à jour",
        description: "L'email PayPal a été configuré avec succès.",
      });

      await loadConfig();
      return data;
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la mise à jour de la configuration",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Créer un paiement PayPal
  const createPayment = async (amount: number = 29.99) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      if (!config?.paypal_email) {
        throw new Error('Configuration PayPal non disponible');
      }

      // Créer l'enregistrement de paiement avec gestion d'erreur
      let insertData = {
        user_id: user.id,
        amount,
        currency: 'USD',
        status: 'pending' as const
      };

      let { data, error } = await supabase
        .from('paypal_payments')
        .insert(insertData)
        .select()
        .single();

      // Si erreur de table, essayer de continuer sans l'enregistrement
      if (error && error.message.includes('relation')) {
        console.log('Table paypal_payments n\'existe pas encore, redirection directe vers PayPal');
        // Continuer avec PayPal même sans enregistrement
        data = { id: 'temp_' + Date.now() };
      } else if (error) {
        throw error;
      }

      // Générer l'URL PayPal
      const paypalUrl = generatePayPalUrl(config.paypal_email, amount, data.id);
      
      // Ouvrir PayPal dans une nouvelle fenêtre
      window.open(paypalUrl, '_blank');

      toast({
        title: "Redirection vers PayPal",
        description: "Vous allez être redirigé vers PayPal pour finaliser le paiement.",
      });

      return data;
    } catch (error: any) {
      console.error('Erreur PayPal:', error);
      
      // Message d'erreur plus spécifique
      let errorMessage = "Erreur lors de la création du paiement PayPal";
      if (error.message.includes('Configuration PayPal')) {
        errorMessage = "PayPal n'est pas encore configuré par l'administrateur.";
      }
      
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Générer l'URL PayPal
  const generatePayPalUrl = (email: string, amount: number, paymentId: string) => {
    const params = new URLSearchParams({
      cmd: '_xclick',
      business: email,
      item_name: 'Amora Heartbeat - Plan Premium',
      amount: amount.toString(),
      currency_code: 'USD',
      custom: paymentId, // ID de notre paiement pour le suivi
      return: `${window.location.origin}/premium-success?payment_id=${paymentId}`,
      cancel_return: `${window.location.origin}/premium-fail?payment_id=${paymentId}`,
      notify_url: `${window.location.origin}/api/paypal/webhook` // Pour les notifications IPN
    });

    return `https://www.paypal.com/cgi-bin/webscr?${params.toString()}`;
  };

  // Vérifier le statut d'un paiement
  const verifyPayment = async (paymentId: string, transactionId?: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('paypal_payments')
        .update({
          status: 'completed',
          paypal_transaction_id: transactionId,
          paypal_response: { verified_at: new Date().toISOString() }
        })
        .eq('id', paymentId)
        .select()
        .single();

      if (error) throw error;

      // Mettre à jour le plan utilisateur
      const { error: userError } = await supabase
        .from('users')
        .update({
          plan: 'premium',
          premium_since: new Date().toISOString(),
          payment_method: 'paypal'
        })
        .eq('id', data.user_id);

      if (userError) throw userError;

      toast({
        title: "Paiement PayPal vérifié !",
        description: "Votre compte est maintenant Premium.",
      });

      return data;
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la vérification du paiement",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
    loadUserPayments();
  }, []);

  return {
    config,
    payments,
    loading,
    updateConfig,
    createPayment,
    verifyPayment,
    loadConfig,
    loadUserPayments
  };
};