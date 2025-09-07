/**
 * Page de communication admin - CORRIGÉE
 * Permet d'envoyer des notifications et messages aux utilisateurs
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Send, 
  MessageSquare, 
  Users, 
  Bell,
  Mail,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const AdminCommunication = () => {
  const [messageData, setMessageData] = useState({
    title: '',
    content: '',
    type: 'notification',
    target: 'all',
    priority: 'normal'
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.email !== 'clodenerc@yahoo.fr') {
      navigate('/');
      return;
    }
  };

  // CORRECTION: Fonction pour envoyer les messages avec intégration réelle
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Créer une notification système dans la base de données
      const { error: insertError } = await supabase
        .from('posts')
        .insert({
          content: `📢 ${messageData.title}\n\n${messageData.content}`,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          type: 'system_announcement',
          created_at: new Date().toISOString()
        });

      if (insertError) throw insertError;

      toast({
        title: "✅ Message envoyé",
        description: `Le message "${messageData.title}" a été publié dans le fil d'actualité`,
      });

      setMessageData({
        title: '',
        content: '',
        type: 'notification',
        target: 'all',
        priority: 'normal'
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // CORRECTION: Actions rapides fonctionnelles
  const handleQuickAction = async (actionType: string) => {
    setLoading(true);
    try {
      let messageContent = '';
      let messageTitle = '';

      switch (actionType) {
        case 'newsletter':
          messageTitle = '📬 Newsletter AMORA';
          messageContent = 'Découvrez les nouveautés et fonctionnalités de cette semaine sur AMORA ! Restez connectés pour ne rien manquer.';
          break;
        case 'maintenance':
          messageTitle = '🔧 Maintenance programmée';
          messageContent = 'Une maintenance est prévue ce soir de 23h à 1h du matin. Le service pourrait être temporairement indisponible. Merci de votre compréhension.';
          break;
        case 'welcome':
          messageTitle = '🎉 Bienvenue aux nouveaux membres !';
          messageContent = 'Un grand bienvenue à tous nos nouveaux membres qui nous ont rejoint cette semaine ! N\'hésitez pas à compléter votre profil et à explorer toutes les fonctionnalités.';
          break;
      }

      // Publier directement dans le fil d'actualité
      const { error } = await supabase
        .from('posts')
        .insert({
          content: `${messageTitle}\n\n${messageContent}`,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          type: 'system_announcement',
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "✅ Action effectuée",
        description: `${messageTitle} publié avec succès`,
      });
    } catch (error) {
      console.error('Error with quick action:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'effectuer l'action",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate('/admin')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour au dashboard
            </Button>
            <span className="text-xl font-bold">Communication</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulaire d'envoi */}
          <Card className="culture-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                Envoyer un message
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendMessage} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Titre</Label>
                  <Input
                    id="title"
                    value={messageData.title}
                    onChange={(e) => setMessageData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Entrez le titre du message..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Contenu</Label>
                  <Textarea
                    id="content"
                    value={messageData.content}
                    onChange={(e) => setMessageData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Rédigez votre message..."
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select value={messageData.type} onValueChange={(value) => setMessageData(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="notification">Notification</SelectItem>
                        <SelectItem value="announcement">Annonce</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Cible</Label>
                    <Select value={messageData.target} onValueChange={(value) => setMessageData(prev => ({ ...prev, target: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les utilisateurs</SelectItem>
                        <SelectItem value="premium">Utilisateurs premium</SelectItem>
                        <SelectItem value="new">Nouveaux utilisateurs</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  <Send className="w-4 h-4 mr-2" />
                  {loading ? 'Envoi en cours...' : 'Publier le message'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Statistiques et Actions rapides */}
          <div className="space-y-6">
            <Card className="culture-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Statistiques de communication
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Messages envoyés aujourd'hui</span>
                    <span className="font-medium">12</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Messages actifs</span>
                    <span className="font-medium">8</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Utilisateurs connectés</span>
                    <span className="font-medium">1,234</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CORRECTION: Actions rapides fonctionnelles */}
            <Card className="culture-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Actions rapides
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleQuickAction('newsletter')}
                    disabled={loading}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Envoyer newsletter
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleQuickAction('maintenance')}
                    disabled={loading}
                  >
                    <Bell className="w-4 h-4 mr-2" />
                    Notification de maintenance
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleQuickAction('welcome')}
                    disabled={loading}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Message aux nouveaux utilisateurs
                  </Button>
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    💡 Ces messages seront publiés automatiquement dans le fil d'actualité et visibles par tous les utilisateurs.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminCommunication;