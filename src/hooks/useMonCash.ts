import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MonCashConfig {
  id: string;
  phone_number: string;
  account_name: string;
  is_active: boolean;
  is_paused: boolean;
  created_at: string;
  updated_at: string;
}

export interface MonCashPayment {
  id: string;
  user_id: string;
  config_id: string;
  amount: number;
  amount_htg?: number;
  transaction_reference?: string;
  sender_phone?: string;
  receipt_image_url?: string;
  status: 'pending' | 'verified' | 'rejected';
  admin_notes?: string;
  created_at: string;
}

export const useMonCash = () => {
  const [config, setConfig] = useState<MonCashConfig | null>(null);
  const [payments, setPayments] = useState<MonCashPayment[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Charger la configuration MonCash active
  const loadConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('moncash_config')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.log('Aucune configuration MonCash trouvée');
        return;
      }
      
      setConfig(data);
    } catch (error) {
      console.error('Erreur chargement config MonCash:', error);
    }
  };

  // Charger les paiements de l'utilisateur
  const loadUserPayments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('moncash_payments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error('Erreur chargement paiements MonCash:', error);
    }
  };

  // Mettre à jour la configuration MonCash (admin seulement)
  const updateConfig = async (configData: Omit<MonCashConfig, 'id' | 'created_at' | 'updated_at'>) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      // Désactiver l'ancienne configuration
      await supabase
        .from('moncash_config')
        .update({ is_active: false })
        .eq('is_active', true);

      // Créer la nouvelle configuration
      const { data, error } = await supabase
        .from('moncash_config')
        .insert({
          ...configData,
          created_by: user.id,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Configuration MonCash mise à jour",
        description: "Les informations MonCash ont été configurées avec succès.",
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

  // Mettre en pause/reprendre MonCash
  const togglePause = async (isPaused: boolean) => {
    if (!config) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('moncash_config')
        .update({ 
          is_paused: isPaused,
          updated_at: new Date().toISOString()
        })
        .eq('id', config.id);

      if (error) throw error;

      toast({
        title: isPaused ? "MonCash mis en pause" : "MonCash réactivé",
        description: isPaused 
          ? "Les paiements MonCash sont temporairement désactivés"
          : "Les paiements MonCash sont maintenant disponibles",
      });

      await loadConfig();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la modification",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Soumettre un paiement MonCash
  const submitPayment = async (
    amount: number,
    senderPhone: string,
    transactionRef: string,
    receiptFile?: File
  ) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      if (!config?.id) throw new Error('Configuration MonCash non disponible');

      let receiptUrl = '';

      // Upload du reçu si fourni
      if (receiptFile) {
        const fileExt = receiptFile.name.split('.').pop();
        const fileName = `${user.id}_${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('receipts')
          .upload(`moncash/${fileName}`, receiptFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('receipts')
          .getPublicUrl(uploadData.path);

        receiptUrl = publicUrl;
      }

      // Calculer le montant en gourdes (approximatif : 1 USD = 133 HTG)
      const amountHTG = amount * 133;

      // Créer le paiement
      const { data, error } = await supabase
        .from('moncash_payments')
        .insert({
          user_id: user.id,
          config_id: config.id,
          amount,
          amount_htg: amountHTG,
          transaction_reference: transactionRef,
          sender_phone: senderPhone,
          receipt_image_url: receiptUrl,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Paiement MonCash soumis",
        description: "Votre paiement est en cours de vérification.",
      });

      await loadUserPayments();
      return data;
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la soumission du paiement",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Vérifier un paiement (admin seulement)
  const verifyPayment = async (paymentId: string, status: 'verified' | 'rejected', notes?: string) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const { data, error } = await supabase
        .from('moncash_payments')
        .update({
          status,
          admin_notes: notes,
          verified_by: user.id,
          verified_at: new Date().toISOString()
        })
        .eq('id', paymentId)
        .select()
        .single();

      if (error) throw error;

      // Si vérifié, mettre à jour le plan utilisateur
      if (status === 'verified') {
        const { error: userError } = await supabase
          .from('users')
          .update({
            plan: 'premium',
            premium_since: new Date().toISOString(),
            payment_method: 'moncash'
          })
          .eq('id', data.user_id);

        if (userError) throw userError;
      }

      toast({
        title: status === 'verified' ? "Paiement vérifié" : "Paiement rejeté",
        description: status === 'verified' 
          ? "L'utilisateur est maintenant Premium" 
          : "Le paiement a été rejeté",
      });

      return data;
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la vérification",
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
    togglePause,
    submitPayment,
    verifyPayment,
    loadConfig,
    loadUserPayments
  };
};