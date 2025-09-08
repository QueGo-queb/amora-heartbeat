import { supabase } from '@/integrations/supabase/client';
import { getStripe, STRIPE_PLANS, type PlanId } from './stripe';
import { SimpleCacheService } from './cacheSimple';
import { analytics } from './analytics';

interface PaymentIntent {
  id: string;
  client_secret: string;
  status: string;
  amount: number;
  currency: string;
}

interface PaymentResult {
  success: boolean;
  paymentIntent?: PaymentIntent;
  error?: string;
  requiresAction?: boolean;
}

export class PaymentService {
  
  /**
   * Créer une intention de paiement
   */
  static async createPaymentIntent(
    planId: PlanId,
    userId: string
  ): Promise<PaymentResult> {
    try {
      const plan = STRIPE_PLANS[planId];
      if (!plan) {
        throw new Error('Plan invalide');
      }

      // Vérifier que l'utilisateur n'a pas déjà un abonnement actif
      const hasActiveSub = await this.hasActiveSubscription(userId);
      if (hasActiveSub && plan.interval !== 'one_time') {
        return {
          success: false,
          error: 'Vous avez déjà un abonnement actif'
        };
      }

      // Créer l'intention de paiement côté serveur
      // Note: En production, ceci devrait être un appel API vers votre backend
      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: {
          planId,
          userId,
          amount: Math.round(plan.price * 100), // Convertir en centimes
          currency: plan.currency
        }
      });

      if (error) throw error;

      // Tracker l'événement
      analytics.trackEvent('payment_intent_created', {
        plan_id: planId,
        amount: plan.price,
        currency: plan.currency
      });

      return {
        success: true,
        paymentIntent: data
      };

    } catch (error) {
      console.error('Erreur création PaymentIntent:', error);
      analytics.paymentFailed(error.message, STRIPE_PLANS[planId].price);
      
      return {
        success: false,
        error: 'Erreur lors de la création du paiement'
      };
    }
  }

  /**
   * Confirmer un paiement
   */
  static async confirmPayment(
    paymentIntentId: string,
    paymentMethodId: string
  ): Promise<PaymentResult> {
    try {
      const stripe = await getStripe();
      if (!stripe) throw new Error('Stripe non initialisé');

      const { error, paymentIntent } = await stripe.confirmPayment({
        clientSecret: paymentIntentId,
        payment_method: paymentMethodId,
        confirmation_method: 'manual',
        confirm: true,
      });

      if (error) {
        analytics.paymentFailed(error.message, 0);
        return {
          success: false,
          error: error.message
        };
      }

      if (paymentIntent.status === 'requires_action') {
        return {
          success: false,
          requiresAction: true,
          paymentIntent
        };
      }

      if (paymentIntent.status === 'succeeded') {
        // Le webhook gérera la mise à jour de l'abonnement
        analytics.premiumUpgrade('unknown', paymentIntent.amount / 100);
        
        return {
          success: true,
          paymentIntent
        };
      }

      return {
        success: false,
        error: 'Statut de paiement inattendu'
      };

    } catch (error) {
      console.error('Erreur confirmation paiement:', error);
      return {
        success: false,
        error: 'Erreur lors de la confirmation du paiement'
      };
    }
  }

  /**
   * Vérifier si l'utilisateur a un abonnement actif
   */
  static async hasActiveSubscription(userId: string): Promise<boolean> {
    try {
      // Vérifier d'abord le cache
      const cacheKey = `subscription:active:${userId}`;
      const cached = await SimpleCacheService.get<boolean>(cacheKey);
      if (cached !== null) {
        return cached;
      }

      // Vérifier en base
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('id, status, end_date')
        .eq('user_id', userId)
        .eq('status', 'active')
        .or('end_date.is.null,end_date.gt.now()')
        .limit(1);

      if (error) throw error;

      const hasActive = data && data.length > 0;
      
      // Mettre en cache pour 5 minutes
      await SimpleCacheService.set(cacheKey, hasActive, 300);
      
      return hasActive;

    } catch (error) {
      console.error('Erreur vérification abonnement:', error);
      return false;
    }
  }

  /**
   * Obtenir les détails de l'abonnement
   */
  static async getSubscriptionDetails(userId: string) {
    try {
      const cacheKey = `subscription:details:${userId}`;
      const cached = await SimpleCacheService.get(cacheKey);
      if (cached) {
        return cached;
      }

      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          plan:subscription_plans(*)
        `)
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      // Mettre en cache pour 10 minutes
      await SimpleCacheService.set(cacheKey, data, 600);
      
      return data;

    } catch (error) {
      console.error('Erreur récupération détails abonnement:', error);
      return null;
    }
  }

  /**
   * Annuler un abonnement
   */
  static async cancelSubscription(userId: string): Promise<boolean> {
    try {
      // Appel API pour annuler côté Stripe
      const { error } = await supabase.functions.invoke('cancel-subscription', {
        body: { userId }
      });

      if (error) throw error;

      // Invalider le cache
      await SimpleCacheService.delete(`subscription:active:${userId}`);
      await SimpleCacheService.delete(`subscription:details:${userId}`);

      analytics.trackEvent('subscription_cancelled', { user_id: userId });

      return true;

    } catch (error) {
      console.error('Erreur annulation abonnement:', error);
      return false;
    }
  }

  /**
   * Réactiver un abonnement
   */
  static async reactivateSubscription(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase.functions.invoke('reactivate-subscription', {
        body: { userId }
      });

      if (error) throw error;

      // Invalider le cache
      await SimpleCacheService.delete(`subscription:active:${userId}`);
      await SimpleCacheService.delete(`subscription:details:${userId}`);

      analytics.trackEvent('subscription_reactivated', { user_id: userId });

      return true;

    } catch (error) {
      console.error('Erreur réactivation abonnement:', error);
      return false;
    }
  }
}
