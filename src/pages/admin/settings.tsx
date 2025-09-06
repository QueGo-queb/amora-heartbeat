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
  Bell,
  Coins,
  DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UsdtLinksManager } from '@/components/admin/UsdtLinksManager';
import { PremiumPricingManager } from '@/components/admin/PremiumPricingManager';

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
  const [showUsdtManager, setShowUsdtManager] = useState(false);
  const [showPricingManager, setShowPricingManager] = useState(false);
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
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/admin')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Settings className="w-6 h-6" />
              <h1 className="text-2xl font-bold">Paramètres Admin</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Paiements et Finance */}
          <Card className="culture-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-orange-500" />
                Paiements et Finance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  onClick={() => setShowUsdtManager(true)}
                  className="h-20 flex flex-col items-center justify-center gap-2"
                >
                  <Coins className="w-6 h-6 text-orange-500" />
                  <div className="text-center">
                    <div className="font-medium">Gérer les liens USDT</div>
                    <div className="text-xs text-gray-500">TRC20 et ERC20</div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => navigate('/admin/payments')}
                  className="h-20 flex flex-col items-center justify-center gap-2"
                >
                  <Database className="w-6 h-6 text-blue-500" />
                  <div className="text-center">
                    <div className="font-medium">Transactions</div>
                    <div className="text-xs text-gray-500">Historique des paiements</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Prix Premium */}
          <Card className="culture-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="w-5 h-5 text-green-500" />
                Prix Premium
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-4">
                Gérer les prix du plan Premium par devise
              </p>
              <div className="flex items-center justify-between">
                <Badge variant="secondary">
                  Tarification
                </Badge>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowPricingManager(true)}
                >
                  Gérer les prix
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Configuration générale */}
          <Card className="culture-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Configuration générale
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Nom du site</Label>
                  <Input
                    id="siteName"
                    value={settings.siteName}
                    onChange={(e) => setSettings(prev => ({ ...prev, siteName: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="defaultLanguage">Langue par défaut</Label>
                  <Select 
                    value={settings.defaultLanguage} 
                    onValueChange={(value) => setSettings(prev => ({ ...prev, defaultLanguage: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ht">Kreyòl</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteDescription">Description du site</Label>
                <Input
                  id="siteDescription"
                  value={settings.siteDescription}
                  onChange={(e) => setSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Sécurité */}
          <Card className="culture-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Sécurité
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Mode maintenance</Label>
                  <p className="text-sm text-gray-500">Désactiver temporairement l'application</p>
                </div>
                <Switch
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, maintenanceMode: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Confirmation email obligatoire</Label>
                  <p className="text-sm text-gray-500">Les utilisateurs doivent confirmer leur email</p>
                </div>
                <Switch
                  checked={settings.emailConfirmation}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, emailConfirmation: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="culture-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notifications système</Label>
                  <p className="text-sm text-gray-500">Envoyer des notifications aux utilisateurs</p>
                </div>
                <Switch
                  checked={settings.notifications}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, notifications: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Analytics</Label>
                  <p className="text-sm text-gray-500">Collecter des données d'utilisation</p>
                </div>
                <Switch
                  checked={settings.analytics}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, analytics: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Bouton de sauvegarde */}
          <div className="flex justify-end">
            <Button 
              onClick={handleSaveSettings}
              disabled={loading}
              className="btn-hero"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
            </Button>
          </div>
        </div>
      </main>

      {/* Modal de gestion USDT */}
      <UsdtLinksManager 
        open={showUsdtManager}
        onClose={() => setShowUsdtManager(false)}
      />

      {/* Modal de gestion des prix */}
      <PremiumPricingManager 
        open={showPricingManager}
        onClose={() => setShowPricingManager(false)}
      />
    </div>
  );
};

export default AdminSettings;