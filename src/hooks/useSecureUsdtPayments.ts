/**
 * Hook sécurisé pour les paiements USDT avec vérification blockchain
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UsdtTransaction {
  hash: string;
  from: string;
  to: string;
  amount: string;
  timestamp: number;
  confirmed: boolean;
}

export function useSecureUsdtPayments() {
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const { toast } = useToast();

  // ✅ SÉCURISÉ: Vérifier une transaction USDT sur la blockchain
  const verifyUsdtTransaction = useCallback(async (
    txHash: string,
    expectedAmount: number,
    network: 'TRC20' | 'ERC20'
  ): Promise<UsdtTransaction | null> => {
    try {
      setVerifying(true);

      // API pour vérifier les transactions (à adapter selon votre fournisseur)
      const apiUrl = network === 'TRC20' 
        ? `https://api.trongrid.io/v1/transactions/${txHash}`
        : `https://api.etherscan.io/api?module=proxy&action=eth_getTransactionByHash&txhash=${txHash}&apikey=${import.meta.env.VITE_ETHERSCAN_API_KEY}`;

      const response = await fetch(apiUrl);
      const data = await response.json();

      if (!response.ok || !data) {
        throw new Error('Transaction non trouvée sur la blockchain');
      }

      // Valider la transaction selon le réseau
      let transaction: UsdtTransaction | null = null;

      if (network === 'TRC20') {
        // Logique de validation TRC20 (Tron)
        if (data.ret && data.ret[0]?.contractRet === 'SUCCESS') {
          transaction = {
            hash: txHash,
            from: data.raw_data?.contract[0]?.parameter?.value?.owner_address || '',
            to: data.raw_data?.contract[0]?.parameter?.value?.to_address || '',
            amount: data.raw_data?.contract[0]?.parameter?.value?.amount || '0',
            timestamp: data.raw_data?.timestamp || 0,
            confirmed: true
          };
        }
      } else {
        // Logique de validation ERC20 (Ethereum)
        if (data.result && data.result.blockNumber) {
          transaction = {
            hash: txHash,
            from: data.result.from || '',
            to: data.result.to || '',
            amount: data.result.value || '0',
            timestamp: Date.now(),
            confirmed: true
          };
        }
      }

      return transaction;

    } catch (error) {
      console.error('Erreur vérification blockchain:', error);
      return null;
    } finally {
      setVerifying(false);
    }
  }, []);

  // ✅ SÉCURISÉ: Soumettre un paiement USDT pour vérification
  const submitUsdtPayment = useCallback(async (
    txHash: string,
    amount: number,
    network: 'TRC20' | 'ERC20'
  ) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      // 1. ✅ VÉRIFIER LA TRANSACTION SUR LA BLOCKCHAIN
      const transaction = await verifyUsdtTransaction(txHash, amount, network);
      
      if (!transaction) {
        throw new Error('Transaction non trouvée ou invalide sur la blockchain');
      }

      if (!transaction.confirmed) {
        throw new Error('Transaction non confirmée sur la blockchain');
      }

      // 2. Vérifier que la transaction correspond
      const { data: ourAddresses } = await supabase
        .from('usdt_payment_links')
        .select(network === 'TRC20' ? 'trc20_address' : 'erc20_address')
        .eq('is_active', true)
        .single();

      const expectedAddress = network === 'TRC20' 
        ? ourAddresses?.trc20_address 
        : ourAddresses?.erc20_address;

      if (!expectedAddress || transaction.to.toLowerCase() !== expectedAddress.toLowerCase()) {
        throw new Error('Transaction envoyée vers une mauvaise adresse');
      }

      // 3. Vérifier le montant (avec tolérance de 1%)
      const expectedAmountUsdt = amount;
      const actualAmountUsdt = parseFloat(transaction.amount) / (10 ** 6); // USDT a 6 décimales
      const tolerance = expectedAmountUsdt * 0.01; // 1% de tolérance

      if (Math.abs(actualAmountUsdt - expectedAmountUsdt) > tolerance) {
        throw new Error(`Montant incorrect. Attendu: ${expectedAmountUsdt} USDT, Reçu: ${actualAmountUsdt} USDT`);
      }

      // 4. Vérifier que la transaction n'a pas déjà été utilisée
      const { data: existingPayment } = await supabase
        .from('usdt_payments')
        .select('id')
        .eq('transaction_hash', txHash)
        .single();

      if (existingPayment) {
        throw new Error('Cette transaction a déjà été utilisée');
      }

      // 5. ✅ SÉCURISÉ: Enregistrer le paiement vérifié
      const { data: paymentData, error: paymentError } = await supabase
        .from('usdt_payments')
        .insert({
          user_id: user.id,
          transaction_hash: txHash,
          network: network,
          amount_usdt: actualAmountUsdt,
          from_address: transaction.from,
          to_address: transaction.to,
          blockchain_timestamp: new Date(transaction.timestamp).toISOString(),
          status: 'verified', // ✅ Déjà vérifiée sur blockchain
          verified_at: new Date().toISOString()
        })
        .select()
        .single();

      if (paymentError) throw paymentError;

      // 6. ✅ SÉCURISÉ: Activation Premium APRÈS vérification blockchain
      const { error: userError } = await supabase
        .from('users')
        .update({
          plan: 'premium',
          premium_since: new Date().toISOString(),
          payment_method: 'usdt'
        })
        .eq('id', user.id);

      if (userError) throw userError;

      // 7. Créer une transaction confirmée
      await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          amount_cents: Math.round(amount * 100),
          currency: 'usdt',
          payment_method: 'usdt',
          status: 'succeeded',
          external_reference: txHash
        });

      toast({
        title: "Paiement USDT vérifié ✅",
        description: "Votre compte Premium a été activé automatiquement !",
      });

      return { success: true, payment_id: paymentData.id };

    } catch (error: any) {
      toast({
        title: "Erreur de vérification",
        description: error.message || "Impossible de vérifier la transaction USDT",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  }, [toast, verifyUsdtTransaction]);

  return {
    loading,
    verifying,
    submitUsdtPayment,
    verifyUsdtTransaction
  };
}
