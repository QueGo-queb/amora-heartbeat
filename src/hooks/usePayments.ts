import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { PaymentService } from '@/lib/paymentService';
import { STRIPE_PLANS, type PlanId } from '@/lib/stripe';
import { useToast } from './use-toast';

export const usePayments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [subscriptionDetails, setSubscriptionDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(true);

  // Charger les détails au montage
  useEffect(() => {
    if (user?.id) {
      loadSubscriptionDetails();
    }
  }, [user?.id]);

  const loadSubscriptionDetails = async () => {
    if (!user?.id) return;

    try {
      setLoadingDetails(true);
      
      const [hasActive, details] = await Promise.all([
        PaymentService.hasActiveSubscription(user.id),
        PaymentService.getSubscriptionDetails(user.id)
      ]);

      setHasActiveSubscription(hasActive);
      setSubscriptionDetails(details);

    } catch (error) {
      console.error('Erreur chargement abonnement:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const purchasePlan = async (planId: PlanId) => {
    if (!user?.id) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour acheter un plan",
        variant: "destructive"
      });
      return false;
    }

    try {
      setLoading(true);

      const plan = STRIPE_PLANS[planId];
      
      // Créer l'intention de paiement
      const result = await PaymentService.createPaymentIntent(planId, user.id);
      
      if (!result.success) {
        toast({
          title: "Erreur",
          description: result.error || "Erreur lors de la création du paiement",
          variant: "destructive"
        });
        return false;
      }

      // Ici vous pouvez intégrer le formulaire de paiement Stripe
      toast({
        title: "Paiement initié",
        description: `Traitement du paiement pour ${plan.name}...`,
      });

      return true;

    } catch (error) {
      console.error('Erreur achat plan:', error);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue est survenue",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const cancelSubscription = async () => {
    if (!user?.id) return false;

    try {
      setLoading(true);
      
      const success = await PaymentService.cancelSubscription(user.id);
      
      if (success) {
        toast({
          title: "Abonnement annulé",
          description: "Votre abonnement a été annulé avec succès",
        });
        await loadSubscriptionDetails();
        return true;
      } else {
        toast({
          title: "Erreur",
          description: "Erreur lors de l'annulation",
          variant: "destructive"
        });
        return false;
      }

    } catch (error) {
      console.error('Erreur annulation:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const reactivateSubscription = async () => {
    if (!user?.id) return false;

    try {
      setLoading(true);
      
      const success = await PaymentService.reactivateSubscription(user.id);
      
      if (success) {
        toast({
          title: "Abonnement réactivé",
          description: "Votre abonnement a été réactivé avec succès",
        });
        await loadSubscriptionDetails();
        return true;
      } else {
        toast({
          title: "Erreur", 
          description: "Erreur lors de la réactivation",
          variant: "destructive"
        });
        return false;
      }

    } catch (error) {
      console.error('Erreur réactivation:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    loadingDetails,
    hasActiveSubscription,
    subscriptionDetails,
    plans: STRIPE_PLANS,
    purchasePlan,
    cancelSubscription,
    reactivateSubscription,
    refreshDetails: loadSubscriptionDetails,
  };
};
