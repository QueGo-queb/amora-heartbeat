/**
 * Page de communication admin
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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Ici vous pouvez implémenter l'envoi de notifications
      // via Supabase ou un service externe
      
      toast({
        title: "Message envoyé",
        description: "Le message a été envoyé avec succès.",
      });

      setMessageData({
        title: '',
        content: '',
        type: 'notification',
        target: 'all',
        priority: 'normal'
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
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
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Contenu</Label>
                  <Textarea
                    id="content"
                    value={messageData.content}
                    onChange={(e) => setMessageData(prev => ({ ...prev, content: e.target.value }))}
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
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="push">Push</SelectItem>
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
                  {loading ? 'Envoi...' : 'Envoyer'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Statistiques */}
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
                    <span>Taux d'ouverture</span>
                    <span className="font-medium">78%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Utilisateurs actifs</span>
                    <span className="font-medium">1,234</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="culture-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Actions rapides
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Mail className="w-4 h-4 mr-2" />
                    Envoyer newsletter
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Bell className="w-4 h-4 mr-2" />
                    Notification de maintenance
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="w-4 h-4 mr-2" />
                    Message aux nouveaux utilisateurs
                  </Button>
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
