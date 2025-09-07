/**
 * Page de modération - CORRIGÉE
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
  X,
  RefreshCw
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
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showPostModal, setShowPostModal] = useState(false);
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
      setLoading(true);
      
      // Simuler des données de signalements avec plus de réalisme
      const mockReports: Report[] = [
        {
          id: '1',
          reporter_id: 'user1',
          reported_user_id: 'user2',
          reason: 'Contenu inapproprié',
          description: 'L\'utilisateur a posté du contenu offensant dans son profil',
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
            content: 'Achetez maintenant ! Meilleure offre ! Cliquez ici ! Promotion exceptionnelle !',
            user_id: 'user4'
          }
        },
        {
          id: '3',
          reporter_id: 'user5',
          reported_post_id: 'post2',
          reason: 'Harcèlement',
          description: 'Messages agressifs répétés',
          status: 'pending',
          created_at: new Date(Date.now() - 172800000).toISOString(),
          reporter: {
            email: 'victim@example.com',
            full_name: 'Sophie Lemaire'
          },
          reported_post: {
            content: 'Tu es vraiment pathétique ! Je vais te faire regretter d\'être sur cette app !',
            user_id: 'user6'
          }
        }
      ];

      setReports(mockReports);
      
      toast({
        title: "Données chargées",
        description: `${mockReports.length} signalement(s) chargé(s)`,
      });
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

  // CORRECTION: Fonctions cliquables pour les actions
  const handleViewPost = (report: Report) => {
    if (report.reported_post) {
      setSelectedReport(report);
      setShowPostModal(true);
    } else {
      toast({
        title: "Information",
        description: "Ce signalement concerne un utilisateur, pas une publication",
      });
    }
  };

  const handleAcceptReport = async (reportId: string) => {
    try {
      setReports(prev => prev.map(report => 
        report.id === reportId 
          ? { ...report, status: 'resolved' }
          : report
      ));

      toast({
        title: "✅ Signalement accepté",
        description: "Le signalement a été marqué comme traité",
      });
    } catch (error) {
      console.error('Error accepting report:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'accepter le signalement",
        variant: "destructive",
      });
    }
  };

  const handleRejectReport = async (reportId: string) => {
    try {
      setReports(prev => prev.map(report => 
        report.id === reportId 
          ? { ...report, status: 'dismissed' }
          : report
      ));

      toast({
        title: "❌ Signalement rejeté",
        description: "Le signalement a été marqué comme non fondé",
      });
    } catch (error) {
      console.error('Error rejecting report:', error);
      toast({
        title: "Erreur",
        description: "Impossible de rejeter le signalement",
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
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-lg">Chargement de la modération...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <HeaderAdmin 
        title="Modération"
        showBackButton={true}
        backTo="/admin"
        backLabel="Admin principal"
      />

      <main className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          
          {/* En-tête avec actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold">Modération</h1>
              <p className="text-muted-foreground">
                Gérez les signalements et modérez le contenu ({reports.length} signalement{reports.length > 1 ? 's' : ''})
              </p>
            </div>
            
            <Button onClick={loadReports} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="culture-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">En attente</CardTitle>
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {reports.filter(r => r.status === 'pending').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Signalements à traiter
                </p>
              </CardContent>
            </Card>

            <Card className="culture-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Traités</CardTitle>
                <CheckCircle className="w-4 h-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {reports.filter(r => r.status === 'resolved').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Signalements acceptés
                </p>
              </CardContent>
            </Card>

            <Card className="culture-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rejetés</CardTitle>
                <X className="w-4 h-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {reports.filter(r => r.status === 'dismissed').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Signalements non fondés
                </p>
              </CardContent>
            </Card>

            <Card className="culture-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total</CardTitle>
                <Flag className="w-4 h-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reports.length}</div>
                <p className="text-xs text-muted-foreground">
                  Tous signalements
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
                    placeholder="Rechercher par raison, email..."
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
          <Card className="culture-card">
            <CardHeader>
              <CardTitle>Signalements ({filteredReports.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredReports.length === 0 ? (
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
              ) : (
                <div className="space-y-4">
                  {filteredReports.map((report) => (
                    <div key={report.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge className={getStatusColor(report.status)}>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(report.status)}
                                {report.status}
                              </div>
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {new Date(report.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                            <div>
                              <h4 className="font-semibold text-sm text-muted-foreground">Signalé par</h4>
                              <p className="font-medium">{report.reporter?.full_name}</p>
                              <p className="text-sm text-muted-foreground">{report.reporter?.email}</p>
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm text-muted-foreground">Contenu signalé</h4>
                              {report.reported_user ? (
                                <>
                                  <p className="font-medium">{report.reported_user.full_name}</p>
                                  <p className="text-sm text-muted-foreground">{report.reported_user.email}</p>
                                </>
                              ) : (
                                <>
                                  <p className="font-medium">Publication</p>
                                  <p className="text-sm text-muted-foreground">
                                    {report.reported_post?.content?.slice(0, 60)}...
                                  </p>
                                </>
                              )}
                            </div>
                          </div>
                          
                          <div className="mb-3">
                            <h4 className="font-semibold text-sm text-muted-foreground">Raison</h4>
                            <p className="font-medium">{report.reason}</p>
                            {report.description && (
                              <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 ml-4">
                          {/* CORRECTION: Boutons fonctionnels */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewPost(report)}
                            className="flex items-center gap-2"
                            title="Voir la publication"
                          >
                            <Eye className="w-4 h-4" />
                            Voir
                          </Button>
                          
                          {report.status === 'pending' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAcceptReport(report.id)}
                                className="flex items-center gap-2 text-green-600 hover:text-green-700 border-green-200"
                                title="Accepter le signalement"
                              >
                                <Check className="w-4 h-4" />
                                Accepter
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRejectReport(report.id)}
                                className="flex items-center gap-2 text-red-600 hover:text-red-700 border-red-200"
                                title="Rejeter le signalement"
                              >
                                <X className="w-4 h-4" />
                                Rejeter
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* CORRECTION: Modal pour voir les publications */}
      <Dialog open={showPostModal} onOpenChange={setShowPostModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Publication signalée</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedReport && (
              <>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Contenu de la publication :</h4>
                  <p className="text-gray-800">{selectedReport.reported_post?.content}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Raison du signalement :</h4>
                  <p className="text-gray-600">{selectedReport.reason}</p>
                  {selectedReport.description && (
                    <>
                      <h4 className="font-semibold mt-3 mb-2">Description :</h4>
                      <p className="text-gray-600">{selectedReport.description}</p>
                    </>
                  )}
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setShowPostModal(false)}>
                    Fermer
                  </Button>
                  {selectedReport.status === 'pending' && (
                    <>
                      <Button 
                        onClick={() => {
                          handleAcceptReport(selectedReport.id);
                          setShowPostModal(false);
                        }}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Accepter le signalement
                      </Button>
                      <Button 
                        onClick={() => {
                          handleRejectReport(selectedReport.id);
                          setShowPostModal(false);
                        }}
                        variant="destructive"
                      >
                        Rejeter le signalement
                      </Button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminModeration;
