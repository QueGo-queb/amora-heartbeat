/**
 * Page de gestion des utilisateurs - AVEC BOUTON CRÉER ADMIN
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  MoreHorizontal,
  User,
  Mail,
  Calendar,
  Shield,
  Ban,
  CheckCircle,
  Eye,
  Edit,
  Trash2,
  Download,
  Crown,
  RefreshCw,
  UserPlus,
  X,
  Check,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import HeaderAdmin from '@/components/admin/HeaderAdmin';

interface User {
  id: string;
  email: string;
  full_name?: string;
  created_at: string;
  last_login?: string;
  plan?: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  interests?: string[];
  role?: string; // Ajout du champ role
}

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [showCreateAdminDialog, setShowCreateAdminDialog] = useState(false);
  const [createAdminLoading, setCreateAdminLoading] = useState(false);
  const [newAdminForm, setNewAdminForm] = useState({
    email: '',
    full_name: '',
    password: ''
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAccess();
    loadUsers();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.email !== 'clodenerc@yahoo.fr') {
      navigate('/');
      return;
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur Supabase:', error);
        throw error;
      }

      setUsers(data || []);
      
      toast({
        title: "Succès",
        description: `${data?.length || 0} utilisateur(s) chargé(s)`,
      });
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les utilisateurs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Créer un nouvel administrateur
  const handleCreateAdmin = async () => {
    if (!newAdminForm.email || !newAdminForm.password) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    setCreateAdminLoading(true);
    
    try {
      // 1. Créer l'utilisateur dans Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: newAdminForm.email,
        password: newAdminForm.password,
        email_confirm: true,
        user_metadata: {
          full_name: newAdminForm.full_name || newAdminForm.email,
          role: 'admin'
        }
      });

      if (authError) {
        console.error('Erreur création auth:', authError);
        throw authError;
      }

      // 2. Créer le profil avec le rôle admin
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          user_id: authData.user.id,
          email: newAdminForm.email,
          full_name: newAdminForm.full_name || newAdminForm.email,
          role: 'admin',
          plan: 'admin',
          created_at: new Date().toISOString()
        });

      if (profileError) {
        console.error('Erreur création profil:', profileError);
        // Si le profil échoue, essayer de mettre à jour le profil existant
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            role: 'admin',
            plan: 'admin',
            full_name: newAdminForm.full_name || newAdminForm.email
          })
          .eq('id', authData.user.id);

        if (updateError) {
          console.error('Erreur mise à jour profil:', updateError);
        }
      }

      // 3. Attribuer les permissions RBAC si le système existe
      try {
        await supabase
          .from('user_roles')
          .insert({
            user_id: authData.user.id,
            role_id: 'admin'
          });
      } catch (rbacError) {
        console.log('RBAC non disponible, utilisation du système simple');
      }

      toast({
        title: "✅ Administrateur créé",
        description: `Nouvel admin créé: ${newAdminForm.email}`,
      });

      // Reset du formulaire
      setNewAdminForm({ email: '', full_name: '', password: '' });
      setShowCreateAdminDialog(false);
      
      // Recharger la liste
      await loadUsers();

    } catch (error: any) {
      console.error('Erreur création admin:', error);
      toast({
        title: "❌ Erreur",
        description: error.message || "Impossible de créer l'administrateur",
        variant: "destructive",
      });
    } finally {
      setCreateAdminLoading(false);
    }
  };

  const handleUserAction = async (userId: string, action: 'premium' | 'free' | 'admin' | 'delete') => {
    try {
      if (action === 'delete' && !confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
        return;
      }

      if (action === 'delete') {
        const { error } = await supabase
          .from('profiles')
          .delete()
          .eq('id', userId);
        
        if (error) throw error;
        
        toast({
          title: "Succès",
          description: "Utilisateur supprimé avec succès",
        });
      } else {
        const updateData: any = { plan: action };
        
        // Si c'est admin, ajouter le rôle
        if (action === 'admin') {
          updateData.role = 'admin';
        }

        const { error } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', userId);
        
        if (error) throw error;
        
        toast({
          title: "Succès",
          description: `Utilisateur mis à jour: ${action}`,
        });
      }

      loadUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier l'utilisateur",
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'premium') return matchesSearch && user.plan === 'premium';
    if (filter === 'admin') return matchesSearch && (user.role === 'admin' || user.plan === 'admin');
    if (filter === 'free') return matchesSearch && (user.plan === 'free' || !user.plan);
    return matchesSearch;
  });

  const exportUsers = () => {
    const csvContent = [
      ['Email', 'Nom complet', 'Plan', 'Rôle', 'Date création'].join(','),
      ...filteredUsers.map(user => [
        user.email,
        user.full_name || '',
        user.plan || 'free',
        user.role || 'user',
        new Date(user.created_at).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'utilisateurs.csv';
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Chargement des utilisateurs...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <HeaderAdmin 
        title="Gestion des Utilisateurs"
        showBackButton={true}
        backTo="/admin"
        backLabel="Admin principal"
      />

      <main className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          
          {/* En-tête avec actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold">Gestion des Utilisateurs</h1>
              <p className="text-muted-foreground">
                Gérez tous les utilisateurs de la plateforme ({users.length} utilisateur{users.length > 1 ? 's' : ''})
              </p>
            </div>
            
            <div className="flex gap-2">
              {/* NOUVEAU BOUTON CRÉER ADMIN */}
              <Dialog open={showCreateAdminDialog} onOpenChange={setShowCreateAdminDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Créer Admin
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Créer un nouvel administrateur</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label htmlFor="admin-email">Email *</Label>
                      <Input
                        id="admin-email"
                        type="email"
                        value={newAdminForm.email}
                        onChange={(e) => setNewAdminForm(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="admin@example.com"
                        disabled={createAdminLoading}
                      />
                    </div>
                    <div>
                      <Label htmlFor="admin-name">Nom complet</Label>
                      <Input
                        id="admin-name"
                        value={newAdminForm.full_name}
                        onChange={(e) => setNewAdminForm(prev => ({ ...prev, full_name: e.target.value }))}
                        placeholder="Nom de l'administrateur"
                        disabled={createAdminLoading}
                      />
                    </div>
                    <div>
                      <Label htmlFor="admin-password">Mot de passe temporaire *</Label>
                      <Input
                        id="admin-password"
                        type="password"
                        value={newAdminForm.password}
                        onChange={(e) => setNewAdminForm(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="Mot de passe sécurisé"
                        disabled={createAdminLoading}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleCreateAdmin}
                        disabled={createAdminLoading || !newAdminForm.email || !newAdminForm.password}
                        className="flex-1"
                      >
                        {createAdminLoading ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4 mr-2" />
                        )}
                        {createAdminLoading ? 'Création...' : 'Créer Admin'}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowCreateAdminDialog(false)}
                        disabled={createAdminLoading}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Button onClick={loadUsers} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualiser
              </Button>
              <Button onClick={exportUsers} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exporter
              </Button>
            </div>
          </div>

          {/* Filtres et recherche */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher par email ou nom..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrer par..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les utilisateurs</SelectItem>
                <SelectItem value="admin">Administrateurs</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="free">Gratuit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Liste des utilisateurs */}
          <Card>
            <CardHeader>
              <CardTitle>Utilisateurs ({filteredUsers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt="" className="w-10 h-10 rounded-full" />
                        ) : (
                          <User className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{user.full_name || user.email}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        <div className="flex gap-2 mt-1">
                          <Badge variant={
                            user.role === 'admin' || user.plan === 'admin' ? 'destructive' :
                            user.plan === 'premium' ? 'default' : 'secondary'
                          }>
                            {user.role === 'admin' || user.plan === 'admin' ? 'Admin' :
                             user.plan === 'premium' ? 'Premium' : 'Gratuit'}
                          </Badge>
                          {user.role === 'admin' && (
                            <Badge variant="outline">
                              <Shield className="w-3 h-3 mr-1" />
                              Administrateur
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {user.role !== 'admin' && user.plan !== 'admin' && (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleUserAction(user.id, 'admin')}
                          >
                            <Shield className="w-4 h-4 mr-1" />
                            Admin
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleUserAction(user.id, 'premium')}
                          >
                            <Crown className="w-4 h-4 mr-1" />
                            Premium
                          </Button>
                        </>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleUserAction(user.id, 'delete')}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {filteredUsers.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Aucun utilisateur trouvé
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminUsers;
