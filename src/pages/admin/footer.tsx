/**
 * Page de gestion du footer - VERSION FUSIONNÉE AVEC PAGES LÉGALES
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit3, 
  Link, 
  Mail, 
  Phone, 
  MapPin, 
  Plus,
  Trash2,
  Save,
  Globe,
  ExternalLink,
  Eye,
  EyeOff,
  Loader2,
  Check,
  X,
  FileText,
  Search,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import HeaderAdmin from '@/components/admin/HeaderAdmin';
import { useFooter } from '@/hooks/useFooter';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// ✅ AJOUT: Interface pour les pages légales
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

const AdminFooter = () => {
  const navigate = useNavigate();
  // ✅ MODIFICATION: Utiliser le hook unifié avec pages légales
  const { 
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
    deleteLegalPage
  } = useFooter();
  
  const { toast } = useToast();
  
  // ✅ MODIFICATION: Ajout de l'onglet pages légales
  const [activeTab, setActiveTab] = useState<'content' | 'links' | 'socials' | 'legal'>('content');
  
  // États existants...
  const [editingContent, setEditingContent] = useState(false);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [editingSocialId, setEditingSocialId] = useState<string | null>(null);
  const [showAddLink, setShowAddLink] = useState(false);
  const [showAddSocial, setShowAddSocial] = useState(false);
  
  // ✅ AJOUT: États pour les pages légales
  const [legalPagesState, setLegalPagesState] = useState<LegalPage[]>([]);
  const [legalPagesLoading, setLegalPagesLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showLegalEditor, setShowLegalEditor] = useState(false);
  const [editingLegalPage, setEditingLegalPage] = useState<LegalPage | null>(null);
  
  // États de chargement pour chaque action
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  // Formulaires existants...
  const [contentForm, setContentForm] = useState({
    company_name: '',
    company_description: '',
    contact_address: '',
    contact_phone: '',
    contact_email: '',
    contact_hours: '',
    company_stats: []
  });

  const [linkForm, setLinkForm] = useState({
    category: 'quick_links' as const,
    name: '',
    href: '',
    order_index: 0
  });

  const [socialForm, setSocialForm] = useState({
    name: '',
    icon_name: 'facebook',
    href: '',
    color_class: 'hover:text-blue-500',
    order_index: 0
  });

  // ✅ AJOUT: Formulaire pour les pages légales
  const [legalPageForm, setLegalPageForm] = useState({
    slug: '',
    title: '',
    content: '',
    meta_description: '',
    category: 'legal',
    order_index: 0
  });

  // Formulaire d'édition de lien
  const [editLinkForm, setEditLinkForm] = useState({
    category: 'quick_links' as const,
    name: '',
    href: '',
    order_index: 0
  });

  // Formulaire d'édition de réseau social
  const [editSocialForm, setEditSocialForm] = useState({
    name: '',
    icon_name: 'facebook',
    href: '',
    color_class: 'hover:text-blue-500',
    order_index: 0
  });

  // ✅ AJOUT: Chargement des pages légales
  const loadLegalPages = useCallback(async () => {
    try {
      setLegalPagesLoading(true);
      const { data, error } = await supabase
        .from('legal_pages')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      setLegalPagesState(data || []);
    } catch (error) {
      console.error('Erreur chargement pages légales:', error);
      toast({
        title: "❌ Erreur",
        description: "Impossible de charger les pages légales",
        variant: "destructive",
      });
    } finally {
      setLegalPagesLoading(false);
    }
  }, [toast]);

  // ✅ AJOUT: Créer une page légale
  const handleCreateLegalPage = async () => {
    const loadingKey = 'create-legal-page';
    setLoading(loadingKey, true);
    
    try {
      await createLegalPage({
        ...legalPageForm,
        is_active: true
      });
      
      setLegalPageForm({
        slug: '',
        title: '',
        content: '',
        meta_description: '',
        category: 'legal',
        order_index: 0
      });
      setShowLegalEditor(false);
      
      toast({
        title: "✅ Succès",
        description: "Page légale créée avec succès",
      });
    } catch (error) {
      console.error('Erreur création page légale:', error);
      toast({
        title: "❌ Erreur",
        description: "Impossible de créer la page légale",
        variant: "destructive",
      });
    } finally {
      setLoading(loadingKey, false);
    }
  };

  // ✅ AJOUT: Modifier une page légale
  const handleEditLegalPage = (page: LegalPage) => {
    setEditingLegalPage(page);
    setLegalPageForm({
      slug: page.slug,
      title: page.title,
      content: page.content,
      meta_description: page.meta_description || '',
      category: page.category,
      order_index: page.order_index
    });
    setShowLegalEditor(true);
  };

  // ✅ AJOUT: Sauvegarder la modification d'une page légale
  const handleSaveLegalPage = async () => {
    if (!editingLegalPage) return;

    const loadingKey = 'save-legal-page';
    setLoading(loadingKey, true);
    
    try {
      await updateLegalPage(editingLegalPage.id, legalPageForm);
      
      setShowLegalEditor(false);
      setEditingLegalPage(null);
      
      toast({
        title: "✅ Succès",
        description: "Page légale mise à jour avec succès",
      });
    } catch (error) {
      console.error('Erreur sauvegarde page légale:', error);
      toast({
        title: "❌ Erreur",
        description: "Impossible de sauvegarder la page légale",
        variant: "destructive",
      });
    } finally {
      setLoading(loadingKey, false);
    }
  };

  // ✅ AJOUT: Activer/Désactiver une page légale
  const handleToggleLegalPage = async (pageId: string, currentStatus: boolean) => {
    const loadingKey = `toggle-legal-page-${pageId}`;
    setLoading(loadingKey, true);
    
    try {
      await updateLegalPage(pageId, { is_active: !currentStatus });
      
      // ✅ CORRECTION: Déclencher le rafraîchissement du footer en temps réel
      console.log('🔄 Toggle page légale - Déclenchement du rafraîchissement footer');
      
      // ✅ AMÉLIORATION: Déclencher plusieurs événements pour s'assurer de la synchronisation
      window.dispatchEvent(new CustomEvent('footer-refresh', {
        detail: { 
          type: 'legal_page_toggled', 
          pageId: pageId,
          newStatus: !currentStatus,
          timestamp: Date.now()
        }
      }));
      
      // ✅ AJOUT: Déclencher aussi un événement de données mises à jour
      window.dispatchEvent(new CustomEvent('footer-data-updated', {
        detail: { 
          type: 'legal_page_updated',
          pageId: pageId,
          newStatus: !currentStatus,
          timestamp: Date.now()
        }
      }));
      
      // ✅ AJOUT: Forcer le rechargement des données après un court délai
      setTimeout(() => {
        console.log('🔄 Forçage du rechargement des données footer...');
        window.dispatchEvent(new CustomEvent('footer-refresh', {
          detail: { 
            type: 'force_refresh', 
            timestamp: Date.now()
          }
        }));
      }, 500);
      
      toast({
        title: "✅ Succès",
        description: `Page légale ${!currentStatus ? 'activée' : 'désactivée'} avec succès`,
      });
    } catch (error) {
      console.error('Erreur toggle page légale:', error);
      toast({
        title: "❌ Erreur",
        description: "Impossible de modifier le statut de la page",
        variant: "destructive",
      });
    } finally {
      setLoading(loadingKey, false);
    }
  };

  // ✅ AJOUT: Supprimer une page légale
  const handleDeleteLegalPage = async (pageId: string, pageTitle: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la page "${pageTitle}" ?`)) {
      return;
    }

    const loadingKey = `delete-legal-page-${pageId}`;
    setLoading(loadingKey, true);
    
    try {
      await deleteLegalPage(pageId);
      
      toast({
        title: "✅ Succès",
        description: "Page légale supprimée avec succès",
      });
    } catch (error) {
      console.error('Erreur suppression page légale:', error);
      toast({
        title: "❌ Erreur",
        description: "Impossible de supprimer la page légale",
        variant: "destructive",
      });
    } finally {
      setLoading(loadingKey, false);
    }
  };

  // Initialiser les formulaires quand le contenu se charge
  useEffect(() => {
    if (content) {
      setContentForm({
        company_name: content.company_name || 'AMORA',
        company_description: content.company_description || '',
        contact_address: content.contact_address || '',
        contact_phone: content.contact_phone || '',
        contact_email: content.contact_email || '',
        contact_hours: content.contact_hours || '',
        company_stats: content.company_stats || []
      });
    }
  }, [content]);

  // ✅ AJOUT: Charger les pages légales au montage
  useEffect(() => {
    loadLegalPages();
  }, [loadLegalPages]);

  // Fonction utilitaire pour gérer les états de chargement
  const setLoading = (key: string, value: boolean) => {
    setLoadingStates(prev => ({ ...prev, [key]: value }));
  };

  // Sauvegarder le contenu
  const handleSaveContent = async () => {
    const loadingKey = 'save-content';
    setLoading(loadingKey, true);
    
    try {
      await updateContent({
        company_name: contentForm.company_name,
        company_description: contentForm.company_description,
        company_stats: contentForm.company_stats,
        contact_address: contentForm.contact_address,
        contact_phone: contentForm.contact_phone,
        contact_email: contentForm.contact_email,
        contact_hours: contentForm.contact_hours,
        is_active: true
      });
      
      setEditingContent(false);
      toast({
        title: "✅ Succès",
        description: "Contenu du footer mis à jour avec succès",
      });
    } catch (error) {
      console.error('Erreur sauvegarde contenu:', error);
      toast({
        title: "❌ Erreur",
        description: "Impossible de sauvegarder le contenu",
        variant: "destructive",
      });
    } finally {
      setLoading(loadingKey, false);
    }
  };

  // Ajouter un lien
  const handleAddLink = async () => {
    const loadingKey = 'add-link';
    setLoading(loadingKey, true);
    
    try {
      await addLink({
        ...linkForm,
        is_active: true
      });
      
      setLinkForm({
        category: 'quick_links',
        name: '',
        href: '',
        order_index: 0
      });
      setShowAddLink(false);
      
      toast({
        title: "✅ Succès",
        description: "Lien ajouté avec succès",
      });
    } catch (error) {
      console.error('Erreur ajout lien:', error);
      toast({
        title: "❌ Erreur",
        description: "Impossible d'ajouter le lien",
        variant: "destructive",
      });
    } finally {
      setLoading(loadingKey, false);
    }
  };

  // Modifier un lien
  const handleEditLink = (link: any) => {
    setEditingLinkId(link.id);
    setEditLinkForm({
      category: link.category,
      name: link.name,
      href: link.href,
      order_index: link.order_index
    });
  };

  // Sauvegarder la modification d'un lien
  const handleSaveEditLink = async (linkId: string) => {
    const loadingKey = `edit-link-${linkId}`;
    setLoading(loadingKey, true);
    
    try {
      await updateLink(linkId, editLinkForm);
      setEditingLinkId(null);
      
      toast({
        title: "✅ Succès",
        description: "Lien modifié avec succès",
      });
    } catch (error) {
      console.error('Erreur modification lien:', error);
      toast({
        title: "❌ Erreur",
        description: "Impossible de modifier le lien",
        variant: "destructive",
      });
    } finally {
      setLoading(loadingKey, false);
    }
  };

  // Activer/Désactiver un lien
  const handleToggleLink = async (linkId: string, currentStatus: boolean) => {
    const loadingKey = `toggle-link-${linkId}`;
    setLoading(loadingKey, true);
    
    try {
      await updateLink(linkId, { is_active: !currentStatus });
      
      toast({
        title: "✅ Succès",
        description: `Lien ${!currentStatus ? 'activé' : 'désactivé'} avec succès`,
      });
    } catch (error) {
      console.error('Erreur toggle lien:', error);
      toast({
        title: "❌ Erreur",
        description: "Impossible de modifier le statut du lien",
        variant: "destructive",
      });
    } finally {
      setLoading(loadingKey, false);
    }
  };

  // Supprimer un lien avec confirmation
  const handleDeleteLink = async (linkId: string, linkName: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le lien "${linkName}" ?`)) {
      return;
    }

    const loadingKey = `delete-link-${linkId}`;
    setLoading(loadingKey, true);
    
    try {
      await deleteLink(linkId);
      
      toast({
        title: "✅ Succès",
        description: "Lien supprimé avec succès",
      });
    } catch (error) {
      console.error('Erreur suppression lien:', error);
      toast({
        title: "❌ Erreur",
        description: "Impossible de supprimer le lien",
        variant: "destructive",
      });
    } finally {
      setLoading(loadingKey, false);
    }
  };

  // Ajouter un réseau social
  const handleAddSocial = async () => {
    const loadingKey = 'add-social';
    setLoading(loadingKey, true);
    
    try {
      await addSocial({
        ...socialForm,
        is_active: true
      });
      
      setSocialForm({
        name: '',
        icon_name: 'facebook',
        href: '',
        color_class: 'hover:text-blue-500',
        order_index: 0
      });
      setShowAddSocial(false);
      
      toast({
        title: "✅ Succès",
        description: "Réseau social ajouté avec succès",
      });
    } catch (error) {
      console.error('Erreur ajout réseau social:', error);
      toast({
        title: "❌ Erreur",
        description: "Impossible d'ajouter le réseau social",
        variant: "destructive",
      });
    } finally {
      setLoading(loadingKey, false);
    }
  };

  // Modifier un réseau social
  const handleEditSocial = (social: any) => {
    setEditingSocialId(social.id);
    setEditSocialForm({
      name: social.name,
      icon_name: social.icon_name,
      href: social.href,
      color_class: social.color_class,
      order_index: social.order_index
    });
  };

  // Sauvegarder la modification d'un réseau social
  const handleSaveEditSocial = async (socialId: string) => {
    const loadingKey = `edit-social-${socialId}`;
    setLoading(loadingKey, true);
    
    try {
      await updateSocial(socialId, editSocialForm);
      setEditingSocialId(null);
      
      toast({
        title: "✅ Succès",
        description: "Réseau social modifié avec succès",
      });
    } catch (error) {
      console.error('Erreur modification réseau social:', error);
      toast({
        title: "❌ Erreur",
        description: "Impossible de modifier le réseau social",
        variant: "destructive",
      });
    } finally {
      setLoading(loadingKey, false);
    }
  };

  // Activer/Désactiver un réseau social
  const handleToggleSocial = async (socialId: string, currentStatus: boolean) => {
    const loadingKey = `toggle-social-${socialId}`;
    setLoading(loadingKey, true);
    
    try {
      await updateSocial(socialId, { is_active: !currentStatus });
      
      toast({
        title: "✅ Succès",
        description: `Réseau social ${!currentStatus ? 'activé' : 'désactivé'} avec succès`,
      });
    } catch (error) {
      console.error('Erreur toggle réseau social:', error);
      toast({
        title: "❌ Erreur",
        description: "Impossible de modifier le statut du réseau social",
        variant: "destructive",
      });
    } finally {
      setLoading(loadingKey, false);
    }
  };

  // Supprimer un réseau social avec confirmation
  const handleDeleteSocial = async (socialId: string, socialName: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le réseau social "${socialName}" ?`)) {
      return;
    }

    const loadingKey = `delete-social-${socialId}`;
    setLoading(loadingKey, true);
    
    try {
      await deleteSocial(socialId);
      
      toast({
        title: "✅ Succès",
        description: "Réseau social supprimé avec succès",
      });
    } catch (error) {
      console.error('Erreur suppression réseau social:', error);
      toast({
        title: "❌ Erreur",
        description: "Impossible de supprimer le réseau social",
        variant: "destructive",
      });
    } finally {
      setLoading(loadingKey, false);
    }
  };

  const tabs = [
    { id: 'content', label: 'Contenu', icon: Edit3 },
    { id: 'links', label: 'Liens', icon: Link },
    { id: 'socials', label: 'Réseaux sociaux', icon: Globe },
    { id: 'legal', label: 'Pages légales', icon: FileText }
  ];

  // ✅ AJOUT: Filtrer les pages légales
  const filteredLegalPages = legalPagesState.filter(page => {
    const matchesSearch = page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         page.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || page.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Chargement de la gestion du footer...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <HeaderAdmin 
        title="Gestion du Footer"
        showBackButton={true}
        backTo="/admin"
        backLabel="Admin principal"
      />

      <main className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Tabs */}
          <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                    activeTab === tab.id
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Contenu principal */}
          {activeTab === 'content' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Contenu principal</span>
                  <Button
                    onClick={() => setEditingContent(!editingContent)}
                    variant={editingContent ? "outline" : "default"}
                    disabled={loadingStates['save-content']}
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    {editingContent ? 'Annuler' : 'Modifier'}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {editingContent ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="company_name">Nom de l'entreprise</Label>
                        <Input
                          id="company_name"
                          value={contentForm.company_name}
                          onChange={(e) => setContentForm(prev => ({ ...prev, company_name: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="contact_email">Email de contact</Label>
                        <Input
                          id="contact_email"
                          type="email"
                          value={contentForm.contact_email}
                          onChange={(e) => setContentForm(prev => ({ ...prev, contact_email: e.target.value }))}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="company_description">Description de l'entreprise</Label>
                      <Textarea
                        id="company_description"
                        rows={3}
                        value={contentForm.company_description}
                        onChange={(e) => setContentForm(prev => ({ ...prev, company_description: e.target.value }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="contact_hours">Heures d'ouverture</Label>
                      <Input
                        id="contact_hours"
                        value={contentForm.contact_hours}
                        onChange={(e) => setContentForm(prev => ({ ...prev, contact_hours: e.target.value }))}
                      />
                    </div>

                    <Button 
                      onClick={handleSaveContent} 
                      className="w-full"
                      disabled={loadingStates['save-content']}
                    >
                      {loadingStates['save-content'] ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      {loadingStates['save-content'] ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
                    </Button>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div><strong>Nom:</strong> {content?.company_name}</div>
                    <div><strong>Description:</strong> {content?.company_description}</div>
                    <div><strong>Email:</strong> {content?.contact_email}</div>
                    <div><strong>Heures:</strong> {content?.contact_hours}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Gestion des liens */}
          {activeTab === 'links' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Liens du footer ({links.length})</span>
                    <Button 
                      onClick={() => setShowAddLink(true)}
                      disabled={loadingStates['add-link']}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter un lien
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {showAddLink && (
                    <Card className="mb-6 border-2 border-blue-200">
                      <CardHeader>
                        <CardTitle>Nouveau lien</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Catégorie</Label>
                            <Select value={linkForm.category} onValueChange={(value: any) => setLinkForm(prev => ({ ...prev, category: value }))}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="quick_links">Liens rapides</SelectItem>
                                <SelectItem value="support">Support</SelectItem>
                                <SelectItem value="legal">Légal</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="link_name">Nom du lien</Label>
                            <Input
                              id="link_name"
                              value={linkForm.name}
                              onChange={(e) => setLinkForm(prev => ({ ...prev, name: e.target.value }))}
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="link_href">URL</Label>
                          <Input
                            id="link_href"
                            value={linkForm.href}
                            onChange={(e) => setLinkForm(prev => ({ ...prev, href: e.target.value }))}
                            placeholder="/page-exemple"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            onClick={handleAddLink}
                            disabled={loadingStates['add-link'] || !linkForm.name || !linkForm.href}
                          >
                            {loadingStates['add-link'] ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Plus className="w-4 h-4 mr-2" />
                            )}
                            {loadingStates['add-link'] ? 'Ajout...' : 'Ajouter'}
                          </Button>
                          <Button variant="outline" onClick={() => setShowAddLink(false)}>
                            Annuler
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {['quick_links', 'support', 'legal'].map((category) => (
                      <div key={category}>
                        <h3 className="font-semibold mb-4 capitalize">
                          {category === 'quick_links' ? 'Liens rapides' :
                           category === 'support' ? 'Support' : 'Légal'}
                        </h3>
                        <div className="space-y-2">
                          {links.filter(link => link.category === category).map((link) => (
                            <div key={link.id} className={`p-3 border rounded-lg ${link.is_active ? 'bg-white' : 'bg-gray-50'}`}>
                              {editingLinkId === link.id ? (
                                // Mode édition
                                <div className="space-y-3">
                                  <Input
                                    value={editLinkForm.name}
                                    onChange={(e) => setEditLinkForm(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Nom du lien"
                                  />
                                  <Input
                                    value={editLinkForm.href}
                                    onChange={(e) => setEditLinkForm(prev => ({ ...prev, href: e.target.value }))}
                                    placeholder="URL"
                                  />
                                  <div className="flex gap-1">
                                    <Button 
                                      size="sm" 
                                      onClick={() => handleSaveEditLink(link.id)}
                                      disabled={loadingStates[`edit-link-${link.id}`]}
                                    >
                                      {loadingStates[`edit-link-${link.id}`] ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                      ) : (
                                        <Check className="w-3 h-3" />
                                      )}
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => setEditingLinkId(null)}
                                    >
                                      <X className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                // Mode affichage
                                <>
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <div className="font-medium">{link.name}</div>
                                      {!link.is_active && (
                                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                                          Inactif
                                        </span>
                                      )}
                                    </div>
                                    <Switch
                                      checked={link.is_active}
                                      onCheckedChange={() => handleToggleLink(link.id, link.is_active)}
                                      disabled={loadingStates[`toggle-link-${link.id}`]}
                                    />
                                  </div>
                                  <div className="text-xs text-gray-600 mb-3">{link.href}</div>
                                  <div className="flex gap-1">
                                    <Button 
                                      size="sm" 
                                      variant="ghost"
                                      onClick={() => window.open(link.href, '_blank')}
                                      title="Voir le lien"
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="ghost"
                                      onClick={() => handleEditLink(link)}
                                      title="Modifier"
                                    >
                                      <Edit3 className="w-3 h-3" />
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="ghost"
                                      onClick={() => handleDeleteLink(link.id, link.name)}
                                      className="text-red-600 hover:text-red-700"
                                      disabled={loadingStates[`delete-link-${link.id}`]}
                                      title="Supprimer"
                                    >
                                      {loadingStates[`delete-link-${link.id}`] ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                      ) : (
                                        <Trash2 className="w-3 h-3" />
                                      )}
                                    </Button>
                                  </div>
                                </>
                              )}
                            </div>
                          ))}
                          {links.filter(link => link.category === category).length === 0 && (
                            <div className="text-center text-gray-500 py-4">
                              Aucun lien dans cette catégorie
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Gestion des réseaux sociaux */}
          {activeTab === 'socials' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Réseaux sociaux ({socials.length})</span>
                  <Button 
                    onClick={() => setShowAddSocial(true)}
                    disabled={loadingStates['add-social']}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter un réseau
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {showAddSocial && (
                  <Card className="mb-6 border-2 border-blue-200">
                    <CardHeader>
                      <CardTitle>Nouveau réseau social</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="social_name">Nom</Label>
                          <Input
                            id="social_name"
                            value={socialForm.name}
                            onChange={(e) => setSocialForm(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Facebook"
                          />
                        </div>
                        <div>
                          <Label>Icône</Label>
                          <Select value={socialForm.icon_name} onValueChange={(value) => setSocialForm(prev => ({ ...prev, icon_name: value }))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="facebook">Facebook</SelectItem>
                              <SelectItem value="instagram">Instagram</SelectItem>
                              <SelectItem value="twitter">Twitter</SelectItem>
                              <SelectItem value="linkedin">LinkedIn</SelectItem>
                              <SelectItem value="youtube">YouTube</SelectItem>
                              <SelectItem value="tiktok">TikTok</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="social_href">URL</Label>
                        <Input
                          id="social_href"
                          value={socialForm.href}
                          onChange={(e) => setSocialForm(prev => ({ ...prev, href: e.target.value }))}
                          placeholder="https://facebook.com/votre-page"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={handleAddSocial}
                          disabled={loadingStates['add-social'] || !socialForm.name || !socialForm.href}
                        >
                          {loadingStates['add-social'] ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Plus className="w-4 h-4 mr-2" />
                          )}
                          {loadingStates['add-social'] ? 'Ajout...' : 'Ajouter'}
                        </Button>
                        <Button variant="outline" onClick={() => setShowAddSocial(false)}>
                          Annuler
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {socials.map((social) => (
                    <Card key={social.id} className={social.is_active ? 'bg-white' : 'bg-gray-50'}>
                      <CardContent className="p-4">
                        {editingSocialId === social.id ? (
                          // Mode édition
                          <div className="space-y-3">
                            <Input
                              value={editSocialForm.name}
                              onChange={(e) => setEditSocialForm(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="Nom du réseau"
                            />
                            <Input
                              value={editSocialForm.href}
                              onChange={(e) => setEditSocialForm(prev => ({ ...prev, href: e.target.value }))}
                              placeholder="URL"
                            />
                            <Select 
                              value={editSocialForm.icon_name} 
                              onValueChange={(value) => setEditSocialForm(prev => ({ ...prev, icon_name: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="facebook">Facebook</SelectItem>
                                <SelectItem value="instagram">Instagram</SelectItem>
                                <SelectItem value="twitter">Twitter</SelectItem>
                                <SelectItem value="linkedin">LinkedIn</SelectItem>
                                <SelectItem value="youtube">YouTube</SelectItem>
                                <SelectItem value="tiktok">TikTok</SelectItem>
                              </SelectContent>
                            </Select>
                            <div className="flex gap-1">
                              <Button 
                                size="sm" 
                                onClick={() => handleSaveEditSocial(social.id)}
                                disabled={loadingStates[`edit-social-${social.id}`]}
                              >
                                {loadingStates[`edit-social-${social.id}`] ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Check className="w-3 h-3" />
                                )}
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setEditingSocialId(null)}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          // Mode affichage
                          <>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="font-medium">{social.name}</div>
                                {!social.is_active && (
                                  <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                                    Inactif
                                  </span>
                                )}
                              </div>
                              <Switch
                                checked={social.is_active}
                                onCheckedChange={() => handleToggleSocial(social.id, social.is_active)}
                                disabled={loadingStates[`toggle-social-${social.id}`]}
                              />
                            </div>
                            <div className="text-xs text-gray-600 mb-3 break-all">{social.href}</div>
                            <div className="flex gap-1">
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => window.open(social.href, '_blank')}
                                title="Voir le profil"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => handleEditSocial(social)}
                                title="Modifier"
                              >
                                <Edit3 className="w-3 h-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => handleDeleteSocial(social.id, social.name)}
                                className="text-red-600 hover:text-red-700"
                                disabled={loadingStates[`delete-social-${social.id}`]}
                                title="Supprimer"
                              >
                                {loadingStates[`delete-social-${social.id}`] ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Trash2 className="w-3 h-3" />
                                )}
                              </Button>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                  {socials.length === 0 && (
                    <div className="col-span-full text-center text-gray-500 py-8">
                      Aucun réseau social configuré
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* ✅ NOUVEAU: Gestion des pages légales */}
          {activeTab === 'legal' && (
            <div className="space-y-6">
              {/* En-tête avec recherche et filtres */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Pages légales ({legalPagesState.length})</span>
                    <Button 
                      onClick={() => {
                        setEditingLegalPage(null);
                        setLegalPageForm({
                          slug: '',
                          title: '',
                          content: '',
                          meta_description: '',
                          category: 'legal',
                          order_index: 0
                        });
                        setShowLegalEditor(true);
                      }}
                      disabled={loadingStates['create-legal-page']}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Créer une page
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 mb-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Rechercher une page..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes les catégories</SelectItem>
                        <SelectItem value="legal">Légal</SelectItem>
                        <SelectItem value="privacy">Confidentialité</SelectItem>
                        <SelectItem value="terms">Conditions</SelectItem>
                        <SelectItem value="cookies">Cookies</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Liste des pages légales */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredLegalPages.map((page) => (
                  <Card key={page.id} className={page.is_active ? 'bg-white' : 'bg-gray-50'}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="font-medium">{page.title}</div>
                          {!page.is_active && (
                            <Badge variant="secondary">Inactif</Badge>
                          )}
                        </div>
                        <Switch
                          checked={page.is_active}
                          onCheckedChange={() => handleToggleLegalPage(page.id, page.is_active)}
                          disabled={loadingStates[`toggle-legal-page-${page.id}`]}
                        />
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-2">
                        <strong>Slug:</strong> {page.slug}
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-3">
                        <strong>Catégorie:</strong> {page.category}
                      </div>
                      
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => window.open(`/${page.slug}`, '_blank')}
                          title="Voir la page"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleEditLegalPage(page)}
                          title="Modifier"
                        >
                          <Edit3 className="w-3 h-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleDeleteLegalPage(page.id, page.title)}
                          className="text-red-600 hover:text-red-700"
                          disabled={loadingStates[`delete-legal-page-${page.id}`]}
                          title="Supprimer"
                        >
                          {loadingStates[`delete-legal-page-${page.id}`] ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Trash2 className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {filteredLegalPages.length === 0 && (
                  <div className="col-span-full text-center text-gray-500 py-8">
                    {searchTerm || filterCategory !== 'all' 
                      ? 'Aucune page ne correspond aux critères' 
                      : 'Aucune page légale configurée'
                    }
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ✅ AJOUT: Modal d'édition des pages légales */}
          <Dialog open={showLegalEditor} onOpenChange={setShowLegalEditor}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingLegalPage ? 'Modifier la page légale' : 'Créer une nouvelle page légale'}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="legal_slug">Slug (URL)</Label>
                    <Input
                      id="legal_slug"
                      value={legalPageForm.slug}
                      onChange={(e) => setLegalPageForm(prev => ({ ...prev, slug: e.target.value }))}
                      placeholder="terms-of-service"
                    />
                  </div>
                  <div>
                    <Label htmlFor="legal_title">Titre</Label>
                    <Input
                      id="legal_title"
                      value={legalPageForm.title}
                      onChange={(e) => setLegalPageForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Conditions d'utilisation"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="legal_category">Catégorie</Label>
                  <Select 
                    value={legalPageForm.category} 
                    onValueChange={(value) => setLegalPageForm(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="legal">Légal</SelectItem>
                      <SelectItem value="privacy">Confidentialité</SelectItem>
                      <SelectItem value="terms">Conditions</SelectItem>
                      <SelectItem value="cookies">Cookies</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="legal_meta">Description meta</Label>
                  <Input
                    id="legal_meta"
                    value={legalPageForm.meta_description}
                    onChange={(e) => setLegalPageForm(prev => ({ ...prev, meta_description: e.target.value }))}
                    placeholder="Description pour les moteurs de recherche"
                  />
                </div>
                
                <div>
                  <Label htmlFor="legal_content">Contenu</Label>
                  <Textarea
                    id="legal_content"
                    value={legalPageForm.content}
                    onChange={(e) => setLegalPageForm(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Contenu de la page légale..."
                    rows={10}
                    className="resize-none"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={editingLegalPage ? handleSaveLegalPage : handleCreateLegalPage}
                    disabled={loadingStates['create-legal-page'] || loadingStates['save-legal-page']}
                  >
                    {loadingStates['create-legal-page'] || loadingStates['save-legal-page'] ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    {editingLegalPage ? 'Sauvegarder' : 'Créer la page'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowLegalEditor(false)}>
                    Annuler
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
};

export default AdminFooter;
