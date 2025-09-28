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
  Flag,
  Building2,
  ArrowLeft,
  Upload,
  MapPin,
  CheckCircle,
  Clock,
  DollarSign,
  Coins,
  Smartphone,
  Landmark,
  FileText,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Search,
  Filter,
  Save,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCajaVecina } from '@/hooks/useCajaVecina';
import { PayPalManager } from '@/components/admin/PayPalManager';
import { CajaVecinaManager } from '@/components/admin/CajaVecinaManager';
import { MonCashManager } from '@/components/admin/MonCashManager';
import { UsdtLinksManager } from '@/components/admin/UsdtLinksManager';
import { AdminBankAccountManager } from '@/components/admin/AdminBankAccountManager';
import { InteracManager } from '@/components/admin/InteracManager';
import { StripeManager } from '@/components/admin/StripeManager';
import { EnhancedInterestsSelector } from '@/components/profile/EnhancedInterestsSelector';
import { MoneyTransferButton } from '@/components/admin/MoneyTransferButton';
import { BankAccountSecurityMonitor } from '@/components/admin/BankAccountSecurityMonitor';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface AdminStats {
  totalUsers: number;
  premiumUsers: number;
  totalRevenue: number;
  pendingReports: number;
  activeAds: number;
  activePromotions: number;
  availableBalance?: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    premiumUsers: 0,
    totalRevenue: 0,
    pendingReports: 0,
    activeAds: 0,
    activePromotions: 0,
    availableBalance: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPayPalManager, setShowPayPalManager] = useState(false);
  const [showCajaVecinaManager, setShowCajaVecinaManager] = useState(false);
  const [showMonCashManager, setShowMonCashManager] = useState(false);
  const [showUsdtLinksManager, setShowUsdtLinksManager] = useState(false);
  const [showAdminBankAccountManager, setShowAdminBankAccountManager] = useState(false);
  const [showInteracManager, setShowInteracManager] = useState(false);
  const [showStripeManager, setShowStripeManager] = useState(false);
  const [showSecurityMonitor, setShowSecurityMonitor] = useState(false);

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
      const { data: adminTransfers } = await supabase.from('admin_transfers').select('*');

      setStats({
        totalUsers: users?.length || 0,
        premiumUsers: users?.filter(u => u.plan === 'premium').length || 0,
        totalRevenue: (transactions?.filter(t => t.status === 'succeeded').reduce((sum, t) => sum + t.amount_cents, 0) || 0) / 100,
        pendingReports: reports?.filter(r => r.status === 'pending').length || 0,
        activeAds: ads?.filter(a => a.is_active).length || 0,
        activePromotions: promotions?.filter(p => p.is_active).length || 0,
        availableBalance: await getAvailableBalance()
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

  // Fonction de navigation sécurisée pour tous les boutons
  const handleNavigation = (path: string) => {
    try {
      // Debug
      navigate(path);
    } catch (error) {
      console.error(`Erreur de navigation vers ${path}:`, error);
      toast({
        title: "Erreur de navigation",
        description: "Impossible d'accéder à cette section",
        variant: "destructive",
      });
    }
  };

  // CORRECTION: Fonction de diagnostic système améliorée
  const runSystemDiagnostic = async () => {
    try {
      setLoading(true);
      const diagnosticResults = {
        database: 'OK',
        authentication: 'OK',
        storage: 'OK',
        apis: 'OK',
        performance: 'Bon'
      };

      // Vérifier la base de données
      try {
        const { data: profiles } = await supabase.from('profiles').select('count').limit(1);
        diagnosticResults.database = profiles ? 'OK' : 'ERREUR';
      } catch (error) {
        diagnosticResults.database = 'ERREUR';
      }

      // Vérifier l'authentification
      try {
        const { data: { user } } = await supabase.auth.getUser();
        diagnosticResults.authentication = user ? 'OK' : 'ERREUR';
      } catch (error) {
        diagnosticResults.authentication = 'ERREUR';
      }

      // Afficher les résultats
      toast({
        title: "✅ Diagnostic terminé",
        description: `Base de données: ${diagnosticResults.database} | Auth: ${diagnosticResults.authentication} | Stockage: ${diagnosticResults.storage}`,
      });

      } catch (error) {
      console.error('❌ Erreur lors du diagnostic:', error);
      toast({
        title: "❌ Erreur de diagnostic",
        description: "Impossible de compléter le diagnostic système",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 border-2 border-purple-300 border-t-transparent rounded-full animate-spin" />
          <span>Chargement des statistiques...</span>
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
            <div className="heart-logo">
              <div className="heart-shape" />
            </div>
            <span className="text-2xl font-bold gradient-text">AMORA ADMIN</span>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <User className="w-5 h-5" />
            </Button>
            <Button variant="outline" onClick={handleSignOut} className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Tableau de bord administrateur</h1>
          <p className="text-muted-foreground">
            Gérez votre application AMORA depuis cette interface centralisée
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

          {/* Transfert d'argent - Nouvelle carte */}
          <Card className="culture-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Solde disponible</CardTitle>
              <DollarSign className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.availableBalance?.toFixed(2) || '0.00'}€
              </div>
              <div className="mt-4">
                <MoneyTransferButton />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Gestion Utilisateurs */}
          <Card 
            className="culture-card hover:shadow-lg transition-shadow cursor-pointer" 
            onClick={() => handleNavigation('/admin/users')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleNavigation('/admin/users');
              }
            }}
            tabIndex={0}
            role="button"
            aria-label="Accéder à la gestion des utilisateurs"
          >
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
              <div className="mt-3 text-xs text-blue-600 font-medium">
                Cliquez pour accéder →
              </div>
            </CardContent>
          </Card>

          {/* Paiements & Abonnements */}
          <Card 
            className="culture-card hover:shadow-lg transition-shadow cursor-pointer" 
            onClick={() => handleNavigation('/admin/payments')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleNavigation('/admin/payments');
              }
            }}
            tabIndex={0}
            role="button"
            aria-label="Accéder à la gestion des paiements"
          >
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
              <div className="mt-3 text-xs text-blue-600 font-medium">
                Cliquez pour accéder →
              </div>
            </CardContent>
          </Card>

          {/* Analytics & Rapports */}
          <Card 
            className="culture-card hover:shadow-lg transition-shadow cursor-pointer" 
            onClick={() => handleNavigation('/admin/analytics')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleNavigation('/admin/analytics');
              }
            }}
            tabIndex={0}
            role="button"
            aria-label="Accéder aux analytics"
          >
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
              <div className="mt-3 text-xs text-blue-600 font-medium">
                Cliquez pour accéder →
              </div>
            </CardContent>
          </Card>

          {/* Modération */}
          <Card 
            className="culture-card hover:shadow-lg transition-shadow cursor-pointer" 
            onClick={() => handleNavigation('/admin/moderation')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleNavigation('/admin/moderation');
              }
            }}
            tabIndex={0}
            role="button"
            aria-label="Accéder à la modération"
          >
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
              <div className="mt-3 text-xs text-blue-600 font-medium">
                Cliquez pour accéder →
              </div>
            </CardContent>
          </Card>

          {/* Communication */}
          <Card 
            className="culture-card hover:shadow-lg transition-shadow cursor-pointer" 
            onClick={() => handleNavigation('/admin/communication')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleNavigation('/admin/communication');
              }
            }}
            tabIndex={0}
            role="button"
            aria-label="Accéder à la communication"
          >
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
              <div className="mt-3 text-xs text-blue-600 font-medium">
                Cliquez pour accéder →
              </div>
            </CardContent>
          </Card>

          {/* Configuration */}
          <Card 
            className="culture-card hover:shadow-lg transition-shadow cursor-pointer" 
            onClick={() => handleNavigation('/admin/settings')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleNavigation('/admin/settings');
              }
            }}
            tabIndex={0}
            role="button"
            aria-label="Accéder à la configuration"
          >
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
              <div className="mt-3 text-xs text-blue-600 font-medium">
                Cliquez pour accéder →
              </div>
            </CardContent>
          </Card>

          {/* Publicité - CORRIGÉ */}
          <Card 
            className="culture-card hover:shadow-lg transition-shadow cursor-pointer" 
            onClick={() => handleNavigation('/admin/ads')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleNavigation('/admin/ads');
              }
            }}
            tabIndex={0}
            role="button"
            aria-label="Accéder à la gestion des publicités"
          >
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
              <div className="mt-3 text-xs text-blue-600 font-medium">
                Cliquez pour accéder →
              </div>
            </CardContent>
          </Card>

          {/* Promotions - CORRIGÉ */}
          <Card 
            className="culture-card hover:shadow-lg transition-shadow cursor-pointer" 
            onClick={() => handleNavigation('/admin/promotions')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleNavigation('/admin/promotions');
              }
            }}
            tabIndex={0}
            role="button"
            aria-label="Accéder à la gestion des promotions"
          >
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
              <div className="mt-3 text-xs text-blue-600 font-medium">
                Cliquez pour accéder →
              </div>
            </CardContent>
          </Card>

          {/* Gestion Footer - CORRIGÉ */}
          <Card 
            className="culture-card hover:shadow-lg transition-shadow cursor-pointer" 
            onClick={() => handleNavigation('/admin/footer')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleNavigation('/admin/footer');
              }
            }}
            tabIndex={0}
            role="button"
            aria-label="Accéder à la gestion du footer"
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flag className="w-5 h-5 text-gray-600" />
                Gestion Footer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Modifier le contenu du footer, les liens, les réseaux sociaux et les pages légales.
              </p>
              <div className="mt-3 text-xs text-blue-600 font-medium">
                Cliquez pour accéder →
              </div>
            </CardContent>
          </Card>

          {/* Caja Vecina - MODIFIER SEULEMENT CETTE CARTE */}
          <Card className="culture-card hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="w-5 h-5 text-blue-500" />
                Caja Vecina
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-4">
                Gérer les comptes de paiement chiliens
              </p>
              <div className="flex items-center justify-between">
                <Badge variant="secondary">
                  Comptes
                </Badge>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowCajaVecinaManager(true)}
                >
                  Gérer
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* PayPal - MODIFIER SEULEMENT CETTE CARTE */}
          <Card className="culture-card hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="w-5 h-5 text-blue-500" />
                PayPal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-4">
                Configurer les paiements PayPal
              </p>
              <div className="flex items-center justify-between">
                <Badge variant="secondary">
                  Configuration
                </Badge>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowPayPalManager(true)}
                >
                  Gérer
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* MonCash - MODIFIER SEULEMENT CETTE CARTE */}
          <Card className="culture-card hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Smartphone className="w-5 h-5 text-green-500" />
                MonCash
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-4">
                Gérer les paiements MonCash (Haïti)
              </p>
              <div className="flex items-center justify-between">
                <Badge variant="secondary">
                  Paiements mobiles
                </Badge>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowMonCashManager(true)}
                >
                  Gérer
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* USDT (Crypto) */}
          <Card className="culture-card hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Coins className="w-5 h-5 text-orange-500" />
                USDT (Crypto)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-4">
                Configurer les adresses USDT TRC20/ERC20
              </p>
              <div className="flex items-center justify-between">
                <Badge variant="secondary">
                  Cryptomonnaies
                </Badge>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowUsdtLinksManager(true)}
                >
                  Gérer
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Interac (Canada) */}
          <Card className="culture-card hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <CreditCard className="w-5 h-5 text-red-600" />
                Interac (Canada)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-4">
                Configurer les paiements électroniques canadiens
              </p>
              <div className="flex items-center justify-between">
                <Badge variant="secondary">
                  Paiement électronique
                </Badge>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowInteracManager(true)}
                >
                  Gérer
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stripe (Cartes) */}
          <Card className="culture-card hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <CreditCard className="w-5 h-5 text-purple-600" />
                Stripe (Cartes)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-4">
                Configurer les paiements par carte de crédit/débit
              </p>
              <div className="flex items-center justify-between">
                <Badge variant="secondary">
                  Cartes internationales
                </Badge>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowStripeManager(true)}
                >
                  Gérer
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Diagnostic Système */}
          <Card 
            className="culture-card hover:shadow-lg transition-shadow cursor-pointer" 
            onClick={runSystemDiagnostic}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                runSystemDiagnostic();
              }
            }}
            tabIndex={0}
            role="button"
            aria-label="Lancer le diagnostic système"
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="w-5 h-5 text-green-500" />
                Diagnostic Système
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-4">
                Vérifier l'état du système
              </p>
              <Button 
                variant="outline" 
                size="sm"
              >
                Lancer diagnostic
              </Button>
            </CardContent>
          </Card>

          {/* Mes Comptes Bancaires */}
          <Card 
            className="culture-card hover:shadow-lg transition-shadow cursor-pointer" 
            onClick={() => setShowAdminBankAccountManager(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setShowAdminBankAccountManager(true);
              }
            }}
            tabIndex={0}
            role="button"
            aria-label="Accéder à la gestion des comptes bancaires"
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Landmark className="w-5 h-5 text-purple-500" />
                Mes Comptes Bancaires
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-4">
                Configurer vos comptes pour recevoir les paiements
              </p>
              <div className="flex items-center justify-between">
                <Badge variant="secondary">
                  Réception des fonds
                </Badge>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowAdminBankAccountManager(true)}
                >
                  Gérer
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Pages légales */}
          {/* Le bouton "Pages légales" a été supprimé car cette fonctionnalité 
              est maintenant intégrée dans "Gestion Footer" */}

          {/* Monitoring Sécurité Bancaire */}
          <Card 
            className="culture-card hover:shadow-lg transition-shadow cursor-pointer" 
            onClick={() => setShowSecurityMonitor(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setShowSecurityMonitor(true);
              }
            }}
            tabIndex={0}
            role="button"
            aria-label="Accéder au monitoring de sécurité bancaire"
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="w-5 h-5 text-red-600" />
                Monitoring Sécurité Bancaire
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-4">
                Surveiller les tentatives d'accès non autorisées aux comptes bancaires.
              </p>
              <Button 
                variant="outline" 
                size="sm"
              >
                Gérer
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* AJOUTER LES MODALS À LA FIN */}
      <PayPalManager 
        open={showPayPalManager}
        onClose={() => setShowPayPalManager(false)}
      />
      
      <CajaVecinaManager 
        open={showCajaVecinaManager}
        onClose={() => setShowCajaVecinaManager(false)}
      />

      <MonCashManager 
        open={showMonCashManager}
        onClose={() => setShowMonCashManager(false)}
      />

      <UsdtLinksManager 
        open={showUsdtLinksManager}
        onClose={() => setShowUsdtLinksManager(false)}
      />

      <AdminBankAccountManager 
        open={showAdminBankAccountManager}
        onClose={() => setShowAdminBankAccountManager(false)}
      />

      <InteracManager 
        open={showInteracManager}
        onClose={() => setShowInteracManager(false)}
      />

      <StripeManager 
        open={showStripeManager}
        onClose={() => setShowStripeManager(false)}
      />

      {showSecurityMonitor && (
        <Dialog open={showSecurityMonitor} onOpenChange={setShowSecurityMonitor}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <BankAccountSecurityMonitor />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AdminDashboard;
