/**
 * Page de configuration admin
 * Permet de gérer les paramètres de l'application
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Settings, 
  Save,
  Globe,
  Shield,
  Database,
  Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    siteName: 'Amora',
    siteDescription: 'Trouvez votre âme sœur',
    maintenanceMode: false,
    emailConfirmation: true,
    maxFileSize: 5,
    defaultLanguage: 'fr',
    notifications: true,
    analytics: true
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAccess();
    loadSettings();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.email !== 'clodenerc@yahoo.fr') {
      navigate('/');
      return;
    }
  };

  const loadSettings = async () => {
    // Charger les paramètres depuis la base de données
    // Pour l'instant, on utilise les valeurs par défaut
  };

  const handleSaveSettings = async () => {
    setLoading(true);

    try {
      // Sauvegarder les paramètres dans la base de données
      toast({
        title: "Paramètres sauvegardés",
        description: "Les modifications ont été enregistrées avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les paramètres",
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
            <span className="text-xl font-bold">Configuration</span>
          </div>
          
          <Button onClick={handleSaveSettings} disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Paramètres généraux */}
          <Card className="culture-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Paramètres généraux
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">Nom du site</Label>
                <Input
                  id="siteName"
                  value={settings.siteName}
                  onChange={(e) => setSettings(prev => ({ ...prev, siteName: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteDescription">Description du site</Label>
                <Input
                  id="siteDescription"
                  value={settings.siteDescription}
                  onChange={(e) => setSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Langue par défaut</Label>
                <Select value={settings.defaultLanguage} onValueChange={(value) => setSettings(prev => ({ ...prev, defaultLanguage: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ht">Kreyòl</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="ptBR">Português</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="maintenanceMode">Mode maintenance</Label>
                <Switch
                  id="maintenanceMode"
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, maintenanceMode: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Paramètres de sécurité */}
          <Card className="culture-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Sécurité
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="emailConfirmation">Confirmation email obligatoire</Label>
                <Switch
                  id="emailConfirmation"
                  checked={settings.emailConfirmation}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, emailConfirmation: checked }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxFileSize">Taille max des fichiers (MB)</Label>
                <Input
                  id="maxFileSize"
                  type="number"
                  value={settings.maxFileSize}
                  onChange={(e) => setSettings(prev => ({ ...prev, maxFileSize: parseInt(e.target.value) }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Paramètres de notifications */}
          <Card className="culture-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="notifications">Notifications activées</Label>
                <Switch
                  id="notifications"
                  checked={settings.notifications}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, notifications: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Paramètres d'analytics */}
          <Card className="culture-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="analytics">Analytics activés</Label>
                <Switch
                  id="analytics"
                  checked={settings.analytics}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, analytics: checked }))}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminSettings;