/**
 * Hook simplifié pour gérer le contenu du footer
 * Version web app simple sans base de données complexe
 */

import { useState, useEffect } from 'react';
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
  contact_address?: string;
  contact_phone?: string;
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

  // Charger le contenu du footer
  const loadFooterContent = async () => {
    try {
      const { data, error } = await supabase
        .from('footer_content')
        .select('*')
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erreur chargement contenu footer:', error);
        return;
      }

      setContent(data);
    } catch (error) {
      console.error('Erreur chargement contenu footer:', error);
    }
  };

  // Charger les liens du footer
  const loadFooterLinks = async () => {
    try {
      const { data, error } = await supabase
        .from('footer_links')
        .select('*')
        .eq('is_active', true)
        .order('category')
        .order('order_index');

      if (error && error.code !== 'PGRST116') {
        console.error('Erreur chargement liens footer:', error);
        return;
      }

      setLinks(data || []);
    } catch (error) {
      console.error('Erreur chargement liens footer:', error);
    }
  };

  // Charger les réseaux sociaux
  const loadFooterSocials = async () => {
    try {
      const { data, error } = await supabase
        .from('footer_socials')
        .select('*')
        .eq('is_active', true)
        .order('order_index');

      if (error && error.code !== 'PGRST116') {
        console.error('Erreur chargement réseaux sociaux footer:', error);
        return;
      }

      setSocials(data || []);
    } catch (error) {
      console.error('Erreur chargement réseaux sociaux footer:', error);
    }
  };

  // Charger toutes les données
  const loadAllFooterData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadFooterContent(),
        loadFooterLinks(),
        loadFooterSocials()
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour le contenu principal
  const updateContent = async (newContent: Omit<FooterContent, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      // Désactiver l'ancien contenu
      await supabase
        .from('footer_content')
        .update({ is_active: false })
        .eq('is_active', true);

      // Créer le nouveau contenu
      const { data, error } = await supabase
        .from('footer_content')
        .insert({
          ...newContent,
          created_by: user.id,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Contenu mis à jour",
        description: "Le contenu du footer a été mis à jour avec succès.",
      });

      await loadFooterContent();
      return data;
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la mise à jour du contenu",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Ajouter un lien
  const addLink = async (link: Omit<FooterLink, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const { data, error } = await supabase
        .from('footer_links')
        .insert({
          ...link,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Lien ajouté",
        description: "Le lien a été ajouté avec succès.",
      });

      await loadFooterLinks();
      return data;
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de l'ajout du lien",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Mettre à jour un lien
  const updateLink = async (id: string, updates: Partial<FooterLink>) => {
    try {
      const { data, error } = await supabase
        .from('footer_links')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Lien mis à jour",
        description: "Le lien a été mis à jour avec succès.",
      });

      await loadFooterLinks();
      return data;
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la mise à jour du lien",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Supprimer un lien
  const deleteLink = async (id: string) => {
    try {
      const { error } = await supabase
        .from('footer_links')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Lien supprimé",
        description: "Le lien a été supprimé avec succès.",
      });

      await loadFooterLinks();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la suppression du lien",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Ajouter un réseau social
  const addSocial = async (social: Omit<FooterSocial, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const { data, error } = await supabase
        .from('footer_socials')
        .insert({
          ...social,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Réseau social ajouté",
        description: "Le réseau social a été ajouté avec succès.",
      });

      await loadFooterSocials();
      return data;
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de l'ajout du réseau social",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Mettre à jour un réseau social
  const updateSocial = async (id: string, updates: Partial<FooterSocial>) => {
    try {
      const { data, error } = await supabase
        .from('footer_socials')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Réseau social mis à jour",
        description: "Le réseau social a été mis à jour avec succès.",
      });

      await loadFooterSocials();
      return data;
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la mise à jour du réseau social",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Supprimer un réseau social
  const deleteSocial = async (id: string) => {
    try {
      const { error } = await supabase
        .from('footer_socials')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Réseau social supprimé",
        description: "Le réseau social a été supprimé avec succès.",
      });

      await loadFooterSocials();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la suppression du réseau social",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    loadAllFooterData();

    // Écouter les changements en temps réel
    const subscription = supabase
      .channel('footer_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'footer_content' },
        () => loadFooterContent()
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'footer_links' },
        () => loadFooterLinks()
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'footer_socials' },
        () => loadFooterSocials()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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
