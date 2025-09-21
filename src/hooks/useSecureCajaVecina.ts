/**
 * Hook sécurisé pour Caja Vecina avec vérification obligatoire
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useSecureCajaVecina() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // ✅ SÉCURISÉ: Soumettre un paiement SANS activation automatique
  const submitPaymentForVerification = useCallback(async (
    accountId: string,
    amount: number,
    receiptFile: File,
    transactionReference: string
  ) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      // 1. Upload sécurisé du reçu
      const fileExt = receiptFile.name.split('.').pop();
      const fileName = `caja_vecina_${user.id}_${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('payment-receipts')
        .upload(fileName, receiptFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // 2. Créer la demande de paiement EN ATTENTE
      const { data, error } = await supabase
        .from('caja_vecina_payments')
        .insert({
          user_id: user.id,
          account_id: accountId,
          amount,
          receipt_image_url: uploadData.path,
          transaction_reference: transactionReference,
          status: 'pending', // ✅ SÉCURISÉ: Toujours en attente
          submitted_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // 3. ✅ SÉCURISÉ: Notifier l'admin mais PAS d'activation automatique
      await supabase
        .from('admin_notifications')
        .insert({
          type: 'payment_verification_needed',
          title: 'Nouveau paiement Caja Vecina à vérifier',
          content: `Utilisateur ${user.email} a soumis un paiement de $${amount}`,
          data: {
            payment_id: data.id,
            user_id: user.id,
            amount: amount,
            receipt_url: uploadData.path
          }
        });

      toast({
        title: "Paiement soumis ✅",
        description: "Votre paiement est en cours de vérification par notre équipe. Vous recevrez une confirmation sous 24h.",
      });

      return { success: true, payment_id: data.id };

    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de soumettre le paiement",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // ✅ SÉCURISÉ: Vérification admin avec double contrôle
  const verifyPaymentAsAdmin = useCallback(async (
    paymentId: string,
    action: 'approve' | 'reject',
    adminNotes: string,
    receiptVerified: boolean = false
  ) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.email !== 'clodenerc@yahoo.fr') {
        throw new Error('Accès admin requis');
      }

      // 1. Récupérer les détails du paiement
      const { data: payment, error: paymentError } = await supabase
        .from('caja_vecina_payments')
        .select('*, users(*)')
        .eq('id', paymentId)
        .single();

      if (paymentError || !payment) throw new Error('Paiement non trouvé');

      // 2. ✅ SÉCURISÉ: Double vérification obligatoire
      if (action === 'approve' && !receiptVerified) {
        throw new Error('Vous devez confirmer avoir vérifié le reçu');
      }

      // 3. Mettre à jour le statut du paiement
      const { error: updateError } = await supabase
        .from('caja_vecina_payments')
        .update({
          status: action === 'approve' ? 'verified' : 'rejected',
          admin_notes: adminNotes,
          verified_by: user.id,
          verified_at: new Date().toISOString()
        })
        .eq('id', paymentId);

      if (updateError) throw updateError;

      // 4. ✅ SÉCURISÉ: Activation Premium SEULEMENT si approuvé
      if (action === 'approve') {
        const { error: userError } = await supabase
          .from('users')
          .update({
            plan: 'premium',
            premium_since: new Date().toISOString(),
            payment_method: 'caja_vecina'
          })
          .eq('id', payment.user_id);

        if (userError) throw userError;

        // Créer une transaction confirmée
        await supabase
          .from('transactions')
          .insert({
            user_id: payment.user_id,
            amount_cents: Math.round(payment.amount * 100),
            currency: 'clp',
            payment_method: 'caja_vecina',
            status: 'succeeded',
            external_reference: payment.transaction_reference
          });
      }

      toast({
        title: action === 'approve' ? "Paiement approuvé ✅" : "Paiement rejeté ❌",
        description: action === 'approve' 
          ? "L'utilisateur a été mis à niveau vers Premium"
          : "Le paiement a été rejeté avec raison",
      });

      return { success: true };

    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la vérification",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    loading,
    submitPaymentForVerification,
    verifyPaymentAsAdmin
  };
}
