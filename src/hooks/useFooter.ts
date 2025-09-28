/**
 * Hook OPTIMISÉ pour le footer - VERSION SYNCHRONISATION ROBUSTE
 * ✅ PRÉSERVE TOUTES LES CORRECTIONS EXISTANTES
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// ✅ INTERFACES PRÉSERVÉES
export interface LegalPage {
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

export interface FooterContent {
  id: string;
  company_name: string;
  company_description: string;
  company_stats: Array<{
    icon: string;
    value: string;
    label: string;
  }>;
  contact_email?: string;
  contact_hours?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FooterLink {
  id: string;
  category: 'quick_links' | 'support' | 'legal';
  name: string;
  href: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FooterSocial {
  id: string;
  name: string;
  icon_name: string;
  href: string;
  color_class: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useFooter = () => {
  const [content, setContent] = useState<FooterContent | null>(null);
  const [links, setLinks] = useState<FooterLink[]>([]);
  const [socials, setSocials] = useState<FooterSocial[]>([]);
  const [legalPages, setLegalPages] = useState<LegalPage[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // ✅ AMÉLIORATION: Cache local optimisé avec timestamp
  const [lastUpdate, setLastUpdate] = useState<number>(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const syncChannelsRef = useRef<any[]>([]);

  // ✅ AMÉLIORATION: Fonction de chargement avec debounce et préservation des données
  const loadAllFooterData = useCallback(async (forceRefresh = false) => {
    const now = Date.now();
    
    // Éviter les appels multiples si pas de force refresh
    if (!forceRefresh && (isUpdating || (now - lastUpdate < 500))) {
      return;
    }

    // ✅ AMÉLIORATION: Debounce pour éviter les appels multiples
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    updateTimeoutRef.current = setTimeout(async () => {
      setIsUpdating(true);
      setLoading(true);
      console.log('🔄 === DÉBUT CHARGEMENT FOOTER DATA SYNCHRONISATION ROBUSTE ===');
      
      try {
        // ✅ AMÉLIORATION: Chargement parallèle optimisé
        const [contentResult, socialsResult, linksResult, legalPagesResult] = await Promise.all([
          supabase.from('footer_content').select('*').eq('is_active', true).maybeSingle(),
          supabase.from('footer_socials').select('*').order('order_index'),
          supabase.from('footer_links').select('*').order('category, order_index'),
          supabase.from('legal_pages').select('*').eq('is_active', true).order('order_index')
        ]);

        // ✅ AMÉLIORATION: Mise à jour optimiste des états avec préservation
        if (contentResult.data) {
          setContent(prev => ({ ...(prev ?? {}), ...contentResult.data }));
          console.log('✅ Content mis à jour:', contentResult.data);
        }

        if (socialsResult.data) {
          setSocials(socialsResult.data);
          console.log('✅ Socials mis à jour:', socialsResult.data.length, 'éléments');
        }

        if (linksResult.data) {
          setLinks(linksResult.data);
          console.log('✅ Links mis à jour:', linksResult.data.length, 'éléments');
        }

        if (legalPagesResult.data) {
          setLegalPages(legalPagesResult.data);
          console.log('✅ Pages légales mises à jour:', legalPagesResult.data.length, 'éléments');
        }

        setLastUpdate(now);
        console.log('🏁 === FIN CHARGEMENT FOOTER DATA SYNCHRONISATION ROBUSTE ===');

        // ✅ AMÉLIORATION: Déclencher un événement personnalisé pour notifier les composants
        window.dispatchEvent(new CustomEvent('footer-data-updated', { 
          detail: { 
            content: contentResult.data,
            links: linksResult.data,
            socials: socialsResult.data,
            legalPages: legalPagesResult.data,
            timestamp: now
          } 
        }));

      } catch (error) {
        console.error('❌ === ERREUR GLOBALE FOOTER ===');
        console.error('❌ Exception:', error);
        
        toast({
          title: "❌ Erreur",
          description: "Impossible de charger le contenu du footer",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
        setIsUpdating(false);
      }
    }, forceRefresh ? 0 : 100);
  }, [toast, lastUpdate, isUpdating]);

  // ✅ AMÉLIORATION: Fonctions de mise à jour avec synchronisation immédiate
  const updateContent = useCallback(async (newContent: any) => {
    try {
      const { error } = await supabase
        .from('footer_content')
        .upsert(newContent);

      if (error) throw error;

      // ✅ Mise à jour immédiate de l'état local
      setContent(prev => ({ ...(prev ?? {}), ...newContent }));
      
      // ✅ AMÉLIORATION: Déclencher un événement personnalisé enrichi
      window.dispatchEvent(new CustomEvent('footer-refresh', { 
        detail: { type: 'content_updated', data: newContent, timestamp: Date.now() } 
      }));

      // ✅ Recharger les données après mise à jour
      await loadAllFooterData(true);

      toast({
        title: "✅ Succès",
        description: "Contenu mis à jour avec succès",
      });

    } catch (error: any) {
      console.error('❌ Exception:', error);
      
      toast({
        title: "❌ Erreur",
        description: `Impossible de modifier le contenu: ${error.message}`,
        variant: "destructive",
      });
      throw error;
    }
  }, [toast, loadAllFooterData]);

  // ✅ AMÉLIORATION: addLink avec synchronisation immédiate
  const addLink = useCallback(async (link: Omit<FooterLink, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('footer_links')
        .insert([{
          ...link,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      // ✅ Mise à jour immédiate de l'état local
      setLinks(prev => [...prev, data]);
      
      // ✅ AMÉLIORATION: Déclencher un événement personnalisé enrichi
      window.dispatchEvent(new CustomEvent('footer-refresh', { 
        detail: { type: 'link_added', data, timestamp: Date.now() } 
      }));

      toast({
        title: "✅ Succès",
        description: "Lien ajouté avec succès",
      });

      // Recharger les données après ajout
      await loadAllFooterData(true);
    } catch (error: any) {
      console.error('❌ Exception:', error);
      
      toast({
        title: "❌ Erreur",
        description: `Impossible d'ajouter le lien: ${error.message}`,
        variant: "destructive",
      });
      throw error;
    }
  }, [toast, loadAllFooterData]);

  // ✅ AMÉLIORATION: updateLink avec synchronisation immédiate
  const updateLink = useCallback(async (id: string, updates: Partial<FooterLink>) => {
    try {
      const { data, error } = await supabase
        .from('footer_links')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // ✅ Mise à jour immédiate de l'état local
      setLinks(prev => prev.map(link => link.id === id ? data : link));
      
      // ✅ AMÉLIORATION: Déclencher un événement personnalisé enrichi
      window.dispatchEvent(new CustomEvent('footer-refresh', { 
        detail: { type: 'link_updated', data, timestamp: Date.now() } 
      }));

      toast({
        title: "✅ Succès",
        description: "Lien mis à jour avec succès",
      });

      // Recharger les données après mise à jour
      await loadAllFooterData(true);
    } catch (error: any) {
      console.error('❌ Exception:', error);
      
      toast({
        title: "❌ Erreur",
        description: `Impossible de mettre à jour le lien: ${error.message}`,
        variant: "destructive",
      });
      throw error;
    }
  }, [toast, loadAllFooterData]);

  // ✅ AMÉLIORATION: deleteLink avec synchronisation immédiate
  const deleteLink = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('footer_links')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // ✅ Mise à jour immédiate de l'état local
      setLinks(prev => prev.filter(link => link.id !== id));
      
      // ✅ AMÉLIORATION: Déclencher un événement personnalisé enrichi
      window.dispatchEvent(new CustomEvent('footer-refresh', { 
        detail: { type: 'link_deleted', id, timestamp: Date.now() } 
      }));

      toast({
        title: "✅ Succès",
        description: "Lien supprimé avec succès",
      });

      // Recharger les données après suppression
      await loadAllFooterData(true);
    } catch (error: any) {
      console.error('❌ Exception:', error);
      
      toast({
        title: "❌ Erreur",
        description: `Impossible de supprimer le lien: ${error.message}`,
        variant: "destructive",
      });
      throw error;
    }
  }, [toast, loadAllFooterData]);

  // ✅ AMÉLIORATION: addSocial avec synchronisation immédiate
  const addSocial = useCallback(async (social: Omit<FooterSocial, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('footer_socials')
        .insert([{
          ...social,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      // ✅ Mise à jour immédiate de l'état local
      setSocials(prev => [...prev, data]);
      
      // ✅ AMÉLIORATION: Déclencher un événement personnalisé enrichi
      window.dispatchEvent(new CustomEvent('footer-refresh', { 
        detail: { type: 'social_added', data, timestamp: Date.now() } 
      }));

      toast({
        title: "✅ Succès",
        description: "Réseau social ajouté avec succès",
      });

      // Recharger les données après ajout
      await loadAllFooterData(true);
    } catch (error: any) {
      console.error('❌ Exception:', error);
      
      toast({
        title: "❌ Erreur",
        description: `Impossible d'ajouter le réseau social: ${error.message}`,
        variant: "destructive",
      });
      throw error;
    }
  }, [toast, loadAllFooterData]);

  // ✅ AMÉLIORATION: updateSocial avec synchronisation immédiate
  const updateSocial = useCallback(async (id: string, updates: Partial<FooterSocial>) => {
    try {
      const { data, error } = await supabase
        .from('footer_socials')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // ✅ Mise à jour immédiate de l'état local
      setSocials(prev => prev.map(social => social.id === id ? data : social));
      
      // ✅ AMÉLIORATION: Déclencher un événement personnalisé enrichi
      window.dispatchEvent(new CustomEvent('footer-refresh', { 
        detail: { type: 'social_updated', data, timestamp: Date.now() } 
      }));

      toast({
        title: "✅ Succès",
        description: "Réseau social mis à jour avec succès",
      });

      // Recharger les données après mise à jour
      await loadAllFooterData(true);
    } catch (error: any) {
      console.error('❌ Exception:', error);
      
      toast({
        title: "❌ Erreur",
        description: `Impossible de mettre à jour le réseau social: ${error.message}`,
        variant: "destructive",
      });
      throw error;
    }
  }, [toast, loadAllFooterData]);

  // ✅ AMÉLIORATION: deleteSocial avec synchronisation immédiate
  const deleteSocial = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('footer_socials')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // ✅ Mise à jour immédiate de l'état local
      setSocials(prev => prev.filter(social => social.id !== id));
      
      // ✅ AMÉLIORATION: Déclencher un événement personnalisé enrichi
      window.dispatchEvent(new CustomEvent('footer-refresh', { 
        detail: { type: 'social_deleted', id, timestamp: Date.now() } 
      }));

      toast({
        title: "✅ Succès",
        description: "Réseau social supprimé avec succès",
      });

      // Recharger les données après suppression
      await loadAllFooterData(true);
    } catch (error: any) {
      console.error('❌ Exception:', error);
      
      toast({
        title: "❌ Erreur",
        description: `Impossible de supprimer le réseau social: ${error.message}`,
        variant: "destructive",
      });
      throw error;
    }
  }, [toast, loadAllFooterData]);

  // ✅ AMÉLIORATION: Fonctions pour gérer les pages légales avec synchronisation
  const createLegalPage = useCallback(async (pageData: Omit<LegalPage, 'id' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('legal_pages')
        .insert([{
          ...pageData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      // ✅ Mise à jour immédiate de l'état local
      setLegalPages(prev => [...prev, data]);
      
      // ✅ AMÉLIORATION: Déclencher un événement personnalisé enrichi
      window.dispatchEvent(new CustomEvent('footer-refresh', { 
        detail: { type: 'legal_page_created', data, timestamp: Date.now() } 
      }));

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
      
      // ✅ AMÉLIORATION: Déclencher un événement personnalisé enrichi
      window.dispatchEvent(new CustomEvent('footer-refresh', { 
        detail: { type: 'legal_page_updated', data, timestamp: Date.now() } 
      }));

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

  const deleteLegalPage = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('legal_pages')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // ✅ Mise à jour immédiate de l'état local
      setLegalPages(prev => prev.filter(page => page.id !== id));
      
      // ✅ AMÉLIORATION: Déclencher un événement personnalisé enrichi
      window.dispatchEvent(new CustomEvent('footer-refresh', { 
        detail: { type: 'legal_page_deleted', id, timestamp: Date.now() } 
      }));

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

  // ✅ AMÉLIORATION: useEffect avec écoute des événements personnalisés
  useEffect(() => {
    loadAllFooterData();
  }, []);

  // ✅ AMÉLIORATION: Écoute des événements personnalisés + Supabase temps réel avec gestion robuste
  useEffect(() => {
    console.log('🔄 Configuration des listeners temps réel robustes...');
    
    // Écouter les événements personnalisés
    const handleFooterRefresh = (event: CustomEvent) => {
      console.log('🔄 Événement footer-refresh reçu:', event.detail);
      loadAllFooterData(true);
    };

    const handleFooterDataUpdated = (event: CustomEvent) => {
      console.log('🔄 Événement footer-data-updated reçu:', event.detail);
      // Les données sont déjà mises à jour, pas besoin de recharger
    };

    window.addEventListener('footer-refresh', handleFooterRefresh as EventListener);
    window.addEventListener('footer-data-updated', handleFooterDataUpdated as EventListener);
    
    // ✅ AMÉLIORATION: Écouter les changements Supabase avec gestion robuste
    const channels = [
      supabase
        .channel('footer_content_changes_robust')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'footer_content' }, (payload) => {
          console.log('🔄 Changement détecté sur footer_content:', payload);
          loadAllFooterData(true);
        })
        .subscribe(),
      
      supabase
        .channel('footer_links_changes_robust')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'footer_links' }, (payload) => {
          console.log('🔄 Changement détecté sur footer_links:', payload);
          loadAllFooterData(true);
        })
        .subscribe(),
      
      supabase
        .channel('footer_socials_changes_robust')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'footer_socials' }, (payload) => {
          console.log('🔄 Changement détecté sur footer_socials:', payload);
          loadAllFooterData(true);
        })
        .subscribe(),
      
      // ✅ AMÉLIORATION: Écoute des changements sur les pages légales
      supabase
        .channel('legal_pages_changes_robust')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'legal_pages' }, (payload) => {
          console.log('🔄 Changement détecté sur legal_pages:', payload);
          loadAllFooterData(true);
        })
        .subscribe()
    ];

    // ✅ AMÉLIORATION: Stocker les channels pour nettoyage
    syncChannelsRef.current = channels;

    return () => {
      console.log('🧹 Nettoyage des listeners temps réel robustes...');
      window.removeEventListener('footer-refresh', handleFooterRefresh as EventListener);
      window.removeEventListener('footer-data-updated', handleFooterDataUpdated as EventListener);
      syncChannelsRef.current.forEach(channel => supabase.removeChannel(channel));
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [loadAllFooterData]);

  return {
    content,
    links,
    socials,
    legalPages,
    loading,
    updateContent,
    addLink,
    updateLink,
    deleteLink,
    addSocial,
    updateSocial,
    deleteSocial,
    createLegalPage,
    updateLegalPage,
    deleteLegalPage,
    refreshFooter: () => loadAllFooterData(true)
  };
};
