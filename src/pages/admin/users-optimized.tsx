/**
 * ✅ PAGE ADMIN UTILISATEURS OPTIMISÉE avec fallback sécurisé
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
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
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { adminAPIFallback } from '@/lib/api/admin-fallback';
import { useDatabaseMonitor } from '@/lib/databaseMonitor';
import { useRateLimit, rateLimitConfigs } from '@/lib/rateLimiter';
import { OptimizedLoader } from '@/components/ui/optimized-loader';
import type { AdminUser, UsersResponse } from '@/lib/api/admin-fallback';

const UsersOptimized = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { measureQuery } = useDatabaseMonitor();
  const { isAllowed: canRefresh, waitTime: refreshWaitTime } = useRateLimit({
    ...rateLimitConfigs.login,
    key: 'admin_refresh'
  });

  // État local optimisé
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    suspendedUsers: 0,
    totalPosts: 0,
    totalMessages: 0
  });

  // ✅ OPTIMISÉ: Fonction de chargement avec monitoring
  const loadUsers = useCallback(async (page: number = 1, append: boolean = false) => {
    if (!canRefresh && page === 1) {
      toast({
        title: "Limite atteinte",
        description: `Attendez ${Math.ceil(refreshWaitTime / 1000)}s avant de rafraîchir`,
        variant: "destructive"
      });
      return;
    }

    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setError(null);
      }

      const result = await measureQuery('admin_load_users', async () => {
        return await adminAPIFallback.getUsers(page, 20);
      });

      if (append) {
        setUsers(prev => [...prev, ...result.users]);
      } else {
        setUsers(result.users);
      }

      setTotalUsers(result.total);
      setCurrentPage(page);

    } catch (error: any) {
      setError(error.message || 'Erreur lors du chargement des utilisateurs');
      toast({
        title: "Erreur",
        description: "Impossible de charger les utilisateurs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [canRefresh, refreshWaitTime, measureQuery, toast]);

  // ✅ OPTIMISÉ: Chargement des statistiques
  const loadStats = useCallback(async () => {
    try {
      const statsData = await measureQuery('admin_load_stats', async () => {
        return await adminAPIFallback.getAdminStats();
      });
      setStats(statsData);
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    }
  }, [measureQuery]);

  // ✅ OPTIMISÉ: Filtrage et recherche mémorisés
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = !searchTerm || 
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = filterRole === 'all' || user.role === filterRole;
      
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, filterRole]);

  // ✅ OPTIMISÉ: Chargement initial
  useEffect(() => {
    loadUsers(1);
    loadStats();
  }, [loadUsers, loadStats]);

  // ✅ OPTIMISÉ: Fonction de refresh
  const handleRefresh = useCallback(() => {
    loadUsers(1);
    loadStats();
  }, [loadUsers, loadStats]);

  // ✅ OPTIMISÉ: Fonction de chargement de plus d'utilisateurs
  const handleLoadMore = useCallback(() => {
    if (!loadingMore && users.length < totalUsers) {
      loadUsers(currentPage + 1, true);
    }
  }, [loadingMore, users.length, totalUsers, currentPage, loadUsers]);

  // ✅ OPTIMISÉ: Fonction d'export (simulation)
  const handleExport = useCallback(() => {
    try {
      const csvContent = [
        ['ID', 'Email', 'Nom', 'Rôle', 'Statut', 'Date de création'],
        ...filteredUsers.map(user => [
          user.id,
          user.email,
          user.full_name || '',
          user.role,
          user.is_suspended ? 'Suspendu' : 'Actif',
          new Date(user.created_at).toLocaleDateString()
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export réussi",
        description: "Fichier CSV téléchargé"
      });
    } catch (error) {
      toast({
        title: "Erreur d'export",
        description: "Impossible d'exporter les données",
        variant: "destructive"
      });
    }
  }, [filteredUsers, toast]);

  // Vérification des permissions admin
  if (!user || (user.email !== 'clodenerc@yahoo.fr' && user.role !== 'admin')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <Shield className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Accès refusé</h2>
            <p className="text-muted-foreground mb-4">
              Vous n'avez pas les permissions nécessaires pour accéder à cette page.
            </p>
            <Button onClick={() => navigate('/dashboard')}>
              Retour au tableau de bord
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/admin')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Gestion des utilisateurs</h1>
              <p className="text-muted-foreground">
                {totalUsers} utilisateurs au total
              </p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button
              onClick={handleRefresh}
              variant="outline"
              disabled={!canRefresh}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
            <Button onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Total</span>
              </div>
              <p className="text-2xl font-bold">{stats.totalUsers}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Actifs</span>
              </div>
              <p className="text-2xl font-bold">{stats.activeUsers}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Ban className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium">Suspendus</span>
              </div>
              <p className="text-2xl font-bold">{stats.suspendedUsers}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium">Posts</span>
              </div>
              <p className="text-2xl font-bold">{stats.totalPosts}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium">Messages</span>
              </div>
              <p className="text-2xl font-bold">{stats.totalMessages}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filtres et recherche */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par nom ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex space-x-2">
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="all">Tous les rôles</option>
                  <option value="user">Utilisateur</option>
                  <option value="admin">Admin</option>
                  <option value="moderator">Modérateur</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Liste des utilisateurs */}
        <Card>
          <CardHeader>
            <CardTitle>Utilisateurs ({filteredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading && users.length === 0 ? (
              <div className="flex justify-center py-8">
                <OptimizedLoader variant="heart" text="Chargement des utilisateurs..." />
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 mx-auto text-red-500 mb-4" />
                <h3 className="text-lg font-semibold text-red-600 mb-2">Erreur de chargement</h3>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button onClick={handleRefresh} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Réessayer
                </Button>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground">
                  Aucun utilisateur trouvé
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Essayez de modifier vos critères de recherche
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-500" />
                        </div>
                        <div>
                          <p className="font-medium">{user.full_name || 'Nom non défini'}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                          {user.role}
                        </Badge>
                        <Badge variant={user.is_suspended ? 'destructive' : 'default'}>
                          {user.is_suspended ? 'Suspendu' : 'Actif'}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Load More Button */}
                {users.length < totalUsers && (
                  <div className="flex justify-center pt-4">
                    <Button
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      variant="outline"
                    >
                      {loadingMore ? (
                        <OptimizedLoader size="sm" />
                      ) : (
                        'Charger plus'
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Avertissement pour les fonctions non déployées */}
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <h4 className="font-medium text-yellow-800">Fonctions avancées non disponibles</h4>
                <p className="text-sm text-yellow-700">
                  La création et la suspension d'utilisateurs nécessitent le déploiement des fonctions Supabase.
                  Installez Supabase CLI et exécutez: <code>supabase functions deploy admin-api</code>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UsersOptimized;
