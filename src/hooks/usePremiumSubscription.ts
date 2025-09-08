import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PremiumSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'inactive' | 'canceled' | 'expired';
  start_date: string;
  end_date: string;
  notification_sent: boolean;
  created_at: string;
  plan?: string; // Optionnel pour compatibilité
  auto_renewal?: boolean; // Optionnel pour compatibilité
  updated_at?: string; // Optionnel pour compatibilité
  transaction_id?: string;
}

export interface SubscriptionStatus {
  isActive: boolean;
  isPremium: boolean;
  daysRemaining: number;
  endDate: string | null;
  status: string;
}

export const usePremiumSubscription = (userId?: string) => {
  const [subscription, setSubscription] = useState<PremiumSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<SubscriptionStatus>({
    isActive: false,
    isPremium: false,
    daysRemaining: 0,
    endDate: null,
    status: 'free'
  });
  const { toast } = useToast();

  // Calculer le statut de l'abonnement
  const calculateStatus = (sub: PremiumSubscription | null): SubscriptionStatus => {
    if (!sub) {
      return {
        isActive: false,
        isPremium: false,
        daysRemaining: 0,
        endDate: null,
        status: 'free'
      };
    }

    const now = new Date();
    const endDate = new Date(sub.end_date);
    const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    
    return {
      isActive: sub.status === 'active' || sub.status === 'expiring',
      isPremium: sub.plan === 'premium' && (sub.status === 'active' || sub.status === 'expiring'),
      daysRemaining,
      endDate: sub.end_date,
      status: sub.status
    };
  };

  // Charger l'abonnement de l'utilisateur
  const loadSubscription = async (targetUserId?: string) => {
    try {
      setLoading(true);
      
      let userIdToUse = targetUserId || userId;
      if (!userIdToUse) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Utilisateur non connecté');
        userIdToUse = user.id;
      }

      const { data, error } = await supabase
        .from('premium_subscriptions')
        .select('*')
        .eq('user_id', userIdToUse)
        .single();

      if (error && error.code !== 'PGRST116') { // Ignore "not found" error
        throw error;
      }

      setSubscription(data);
      setStatus(calculateStatus(data));
    } catch (error) {
      console.error('Erreur chargement abonnement:', error);
      setSubscription(null);
      setStatus(calculateStatus(null));
    } finally {
      setLoading(false);
    }
  };

  // Activer un abonnement premium
  const activatePremium = async (transactionId?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      const startDate = new Date().toISOString();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30); // 30 jours

      const subscriptionData = {
        user_id: user.id,
        plan: 'premium' as const,
        start_date: startDate,
        end_date: endDate.toISOString(),
        status: 'active' as const,
        auto_renewal: true,
        notification_sent: false,
        transaction_id: transactionId
      };

      // Utiliser upsert pour créer ou mettre à jour l'abonnement
      const { data, error } = await supabase
        .from('premium_subscriptions')
        .upsert(subscriptionData, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) throw error;

      // Mettre à jour le plan de l'utilisateur
      const { error: userError } = await supabase.auth.updateUser({
        data: { plan: 'premium' }
      });

      if (userError) {
        console.error('Erreur mise à jour utilisateur:', userError);
      }

      setSubscription(data);
      setStatus(calculateStatus(data));

      toast({
        title: "Premium activé !",
        description: "Votre abonnement premium est maintenant actif pour 30 jours.",
      });

      return data;
    } catch (error: any) {
      console.error('Erreur activation premium:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'activer l'abonnement premium",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Annuler l'auto-renouvellement
  const cancelAutoRenewal = async () => {
    try {
      if (!subscription) throw new Error('Aucun abonnement trouvé');

      const { error } = await supabase
        .from('premium_subscriptions')
        .update({ 
          auto_renewal: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', subscription.id);

      if (error) throw error;

      setSubscription(prev => prev ? { ...prev, auto_renewal: false } : null);

      toast({
        title: "Auto-renouvellement annulé",
        description: "Votre abonnement ne sera pas renouvelé automatiquement.",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'annuler l'auto-renouvellement",
        variant: "destructive",
      });
    }
  };

  // Réactiver l'auto-renouvellement
  const enableAutoRenewal = async () => {
    try {
      if (!subscription) throw new Error('Aucun abonnement trouvé');

      const { error } = await supabase
        .from('premium_subscriptions')
        .update({ 
          auto_renewal: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', subscription.id);

      if (error) throw error;

      setSubscription(prev => prev ? { ...prev, auto_renewal: true } : null);

      toast({
        title: "Auto-renouvellement activé",
        description: "Votre abonnement sera renouvelé automatiquement.",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'activer l'auto-renouvellement",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadSubscription();

    // Écouter les changements en temps réel
    const subscription_channel = supabase
      .channel('subscription_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'premium_subscriptions' },
        () => {
          loadSubscription();
        }
      )
      .subscribe();

    return () => {
      subscription_channel.unsubscribe();
    };
  }, [userId]);

  return {
    subscription,
    status,
    loading,
    activatePremium,
    cancelAutoRenewal,
    enableAutoRenewal,
    refreshSubscription: loadSubscription
  };
};