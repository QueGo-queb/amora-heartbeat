import { supabase } from '@/integrations/supabase/client';
import { SimpleCacheService } from './cacheSimple';
import type { SubscriptionPlan, CreatePlanRequest, UpdatePlanRequest, UserSubscription } from '../../types/pricing';

export class PricingService {
  private static CACHE_TTL = 300; // 5 minutes

  /**
   * Récupérer tous les plans actifs
   */
  static async getActivePlans(): Promise<SubscriptionPlan[]> {
    try {
      // Vérifier le cache d'abord
      const cacheKey = 'pricing:active_plans';
      const cached = await SimpleCacheService.get<SubscriptionPlan[]>(cacheKey);
      if (cached) {
        return cached;
      }

      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;

      const plans = data || [];
      
      // Mettre en cache
      await SimpleCacheService.set(cacheKey, plans, this.CACHE_TTL);
      
      return plans;
    } catch (error) {
      console.error('Erreur récupération plans actifs:', error);
      return [];
    }
  }

  /**
   * Récupérer tous les plans (admin)
   */
  static async getAllPlans(): Promise<SubscriptionPlan[]> {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur récupération tous les plans:', error);
      return [];
    }
  }

  /**
   * Créer un nouveau plan (admin)
   */
  static async createPlan(planData: CreatePlanRequest): Promise<SubscriptionPlan | null> {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .insert([{
          ...planData,
          features: JSON.stringify(planData.features),
          sort_order: planData.sort_order || 0,
          is_featured: planData.is_featured || false,
        }])
        .select()
        .single();

      if (error) throw error;

      // Invalider le cache
      await this.invalidateCache();
      
      return data;
    } catch (error) {
      console.error('Erreur création plan:', error);
      return null;
    }
  }

  /**
   * Mettre à jour un plan (admin)
   */
  static async updatePlan(planData: UpdatePlanRequest): Promise<boolean> {
    try {
      const updateData: any = { ...planData };
      delete updateData.id;
      
      if (updateData.features) {
        updateData.features = JSON.stringify(updateData.features);
      }

      const { error } = await supabase
        .from('subscription_plans')
        .update(updateData)
        .eq('id', planData.id);

      if (error) throw error;

      // Invalider le cache
      await this.invalidateCache();
      
      return true;
    } catch (error) {
      console.error('Erreur mise à jour plan:', error);
      return false;
    }
  }

  /**
   * Supprimer un plan (admin)
   */
  static async deletePlan(planId: string): Promise<boolean> {
    try {
      // Vérifier qu'aucun abonnement actif n'utilise ce plan
      const { data: activeSubscriptions } = await supabase
        .from('user_subscriptions')
        .select('id')
        .eq('plan_id', planId)
        .eq('status', 'active')
        .limit(1);

      if (activeSubscriptions && activeSubscriptions.length > 0) {
        throw new Error('Impossible de supprimer un plan avec des abonnements actifs');
      }

      const { error } = await supabase
        .from('subscription_plans')
        .delete()
        .eq('id', planId);

      if (error) throw error;

      // Invalider le cache
      await this.invalidateCache();
      
      return true;
    } catch (error) {
      console.error('Erreur suppression plan:', error);
      return false;
    }
  }

  /**
   * Récupérer un plan par ID
   */
  static async getPlanById(planId: string): Promise<SubscriptionPlan | null> {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', planId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur récupération plan:', error);
      return null;
    }
  }

  /**
   * Récupérer l'abonnement actif d'un utilisateur
   */
  static async getUserActiveSubscription(userId: string): Promise<UserSubscription | null> {
    try {
      const cacheKey = `user_subscription:${userId}`;
      const cached = await SimpleCacheService.get<UserSubscription>(cacheKey);
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

      const subscription = data || null;
      
      // Mettre en cache pour 2 minutes
      await SimpleCacheService.set(cacheKey, subscription, 120);
      
      return subscription;
    } catch (error) {
      console.error('Erreur récupération abonnement utilisateur:', error);
      return null;
    }
  }

  /**
   * Formater le prix selon la devise
   */
  static formatPrice(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  }

  /**
   * Invalider le cache des plans
   */
  static async invalidateCache(): Promise<void> {
    await SimpleCacheService.deletePattern('pricing:*');
    await SimpleCacheService.deletePattern('user_subscription:*');
  }

  /**
   * Calculer les économies (pour plan annuel vs mensuel)
   */
  static calculateSavings(yearlyPrice: number, monthlyPrice: number): number {
    const yearlyEquivalent = monthlyPrice * 12;
    const savings = yearlyEquivalent - yearlyPrice;
    return Math.round((savings / yearlyEquivalent) * 100);
  }
}
