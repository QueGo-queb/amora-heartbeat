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

      // ✅ CORRECTION: Utiliser la table users unifiée
      const { data: userProfile } = await supabase
        .from('users')
        .select('plan, premium_since')
        .eq('user_id', user.id)
        .single();

      // ✅ FALLBACK: Si pas trouvé avec user_id, essayer avec id
      if (!userProfile) {
        const { data: fallbackProfile } = await supabase
          .from('users')
          .select('plan, premium_since')
          .eq('id', user.id)
          .single();

        if (fallbackProfile) {
          setPremiumStatus({
            isPremium: fallbackProfile.plan === 'premium',
            plan: fallbackProfile.plan || 'free',
            premiumSince: fallbackProfile.premium_since
          });
          return;
        }
      }

      if (userProfile) {
        setPremiumStatus({
          isPremium: userProfile.plan === 'premium',
          plan: userProfile.plan || 'free',
          premiumSince: userProfile.premium_since
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

      // ✅ CORRECTION: Mettre à jour la table users
      const { error } = await supabase
        .from('users')
        .update({
          plan: 'premium',
          premium_since: new Date().toISOString()
        })
        .eq('user_id', user.id);

      // ✅ FALLBACK: Si échec avec user_id, essayer avec id
      if (error) {
        const { error: fallbackError } = await supabase
          .from('users')
          .update({
            plan: 'premium',
            premium_since: new Date().toISOString()
          })
          .eq('id', user.id);

        if (fallbackError) throw fallbackError;
      }

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