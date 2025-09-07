/**
 * Page de gestion des paiements et abonnements - CORRIGÉE
 * Surveille les transactions et gère les abonnements
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  DollarSign, 
  CreditCard, 
  TrendingUp, 
  Calendar,
  Download,
  Filter,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Crown,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import HeaderAdmin from '@/components/admin/HeaderAdmin';

interface Subscription {
  id: string;
  user_id: string;
  plan: string;
  start_date: string;
  end_date?: string;
  status: string;
  created_at: string;
  profiles?: {
    email: string;
    full_name?: string;
  };
}

const AdminPayments = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAccess();
    loadPaymentsData();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.email !== 'clodenerc@yahoo.fr') {
      navigate('/');
      return;
    }
  };

  const loadPaymentsData = async () => {
    try {
      setLoading(true);
      
      // Essayer d'abord de charger les abonnements premium
      const { data: subsData, error: subsError } = await supabase
        .from('profiles')
        .select('id, email, full_name, plan, premium_since, created_at')
        .not('plan', 'is', null);

      if (subsError) {
        console.error('Erreur abonnements:', subsError);
      }

      // Transformer les données en format subscription
      const subscriptionsData = subsData?.map(profile => ({
        id: profile.id,
        user_id: profile.id,
        plan: profile.plan || 'free',
        start_date: profile.premium_since || profile.created_at,
        status: profile.plan === 'premium' ? 'active' : 'inactive',
        created_at: profile.created_at,
        profiles: {
          email: profile.email,
          full_name: profile.full_name
        }
      })) || [];

      setSubscriptions(subscriptionsData);
      
      toast({
        title: "Données chargées",
        description: `${subscriptionsData.length} abonnement(s) trouvé(s)`,
      });

    } catch (error) {
      console.error('Error loading payments data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données de paiement",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'inactive': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredSubscriptions = subscriptions.filter(subscription => {
    const matchesSearch = subscription.profiles?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subscription.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'premium') return matchesSearch && subscription.plan === 'premium';
    if (filter === 'free') return matchesSearch && subscription.plan === 'free';
    return matchesSearch && subscription.status === filter;
  });

  const premiumUsers = subscriptions.filter(s => s.plan === 'premium').length;
  const freeUsers = subscriptions.filter(s => s.plan === 'free').length;
  const totalRevenue = premiumUsers * 29.99; // Estimation basée sur le prix premium

  const exportData = () => {
    const csvContent = [
      ['Email', 'Nom', 'Plan', 'Statut', 'Date début', 'Date création'],
      ...filteredSubscriptions.map(s => [
        s.profiles?.email || '',
        s.profiles?.full_name || '',
        s.plan,
        s.status,
        new Date(s.start_date).toLocaleDateString(),
        new Date(s.created_at).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'abonnements-amora.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-lg">Chargement des paiements...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <HeaderAdmin 
        title="Paiements & Abonnements"
        showBackButton={true}
        backTo="/admin"
        backLabel="Admin principal"
      />

      <main className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          
          {/* En-tête avec actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold">Paiements & Abonnements</h1>
              <p className="text-muted-foreground">
                Gérez les abonnements et suivez les revenus
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={loadPaymentsData} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualiser
              </Button>
              <Button onClick={exportData} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exporter
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="culture-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenus Estimés</CardTitle>
                <DollarSign className="w-4 h-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  Basé sur {premiumUsers} abonnements premium
                </p>
              </CardContent>
            </Card>

            <Card className="culture-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Utilisateurs Premium</CardTitle>
                <Crown className="w-4 h-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{premiumUsers}</div>
                <p className="text-xs text-muted-foreground">
                  Abonnements actifs
                </p>
              </CardContent>
            </Card>

            <Card className="culture-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Utilisateurs Gratuits</CardTitle>
                <CheckCircle className="w-4 h-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{freeUsers}</div>
                <p className="text-xs text-muted-foreground">
                  Comptes gratuits
                </p>
              </CardContent>
            </Card>

            <Card className="culture-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taux de Conversion</CardTitle>
                <TrendingUp className="w-4 h-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {subscriptions.length > 0 ? ((premiumUsers / subscriptions.length) * 100).toFixed(1) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Gratuit vers Premium
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filtres */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Filtres</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Rechercher par email ou nom..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filtrer par plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les plans</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="free">Gratuit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Liste des abonnements */}
          <Card className="culture-card">
            <CardHeader>
              <CardTitle>Abonnements ({filteredSubscriptions.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredSubscriptions.length === 0 ? (
                <div className="text-center py-12">
                  <CreditCard className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Aucun abonnement trouvé</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || filter !== 'all' 
                      ? "Aucun abonnement ne correspond aux critères de recherche."
                      : "Aucun abonnement enregistré pour le moment."
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredSubscriptions.map((subscription) => (
                    <div key={subscription.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {subscription.profiles?.full_name?.charAt(0) || subscription.profiles?.email?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div className="font-semibold">{subscription.profiles?.full_name || 'Nom non renseigné'}</div>
                          <div className="text-sm text-muted-foreground">{subscription.profiles?.email}</div>
                          <div className="text-xs text-muted-foreground">
                            Depuis: {new Date(subscription.start_date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <Badge variant={subscription.plan === 'premium' ? 'default' : 'secondary'}>
                          {subscription.plan === 'premium' ? (
                            <>
                              <Crown className="w-3 h-3 mr-1" />
                              Premium
                            </>
                          ) : (
                            'Gratuit'
                          )}
                        </Badge>
                        
                        <Badge className={getStatusColor(subscription.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(subscription.status)}
                            {subscription.status}
                          </div>
                        </Badge>

                        <div className="text-sm text-muted-foreground">
                          {new Date(subscription.created_at).toLocaleDateString()}
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => console.log('Voir détails:', subscription.id)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminPayments;
