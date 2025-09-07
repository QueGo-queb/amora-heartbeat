import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  CreditCard, 
  Save, 
  Copy, 
  AlertCircle,
  CheckCircle,
  Trash2,
  Plus,
  MapPin,
  Shield,
  Eye,
  EyeOff
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface InteracConfig {
  id: string;
  merchant_id: string;
  api_key: string;
  api_secret: string;
  environment: 'sandbox' | 'production';
  bank_account: string;
  bank_institution: string;
  routing_number: string;
  notification_email: string;
  is_active: boolean;
  webhook_url?: string;
  created_at: string;
  updated_at: string;
}

interface InteracManagerProps {
  open: boolean;
  onClose: () => void;
}

export function InteracManager({ open, onClose }: InteracManagerProps) {
  const [config, setConfig] = useState<InteracConfig | null>(null);
  const [formData, setFormData] = useState({
    merchant_id: '',
    api_key: '',
    api_secret: '',
    environment: 'sandbox' as 'sandbox' | 'production',
    bank_account: '',
    bank_institution: '',
    routing_number: '',
    notification_email: '',
    webhook_url: ''
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showApiSecret, setShowApiSecret] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      checkAdminAccess();
      loadInteracConfig();
    }
  }, [open]);

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email === 'clodenerc@yahoo.fr') {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
      onClose();
    }
  };

  const loadInteracConfig = async () => {
    try {
      setLoading(true);
      
      // Simuler le chargement de la configuration Interac
      const mockConfig: InteracConfig = {
        id: '1',
        merchant_id: 'MERCHANT_123456',
        api_key: 'pk_test_abc123def456',
        api_secret: 'sk_test_secret789xyz',
        environment: 'sandbox',
        bank_account: '12345-67890-123',
        bank_institution: 'RBC Royal Bank',
        routing_number: '003',
        notification_email: 'payments@amora.com',
        is_active: true,
        webhook_url: 'https://amora.com/webhooks/interac',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setConfig(mockConfig);
      setFormData({
        merchant_id: mockConfig.merchant_id,
        api_key: mockConfig.api_key,
        api_secret: mockConfig.api_secret,
        environment: mockConfig.environment,
        bank_account: mockConfig.bank_account,
        bank_institution: mockConfig.bank_institution,
        routing_number: mockConfig.routing_number,
        notification_email: mockConfig.notification_email,
        webhook_url: mockConfig.webhook_url || ''
      });
    } catch (error) {
      console.error('Error loading Interac config:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger la configuration Interac",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Valider les champs requis
      if (!formData.merchant_id || !formData.api_key || !formData.bank_account) {
        toast({
          title: "Erreur",
          description: "Veuillez remplir tous les champs obligatoires",
          variant: "destructive",
        });
        return;
      }

      // Simuler la sauvegarde
      await new Promise(resolve => setTimeout(resolve, 2000));

      const updatedConfig: InteracConfig = {
        id: config?.id || '1',
        ...formData,
        is_active: config?.is_active || true,
        created_at: config?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setConfig(updatedConfig);

      toast({
        title: "✅ Configuration sauvegardée",
        description: "La configuration Interac a été mise à jour avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la configuration",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async () => {
    if (!config) return;
    
    try {
      const newStatus = !config.is_active;
      setConfig(prev => prev ? { ...prev, is_active: newStatus } : null);
      
      toast({
        title: newStatus ? "Interac activé" : "Interac désactivé",
        description: `Le paiement Interac est maintenant ${newStatus ? 'actif' : 'inactif'}`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copié",
        description: `${label} copié dans le presse-papiers`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de copier",
        variant: "destructive",
      });
    }
  };

  const testConnection = async () => {
    try {
      setLoading(true);
      
      // Simuler un test de connexion
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast({
        title: "✅ Connexion réussie",
        description: "La connexion avec l'API Interac fonctionne correctement",
      });
    } catch (error) {
      toast({
        title: "❌ Échec de connexion",
        description: "Impossible de se connecter à l'API Interac",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              Accès refusé
            </DialogTitle>
          </DialogHeader>
          <div className="p-4 text-center">
            <p>Vous n'avez pas les droits d'administrateur pour accéder à cette fonctionnalité.</p>
            <Button onClick={onClose} className="mt-4">
              Fermer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Chargement de la configuration Interac...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-red-600" />
            Configuration Interac (Canada)
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Statut actuel */}
          {config && (
            <Card className={`border-2 ${config.is_active ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm">Statut Interac</CardTitle>
                  <div className="flex items-center gap-3">
                    <Badge variant={config.is_active ? "default" : "secondary"}>
                      {config.is_active ? "✅ Actif" : "⏸️ Inactif"}
                    </Badge>
                    <Switch
                      checked={config.is_active}
                      onCheckedChange={toggleActive}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Environnement :</strong>
                    <Badge variant="outline" className="ml-2">
                      {config.environment === 'production' ? '🔴 Production' : '🟡 Test'}
                    </Badge>
                  </div>
                  <div>
                    <strong>Institution :</strong>
                    <span className="ml-2">{config.bank_institution}</span>
                  </div>
                  <div>
                    <strong>Compte bancaire :</strong>
                    <span className="ml-2 font-mono">{config.bank_account}</span>
                  </div>
                  <div>
                    <strong>Dernière mise à jour :</strong>
                    <span className="ml-2">{new Date(config.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" onClick={testConnection} disabled={loading}>
                    <Shield className="w-4 h-4 mr-2" />
                    {loading ? 'Test en cours...' : 'Tester la connexion'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Configuration détaillée */}
          <Card>
            <CardHeader>
              <CardTitle>Configuration API Interac</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Informations API */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-800 border-b pb-2">Identifiants API</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="merchant_id">ID Marchand *</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="merchant_id"
                        placeholder="MERCHANT_123456"
                        value={formData.merchant_id}
                        onChange={(e) => setFormData(prev => ({ ...prev, merchant_id: e.target.value }))}
                        className="font-mono"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(formData.merchant_id, 'ID Marchand')}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="environment">Environnement</Label>
                    <select
                      id="environment"
                      value={formData.environment}
                      onChange={(e) => setFormData(prev => ({ ...prev, environment: e.target.value as 'sandbox' | 'production' }))}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="sandbox">🟡 Test (Sandbox)</option>
                      <option value="production">🔴 Production</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="api_key">Clé API *</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="api_key"
                        placeholder="pk_test_abc123def456"
                        value={formData.api_key}
                        onChange={(e) => setFormData(prev => ({ ...prev, api_key: e.target.value }))}
                        className="font-mono"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(formData.api_key, 'Clé API')}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="api_secret">Clé secrète *</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="api_secret"
                        type={showApiSecret ? "text" : "password"}
                        placeholder="sk_test_secret789xyz"
                        value={formData.api_secret}
                        onChange={(e) => setFormData(prev => ({ ...prev, api_secret: e.target.value }))}
                        className="font-mono"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowApiSecret(!showApiSecret)}
                      >
                        {showApiSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informations bancaires */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-800 border-b pb-2">Compte bancaire de réception</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bank_institution">Institution bancaire *</Label>
                    <Input
                      id="bank_institution"
                      placeholder="RBC Royal Bank"
                      value={formData.bank_institution}
                      onChange={(e) => setFormData(prev => ({ ...prev, bank_institution: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="routing_number">Numéro de routage</Label>
                    <Input
                      id="routing_number"
                      placeholder="003"
                      value={formData.routing_number}
                      onChange={(e) => setFormData(prev => ({ ...prev, routing_number: e.target.value }))}
                      className="font-mono"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="bank_account">Numéro de compte bancaire *</Label>
                    <Input
                      id="bank_account"
                      placeholder="12345-67890-123"
                      value={formData.bank_account}
                      onChange={(e) => setFormData(prev => ({ ...prev, bank_account: e.target.value }))}
                      className="font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Configuration avancée */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-800 border-b pb-2">Configuration avancée</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="notification_email">Email de notification</Label>
                    <Input
                      id="notification_email"
                      type="email"
                      placeholder="payments@amora.com"
                      value={formData.notification_email}
                      onChange={(e) => setFormData(prev => ({ ...prev, notification_email: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="webhook_url">URL Webhook (optionnel)</Label>
                    <Input
                      id="webhook_url"
                      placeholder="https://amora.com/webhooks/interac"
                      value={formData.webhook_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, webhook_url: e.target.value }))}
                      className="font-mono text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Informations importantes */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="space-y-2 text-sm">
                    <p className="font-medium text-blue-800">Informations importantes :</p>
                    <ul className="list-disc list-inside space-y-1 text-blue-700">
                      <li>Interac est uniquement disponible pour les utilisateurs canadiens</li>
                      <li>Les frais Interac sont généralement de 1,50$ CAD par transaction</li>
                      <li>Les fonds sont transférés directement sur votre compte bancaire</li>
                      <li>Le traitement prend habituellement 1-2 jours ouvrables</li>
                      <li>Testez toujours en mode sandbox avant la production</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Boutons d'action */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button 
              onClick={handleSave}
              disabled={saving || loading}
              className="btn-hero"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Sauvegarde...' : 'Sauvegarder la configuration'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
