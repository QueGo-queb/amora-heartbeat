import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LegalPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  meta_description?: string;
  category: string;
  is_active: boolean;
  order_index: number;
  updated_at: string;
}

export const useLegalPagesSync = () => {
  const [legalPages, setLegalPages] = useState<LegalPage[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // ✅ Chargement des pages légales
  const loadLegalPages = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('legal_pages')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      setLegalPages(data || []);
    } catch (error) {
      console.error('Erreur chargement pages légales:', error);
      toast({
        title: "❌ Erreur",
        description: "Impossible de charger les pages légales",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // ✅ Créer une page légale
  const createLegalPage = useCallback(async (pageData: Omit<LegalPage, 'id' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('legal_pages')
        .insert({
          ...pageData,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // ✅ Mise à jour immédiate de l'état local
      setLegalPages(prev => [...prev, data]);
      
      // ✅ Déclencher un événement personnalisé
      window.dispatchEvent(new CustomEvent('footer-refresh'));

      toast({
        title: "✅ Succès",
        description: "Page légale créée avec succès",
      });

      return data;
    } catch (error: any) {
      toast({
        title: "❌ Erreur",
        description: "Impossible de créer la page légale",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);

  // ✅ Mettre à jour une page légale
  const updateLegalPage = useCallback(async (id: string, updates: Partial<LegalPage>) => {
    try {
      const { data, error } = await supabase
        .from('legal_pages')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // ✅ Mise à jour immédiate de l'état local
      setLegalPages(prev => prev.map(page => page.id === id ? data : page));
      
      // ✅ Déclencher un événement personnalisé
      window.dispatchEvent(new CustomEvent('footer-refresh'));

      toast({
        title: "✅ Succès",
        description: "Page légale mise à jour avec succès",
      });

      return data;
    } catch (error: any) {
      toast({
        title: "❌ Erreur",
        description: "Impossible de mettre à jour la page légale",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);

  // ✅ Supprimer une page légale
  const deleteLegalPage = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('legal_pages')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // ✅ Mise à jour immédiate de l'état local
      setLegalPages(prev => prev.filter(page => page.id !== id));
      
      // ✅ Déclencher un événement personnalisé
      window.dispatchEvent(new CustomEvent('footer-refresh'));

      toast({
        title: "✅ Succès",
        description: "Page légale supprimée avec succès",
      });
    } catch (error: any) {
      toast({
        title: "❌ Erreur",
        description: "Impossible de supprimer la page légale",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);

  // ✅ Écoute des changements en temps réel
  useEffect(() => {
    loadLegalPages();

    // Écouter les événements personnalisés
    const handleFooterRefresh = () => {
      console.log('🔄 Événement footer-refresh reçu pour pages légales');
      loadLegalPages();
    };

    window.addEventListener('footer-refresh', handleFooterRefresh);

    // Écouter les changements Supabase
    const channel = supabase
      .channel('legal_pages_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'legal_pages' }, () => {
        console.log('🔄 Changement détecté sur legal_pages');
        loadLegalPages();
      })
      .subscribe();

    return () => {
      window.removeEventListener('footer-refresh', handleFooterRefresh);
      supabase.removeChannel(channel);
    };
  }, [loadLegalPages]);

  return {
    legalPages,
    loading,
    createLegalPage,
    updateLegalPage,
    deleteLegalPage,
    refreshLegalPages: loadLegalPages
  };
};
