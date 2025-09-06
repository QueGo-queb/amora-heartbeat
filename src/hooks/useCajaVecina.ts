import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CajaVecinaAccount {
  id: string;
  account_number: string;
  account_name: string;
  rut: string;
  is_active: boolean;
}

export interface CajaVecinaPayment {
  id: string;
  user_id: string;
  account_id: string;
  amount: number;
  receipt_image_url?: string;
  transaction_reference?: string;
  status: 'pending' | 'verified' | 'rejected';
  admin_notes?: string;
  created_at: string;
}

export const useCajaVecina = () => {
  const [accounts, setAccounts] = useState<CajaVecinaAccount[]>([]);
  const [payments, setPayments] = useState<CajaVecinaPayment[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Charger les comptes actifs
  const loadAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('caja_vecina_accounts')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      // Si la table n'existe pas encore, ne pas afficher d'erreur
      if (error && (error.code === 'PGRST116' || error.code === '42P01')) {
        console.log('Table caja_vecina_accounts pas encore créée');
        return;
      }

      if (error) throw error;
      setAccounts(data || []);
    } catch (error: any) {
      // Ne pas afficher d'erreur si c'est juste que la table n'existe pas
      if (error.code !== 'PGRST116' && error.code !== '42P01') {
        console.error('Erreur chargement comptes:', error);
      }
    }
  };

  // Charger les paiements de l'utilisateur
  const loadUserPayments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('caja_vecina_payments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error('Erreur chargement paiements:', error);
    }
  };

  // Créer un nouveau compte (admin seulement)
  const createAccount = async (accountData: Omit<CajaVecinaAccount, 'id' | 'is_active'>) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      // Essayer d'abord avec created_by
      let { data, error } = await supabase
        .from('caja_vecina_accounts')
        .insert({
          ...accountData,
          created_by: user.id
        })
        .select()
        .single();

      // Si erreur RLS, essayer sans created_by
      if (error && (error.code === '42501' || error.message.includes('row-level security'))) {
        const result = await supabase
          .from('caja_vecina_accounts')
          .insert(accountData)
          .select()
          .single();
        
        data = result.data;
        error = result.error;
      }

      if (error) throw error;

      toast({
        title: "Compte créé",
        description: "Le compte Caja Vecina a été ajouté avec succès.",
      });

      await loadAccounts();
      return data;
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la création du compte",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Soumettre un paiement
  const submitPayment = async (
    accountId: string, 
    amount: number, 
    receiptFile?: File,
    transactionReference?: string
  ) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      let receiptUrl = '';

      // Upload du reçu si fourni
      if (receiptFile) {
        const fileExt = receiptFile.name.split('.').pop();
        const fileName = `${user.id}_${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('receipts')
          .upload(`caja-vecina/${fileName}`, receiptFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('receipts')
          .getPublicUrl(uploadData.path);

        receiptUrl = publicUrl;
      }

      // Créer le paiement
      const { data, error } = await supabase
        .from('caja_vecina_payments')
        .insert({
          user_id: user.id,
          account_id: accountId,
          amount,
          receipt_image_url: receiptUrl,
          transaction_reference: transactionReference,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Paiement soumis",
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
        .from('caja_vecina_payments')
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
            payment_method: 'caja_vecina'
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
    loadAccounts();
    loadUserPayments();
  }, []);

  return {
    accounts,
    payments,
    loading,
    createAccount,
    submitPayment,
    verifyPayment,
    loadAccounts,
    loadUserPayments
  };
};