import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PremiumPrice {
  id: string;
  price_usd: number;
  price_eur?: number;
  price_cad?: number;
  price_clp?: number;
  price_htg?: number;
  currency: string;
  exchange_rates?: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export const usePremiumPricing = () => {
  const [prices, setPrices] = useState<PremiumPrice[]>([]);
  const [activePricing, setActivePricing] = useState<PremiumPrice | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Vérifier si l'utilisateur est admin
  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.email === 'clodenerc@yahoo.fr';
  };

  // Charger tous les prix en utilisant les fonctions PostgreSQL
  const loadPrices = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      const isAdmin = user?.email === 'clodenerc@yahoo.fr';
      
      if (isAdmin) {
        // Admin : récupérer tous les prix via fonction PostgreSQL
        const { data, error } = await supabase.rpc('get_all_premium_pricing', {
          admin_email: user.email
        });

        if (error) {
          console.error('Erreur fonction admin:', error);
          // Fallback : essayer la méthode directe
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('premium_pricing')
            .select('*')
            .order('created_at', { ascending: false });
          
          if (fallbackError) throw fallbackError;
          setPrices(fallbackData || []);
        } else {
          setPrices(data || []);
        }
        
        // Trouver le prix actif
        const active = (data || []).find((p: any) => p.is_active);
        setActivePricing(active || null);
      } else {
        // Public : récupérer seulement le prix actif
        const { data, error } = await supabase.rpc('get_active_premium_pricing');
        
        if (error) {
          console.error('Erreur fonction publique:', error);
          // Fallback : essayer la méthode directe
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('premium_pricing')
            .select('*')
            .eq('is_active', true)
            .single();
          
          if (fallbackError && fallbackError.code !== 'PGRST116') {
            throw fallbackError;
          }
          
          setPrices(fallbackData ? [fallbackData] : []);
          setActivePricing(fallbackData || null);
        } else {
          const activePrice = data?.[0] || null;
          setPrices(activePrice ? [activePrice] : []);
          setActivePricing(activePrice);
        }
      }
    } catch (error) {
      console.error('Erreur chargement prix:', error);
      setPrices([]);
      setActivePricing(null);
      toast({
        title: "Erreur",
        description: "Impossible de charger les prix",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Sauvegarder un prix en utilisant la fonction PostgreSQL
  const savePricing = async (pricingData: Omit<PremiumPrice, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.email !== 'clodenerc@yahoo.fr') {
        throw new Error('Accès non autorisé - Admin requis');
      }

      // Utiliser la fonction PostgreSQL
      const { data, error } = await supabase.rpc('save_premium_pricing', {
        admin_email: user.email,
        p_price_usd: pricingData.price_usd,
        p_price_eur: pricingData.price_eur,
        p_price_cad: pricingData.price_cad,
        p_price_clp: pricingData.price_clp,
        p_price_htg: pricingData.price_htg,
        p_currency: pricingData.currency || 'USD',
        p_exchange_rates: pricingData.exchange_rates || {},
        p_is_active: pricingData.is_active,
        p_created_by: user.id
      });

      if (error) throw error;

      toast({
        title: "Prix sauvegardé",
        description: "La tarification a été mise à jour avec succès",
      });

      await loadPrices();
    } catch (error: any) {
      console.error('Erreur sauvegarde prix:', error);
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la sauvegarde",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Activer un prix existant
  const activatePricing = async (id: string) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.email !== 'clodenerc@yahoo.fr') {
        throw new Error('Accès non autorisé - Admin requis');
      }

      const { error } = await supabase.rpc('activate_premium_pricing', {
        pricing_id: id
      });

      if (error) throw error;

      toast({
        title: "Prix activé",
        description: "Le nouveau prix est maintenant actif",
      });

      await loadPrices();
    } catch (error: any) {
      console.error('Erreur activation prix:', error);
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de l'activation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Supprimer un prix
  const deletePricing = async (id: string) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.email !== 'clodenerc@yahoo.fr') {
        throw new Error('Accès non autorisé - Admin requis');
      }

      // Utiliser une requête directe pour la suppression
      const { error } = await supabase
        .from('premium_pricing')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Prix supprimé",
        description: "La tarification a été supprimée",
      });

      await loadPrices();
    } catch (error: any) {
      console.error('Erreur suppression prix:', error);
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la suppression",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrices();
  }, []);

  return {
    prices,
    activePricing,
    loading,
    loadPrices,
    savePricing,
    activatePricing,
    deletePricing
  };
};