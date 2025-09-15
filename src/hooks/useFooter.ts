/**
 * Hook CORRIGÉ pour le footer - VERSION FINALE
 * Avec toutes les fonctions implémentées correctement
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Vérifier les permissions admin
  const checkAdminPermissions = useCallback(async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        return false;
      }
      
      return user.email === 'clodenerc@yahoo.fr';
    } catch (error) {
      return false;
    }
  }, []);

  // Charger les données
  const loadAllFooterData = useCallback(async () => {
    setLoading(true);
    console.log('🔍 === DÉBUT CHARGEMENT FOOTER DATA ===');
    
    try {
      const [contentResult, socialsResult, linksResult] = await Promise.all([
        supabase.from('footer_content').select('*').eq('is_active', true).maybeSingle(),
        supabase.from('footer_socials').select('*').order('order_index'),
        supabase.from('footer_links').select('*').order('category, order_index')
      ]);

      console.log('📊 === RÉSULTATS BRUTS ===');
      console.log('Content:', contentResult);
      console.log('Socials:', socialsResult);
      console.log('Links:', linksResult);

      // Traitement des données
      if (contentResult.error) {
        console.error('❌ Erreur footer_content:', contentResult.error);
      } else {
        setContent(contentResult.data);
        console.log('✅ Content chargé:', contentResult.data);
      }

      if (socialsResult.error) {
        console.error('❌ Erreur footer_socials:', socialsResult.error);
        setSocials([]);
      } else {
        setSocials(socialsResult.data || []);
        console.log('✅ Socials chargés:', socialsResult.data?.length, 'éléments');
      }

      if (linksResult.error) {
        console.error('❌ Erreur footer_links:', linksResult.error);
        setLinks([]);
      } else {
        setLinks(linksResult.data || []);
        console.log('✅ Links chargés:', linksResult.data?.length, 'éléments');
      }

      console.log('🏁 === FIN CHARGEMENT FOOTER DATA ===');

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
    }
  }, [toast]);

  // ✅ CORRECTION: Implémenter updateContent
  const updateContent = useCallback(async (newContent: Omit<FooterContent, 'id' | 'created_at' | 'updated_at'>) => {
    console.log('🔄 === DÉBUT updateContent ===');
    console.log('📝 New Content:', newContent);
    
    try {
      const hasPermissions = await checkAdminPermissions();
      if (!hasPermissions) {
        throw new Error('Permissions admin requises');
      }

      console.log('🔄 Envoi requête UPDATE vers Supabase...');
      
      const { data, error } = await supabase
        .from('footer_content')
        .update({
          ...newContent,
          updated_at: new Date().toISOString()
        })
        .eq('is_active', true)
        .select()
        .single();

      console.log('📊 === RÉPONSE SUPABASE updateContent ===');
      console.log('Data:', data);
      console.log('Error:', error);

      if (error) {
        console.error('❌ Erreur SQL updateContent:', error);
        throw error;
      }

      console.log('✅ updateContent réussi !');
      
      toast({
        title: "✅ Contenu mis à jour",
        description: "Le contenu du footer a été mis à jour avec succès.",
      });

      // Recharger les données
      await loadAllFooterData();
      
      console.log('🏁 === FIN updateContent ===');
      return data;

    } catch (error: any) {
      console.error('❌ === ERREUR COMPLÈTE updateContent ===');
      console.error('❌ Exception:', error);
      
      toast({
        title: "❌ Erreur",
        description: `Impossible de modifier le contenu: ${error.message}`,
        variant: "destructive",
      });
      throw error;
    }
  }, [checkAdminPermissions, loadAllFooterData, toast]);

  // ✅ CORRECTION: Implémenter addLink
  const addLink = useCallback(async (link: Omit<FooterLink, 'id' | 'created_at' | 'updated_at'>) => {
    console.log('🔄 === DÉBUT addLink ===');
    console.log('📝 New Link:', link);
    
    try {
      const hasPermissions = await checkAdminPermissions();
      if (!hasPermissions) {
        throw new Error('Permissions admin requises');
      }

      const { data, error } = await supabase
        .from('footer_links')
        .insert({
          ...link,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Erreur SQL addLink:', error);
        throw error;
      }

      console.log('✅ addLink réussi !');
      
      toast({
        title: "✅ Lien ajouté",
        description: "Le lien a été ajouté avec succès.",
      });

      await loadAllFooterData();
      return data;

    } catch (error: any) {
      console.error('❌ === ERREUR COMPLÈTE addLink ===');
      console.error('❌ Exception:', error);
      
      toast({
        title: "❌ Erreur",
        description: `Impossible d'ajouter le lien: ${error.message}`,
        variant: "destructive",
      });
      throw error;
    }
  }, [checkAdminPermissions, loadAllFooterData, toast]);

  // ✅ CORRECTION: Implémenter addSocial
  const addSocial = useCallback(async (social: Omit<FooterSocial, 'id' | 'created_at' | 'updated_at'>) => {
    console.log('🔄 === DÉBUT addSocial ===');
    console.log('📝 New Social:', social);
    
    try {
      const hasPermissions = await checkAdminPermissions();
      if (!hasPermissions) {
        throw new Error('Permissions admin requises');
      }

      const { data, error } = await supabase
        .from('footer_socials')
        .insert({
          ...social,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Erreur SQL addSocial:', error);
        throw error;
      }

      console.log('✅ addSocial réussi !');
      
      toast({
        title: "✅ Réseau social ajouté",
        description: "Le réseau social a été ajouté avec succès.",
      });

      await loadAllFooterData();
      return data;

    } catch (error: any) {
      console.error('❌ === ERREUR COMPLÈTE addSocial ===');
      console.error('❌ Exception:', error);
      
      toast({
        title: "❌ Erreur",
        description: `Impossible d'ajouter le réseau social: ${error.message}`,
        variant: "destructive",
      });
      throw error;
    }
  }, [checkAdminPermissions, loadAllFooterData, toast]);

  // Mettre à jour un lien
  const updateLink = useCallback(async (id: string, updates: Partial<FooterLink>) => {
    console.log('🔄 === DÉBUT updateLink ===');
    console.log('📝 ID:', id);
    console.log('📝 Updates:', updates);
    
    try {
      const hasPermissions = await checkAdminPermissions();
      if (!hasPermissions) {
        throw new Error('Permissions admin requises');
      }

      const { data, error } = await supabase
        .from('footer_links')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Erreur SQL updateLink:', error);
        throw error;
      }

      console.log('✅ updateLink réussi !');
      
      toast({
        title: "✅ Lien mis à jour",
        description: "Le lien a été mis à jour avec succès.",
      });

      await loadAllFooterData();
      return data;

    } catch (error: any) {
      console.error('❌ === ERREUR COMPLÈTE updateLink ===');
      console.error('❌ Exception:', error);
      
      toast({
        title: "❌ Erreur",
        description: `Impossible de modifier le lien: ${error.message}`,
        variant: "destructive",
      });
      throw error;
    }
  }, [checkAdminPermissions, loadAllFooterData, toast]);

  // Mettre à jour un réseau social
  const updateSocial = useCallback(async (id: string, updates: Partial<FooterSocial>) => {
    console.log('🔄 === DÉBUT updateSocial ===');
    console.log('📝 ID:', id);
    console.log('📝 Updates:', updates);
    
    try {
      const hasPermissions = await checkAdminPermissions();
      if (!hasPermissions) {
        throw new Error('Permissions admin requises');
      }

      const { data, error } = await supabase
        .from('footer_socials')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Erreur SQL updateSocial:', error);
        throw error;
      }

      console.log('✅ updateSocial réussi !');
      
      toast({
        title: "✅ Réseau social mis à jour",
        description: "Le réseau social a été mis à jour avec succès.",
      });

      await loadAllFooterData();
      return data;

    } catch (error: any) {
      console.error('❌ === ERREUR COMPLÈTE updateSocial ===');
      console.error('❌ Exception:', error);
      
      toast({
        title: "❌ Erreur",
        description: `Impossible de modifier le réseau social: ${error.message}`,
        variant: "destructive",
      });
      throw error;
    }
  }, [checkAdminPermissions, loadAllFooterData, toast]);

  // Supprimer un lien
  const deleteLink = useCallback(async (id: string) => {
    try {
      const hasPermissions = await checkAdminPermissions();
      if (!hasPermissions) {
        throw new Error('Permissions admin requises');
      }

      const { error } = await supabase
        .from('footer_links')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "✅ Lien supprimé",
        description: "Le lien a été supprimé définitivement.",
      });

      await loadAllFooterData();
    } catch (error: any) {
      toast({
        title: "❌ Erreur",
        description: `Impossible de supprimer le lien: ${error.message}`,
        variant: "destructive",
      });
      throw error;
    }
  }, [checkAdminPermissions, loadAllFooterData, toast]);

  // Supprimer un réseau social
  const deleteSocial = useCallback(async (id: string) => {
    try {
      const hasPermissions = await checkAdminPermissions();
      if (!hasPermissions) {
        throw new Error('Permissions admin requises');
      }

      const { error } = await supabase
        .from('footer_socials')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "✅ Réseau social supprimé",
        description: "Le réseau social a été supprimé définitivement.",
      });

      await loadAllFooterData();
    } catch (error: any) {
      toast({
        title: "❌ Erreur",
        description: `Impossible de supprimer le réseau social: ${error.message}`,
        variant: "destructive",
      });
      throw error;
    }
  }, [checkAdminPermissions, loadAllFooterData, toast]);

  // Charger les données au montage
  useEffect(() => {
    loadAllFooterData();
  }, [loadAllFooterData]);

  // Listeners temps réel pour toutes les tables
  useEffect(() => {
    console.log('🔄 Configuration des listeners temps réel...');
    
    const channels = [
      supabase
        .channel('footer_content_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'footer_content' }, () => {
          console.log('🔄 Changement détecté sur footer_content');
          loadAllFooterData();
        })
        .subscribe(),
      
      supabase
        .channel('footer_links_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'footer_links' }, () => {
          console.log('🔄 Changement détecté sur footer_links');
          loadAllFooterData();
        })
        .subscribe(),
      
      supabase
        .channel('footer_socials_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'footer_socials' }, () => {
          console.log('🔄 Changement détecté sur footer_socials');
          loadAllFooterData();
        })
        .subscribe()
    ];

    return () => {
      console.log('🧹 Nettoyage des listeners temps réel...');
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [loadAllFooterData]);

  return {
    content,
    links,
    socials,
    loading,
    updateContent,
    addLink,
    updateLink,
    deleteLink,
    addSocial,
    updateSocial,
    deleteSocial,
    refreshFooter: loadAllFooterData
  };
};
