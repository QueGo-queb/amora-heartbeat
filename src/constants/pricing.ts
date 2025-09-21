/**
 * Configuration centralisée des prix Amora
 * ✅ CORRECTION: Prix Premium à $9.99/mois
 */

export const AMORA_PRICING = {
  premium: {
    monthly: {
      usd: 9.99,
      usd_cents: 999, // Pour Stripe (en centimes)
      cad: 13.49,     // Équivalent canadien
      eur: 9.49,      // Équivalent européen
      clp: 9500,      // Pesos chiliens (approximatif)
      dop: 590        // Pesos dominicains (approximatif)
    }
  },
  
  // Montants minimums pour validation
  minimum: {
    usd: 9.99,
    cad: 13.49,
    eur: 9.49
  },

  // Configuration Stripe
  stripe: {
    product_id: 'prod_premium_monthly',
    price_id: 'price_premium_monthly_999' // À créer dans Stripe
  }
} as const;

// Helper functions
export const formatPrice = (amount: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

export const getPremiumPrice = (currency: string = 'USD') => {
  switch (currency.toUpperCase()) {
    case 'CAD':
      return AMORA_PRICING.premium.monthly.cad;
    case 'EUR':
      return AMORA_PRICING.premium.monthly.eur;
    case 'CLP':
      return AMORA_PRICING.premium.monthly.clp;
    case 'DOP':
      return AMORA_PRICING.premium.monthly.dop;
    default:
      return AMORA_PRICING.premium.monthly.usd;
  }
};
