/**
 * Page principale du dashboard administrateur
 * Affiche les statistiques et les boutons de navigation vers les différentes sections
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, 
  Users, 
  CreditCard, 
  BarChart3, 
  Settings, 
  LogOut,
  User,
  Mail,
  Calendar,
  TrendingUp,
  AlertTriangle,
  Megaphone,
  Gift,
  Shield,
  MessageSquare,
  Flag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AdminStats {
  totalUsers: number;
  premiumUsers: number;
  totalRevenue: number;
  pendingReports: number;
  activeAds: number;
  activePromotions: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    premiumUsers: 0,
    totalRevenue: 0,
    pendingReports: 0,
    activeAds: 0,
    activePromotions: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAccess();
    loadStats();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.email !== 'clodenerc@yahoo.fr') {
      navigate('/');
      return;
    }
  };

  const loadStats = async () => {
    try {
      // Charger les statistiques depuis Supabase
      const { data: users } = await supabase.from('profiles').select('*');
      const { data: transactions } = await supabase.from('transactions').select('*');
      const { data: reports } = await supabase.from('reports').select('*');
      const { data: ads } = await supabase.from('ads').select('*');
      const { data: promotions } = await supabase.from('promotions').select('*');

      setStats({
        totalUsers: users?.length || 0,
        premiumUsers: users?.filter(u => u.plan === 'premium').length || 0,
        totalRevenue: (transactions?.filter(t => t.status === 'succeeded').reduce((sum, t) => sum + t.amount_cents, 0) || 0) / 100,
        pendingReports: reports?.filter(r => r.status === 'pending').length || 0,
        activeAds: ads?.filter(a => a.is_active).length || 0,
        activePromotions: promotions?.filter(p => p.is_active).length || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la déconnexion",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="heart-logo">
            <div className="heart-shape animate-pulse" />
          </div>
          <span className="text-lg">Chargement du dashboard...</span>
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
            <Heart className="w-8 h-8 text-heart-red" />
            <span className="text-xl font-bold">Dashboard Admin - Amora</span>
          </div>
          
          <Button variant="ghost" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Déconnexion
          </Button>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="culture-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utilisateurs Totaux</CardTitle>
              <Users className="w-4 h-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {stats.premiumUsers} utilisateurs premium
              </p>
            </CardContent>
          </Card>

          <Card className="culture-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenus Totaux</CardTitle>
              <CreditCard className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Toutes les transactions
              </p>
            </CardContent>
          </Card>

          <Card className="culture-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Signalements En Attente</CardTitle>
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingReports}</div>
              <p className="text-xs text-muted-foreground">
                Nécessitent une action
              </p>
            </CardContent>
          </Card>

          <Card className="culture-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Publicités Actives</CardTitle>
              <Megaphone className="w-4 h-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeAds}</div>
              <p className="text-xs text-muted-foreground">
                En cours de diffusion
              </p>
            </CardContent>
          </Card>

          <Card className="culture-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Promotions Actives</CardTitle>
              <Gift className="w-4 h-4 text-heart-red" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activePromotions}</div>
              <p className="text-xs text-muted-foreground">
                En cours de promotion
              </p>
            </CardContent>
          </Card>

          <Card className="culture-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Croissance</CardTitle>
              <TrendingUp className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+12.5%</div>
              <p className="text-xs text-muted-foreground">
                Ce mois
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Admin Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Gestion Utilisateurs */}
          <Card className="culture-card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin/users')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                Gestion Utilisateurs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Gérer les comptes utilisateurs, voir les statistiques et modérer les profils.
              </p>
            </CardContent>
          </Card>

          {/* Paiements & Abonnements */}
          <Card className="culture-card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin/payments')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-green-500" />
                Paiements & Abonnements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Surveiller les transactions, gérer les abonnements et analyser les revenus.
              </p>
            </CardContent>
          </Card>

          {/* Analytics & Rapports */}
          <Card className="culture-card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin/analytics')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-500" />
                Analytics & Rapports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Analyser les performances, générer des rapports et suivre les métriques.
              </p>
            </CardContent>
          </Card>

          {/* Modération */}
          <Card className="culture-card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin/moderation')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-500" />
                Modération
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Gérer les signalements, modérer le contenu et bannir les utilisateurs.
              </p>
            </CardContent>
          </Card>

          {/* Communication */}
          <Card className="culture-card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin/communication')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                Communication
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Envoyer des notifications, gérer les messages et communiquer avec les utilisateurs.
              </p>
            </CardContent>
          </Card>

          {/* Configuration */}
          <Card className="culture-card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin/settings')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-gray-500" />
                Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Configurer les paramètres de l'application et gérer les préférences.
              </p>
            </CardContent>
          </Card>

          {/* Publicité */}
          <Card className="culture-card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin/ads')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-orange-500" />
                Publicité
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Créer et gérer les publicités, suivre les performances et optimiser les campagnes.
              </p>
            </CardContent>
          </Card>

          {/* Promotions */}
          <Card className="culture-card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin/promotions')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-heart-red" />
                Promotions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Créer des promotions, gérer les offres spéciales et booster l'engagement.
              </p>
            </CardContent>
          </Card>

          {/* Gestion Footer */}
          <Card className="culture-card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin/footer')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flag className="w-5 h-5 text-gray-600" />
                Gestion Footer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Modifier le contenu du footer, les liens et les informations de contact.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
