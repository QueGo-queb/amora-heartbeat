/**
 * Hook pour protéger les comptes bancaires côté client
 * Empêche les modifications non autorisées
 */

import { useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function useBankAccountProtection() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Vérifier si l'utilisateur est admin autorisé
  const isAuthorizedAdmin = useCallback(() => {
    return user?.email === 'clodenerc@yahoo.fr';
  }, [user?.email]);

  // Fonction sécurisée pour modifier un compte bancaire
  const secureUpdateBankAccount = useCallback(async (
    accountId: string,
    updateData: any,
    tableName: string = 'admin_bank_accounts'
  ) => {
    if (!isAuthorizedAdmin()) {
      toast({
        title: "❌ Accès refusé",
        description: "Seul l'administrateur peut modifier les comptes bancaires",
        variant: "destructive",
      });
      throw new Error('Modification non autorisée');
    }

    try {
      // Log de l'action avant exécution
      console.log('🔒 ADMIN ACTION: Modification compte bancaire', {
        accountId,
        adminEmail: user?.email,
        tableName,
        timestamp: new Date().toISOString()
      });

      const { data, error } = await supabase
        .from(tableName)
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', accountId)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "✅ Compte mis à jour",
        description: "Le compte bancaire a été modifié avec succès",
      });

      return { success: true, data };

    } catch (error: any) {
      console.error('❌ Erreur modification compte bancaire:', error);
      
      toast({
        title: "Erreur",
        description: error.message || "Impossible de modifier le compte",
        variant: "destructive",
      });
      
      return { success: false, error };
    }
  }, [isAuthorizedAdmin, user?.email, toast]);

  // Fonction sécurisée pour supprimer un compte bancaire
  const secureDeleteBankAccount = useCallback(async (
    accountId: string,
    tableName: string = 'admin_bank_accounts'
  ) => {
    if (!isAuthorizedAdmin()) {
      toast({
        title: "❌ Accès refusé",
        description: "Seul l'administrateur peut supprimer les comptes bancaires",
        variant: "destructive",
      });
      throw new Error('Suppression non autorisée');
    }

    try {
      // Log de l'action avant exécution
      console.log('🔒 ADMIN ACTION: Suppression compte bancaire', {
        accountId,
        adminEmail: user?.email,
        tableName,
        timestamp: new Date().toISOString()
      });

      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', accountId);

      if (error) throw error;

      toast({
        title: "✅ Compte supprimé",
        description: "Le compte bancaire a été supprimé avec succès",
      });

      return { success: true };

    } catch (error: any) {
      console.error('❌ Erreur suppression compte bancaire:', error);
      
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer le compte",
        variant: "destructive",
      });
      
      return { success: false, error };
    }
  }, [isAuthorizedAdmin, user?.email, toast]);

  // Fonction pour récupérer les logs d'audit
  const getAuditLogs = useCallback(async () => {
    if (!isAuthorizedAdmin()) {
      throw new Error('Accès aux logs non autorisé');
    }

    try {
      const { data, error } = await supabase
        .from('bank_account_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data;

    } catch (error) {
      console.error('Erreur récupération logs:', error);
      throw error;
    }
  }, [isAuthorizedAdmin]);

  // Fonction pour récupérer les tentatives non autorisées
  const getUnauthorizedAttempts = useCallback(async () => {
    if (!isAuthorizedAdmin()) {
      throw new Error('Accès aux logs non autorisé');
    }

    try {
      const { data, error } = await supabase
        .from('unauthorized_bank_access_attempts')
        .select('*')
        .limit(50);

      if (error) throw error;
      return data;

    } catch (error) {
      console.error('Erreur récupération tentatives non autorisées:', error);
      throw error;
    }
  }, [isAuthorizedAdmin]);

  return {
    isAuthorizedAdmin: isAuthorizedAdmin(),
    secureUpdateBankAccount,
    secureDeleteBankAccount,
    getAuditLogs,
    getUnauthorizedAttempts
  };
}