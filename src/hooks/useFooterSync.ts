import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LegalPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  category: string;
  is_active: boolean;
  order_index: number;
}

export const useFooterSync = () => {
  const [legalPages, setLegalPages] = useState<LegalPage[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // ✅ FONCTION: Synchroniser les pages légales avec le footer
  const syncLegalPagesWithFooter = useCallback(async () => {
    setLoading(true);
    console.log('🔄 === DÉBUT SYNCHRONISATION PAGES LÉGALES ===');
    
    try {
      // 1. Récupérer toutes les pages légales actives
      const { data: pages, error: pagesError } = await supabase
        .from('legal_pages')
        .select('*')
        .eq('is_active', true)
        .order('category')
        .order('order_index');

      if (pagesError) throw pagesError;

      console.log('📄 Pages légales récupérées:', pages?.length || 0);

      if (!pages || pages.length === 0) {
        console.log('⚠️ Aucune page légale active trouvée');
        setLegalPages([]);
        return;
      }

      // 2. Synchroniser avec footer_links
      const footerLinksToSync = pages.map(page => ({
        category: page.category as 'quick_links' | 'support' | 'legal',
        name: page.title,
        href: `/${page.slug}`,
        order_index: page.order_index,
        is_active: page.is_active,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      console.log('🔗 Liens à synchroniser:', footerLinksToSync.length);

      // 3. Supprimer les anciens liens de la même catégorie
      const categories = [...new Set(pages.map(p => p.category))];
      
      for (const category of categories) {
        const { error: deleteError } = await supabase
          .from('footer_links')
          .delete()
          .eq('category', category);

        if (deleteError) {
          console.warn('⚠️ Erreur suppression anciens liens:', deleteError);
        }
      }

      // 4. Insérer les nouveaux liens
      const { error: insertError } = await supabase
        .from('footer_links')
        .insert(footerLinksToSync);

      if (insertError) throw insertError;

      setLegalPages(pages);

      console.log('✅ Synchronisation terminée avec succès');
      
      toast({
        title: "✅ Synchronisation réussie",
        description: `${pages.length} pages légales synchronisées avec le footer`,
      });

      // 5. Déclencher le rechargement du footer
      window.dispatchEvent(new CustomEvent('footer-refresh'));

    } catch (error: any) {
      console.error('❌ Erreur synchronisation:', error);
      
      toast({
        title: "❌ Erreur de synchronisation",
        description: `Impossible de synchroniser: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // ✅ FONCTION: Vérifier la cohérence entre admin et footer
  const checkConsistency = useCallback(async () => {
    try {
      const [legalPagesResult, footerLinksResult] = await Promise.all([
        supabase.from('legal_pages').select('*').eq('is_active', true),
        supabase.from('footer_links').select('*')
      ]);

      if (legalPagesResult.error) throw legalPagesResult.error;
      if (footerLinksResult.error) throw footerLinksResult.error;

      const legalPages = legalPagesResult.data || [];
      const footerLinks = footerLinksResult.data || [];

      console.log('🔍 === VÉRIFICATION COHÉRENCE ===');
      console.log('Pages légales actives:', legalPages.length);
      console.log('Liens footer:', footerLinks.length);

      const inconsistencies = [];

      // Vérifier si chaque page légale a un lien correspondant
      for (const page of legalPages) {
        const correspondingLink = footerLinks.find(link => 
          link.href === `/${page.slug}` && link.category === page.category
        );

        if (!correspondingLink) {
          inconsistencies.push({
            type: 'missing_link',
            page: page.title,
            category: page.category
          });
        }
      }

      // Vérifier si des liens footer pointent vers des pages inexistantes
      for (const link of footerLinks) {
        if (link.href.startsWith('/') && !link.href.startsWith('http')) {
          const slug = link.href.substring(1);
          const correspondingPage = legalPages.find(page => page.slug === slug);
          
          if (!correspondingPage) {
            inconsistencies.push({
              type: 'orphaned_link',
              link: link.name,
              href: link.href
            });
          }
        }
      }

      console.log('⚠️ Incohérences détectées:', inconsistencies.length);
      return inconsistencies;

    } catch (error: any) {
      console.error('❌ Erreur vérification cohérence:', error);
      return [];
    }
  }, []);

  // ✅ FONCTION: Nettoyer les liens orphelins
  const cleanupOrphanedLinks = useCallback(async () => {
    try {
      const inconsistencies = await checkConsistency();
      const orphanedLinks = inconsistencies.filter(inc => inc.type === 'orphaned_link');

      if (orphanedLinks.length === 0) {
        toast({
          title: "✅ Aucun lien orphelin",
          description: "Tous les liens du footer sont cohérents",
        });
        return;
      }

      // Supprimer les liens orphelins
      for (const orphan of orphanedLinks) {
        const { error } = await supabase
          .from('footer_links')
          .delete()
          .eq('name', orphan.link);

        if (error) {
          console.warn('⚠️ Erreur suppression lien orphelin:', error);
        }
      }

      toast({
        title: "✅ Nettoyage terminé",
        description: `${orphanedLinks.length} liens orphelins supprimés`,
      });

      // Recharger le footer
      window.dispatchEvent(new CustomEvent('footer-refresh'));

    } catch (error: any) {
      console.error('❌ Erreur nettoyage:', error);
      toast({
        title: "❌ Erreur de nettoyage",
        description: "Impossible de nettoyer les liens orphelins",
        variant: "destructive",
      });
    }
  }, [checkConsistency, toast]);

  return {
    legalPages,
    loading,
    syncLegalPagesWithFooter,
    checkConsistency,
    cleanupOrphanedLinks
  };
};
