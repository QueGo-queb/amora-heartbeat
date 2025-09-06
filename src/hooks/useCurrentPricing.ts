import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CurrentPricing {
  price_usd: number;
  price_eur?: number;
  price_cad?: number;
  price_clp?: number;
  price_htg?: number;
  currency: string;
}

export const useCurrentPricing = () => {
  const [pricing, setPricing] = useState<CurrentPricing>({
    price_usd: 29.99,
    currency: 'USD'
  });
  const [loading, setLoading] = useState(true);

  const loadCurrentPricing = async () => {
    try {
      const { data, error } = await supabase
        .from('premium_pricing')
        .select('*')
        .eq('is_active', true)
        .single();

      // Gérer les erreurs de table manquante
      if (error) {
        if (error.code === 'PGRST106' || error.message.includes('relation') || error.message.includes('table')) {
          console.log('Table premium_pricing n\'existe pas encore, utilisation des valeurs par défaut');
          setLoading(false);
          return;
        }
        throw error;
      }

      if (data) {
        setPricing({
          price_usd: data.price_usd,
          price_eur: data.price_eur,
          price_cad: data.price_cad,
          price_clp: data.price_clp,
          price_htg: data.price_htg,
          currency: data.currency || 'USD'
        });
      }
    } catch (error) {
      console.error('Erreur chargement prix:', error);
      // Garder les valeurs par défaut en cas d'erreur
    } finally {
      setLoading(false);
    }
  };

  // AJOUTER la fonction formatPrice manquante
  const formatPrice = (currency?: string) => {
    const targetCurrency = currency || 'USD';
    
    switch (targetCurrency.toUpperCase()) {
      case 'EUR':
        return pricing.price_eur ? `€${pricing.price_eur}` : `$${pricing.price_usd}`;
      case 'CAD':
        return pricing.price_cad ? `$${pricing.price_cad} CAD` : `$${pricing.price_usd}`;
      case 'CLP':
        return pricing.price_clp ? `$${pricing.price_clp.toLocaleString()} CLP` : `$${(pricing.price_usd * 800).toLocaleString()} CLP`;
      case 'HTG':
        return pricing.price_htg ? `${pricing.price_htg} G` : `${(pricing.price_usd * 133).toLocaleString()} G`;
      default:
        return `$${pricing.price_usd}`;
    }
  };

  useEffect(() => {
    loadCurrentPricing();

    // Écouter les changements en temps réel
    const subscription = supabase
      .channel('pricing_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'premium_pricing' },
        () => {
          loadCurrentPricing();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    pricing,
    loading,
    formatPrice, // AJOUTER cette ligne
    refreshPricing: loadCurrentPricing
  };
};
