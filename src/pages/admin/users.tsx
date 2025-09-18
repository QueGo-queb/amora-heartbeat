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
import { useAdminCreation } from '@/hooks/useAdminCreation';
import { UserToAdminSelector } from '@/components/admin/UserToAdminSelector';

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
  const [showUserToAdminSelector, setShowUserToAdminSelector] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createAdmin } = useAdminCreation();

  // ✅ AJOUT - État de validation
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // ✅ AJOUT - Validation en temps réel
  const validateAdminForm = (field: string, value: string) => {
    const errors: Record<string, string> = { ...validationErrors };
    
    switch (field) {
      case 'email':
        if (!value) {
          errors.email = 'L\'email est requis';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.email = 'Format d\'email invalide';
        } else {
          delete errors.email;
        }
        break;
      case 'password':
        if (!value) {
          errors.password = 'Le mot de passe est requis';
        } else if (value.length < 6) {
          errors.password = 'Le mot de passe doit contenir au moins 6 caractères';
        } else {
          delete errors.password;
        }
        break;
    }
    
    setValidationErrors(errors);
  };

  // ✅ AMÉLIORÉ - Gestion des changements de formulaire
  const handleFormChange = (field: string, value: string) => {
    setNewAdminForm(prev => ({ ...prev, [field]: value }));
    validateAdminForm(field, value);
  };

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

  // ✅ CORRIGÉ - Fonction de création d'admin
  const handleCreateAdmin = async (formData: any) => {
    try {
      setCreateAdminLoading(true);
      
      // ✅ VALIDATION PRÉALABLE
      if (!formData.email || !formData.password) {
        toast({
          title: "Erreur de validation",
          description: "L'email et le mot de passe sont requis.",
          variant: "destructive",
        });
        return;
      }
      
      if (formData.password.length < 6) {
        toast({
          title: "Erreur de validation",
          description: "Le mot de passe doit contenir au moins 6 caractères.",
          variant: "destructive",
        });
        return;
      }
      
      // ✅ VALIDATION EMAIL
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast({
          title: "Erreur de validation",
          description: "Format d'email invalide.",
          variant: "destructive",
        });
        return;
      }
      
      console.log(' Creating admin with data:', formData);
      
      // ✅ CORRIGÉ - Utiliser le bon nom de champ
      const result = await createAdmin(
        formData.email,
        formData.password,
        formData.full_name || formData.fullName // Support des deux formats
      );

      if (result.success) {
        // ✅ RÉINITIALISER LE FORMULAIRE
        setNewAdminForm({
          email: '',
          full_name: '',
          password: ''
        });
        
        // Recharger la liste des utilisateurs
        await loadUsers();
        
        // Fermer le modal
        setShowCreateAdminDialog(false);
        
        toast({
          title: "✅ Succès",
          description: `L'administrateur ${formData.email} a été créé avec succès !`,
        });
      } else {
        toast({
          title: "❌ Erreur",
          description: result.error || "Erreur lors de la création de l'administrateur.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('❌ Erreur création admin:', error);
      
      toast({
        title: "❌ Erreur",
        description: error.message || "Une erreur inattendue s'est produite.",
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
              {/* Bouton pour créer un nouvel admin (création de compte) */}
              <Dialog open={showCreateAdminDialog} onOpenChange={setShowCreateAdminDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-50">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Nouveau Compte Admin
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
                        className="mt-1"
                      />
                      {validationErrors.email && <p className="text-sm text-red-500 mt-1">{validationErrors.email}</p>}
                    </div>
                    <div>
                      <Label htmlFor="admin-name">Nom complet</Label>
                      <Input
                        id="admin-name"
                        value={newAdminForm.full_name}
                        onChange={(e) => setNewAdminForm(prev => ({ ...prev, full_name: e.target.value }))}
                        placeholder="Nom de l'administrateur"
                        disabled={createAdminLoading}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="admin-password">Mot de passe temporaire *</Label>
                      <Input
                        id="admin-password"
                        type="password"
                        value={newAdminForm.password}
                        onChange={(e) => setNewAdminForm(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="Mot de passe sécurisé (min. 6 caractères)"
                        disabled={createAdminLoading}
                        className="mt-1"
                      />
                      {validationErrors.password && <p className="text-sm text-red-500 mt-1">{validationErrors.password}</p>}
                      <p className="text-sm text-gray-500 mt-1">
                        L'administrateur devra changer ce mot de passe lors de sa première connexion.
                      </p>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button 
                        onClick={() => handleCreateAdmin(newAdminForm)}
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
                        onClick={() => {
                          setShowCreateAdminDialog(false);
                          setNewAdminForm({ email: '', full_name: '', password: '' });
                        }}
                        disabled={createAdminLoading}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* NOUVEAU: Bouton pour promouvoir un utilisateur existant */}
              <Button 
                onClick={() => setShowUserToAdminSelector(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Shield className="w-4 h-4 mr-2" />
                Promouvoir en Admin
              </Button>

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

      {/* Nouveau modal de sélection d'utilisateur */}
      <UserToAdminSelector
        open={showUserToAdminSelector}
        onClose={() => setShowUserToAdminSelector(false)}
        onAdminCreated={() => {
          loadUsers(); // Recharger la liste
          setShowUserToAdminSelector(false);
        }}
      />
    </div>
  );
};

export default AdminUsers;
