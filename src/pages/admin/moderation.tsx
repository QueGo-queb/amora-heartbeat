/**
 * Page de modération
 * Permet de gérer les signalements, modérer le contenu et bannir les utilisateurs
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Shield, 
  AlertTriangle, 
  Flag, 
  Ban,
  CheckCircle,
  Eye,
  MessageSquare,
  User,
  Filter,
  Search,
  Clock,
  Check,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Report {
  id: string;
  reporter_id: string;
  reported_user_id?: string;
  reported_post_id?: string;
  reason: string;
  description?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  created_at: string;
  reporter?: {
    email: string;
    full_name?: string;
  };
  reported_user?: {
    email: string;
    full_name?: string;
  };
  reported_post?: {
    content: string;
    user_id: string;
  };
}

const AdminModeration = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAccess();
    loadReports();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.email !== 'clodenerc@yahoo.fr') {
      navigate('/');
      return;
    }
  };

  const loadReports = async () => {
    try {
      // Simuler des données de signalements (en attendant la table reports)
      const mockReports: Report[] = [
        {
          id: '1',
          reporter_id: 'user1',
          reported_user_id: 'user2',
          reason: 'Contenu inapproprié',
          description: 'L\'utilisateur a posté du contenu offensant',
          status: 'pending',
          created_at: new Date().toISOString(),
          reporter: {
            email: 'reporter@example.com',
            full_name: 'Jean Dupont'
          },
          reported_user: {
            email: 'reported@example.com',
            full_name: 'Marie Martin'
          }
        },
        {
          id: '2',
          reporter_id: 'user3',
          reported_post_id: 'post1',
          reason: 'Spam',
          description: 'Publication répétitive et non pertinente',
          status: 'reviewed',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          reporter: {
            email: 'moderator@example.com',
            full_name: 'Pierre Durand'
          },
          reported_post: {
            content: 'Contenu spam détecté...',
            user_id: 'user4'
          }
        }
      ];

      setReports(mockReports);
    } catch (error) {
      console.error('Error loading reports:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les signalements",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReportAction = async (reportId: string, action: 'resolve' | 'dismiss' | 'ban') => {
    try {
      // Simuler l'action
      setReports(prev => prev.map(report => 
        report.id === reportId 
          ? { ...report, status: action === 'resolve' ? 'resolved' : 'dismissed' }
          : report
      ));

      toast({
        title: "Action effectuée",
        description: `Signalement ${action === 'resolve' ? 'résolu' : action === 'dismiss' ? 'rejeté' : 'utilisateur banni'}`,
      });
    } catch (error) {
      console.error('Error updating report:', error);
      toast({
        title: "Erreur",
        description: "Impossible de traiter le signalement",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'reviewed': return <Eye className="w-4 h-4 text-blue-500" />;
      case 'resolved': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'dismissed': return <X className="w-4 h-4 text-gray-500" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'reviewed': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'dismissed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.reporter?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.reported_user?.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    return matchesSearch && report.status === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="heart-logo">
            <div className="heart-shape animate-pulse" />
          </div>
          <span className="text-lg">Chargement de la modération...</span>
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
            <span className="text-xl font-bold">Modération</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-heart-red" />
            <span className="text-sm text-muted-foreground">Panel de modération</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="culture-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Signalements en attente</CardTitle>
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {reports.filter(r => r.status === 'pending').length}
              </div>
            </CardContent>
          </Card>

          <Card className="culture-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Signalements traités</CardTitle>
              <CheckCircle className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {reports.filter(r => r.status === 'resolved').length}
              </div>
            </CardContent>
          </Card>

          <Card className="culture-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Signalements rejetés</CardTitle>
              <X className="w-4 h-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {reports.filter(r => r.status === 'dismissed').length}
              </div>
            </CardContent>
          </Card>

          <Card className="culture-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total signalements</CardTitle>
              <Flag className="w-4 h-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reports.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Rechercher par raison, email..."
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
              <SelectItem value="all">Tous les signalements</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="reviewed">En cours</SelectItem>
              <SelectItem value="resolved">Résolus</SelectItem>
              <SelectItem value="dismissed">Rejetés</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Reports Table */}
        <Card className="culture-card">
          <CardHeader>
            <CardTitle>Signalements ({filteredReports.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Signalé par</th>
                    <th className="text-left p-2">Contenu signalé</th>
                    <th className="text-left p-2">Raison</th>
                    <th className="text-left p-2">Statut</th>
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map((report) => (
                    <tr key={report.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        <div>
                          <div className="font-medium">{report.reporter?.full_name}</div>
                          <div className="text-sm text-gray-600">{report.reporter?.email}</div>
                        </div>
                      </td>
                      <td className="p-2">
                        <div>
                          {report.reported_user ? (
                            <>
                              <div className="font-medium">{report.reported_user.full_name}</div>
                              <div className="text-sm text-gray-600">{report.reported_user.email}</div>
                            </>
                          ) : (
                            <>
                              <div className="font-medium">Publication</div>
                              <div className="text-sm text-gray-600">
                                {report.reported_post?.content?.slice(0, 50)}...
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="p-2">
                        <div>
                          <div className="font-medium">{report.reason}</div>
                          {report.description && (
                            <div className="text-sm text-gray-600">{report.description}</div>
                          )}
                        </div>
                      </td>
                      <td className="p-2">
                        <Badge className={getStatusColor(report.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(report.status)}
                            {report.status}
                          </div>
                        </Badge>
                      </td>
                      <td className="p-2 text-sm text-gray-600">
                        {new Date(report.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-2">
                        <div className="flex gap-1">
                          {report.status === 'pending' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleReportAction(report.id, 'resolve')}
                                className="text-green-600 hover:text-green-700"
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleReportAction(report.id, 'dismiss')}
                                className="text-gray-600 hover:text-gray-700"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleReportAction(report.id, 'ban')}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Ban className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/admin/moderation/${report.id}`)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredReports.length === 0 && (
              <div className="text-center py-12">
                <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucun signalement trouvé</h3>
                <p className="text-muted-foreground">
                  {searchTerm || filter !== 'all' 
                    ? "Aucun signalement ne correspond aux critères de recherche."
                    : "Aucun signalement en attente pour le moment."
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
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
                <User className="w-4 h-4" />
                Gérer les utilisateurs
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/admin/ads')}
                className="flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                Modérer les publicités
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/admin/analytics')}
                className="flex items-center gap-2"
              >
                <Shield className="w-4 h-4" />
                Voir les statistiques
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminModeration;
