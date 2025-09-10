import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  FileText,
  Search,
  Filter,
  Save,
  X,
  RefreshCw
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

const AdminLegalPages = () => {
  const [pages, setPages] = useState<LegalPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showEditor, setShowEditor] = useState(false);
  const [editingPage, setEditingPage] = useState<LegalPage | null>(null);
  const [formData, setFormData] = useState({
    slug: '',
    title: '',
    content: '',
    meta_description: '',
    category: 'legal',
    is_active: true,
    order_index: 0
  });

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAccess();
    loadPages();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.email !== 'clodenerc@yahoo.fr') {
      navigate('/');
      return;
    }
  };

  const loadPages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('legal_pages')
        .select('*')
        .order('category', { ascending: true })
        .order('order_index', { ascending: true });

      if (error) throw error;
      setPages(data || []);
    } catch (error: any) {
      console.error('Error loading pages:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les pages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const savePage = async () => {
    try {
      const pageData = {
        ...formData,
        slug: formData.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      };

      let result;
      if (editingPage) {
        result = await supabase
          .from('legal_pages')
          .update(pageData)
          .eq('id', editingPage.id);
      } else {
        result = await supabase
          .from('legal_pages')
          .insert([pageData]);
      }

      if (result.error) throw result.error;

      toast({
        title: "✅ Succès",
        description: editingPage ? "Page mise à jour" : "Page créée",
      });

      setShowEditor(false);
      setEditingPage(null);
      resetForm();
      loadPages();
    } catch (error: any) {
      console.error('Error saving page:', error);
      toast({
        title: "❌ Erreur",
        description: "Impossible de sauvegarder la page",
        variant: "destructive",
      });
    }
  };

  const deletePage = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette page ?')) return;

    try {
      const { error } = await supabase
        .from('legal_pages')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "✅ Page supprimée",
        description: "La page a été supprimée avec succès",
      });

      loadPages();
    } catch (error: any) {
      console.error('Error deleting page:', error);
      toast({
        title: "❌ Erreur",
        description: "Impossible de supprimer la page",
        variant: "destructive",
      });
    }
  };

  const togglePageStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('legal_pages')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "✅ Statut mis à jour",
        description: `Page ${!currentStatus ? 'activée' : 'désactivée'}`,
      });

      loadPages();
    } catch (error: any) {
      console.error('Error updating page status:', error);
      toast({
        title: "❌ Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      slug: '',
      title: '',
      content: '',
      meta_description: '',
      category: 'legal',
      is_active: true,
      order_index: 0
    });
  };

  const openEditor = (page?: LegalPage) => {
    if (page) {
      setEditingPage(page);
      setFormData({
        slug: page.slug,
        title: page.title,
        content: page.content,
        meta_description: page.meta_description || '',
        category: page.category,
        is_active: page.is_active,
        order_index: page.order_index
      });
    } else {
      setEditingPage(null);
      resetForm();
    }
    setShowEditor(true);
  };

  const filteredPages = pages.filter(page => {
    const matchesSearch = page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         page.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || page.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'legal':
        return <Badge className="bg-[#E63946] text-white">Légal</Badge>;
      case 'support':
        return <Badge className="bg-[#52B788] text-white">Support</Badge>;
      case 'company':
        return <Badge className="bg-[#CED4DA] text-[#212529]">Entreprise</Badge>;
      default:
        return <Badge>Autre</Badge>;
    }
  };

  const syncWithFooter = async () => {
    try {
      console.log('🔄 Synchronisation avec le footer...');
      
      // Forcer le rechargement du footer
      window.dispatchEvent(new CustomEvent('footer-refresh'));
      
      toast({
        title: "✅ Synchronisation réussie",
        description: "Les liens du footer ont été mis à jour",
      });
    } catch (error) {
      console.error('Error syncing with footer:', error);
      toast({
        title: "❌ Erreur de synchronisation",
        description: "Impossible de synchroniser avec le footer",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/admin')}
            className="mb-4 text-[#212529] hover:bg-[#CED4DA]/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour au dashboard
          </Button>

          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-[#212529]">Pages légales</h1>
              <p className="text-[#CED4DA] mt-2">
                Gérez le contenu de toutes vos pages légales et d'aide
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={syncWithFooter}
                variant="outline"
                className="border-[#52B788] text-[#52B788] hover:bg-[#52B788] hover:text-white"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Sync Footer
              </Button>
              
              <Button 
                onClick={() => openEditor()}
                className="bg-[#E63946] hover:bg-[#E63946]/90 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Créer une page
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#CED4DA] w-4 h-4" />
                  <Input
                    placeholder="Rechercher une page..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-[#CED4DA] focus:border-[#E63946]"
                  />
                </div>
              </div>
              
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-48 border-[#CED4DA]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  <SelectItem value="legal">Légal</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                  <SelectItem value="company">Entreprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Pages List */}
        <div className="grid gap-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-[#E63946] border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-4 text-[#CED4DA]">Chargement...</p>
            </div>
          ) : filteredPages.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="w-16 h-16 text-[#CED4DA] mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-[#212529] mb-2">
                  Aucune page trouvée
                </h3>
                <p className="text-[#CED4DA]">
                  {searchTerm || filterCategory !== 'all' 
                    ? 'Aucune page ne correspond à vos critères'
                    : 'Créez votre première page légale'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredPages.map((page) => (
              <Card key={page.id} className="border-[#CED4DA]/30">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-[#212529]">
                          {page.title}
                        </h3>
                        {getCategoryBadge(page.category)}
                        {page.is_active ? (
                          <Eye className="w-4 h-4 text-[#52B788]" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-[#CED4DA]" />
                        )}
                      </div>
                      
                      <p className="text-sm text-[#CED4DA] mb-1">
                        <strong>Slug:</strong> /{page.slug}
                      </p>
                      
                      {page.meta_description && (
                        <p className="text-sm text-[#212529] line-clamp-2">
                          {page.meta_description}
                        </p>
                      )}
                      
                      <p className="text-xs text-[#CED4DA] mt-2">
                        Mis à jour le {new Date(page.updated_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`/${page.slug}`, '_blank')}
                        className="text-[#52B788] hover:bg-[#52B788]/10"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditor(page)}
                        className="text-[#E63946] hover:bg-[#E63946]/10"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      
                      <Switch
                        checked={page.is_active}
                        onCheckedChange={() => togglePageStatus(page.id, page.is_active)}
                        className="data-[state=checked]:bg-[#52B788]"
                      />
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deletePage(page.id)}
                        className="text-[#E63946] hover:bg-[#E63946]/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Editor Modal */}
        <Dialog open={showEditor} onOpenChange={setShowEditor}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#F8F9FA]">
            <DialogHeader>
              <DialogTitle className="text-[#212529]">
                {editingPage ? 'Modifier la page' : 'Créer une nouvelle page'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title" className="text-[#212529]">Titre *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="border-[#CED4DA] focus:border-[#E63946]"
                    placeholder="Titre de la page"
                  />
                </div>
                
                <div>
                  <Label htmlFor="slug" className="text-[#212529]">Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    className="border-[#CED4DA] focus:border-[#E63946]"
                    placeholder="url-de-la-page"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category" className="text-[#212529]">Catégorie *</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger className="border-[#CED4DA]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="legal">Légal</SelectItem>
                      <SelectItem value="support">Support</SelectItem>
                      <SelectItem value="company">Entreprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="order_index" className="text-[#212529]">Ordre d'affichage</Label>
                  <Input
                    id="order_index"
                    type="number"
                    value={formData.order_index}
                    onChange={(e) => setFormData(prev => ({ ...prev, order_index: parseInt(e.target.value) || 0 }))}
                    className="border-[#CED4DA] focus:border-[#E63946]"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="meta_description" className="text-[#212529]">Description SEO</Label>
                <Textarea
                  id="meta_description"
                  value={formData.meta_description}
                  onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                  className="border-[#CED4DA] focus:border-[#E63946]"
                  placeholder="Description pour les moteurs de recherche"
                  rows={2}
                />
              </div>
              
              <div>
                <Label htmlFor="content" className="text-[#212529]">Contenu (Markdown) *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  className="border-[#CED4DA] focus:border-[#E63946] font-mono"
                  placeholder="# Titre principal

## Sous-titre

Votre contenu en Markdown..."
                  rows={15}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  className="data-[state=checked]:bg-[#52B788]"
                />
                <Label htmlFor="is_active" className="text-[#212529]">
                  Page active (visible publiquement)
                </Label>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-[#CED4DA]">
                <Button
                  variant="outline"
                  onClick={() => setShowEditor(false)}
                  className="border-[#CED4DA] text-[#212529] hover:bg-[#CED4DA]/20"
                >
                  <X className="w-4 h-4 mr-2" />
                  Annuler
                </Button>
                
                <Button
                  onClick={savePage}
                  disabled={!formData.title || !formData.slug || !formData.content}
                  className="bg-[#E63946] hover:bg-[#E63946]/90 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingPage ? 'Mettre à jour' : 'Créer'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminLegalPages;