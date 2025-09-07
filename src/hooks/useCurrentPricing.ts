import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { convertPriceFromUSD, formatPrice } from '@/lib/currencyConverter';

export interface CurrentPricing {
  price_usd: number;
  price_eur?: number;
  price_cad?: number;
  price_clp?: number;
  price_htg?: number;
  currency: string;
}

export const useCurrentPricing = () => {
  const [pricing, setPricing] = useState<CurrentPricing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCurrentPricing = async () => {
    try {
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('premium_pricing')
        .select('*')
        .eq('is_active', true)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST106' || fetchError.message.includes('relation') || fetchError.message.includes('table')) {
          console.log('Table premium_pricing n\'existe pas encore');
          setError('Aucun prix configuré par l\'administrateur');
          setPricing(null);
          setLoading(false);
          return;
        }
        throw fetchError;
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
      } else {
        setError('Aucun prix configuré par l\'administrateur');
        setPricing(null);
      }
    } catch (error) {
      console.error('Erreur chargement prix:', error);
      setError('Erreur lors du chargement des prix');
      setPricing(null);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour formater le prix selon la devise
  const formatPriceForCurrency = (currency?: string) => {
    if (!pricing) return null;
    
    const targetCurrency = currency || 'USD';
    
    switch (targetCurrency.toUpperCase()) {
      case 'EUR':
        return pricing.price_eur ? formatPrice(pricing.price_eur, 'EUR') : null;
      case 'CAD':
        return pricing.price_cad ? formatPrice(pricing.price_cad, 'CAD') : null;
      case 'CLP':
        return pricing.price_clp ? formatPrice(pricing.price_clp, 'CLP') : null;
      case 'HTG':
        return pricing.price_htg ? formatPrice(pricing.price_htg, 'HTG') : null;
      default:
        return formatPrice(pricing.price_usd, 'USD');
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
    error,
    formatPrice: formatPriceForCurrency,
    refreshPricing: loadCurrentPricing
  };
};
