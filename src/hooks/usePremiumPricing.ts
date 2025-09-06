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
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const usePremiumPricing = () => {
  const [prices, setPrices] = useState<PremiumPrice[]>([]);
  const [activePricing, setActivePricing] = useState<PremiumPrice | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Charger tous les prix
  const loadPrices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('premium_pricing')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPrices(data || []);
      
      // Trouver le prix actif
      const active = data?.find(p => p.is_active);
      setActivePricing(active || null);
    } catch (error) {
      console.error('Erreur chargement prix:', error);
    } finally {
      setLoading(false);
    }
  };

  // Créer ou mettre à jour un prix
  const savePricing = async (pricingData: Omit<PremiumPrice, 'id' | 'created_at' | 'updated_at'>) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      // Si on active ce prix, désactiver les autres
      if (pricingData.is_active) {
        await supabase
          .from('premium_pricing')
          .update({ is_active: false })
          .eq('is_active', true);
      }

      const { data, error } = await supabase
        .from('premium_pricing')
        .insert({
          ...pricingData,
          created_by: user.id,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Prix sauvegardé",
        description: "La tarification a été mise à jour avec succès",
      });

      await loadPrices();
      return data;
    } catch (error: any) {
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
      // Désactiver tous les prix
      await supabase
        .from('premium_pricing')
        .update({ is_active: false })
        .eq('is_active', true);

      // Activer le prix sélectionné
      const { error } = await supabase
        .from('premium_pricing')
        .update({ 
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Prix activé",
        description: "Le nouveau prix est maintenant actif",
      });

      await loadPrices();
    } catch (error: any) {
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
