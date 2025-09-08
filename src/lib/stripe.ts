import { loadStripe } from '@stripe/stripe-js';

// Charger Stripe
export const getStripe = () => {
  const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  
  if (!publishableKey) {
    throw new Error('VITE_STRIPE_PUBLISHABLE_KEY manquant');
  }
  
  return loadStripe(publishableKey);
};

// Configuration des plans
export const STRIPE_PLANS = {
  monthly: {
    id: 'monthly',
    name: 'Premium Mensuel',
    price: 29.99,
    currency: 'usd',
    interval: 'month',
    features: [
      'Messages illimités',
      'Super likes quotidiens',
      'Voir qui vous a liké',
      'Boost mensuel gratuit',
      'Pas de publicités'
    ]
  },
  yearly: {
    id: 'yearly', 
    name: 'Premium Annuel',
    price: 199.99,
    currency: 'usd',
    interval: 'year',
    features: [
      'Tous les avantages mensuels',
      '💰 Économisez 44%',
      'Boost hebdomadaire gratuit',
      'Badge premium exclusif',
      'Support prioritaire'
    ]
  },
  lifetime: {
    id: 'lifetime',
    name: 'Premium à Vie',
    price: 499.99,
    currency: 'usd',
    interval: 'one_time',
    features: [
      'Tous les avantages premium',
      '🔥 Accès à vie',
      'Nouvelles fonctionnalités en avant-première',
      'Badge fondateur exclusif',
      'Support VIP personnel'
    ]
  }
} as const;

export type PlanId = keyof typeof STRIPE_PLANS;

// Utilitaires
export const formatPrice = (price: number, currency: string = 'usd'): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(price);
};

export const getPlanById = (planId: PlanId) => {
  return STRIPE_PLANS[planId];
};
