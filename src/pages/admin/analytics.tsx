/**
 * Page Analytics & Rapports
 * Affiche les statistiques détaillées et génère des rapports
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign,
  Calendar,
  Download,
  Filter,
  Eye,
  PieChart,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  premiumUsers: number;
  totalRevenue: number;
  monthlyRevenue: number;
  conversionRate: number;
  userGrowth: number;
  revenueGrowth: number;
}

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalUsers: 0,
    activeUsers: 0,
    premiumUsers: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    conversionRate: 0,
    userGrowth: 0,
    revenueGrowth: 0
  });
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAccess();
    loadAnalytics();
  }, [period]);

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.email !== 'clodenerc@yahoo.fr') {
      navigate('/');
      return;
    }
  };

  const loadAnalytics = async () => {
    try {
      setLoading(true);

      // Charger les données utilisateurs
      const { data: users } = await supabase
        .from('profiles')
        .select('*');

      // Charger les transactions
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('status', 'succeeded');

      // Calculer les statistiques
      const totalUsers = users?.length || 0;
      const activeUsers = users?.filter(u => u.is_active).length || 0;
      const premiumUsers = users?.filter(u => u.plan === 'premium').length || 0;
      const totalRevenue = (transactions?.reduce((sum, t) => sum + t.amount_cents, 0) || 0) / 100;

      // Calculer le revenu mensuel
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const monthlyTransactions = transactions?.filter(t => 
        new Date(t.created_at) > thirtyDaysAgo
      ) || [];
      const monthlyRevenue = (monthlyTransactions.reduce((sum, t) => sum + t.amount_cents, 0)) / 100;

      // Calculer le taux de conversion
      const conversionRate = totalUsers > 0 ? (premiumUsers / totalUsers) * 100 : 0;

      // Calculer la croissance (simulation)
      const userGrowth = 12.5; // % de croissance simulée
      const revenueGrowth = 8.3; // % de croissance simulée

      setAnalytics({
        totalUsers,
        activeUsers,
        premiumUsers,
        totalRevenue,
        monthlyRevenue,
        conversionRate,
        userGrowth,
        revenueGrowth
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les analytics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateReport = () => {
    const reportData = {
      period: period,
      generatedAt: new Date().toISOString(),
      analytics: analytics
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { 
      type: 'application/json' 
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport-analytics-${period}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Rapport généré",
      description: "Le rapport a été téléchargé avec succès",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="heart-logo">
            <div className="heart-shape animate-pulse" />
          </div>
          <span className="text-lg">Chargement des analytics...</span>
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
            <span className="text-xl font-bold">Analytics & Rapports</span>
          </div>
          
          <div className="flex items-center gap-4">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 jours</SelectItem>
                <SelectItem value="30d">30 jours</SelectItem>
                <SelectItem value="90d">90 jours</SelectItem>
                <SelectItem value="1y">1 an</SelectItem>
              </SelectContent>
            </Select>
            
            <Button onClick={generateReport} className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Générer rapport
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        {/* KPIs Principaux */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="culture-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utilisateurs Totaux</CardTitle>
              <Users className="w-4 h-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +{analytics.userGrowth}% ce mois
              </p>
            </CardContent>
          </Card>

          <Card className="culture-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utilisateurs Actifs</CardTitle>
              <Activity className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.activeUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.totalUsers > 0 ? Math.round((analytics.activeUsers / analytics.totalUsers) * 100) : 0}% du total
              </p>
            </CardContent>
          </Card>

          <Card className="culture-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utilisateurs Premium</CardTitle>
              <TrendingUp className="w-4 h-4 text-heart-red" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.premiumUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.conversionRate.toFixed(1)}% de conversion
              </p>
            </CardContent>
          </Card>

          <Card className="culture-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenus Totaux</CardTitle>
              <DollarSign className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${analytics.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +{analytics.revenueGrowth}% ce mois
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Graphiques et Métriques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenus Mensuels */}
          <Card className="culture-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Revenus Mensuels
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 mb-2">
                ${analytics.monthlyRevenue.toFixed(2)}
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Revenus des 30 derniers jours
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((analytics.monthlyRevenue / analytics.totalRevenue) * 100, 100)}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          {/* Taux de Conversion */}
          <Card className="culture-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Taux de Conversion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-heart-red mb-2">
                {analytics.conversionRate.toFixed(1)}%
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Utilisateurs gratuits → Premium
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-heart-red h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(analytics.conversionRate, 100)}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Métriques Détaillées */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="culture-card">
            <CardHeader>
              <CardTitle className="text-lg">Croissance Utilisateurs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                +{analytics.userGrowth}%
              </div>
              <p className="text-sm text-muted-foreground">
                Croissance mensuelle
              </p>
            </CardContent>
          </Card>

          <Card className="culture-card">
            <CardHeader>
              <CardTitle className="text-lg">Croissance Revenus</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                +{analytics.revenueGrowth}%
              </div>
              <p className="text-sm text-muted-foreground">
                Croissance mensuelle
              </p>
            </CardContent>
          </Card>

          <Card className="culture-card">
            <CardHeader>
              <CardTitle className="text-lg">ARPU</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                ${analytics.totalUsers > 0 ? (analytics.totalRevenue / analytics.totalUsers).toFixed(2) : '0.00'}
              </div>
              <p className="text-sm text-muted-foreground">
                Revenu moyen par utilisateur
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Actions Rapides */}
        <Card className="culture-card mt-8">
          <CardHeader>
            <CardTitle>Actions Rapides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/admin/users')}
                className="flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                Gérer les utilisateurs
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/admin/payments')}
                className="flex items-center gap-2"
              >
                <DollarSign className="w-4 h-4" />
                Voir les paiements
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/admin/promotions')}
                className="flex items-center gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                Gérer les promotions
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminAnalytics;
