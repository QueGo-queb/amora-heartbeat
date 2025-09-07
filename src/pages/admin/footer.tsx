/**
 * Page de gestion du footer
 */

import { useState } from 'react';
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
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import HeaderAdmin from '@/components/admin/HeaderAdmin';
import { useFooter } from '@/hooks/useFooter';
import { useToast } from '@/hooks/use-toast';

const AdminFooter = () => {
  const navigate = useNavigate();
  const { content, links, socials, updateContent, addLink, updateLink, deleteLink, addSocial, updateSocial, deleteSocial } = useFooter();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState<'content' | 'links' | 'socials'>('content');
  const [editingContent, setEditingContent] = useState(false);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [editingSocialId, setEditingSocialId] = useState<string | null>(null);
  const [showAddLink, setShowAddLink] = useState(false);
  const [showAddSocial, setShowAddSocial] = useState(false);

  // Formulaires
  const [contentForm, setContentForm] = useState({
    company_name: content?.company_name || 'AMORA',
    company_description: content?.company_description || '',
    contact_address: content?.contact_address || '',
    contact_phone: content?.contact_phone || '',
    contact_email: content?.contact_email || '',
    contact_hours: content?.contact_hours || '',
    company_stats: content?.company_stats || []
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

  // Sauvegarder le contenu
  const handleSaveContent = async () => {
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
    } catch (error) {
      console.error('Erreur sauvegarde contenu:', error);
    }
  };

  // Ajouter un lien
  const handleAddLink = async () => {
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
    } catch (error) {
      console.error('Erreur ajout lien:', error);
    }
  };

  // Ajouter un réseau social
  const handleAddSocial = async () => {
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
    } catch (error) {
      console.error('Erreur ajout réseau social:', error);
    }
  };

  const tabs = [
    { id: 'content', label: 'Contenu', icon: Edit3 },
    { id: 'links', label: 'Liens', icon: Link },
    { id: 'socials', label: 'Réseaux sociaux', icon: Globe }
  ];

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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="contact_address">Adresse</Label>
                        <Input
                          id="contact_address"
                          value={contentForm.contact_address}
                          onChange={(e) => setContentForm(prev => ({ ...prev, contact_address: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="contact_phone">Téléphone</Label>
                        <Input
                          id="contact_phone"
                          value={contentForm.contact_phone}
                          onChange={(e) => setContentForm(prev => ({ ...prev, contact_phone: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="contact_hours">Heures d'ouverture</Label>
                      <Input
                        id="contact_hours"
                        value={contentForm.contact_hours}
                        onChange={(e) => setContentForm(prev => ({ ...prev, contact_hours: e.target.value }))}
                      />
                    </div>

                    <Button onClick={handleSaveContent} className="w-full">
                      <Save className="w-4 h-4 mr-2" />
                      Sauvegarder les modifications
                    </Button>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div><strong>Nom:</strong> {content?.company_name}</div>
                    <div><strong>Description:</strong> {content?.company_description}</div>
                    <div><strong>Email:</strong> {content?.contact_email}</div>
                    <div><strong>Téléphone:</strong> {content?.contact_phone}</div>
                    <div><strong>Adresse:</strong> {content?.contact_address}</div>
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
                    <span>Liens du footer</span>
                    <Button onClick={() => setShowAddLink(true)}>
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
                          <Button onClick={handleAddLink}>Ajouter</Button>
                          <Button variant="outline" onClick={() => setShowAddLink(false)}>Annuler</Button>
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
                            <div key={link.id} className="flex items-center justify-between p-2 border rounded">
                              <div>
                                <div className="font-medium">{link.name}</div>
                                <div className="text-xs text-gray-600">{link.href}</div>
                              </div>
                              <div className="flex gap-1">
                                <Button size="sm" variant="ghost">
                                  <ExternalLink className="w-3 h-3" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => deleteLink(link.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
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
                  <span>Réseaux sociaux</span>
                  <Button onClick={() => setShowAddSocial(true)}>
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
                        <Button onClick={handleAddSocial}>Ajouter</Button>
                        <Button variant="outline" onClick={() => setShowAddSocial(false)}>Annuler</Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {socials.map((social) => (
                    <Card key={social.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{social.name}</div>
                            <div className="text-xs text-gray-600">{social.href}</div>
                          </div>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => deleteSocial(social.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminFooter;
