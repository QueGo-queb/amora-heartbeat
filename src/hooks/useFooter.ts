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

  // ✅ SOLUTION BOUCLES INFINITES - loadAllFooterData stable
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
  }, [toast]); // ✅ Seulement toast dans les dépendances

  // ✅ SOLUTION BOUCLE INFINIE FINALE - Toutes les fonctions stables
  const updateContent = useCallback(async (newContent: any) => {
    try {
      const isAdmin = await checkAdminPermissions();
      if (!isAdmin) throw new Error('Accès non autorisé');

      const { error } = await supabase
        .from('footer_content')
        .upsert(newContent);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Contenu mis à jour avec succès",
      });

      // ✅ Recharger les données après mise à jour
      await loadAllFooterData();
    } catch (error: any) {
      console.error('❌ Exception:', error);
      
      toast({
        title: "❌ Erreur",
        description: `Impossible de modifier le contenu: ${error.message}`,
        variant: "destructive",
      });
      throw error;
    }
  }, [checkAdminPermissions, toast]); // ✅ loadAllFooterData retiré des dépendances

  // ✅ CORRECTION: Implémenter addLink
  const addLink = useCallback(async (link: Omit<FooterLink, 'id' | 'created_at' | 'updated_at'>) => {
    console.log('🔄 === DÉBUT addLink ===');
    console.log('📝 New Link:', link);

    try {
      const isAdmin = await checkAdminPermissions();
      if (!isAdmin) throw new Error('Accès non autorisé');

      const { error } = await supabase
        .from('footer_links')
        .insert([{
          ...link,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Lien ajouté avec succès",
      });

      // ✅ Recharger les données après ajout
      await loadAllFooterData();
    } catch (error: any) {
      console.error('❌ Exception:', error);
      
      toast({
        title: "❌ Erreur",
        description: `Impossible d'ajouter le lien: ${error.message}`,
        variant: "destructive",
      });
      throw error;
    }
  }, [checkAdminPermissions, toast]); // ✅ loadAllFooterData retiré des dépendances

  // ✅ CORRECTION: Implémenter updateLink
  const updateLink = useCallback(async (id: string, updates: Partial<FooterLink>) => {
    console.log('🔄 === DÉBUT updateLink ===');
    console.log('🔧 Link ID:', id);
    console.log('📝 Updates:', updates);

    try {
      const isAdmin = await checkAdminPermissions();
      if (!isAdmin) throw new Error('Accès non autorisé');

      const { error } = await supabase
        .from('footer_links')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Lien mis à jour avec succès",
      });

      // ✅ Recharger les données après mise à jour
      await loadAllFooterData();
    } catch (error: any) {
      console.error('❌ Exception:', error);
      
      toast({
        title: "❌ Erreur",
        description: `Impossible de mettre à jour le lien: ${error.message}`,
        variant: "destructive",
      });
      throw error;
    }
  }, [checkAdminPermissions, toast]); // ✅ loadAllFooterData retiré des dépendances

  // ✅ CORRECTION: Implémenter deleteLink
  const deleteLink = useCallback(async (id: string) => {
    console.log('🔄 === DÉBUT deleteLink ===');
    console.log('🗑️ Link ID:', id);

    try {
      const isAdmin = await checkAdminPermissions();
      if (!isAdmin) throw new Error('Accès non autorisé');

      const { error } = await supabase
        .from('footer_links')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Lien supprimé avec succès",
      });

      // ✅ Recharger les données après suppression
      await loadAllFooterData();
    } catch (error: any) {
      console.error('❌ Exception:', error);
      
      toast({
        title: "❌ Erreur",
        description: `Impossible de supprimer le lien: ${error.message}`,
        variant: "destructive",
      });
      throw error;
    }
  }, [checkAdminPermissions, toast]); // ✅ loadAllFooterData retiré des dépendances

  // ✅ CORRECTION: Implémenter addSocial
  const addSocial = useCallback(async (social: Omit<FooterSocial, 'id' | 'created_at' | 'updated_at'>) => {
    console.log('🔄 === DÉBUT addSocial ===');
    console.log('📝 New Social:', social);

    try {
      const isAdmin = await checkAdminPermissions();
      if (!isAdmin) throw new Error('Accès non autorisé');

      const { error } = await supabase
        .from('footer_socials')
        .insert([{
          ...social,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Réseau social ajouté avec succès",
      });

      // ✅ Recharger les données après ajout
      await loadAllFooterData();
    } catch (error: any) {
      console.error('❌ Exception:', error);
      
      toast({
        title: "❌ Erreur",
        description: `Impossible d'ajouter le réseau social: ${error.message}`,
        variant: "destructive",
      });
      throw error;
    }
  }, [checkAdminPermissions, toast]); // ✅ loadAllFooterData retiré des dépendances

  // ✅ CORRECTION: Implémenter updateSocial
  const updateSocial = useCallback(async (id: string, updates: Partial<FooterSocial>) => {
    console.log('🔄 === DÉBUT updateSocial ===');
    console.log('�� Social ID:', id);
    console.log('📝 Updates:', updates);

    try {
      const isAdmin = await checkAdminPermissions();
      if (!isAdmin) throw new Error('Accès non autorisé');

      const { error } = await supabase
        .from('footer_socials')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Réseau social mis à jour avec succès",
      });

      // ✅ Recharger les données après mise à jour
      await loadAllFooterData();
    } catch (error: any) {
      console.error('❌ Exception:', error);
      
      toast({
        title: "❌ Erreur",
        description: `Impossible de mettre à jour le réseau social: ${error.message}`,
        variant: "destructive",
      });
      throw error;
    }
  }, [checkAdminPermissions, toast]); // ✅ loadAllFooterData retiré des dépendances

  // ✅ CORRECTION: Implémenter deleteSocial
  const deleteSocial = useCallback(async (id: string) => {
    console.log('🔄 === DÉBUT deleteSocial ===');
    console.log('🗑️ Social ID:', id);

    try {
      const isAdmin = await checkAdminPermissions();
      if (!isAdmin) throw new Error('Accès non autorisé');

      const { error } = await supabase
        .from('footer_socials')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Réseau social supprimé avec succès",
      });

      // ✅ Recharger les données après suppression
      await loadAllFooterData();
    } catch (error: any) {
      console.error('❌ Exception:', error);
      
      toast({
        title: "❌ Erreur",
        description: `Impossible de supprimer le réseau social: ${error.message}`,
        variant: "destructive",
      });
      throw error;
    }
  }, [checkAdminPermissions, toast]); // ✅ loadAllFooterData retiré des dépendances

  // ✅ SOLUTION BOUCLE INFINIE - useEffect stable
  useEffect(() => {
    loadAllFooterData();
  }, []); // ✅ Se déclenche une seule fois

  // ✅ SOLUTION BOUCLE INFINIE - listeners stable
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
  }, []); // ✅ Se configure une seule fois

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
