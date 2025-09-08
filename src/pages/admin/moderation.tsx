/**
 * Page de modération - VERSION AVEC VRAIES DONNÉES UNIQUEMENT
 * Utilise la vraie table 'reports' de la base de données
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
  X,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import HeaderAdmin from '@/components/admin/HeaderAdmin';

interface Report {
  id: string;
  reporter_id: string;
  reported_user_id?: string;
  reported_post_id?: string;
  report_type: 'spam' | 'inappropriate' | 'harassment' | 'fake' | 'other';
  description?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  reviewed_by?: string;
  reviewed_at?: string;
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
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    reviewed: 0,
    resolved: 0,
    dismissed: 0
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAccess();
    loadReports();
  }, []);

  const checkAdminAccess = async () => {
    try {
      console.log('🔐 Vérification accès admin modération...');
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user || user.email !== 'clodenerc@yahoo.fr') {
        console.error('❌ Accès refusé à la modération');
        navigate('/');
        return;
      }
      
      console.log('✅ Accès admin modération autorisé');
    } catch (error) {
      console.error('❌ Erreur vérification admin:', error);
      navigate('/');
    }
  };

  const loadReports = async () => {
    try {
      setLoading(true);
      console.log('📊 === CHARGEMENT VRAIES DONNÉES REPORTS ===');
      
      // Charger les vrais signalements depuis la base de données
      const { data: reportsData, error: reportsError } = await supabase
        .from('reports')
        .select(`
          *,
          reporter:profiles!reports_reporter_id_fkey(email, full_name),
          reported_user:profiles!reports_reported_user_id_fkey(email, full_name),
          reported_post:posts!reports_reported_post_id_fkey(content, user_id)
        `)
        .order('created_at', { ascending: false });

      if (reportsError) {
        console.error('❌ Erreur chargement reports:', reportsError);
        throw reportsError;
      }

      console.log('✅ Reports chargés:', reportsData?.length || 0);
      console.log('📊 Données:', reportsData);

      setReports(reportsData || []);
      
      // Calculer les statistiques
      const newStats = {
        total: reportsData?.length || 0,
        pending: reportsData?.filter(r => r.status === 'pending').length || 0,
        reviewed: reportsData?.filter(r => r.status === 'reviewed').length || 0,
        resolved: reportsData?.filter(r => r.status === 'resolved').length || 0,
        dismissed: reportsData?.filter(r => r.status === 'dismissed').length || 0
      };
      
      setStats(newStats);
      console.log('📊 Statistiques:', newStats);
      
      toast({
        title: "✅ Données chargées",
        description: `${reportsData?.length || 0} signalement(s) réel(s) chargé(s)`,
      });

    } catch (error: any) {
      console.error('❌ Erreur complète loadReports:', error);
      
      // Si aucun signalement n'existe, c'est normal
      if (error.code === 'PGRST116' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
        console.log('ℹ️ Aucun signalement trouvé (normal si pas encore de données)');
        setReports([]);
        setStats({ total: 0, pending: 0, reviewed: 0, resolved: 0, dismissed: 0 });
        
        toast({
          title: "ℹ️ Aucun signalement",
          description: "Aucun signalement n'a été trouvé dans la base de données.",
        });
      } else {
        toast({
          title: "❌ Erreur",
          description: `Impossible de charger les signalements: ${error.message}`,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleViewPost = (report: Report) => {
    if (report.reported_post) {
      setSelectedReport(report);
      setShowPostModal(true);
    } else {
      toast({
        title: "ℹ️ Information",
        description: "Ce signalement concerne un utilisateur, pas une publication",
      });
    }
  };

  const handleAcceptReport = async (reportId: string) => {
    try {
      setLoadingAction(reportId);
      console.log('✅ Acceptation du signalement:', reportId);
      
      const { error } = await supabase
        .from('reports')
        .update({ 
          status: 'resolved',
          reviewed_by: (await supabase.auth.getUser()).data.user?.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', reportId);

      if (error) {
        console.error('❌ Erreur acceptation:', error);
        throw error;
      }

      // Recharger les données
      await loadReports();

      toast({
        title: "✅ Signalement accepté",
        description: "Le signalement a été traité et résolu.",
      });

    } catch (error: any) {
      console.error('❌ Erreur handleAcceptReport:', error);
      toast({
        title: "❌ Erreur",
        description: `Impossible d'accepter le signalement: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRejectReport = async (reportId: string) => {
    try {
      setLoadingAction(reportId);
      console.log('❌ Rejet du signalement:', reportId);
      
      const { error } = await supabase
        .from('reports')
        .update({ 
          status: 'dismissed',
          reviewed_by: (await supabase.auth.getUser()).data.user?.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', reportId);

      if (error) {
        console.error('❌ Erreur rejet:', error);
        throw error;
      }

      // Recharger les données
      await loadReports();

      toast({
        title: "✅ Signalement rejeté",
        description: "Le signalement a été rejeté.",
      });

    } catch (error: any) {
      console.error('❌ Erreur handleRejectReport:', error);
      toast({
        title: "❌ Erreur",
        description: `Impossible de rejeter le signalement: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleMarkAsReviewed = async (reportId: string) => {
    try {
      setLoadingAction(reportId);
      console.log('👁️ Marquage en cours de révision:', reportId);
      
      const { error } = await supabase
        .from('reports')
        .update({ 
          status: 'reviewed',
          reviewed_by: (await supabase.auth.getUser()).data.user?.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', reportId);

      if (error) {
        console.error('❌ Erreur marquage:', error);
        throw error;
      }

      // Recharger les données
      await loadReports();

      toast({
        title: "✅ Signalement en cours",
        description: "Le signalement est maintenant en cours de révision.",
      });

    } catch (error: any) {
      console.error('❌ Erreur handleMarkAsReviewed:', error);
      toast({
        title: "❌ Erreur",
        description: `Impossible de marquer le signalement: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoadingAction(null);
    }
  };

  // Filtrer les signalements
  const filteredReports = reports.filter(report => {
    const matchesFilter = filter === 'all' || report.status === filter;
    const matchesSearch = !searchTerm || 
      report.report_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reporter?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reported_user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case 'spam': return <MessageSquare className="w-4 h-4" />;
      case 'inappropriate': return <AlertTriangle className="w-4 h-4" />;
      case 'harassment': return <Ban className="w-4 h-4" />;
      case 'fake': return <User className="w-4 h-4" />;
      default: return <Flag className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="destructive">En attente</Badge>;
      case 'reviewed':
        return <Badge variant="secondary">En cours</Badge>;
      case 'resolved':
        return <Badge variant="default">Traité</Badge>;
      case 'dismissed':
        return <Badge variant="outline">Rejeté</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <HeaderAdmin />
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Chargement des signalements...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <HeaderAdmin />
      
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/admin')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Button>
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-orange-500" />
            <div>
              <h1 className="text-3xl font-bold">Modération</h1>
              <p className="text-muted-foreground">
                Gérer les signalements et modérer le contenu
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadReports}
            className="ml-auto gap-2"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <div className="flex items-center gap-2 mb-2">
                <Flag className="w-5 h-5 text-blue-500" />
                <span className="text-2xl font-bold">{stats.total}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Total signalements
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-red-500" />
                <span className="text-2xl font-bold">{stats.pending}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                En attente
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-5 h-5 text-yellow-500" />
                <span className="text-2xl font-bold">{stats.reviewed}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                En cours
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-2xl font-bold">{stats.resolved}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Traités
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <div className="flex items-center gap-2 mb-2">
                <X className="w-5 h-5 text-gray-500" />
                <span className="text-2xl font-bold">{stats.dismissed}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Rejetés
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
                  placeholder="Rechercher par type, description, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="reviewed">En cours</SelectItem>
                  <SelectItem value="resolved">Traités</SelectItem>
                  <SelectItem value="dismissed">Rejetés</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Liste des signalements */}
        {filteredReports.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-12">
              <Flag className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun signalement</h3>
              <p className="text-muted-foreground text-center">
                {reports.length === 0 
                  ? "Aucun signalement n'a été trouvé dans la base de données."
                  : "Aucun signalement ne correspond aux filtres sélectionnés."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        {getReportTypeIcon(report.report_type)}
                        <h3 className="font-semibold capitalize">
                          {report.report_type === 'spam' && 'Spam'}
                          {report.report_type === 'inappropriate' && 'Contenu inapproprié'}
                          {report.report_type === 'harassment' && 'Harcèlement'}
                          {report.report_type === 'fake' && 'Faux profil'}
                          {report.report_type === 'other' && 'Autre'}
                        </h3>
                        {getStatusBadge(report.status)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Signalé par</p>
                          <p className="font-medium">
                            {report.reporter?.full_name || 'Utilisateur anonyme'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {report.reporter?.email}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-muted-foreground">
                            {report.reported_user_id ? 'Utilisateur signalé' : 'Publication signalée'}
                          </p>
                          {report.reported_user ? (
                            <>
                              <p className="font-medium">
                                {report.reported_user.full_name || 'Utilisateur anonyme'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {report.reported_user.email}
                              </p>
                            </>
                          ) : (
                            <p className="font-medium">Publication #{report.reported_post_id?.slice(-8)}</p>
                          )}
                        </div>
                      </div>

                      {report.description && (
                        <div className="mb-4">
                          <p className="text-sm text-muted-foreground mb-1">Description</p>
                          <p className="text-sm bg-muted p-3 rounded-md">
                            {report.description}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Signalé le {formatDate(report.created_at)}</span>
                        {report.reviewed_at && (
                          <span>Traité le {formatDate(report.reviewed_at)}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      {report.reported_post && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewPost(report)}
                          className="gap-2"
                        >
                          <Eye className="w-3 h-3" />
                          Voir
                        </Button>
                      )}

                      {report.status === 'pending' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkAsReviewed(report.id)}
                            disabled={loadingAction === report.id}
                            className="gap-2"
                          >
                            {loadingAction === report.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Clock className="w-3 h-3" />
                            )}
                            En cours
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleAcceptReport(report.id)}
                            disabled={loadingAction === report.id}
                            className="gap-2"
                          >
                            {loadingAction === report.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Check className="w-3 h-3" />
                            )}
                            Accepter
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRejectReport(report.id)}
                            disabled={loadingAction === report.id}
                            className="gap-2"
                          >
                            {loadingAction === report.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <X className="w-3 h-3" />
                            )}
                            Rejeter
                          </Button>
                        </>
                      )}

                      {report.status === 'reviewed' && (
                        <>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleAcceptReport(report.id)}
                            disabled={loadingAction === report.id}
                            className="gap-2"
                          >
                            {loadingAction === report.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Check className="w-3 h-3" />
                            )}
                            Résoudre
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRejectReport(report.id)}
                            disabled={loadingAction === report.id}
                            className="gap-2"
                          >
                            {loadingAction === report.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <X className="w-3 h-3" />
                            )}
                            Rejeter
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Modal pour voir le contenu d'une publication */}
        <Dialog open={showPostModal} onOpenChange={setShowPostModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Contenu signalé</DialogTitle>
            </DialogHeader>
            {selectedReport?.reported_post && (
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm font-medium mb-2">Publication signalée :</p>
                  <p className="text-sm whitespace-pre-wrap">
                    {selectedReport.reported_post.content}
                  </p>
                </div>
                <div className="text-xs text-muted-foreground">
                  <p>Type : {selectedReport.report_type}</p>
                  {selectedReport.description && (
                    <p>Raison : {selectedReport.description}</p>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminModeration;
