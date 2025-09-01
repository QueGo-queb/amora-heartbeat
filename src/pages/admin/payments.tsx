/**
 * Page de gestion des paiements et abonnements
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
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Transaction {
  id: string;
  user_id: string;
  amount_cents: number;
  currency: string;
  stripe_payment_intent_id: string;
  status: 'created' | 'succeeded' | 'failed';
  created_at: string;
  user?: {
    email: string;
    full_name?: string;
  };
}

const AdminPayments = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAccess();
    loadTransactions();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.email !== 'clodenerc@yahoo.fr') {
      navigate('/');
      return;
    }
  };

  const loadTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          user:profiles(email, full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error loading transactions:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les transactions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'succeeded': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'created': return <Clock className="w-4 h-4 text-yellow-500" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'created': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.user?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.stripe_payment_intent_id.includes(searchTerm);
    
    if (filter === 'all') return matchesSearch;
    return matchesSearch && transaction.status === filter;
  });

  const totalRevenue = transactions
    .filter(t => t.status === 'succeeded')
    .reduce((sum, t) => sum + t.amount_cents, 0) / 100;

  const exportTransactions = () => {
    const csvContent = [
      ['ID', 'Email', 'Montant', 'Devise', 'Statut', 'Date', 'Stripe ID'],
      ...filteredTransactions.map(t => [
        t.id,
        t.user?.email || '',
        (t.amount_cents / 100).toFixed(2),
        t.currency,
        t.status,
        new Date(t.created_at).toLocaleDateString(),
        t.stripe_payment_intent_id
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transactions-amora.csv';
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
          <span className="text-lg">Chargement des paiements...</span>
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
            <span className="text-xl font-bold">Paiements & Abonnements</span>
          </div>
          
          <Button onClick={exportTransactions} className="flex items-center gap-2">
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
              <CardTitle className="text-sm font-medium">Revenus Totaux</CardTitle>
              <DollarSign className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Toutes les transactions réussies
              </p>
            </CardContent>
          </Card>

          <Card className="culture-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transactions Réussies</CardTitle>
              <CheckCircle className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {transactions.filter(t => t.status === 'succeeded').length}
              </div>
            </CardContent>
          </Card>

          <Card className="culture-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transactions Échouées</CardTitle>
              <XCircle className="w-4 h-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {transactions.filter(t => t.status === 'failed').length}
              </div>
            </CardContent>
          </Card>

          <Card className="culture-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En Attente</CardTitle>
              <Clock className="w-4 h-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {transactions.filter(t => t.status === 'created').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Rechercher par email ou ID Stripe..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrer par statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les transactions</SelectItem>
              <SelectItem value="succeeded">Réussies</SelectItem>
              <SelectItem value="failed">Échouées</SelectItem>
              <SelectItem value="created">En attente</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Transactions Table */}
        <Card className="culture-card">
          <CardHeader>
            <CardTitle>Transactions ({filteredTransactions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Utilisateur</th>
                    <th className="text-left p-2">Montant</th>
                    <th className="text-left p-2">Statut</th>
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Stripe ID</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        <div>
                          <div className="font-medium">{transaction.user?.email}</div>
                          <div className="text-sm text-gray-600">{transaction.user?.full_name}</div>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="font-medium">
                          ${(transaction.amount_cents / 100).toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-600">{transaction.currency.toUpperCase()}</div>
                      </td>
                      <td className="p-2">
                        <Badge className={getStatusColor(transaction.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(transaction.status)}
                            {transaction.status}
                          </div>
                        </Badge>
                      </td>
                      <td className="p-2 text-sm text-gray-600">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-2">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {transaction.stripe_payment_intent_id.slice(-8)}
                        </code>
                      </td>
                      <td className="p-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/admin/payments/${transaction.id}`)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredTransactions.length === 0 && (
              <div className="text-center py-12">
                <CreditCard className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucune transaction trouvée</h3>
                <p className="text-muted-foreground">
                  {searchTerm || filter !== 'all' 
                    ? "Aucune transaction ne correspond aux critères de recherche."
                    : "Aucune transaction enregistrée pour le moment."
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

export default AdminPayments;
