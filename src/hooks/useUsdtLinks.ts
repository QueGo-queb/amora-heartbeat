import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UsdtLinks {
  id: string;
  trc20_address: string | null;
  erc20_address: string | null;
  trc20_qr_code: string | null;
  erc20_qr_code: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useUsdtLinks() {
  const [links, setLinks] = useState<UsdtLinks | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Charger les liens USDT actifs
  const loadUsdtLinks = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('usdt_payment_links')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setLinks(data || null);
    } catch (error) {
      console.error('Erreur chargement liens USDT:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Sauvegarder les liens USDT (admin seulement)
  const saveUsdtLinks = useCallback(async (
    trc20Address: string, 
    erc20Address: string,
    trc20QrCode?: string,
    erc20QrCode?: string
  ) => {
    try {
      setSaving(true);
      
      // Vérifier les droits admin
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.email !== 'clodenerc@yahoo.fr') {
        throw new Error('Accès non autorisé');
      }

      // Désactiver les anciens liens (ignorer les erreurs si aucun lien existant)
      try {
        await supabase
          .from('usdt_payment_links')
          .update({ is_active: false })
          .eq('is_active', true);
      } catch (error) {
        console.log('Aucun ancien lien à désactiver');
      }

      // Créer les nouveaux liens avec gestion d'erreur RLS
      let insertData = {
        trc20_address: trc20Address.trim() || null,
        erc20_address: erc20Address.trim() || null,
        trc20_qr_code: trc20QrCode?.trim() || null,
        erc20_qr_code: erc20QrCode?.trim() || null,
        is_active: true,
        created_by: user.id
      };

      let { data, error } = await supabase
        .from('usdt_payment_links')
        .insert(insertData)
        .select()
        .single();

      // Si erreur RLS, essayer sans created_by
      if (error && (error.code === '42501' || error.message.includes('row-level security'))) {
        delete insertData.created_by;
        const result = await supabase
          .from('usdt_payment_links')
          .insert(insertData)
          .select()
          .single();
        
        data = result.data;
        error = result.error;
      }

      if (error) throw error;

      setLinks(data);
      toast({
        title: "Liens USDT sauvegardés",
        description: "Les adresses de paiement ont été mises à jour avec succès",
      });

      return { success: true };
    } catch (error: any) {
      console.error('Erreur sauvegarde liens USDT:', error);
      
      // Message d'erreur plus détaillé
      let errorMessage = "Impossible de sauvegarder les liens USDT";
      if (error.message.includes('relation') || error.message.includes('table')) {
        errorMessage = "La table USDT n'existe pas encore. Veuillez exécuter les migrations.";
      } else if (error.message.includes('permission') || error.message.includes('security')) {
        errorMessage = "Permissions insuffisantes pour sauvegarder les liens USDT.";
      }
      
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setSaving(false);
    }
  }, [toast]);

  // Vérifier si l'utilisateur est admin
  const checkAdminAccess = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.email === 'clodenerc@yahoo.fr';
  }, []);

  useEffect(() => {
    loadUsdtLinks();
  }, [loadUsdtLinks]);

  return {
    links,
    loading,
    saving,
    loadUsdtLinks,
    saveUsdtLinks,
    checkAdminAccess
  };
}