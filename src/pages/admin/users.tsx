/**
 * Page de gestion des utilisateurs
 * Permet de voir, modifier et gérer tous les utilisateurs
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
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  full_name?: string;
  created_at: string;
  last_sign_in_at?: string;
  plan?: string;
  is_active?: boolean;
  profile?: {
    avatar_url?: string;
    bio?: string;
    location?: string;
  };
}

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
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
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          full_name,
          created_at,
          last_sign_in_at,
          plan,
          is_active,
          profile:profiles!inner(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
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

  const handleUserAction = async (userId: string, action: 'ban' | 'unban' | 'delete') => {
    try {
      if (action === 'delete' && !confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
        return;
      }

      let updateData = {};
      if (action === 'ban') {
        updateData = { is_active: false };
      } else if (action === 'unban') {
        updateData = { is_active: true };
      }

      if (action === 'delete') {
        const { error } = await supabase
          .from('profiles')
          .delete()
          .eq('id', userId);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', userId);
        
        if (error) throw error;
      }

      toast({
        title: "Succès",
        description: `Utilisateur ${action === 'ban' ? 'banni' : action === 'unban' ? 'débanni' : 'supprimé'} avec succès`,
      });

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
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'active') return matchesSearch && user.is_active;
    if (filter === 'inactive') return matchesSearch && !user.is_active;
    if (filter === 'premium') return matchesSearch && user.plan === 'premium';
    return matchesSearch;
  });

  const exportUsers = () => {
    const csvContent = [
      ['Email', 'Nom', 'Plan', 'Date création', 'Dernière connexion', 'Statut'],
      ...filteredUsers.map(user => [
        user.email,
        user.full_name || '',
        user.plan || 'free',
        new Date(user.created_at).toLocaleDateString(),
        user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Jamais',
        user.is_active ? 'Actif' : 'Inactif'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'utilisateurs-amora.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="heart-logo">
            <div className="heart-shape animate-pulse" />
          </div>
          <span className="text-lg">Chargement des utilisateurs...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate('/admin')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour au dashboard
            </Button>
            <span className="text-xl font-bold">Gestion des Utilisateurs</span>
          </div>
          
          <Button onClick={exportUsers} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Exporter
          </Button>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="culture-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Utilisateurs</CardTitle>
              <User className="w-4 h-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>

          <Card className="culture-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utilisateurs Actifs</CardTitle>
              <CheckCircle className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(u => u.is_active).length}
              </div>
            </CardContent>
          </Card>

          <Card className="culture-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utilisateurs Premium</CardTitle>
              <Shield className="w-4 h-4 text-heart-red" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(u => u.plan === 'premium').length}
              </div>
            </CardContent>
          </Card>

          <Card className="culture-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utilisateurs Bannis</CardTitle>
              <Ban className="w-4 h-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(u => !u.is_active).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Rechercher par email ou nom..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrer par" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les utilisateurs</SelectItem>
              <SelectItem value="active">Actifs</SelectItem>
              <SelectItem value="inactive">Inactifs</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Users Table */}
        <Card className="culture-card">
          <CardHeader>
            <CardTitle>Liste des utilisateurs ({filteredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Utilisateur</th>
                    <th className="text-left p-2">Email</th>
                    <th className="text-left p-2">Plan</th>
                    <th className="text-left p-2">Date création</th>
                    <th className="text-left p-2">Dernière connexion</th>
                    <th className="text-left p-2">Statut</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4" />
                          </div>
                          <span className="font-medium">{user.full_name || 'Sans nom'}</span>
                        </div>
                      </td>
                      <td className="p-2">{user.email}</td>
                      <td className="p-2">
                        <Badge variant={user.plan === 'premium' ? 'default' : 'secondary'}>
                          {user.plan || 'free'}
                        </Badge>
                      </td>
                      <td className="p-2 text-sm text-gray-600">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-2 text-sm text-gray-600">
                        {user.last_sign_in_at 
                          ? new Date(user.last_sign_in_at).toLocaleDateString()
                          : 'Jamais'
                        }
                      </td>
                      <td className="p-2">
                        <Badge variant={user.is_active ? 'default' : 'destructive'}>
                          {user.is_active ? 'Actif' : 'Inactif'}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/admin/users/${user.id}`)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {user.is_active ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUserAction(user.id, 'ban')}
                            >
                              <Ban className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUserAction(user.id, 'unban')}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUserAction(user.id, 'delete')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucun utilisateur trouvé</h3>
                <p className="text-muted-foreground">
                  {searchTerm || filter !== 'all' 
                    ? "Aucun utilisateur ne correspond aux critères de recherche."
                    : "Aucun utilisateur enregistré pour le moment."
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminUsers;
