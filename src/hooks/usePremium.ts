import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PremiumStatus {
  isPremium: boolean;
  plan: 'free' | 'premium';
  premiumSince?: string;
  expiresAt?: string;
}

export function usePremium() {
  const [premiumStatus, setPremiumStatus] = useState<PremiumStatus>({
    isPremium: false,
    plan: 'free'
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const checkPremiumStatus = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setPremiumStatus({ isPremium: false, plan: 'free' });
        return;
      }

      // Vérifier le statut premium depuis la table profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('plan, premium_since')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        setPremiumStatus({
          isPremium: profile.plan === 'premium',
          plan: profile.plan || 'free',
          premiumSince: profile.premium_since
        });
      }
    } catch (error) {
      console.error('Erreur vérification premium:', error);
      setPremiumStatus({ isPremium: false, plan: 'free' });
    } finally {
      setLoading(false);
    }
  }, []);

  const upgradeToPremium = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      // Mettre à jour le profil vers premium
      const { error } = await supabase
        .from('profiles')
        .update({
          plan: 'premium',
          premium_since: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setPremiumStatus({
        isPremium: true,
        plan: 'premium',
        premiumSince: new Date().toISOString()
      });

      toast({
        title: "Félicitations !",
        description: "Vous êtes maintenant membre Premium !",
      });

      return { success: true };
    } catch (error) {
      console.error('Erreur upgrade premium:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour votre abonnement",
        variant: "destructive",
      });
      return { success: false, error };
    }
  }, [toast]);

  const requirePremium = useCallback((action: string) => {
    if (!premiumStatus.isPremium) {
      toast({
        title: "Fonctionnalité Premium",
        description: `Pour ${action}, vous devez passer au plan Premium.`,
        variant: "destructive",
      });
      return false;
    }
    return true;
  }, [premiumStatus.isPremium, toast]);

  useEffect(() => {
    checkPremiumStatus();
  }, [checkPremiumStatus]);

  return {
    ...premiumStatus,
    loading,
    checkPremiumStatus,
    upgradeToPremium,
    requirePremium
  };
}