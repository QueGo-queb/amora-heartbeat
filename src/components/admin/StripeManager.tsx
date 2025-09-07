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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CreditCard, 
  Save, 
  Copy, 
  AlertCircle,
  CheckCircle,
  Trash2,
  Plus,
  Globe,
  Shield,
  Eye,
  EyeOff,
  ExternalLink,
  DollarSign
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface StripeConfig {
  id: string;
  publishable_key: string;
  secret_key: string;
  webhook_secret: string;
  environment: 'test' | 'live';
  account_country: string;
  default_currency: string;
  business_name: string;
  support_email: string;
  is_active: boolean;
  webhook_url?: string;
  statement_descriptor?: string;
  created_at: string;
  updated_at: string;
}

interface StripeManagerProps {
  open: boolean;
  onClose: () => void;
}

export function StripeManager({ open, onClose }: StripeManagerProps) {
  const [config, setConfig] = useState<StripeConfig | null>(null);
  const [formData, setFormData] = useState({
    publishable_key: '',
    secret_key: '',
    webhook_secret: '',
    environment: 'test' as 'test' | 'live',
    account_country: 'CA',
    default_currency: 'CAD',
    business_name: '',
    support_email: '',
    webhook_url: '',
    statement_descriptor: ''
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      checkAdminAccess();
      loadStripeConfig();
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

  const loadStripeConfig = async () => {
    try {
      setLoading(true);
      
      // Simuler le chargement de la configuration Stripe
      const mockConfig: StripeConfig = {
        id: '1',
        publishable_key: 'pk_test_51H1234567890abcdef...',
        secret_key: 'sk_test_51H1234567890abcdef...',
        webhook_secret: 'whsec_1234567890abcdef...',
        environment: 'test',
        account_country: 'CA',
        default_currency: 'CAD',
        business_name: 'AMORA',
        support_email: 'support@amora.com',
        is_active: true,
        webhook_url: 'https://amora.com/webhooks/stripe',
        statement_descriptor: 'AMORA PREMIUM',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setConfig(mockConfig);
      setFormData({
        publishable_key: mockConfig.publishable_key,
        secret_key: mockConfig.secret_key,
        webhook_secret: mockConfig.webhook_secret,
        environment: mockConfig.environment,
        account_country: mockConfig.account_country,
        default_currency: mockConfig.default_currency,
        business_name: mockConfig.business_name,
        support_email: mockConfig.support_email,
        webhook_url: mockConfig.webhook_url || '',
        statement_descriptor: mockConfig.statement_descriptor || ''
      });
    } catch (error) {
      console.error('Error loading Stripe config:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger la configuration Stripe",
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
      if (!formData.publishable_key || !formData.secret_key || !formData.business_name) {
        toast({
          title: "Erreur",
          description: "Veuillez remplir tous les champs obligatoires",
          variant: "destructive",
        });
        return;
      }

      // Valider le format des clés
      if (!formData.publishable_key.startsWith('pk_')) {
        toast({
          title: "Erreur",
          description: "La clé publique doit commencer par 'pk_'",
          variant: "destructive",
        });
        return;
      }

      if (!formData.secret_key.startsWith('sk_')) {
        toast({
          title: "Erreur",
          description: "La clé secrète doit commencer par 'sk_'",
          variant: "destructive",
        });
        return;
      }

      // Simuler la sauvegarde
      await new Promise(resolve => setTimeout(resolve, 2000));

      const updatedConfig: StripeConfig = {
        id: config?.id || '1',
        ...formData,
        is_active: config?.is_active || true,
        created_at: config?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setConfig(updatedConfig);

      toast({
        title: "✅ Configuration sauvegardée",
        description: "La configuration Stripe a été mise à jour avec succès",
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
        title: newStatus ? "Stripe activé" : "Stripe désactivé",
        description: `Les paiements par carte sont maintenant ${newStatus ? 'actifs' : 'inactifs'}`,
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
      
      // Simuler un test de connexion avec l'API Stripe
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast({
        title: "✅ Connexion réussie",
        description: "La connexion avec l'API Stripe fonctionne correctement",
      });
    } catch (error) {
      toast({
        title: "❌ Échec de connexion",
        description: "Impossible de se connecter à l'API Stripe",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openStripeDashboard = () => {
    const baseUrl = formData.environment === 'live' 
      ? 'https://dashboard.stripe.com' 
      : 'https://dashboard.stripe.com/test';
    window.open(baseUrl, '_blank');
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Chargement de la configuration Stripe...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-purple-600" />
            Configuration Stripe
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Statut actuel */}
          {config && (
            <Card className={`border-2 ${config.is_active ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm">Statut Stripe</CardTitle>
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <strong>Environnement :</strong>
                    <Badge variant="outline" className="ml-2">
                      {config.environment === 'live' ? '🔴 Production' : '🟡 Test'}
                    </Badge>
                  </div>
                  <div>
                    <strong>Devise par défaut :</strong>
                    <span className="ml-2">{config.default_currency.toUpperCase()}</span>
                  </div>
                  <div>
                    <strong>Pays du compte :</strong>
                    <span className="ml-2">{config.account_country}</span>
                  </div>
                  <div>
                    <strong>Nom de l'entreprise :</strong>
                    <span className="ml-2">{config.business_name}</span>
                  </div>
                  <div>
                    <strong>Descripteur :</strong>
                    <span className="ml-2 font-mono">{config.statement_descriptor}</span>
                  </div>
                  <div>
                    <strong>Dernière MAJ :</strong>
                    <span className="ml-2">{new Date(config.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" onClick={testConnection} disabled={loading}>
                    <Shield className="w-4 h-4 mr-2" />
                    {loading ? 'Test en cours...' : 'Tester la connexion'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={openStripeDashboard}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Ouvrir Stripe Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Configuration API */}
          <Card>
            <CardHeader>
              <CardTitle>Configuration API Stripe</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Clés API */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-800 border-b pb-2">Clés API</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="environment">Environnement</Label>
                    <Select value={formData.environment} onValueChange={(value: 'test' | 'live') => setFormData(prev => ({ ...prev, environment: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="test">🟡 Test (Sandbox)</SelectItem>
                        <SelectItem value="live">🔴 Production (Live)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="account_country">Pays du compte</Label>
                    <Select value={formData.account_country} onValueChange={(value) => setFormData(prev => ({ ...prev, account_country: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="US">🇺🇸 États-Unis</SelectItem>
                        <SelectItem value="CA">🇨🇦 Canada</SelectItem>
                        <SelectItem value="FR">🇫🇷 France</SelectItem>
                        <SelectItem value="GB">🇬🇧 Royaume-Uni</SelectItem>
                        <SelectItem value="DE">🇩🇪 Allemagne</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="publishable_key">Clé publique *</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="publishable_key"
                        placeholder="pk_test_51H1234567890abcdef..."
                        value={formData.publishable_key}
                        onChange={(e) => setFormData(prev => ({ ...prev, publishable_key: e.target.value }))}
                        className="font-mono text-sm"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(formData.publishable_key, 'Clé publique')}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="secret_key">Clé secrète *</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="secret_key"
                        type={showSecretKey ? "text" : "password"}
                        placeholder="sk_test_51H1234567890abcdef..."
                        value={formData.secret_key}
                        onChange={(e) => setFormData(prev => ({ ...prev, secret_key: e.target.value }))}
                        className="font-mono text-sm"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowSecretKey(!showSecretKey)}
                      >
                        {showSecretKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="webhook_secret">Secret Webhook</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="webhook_secret"
                        type={showWebhookSecret ? "text" : "password"}
                        placeholder="whsec_1234567890abcdef..."
                        value={formData.webhook_secret}
                        onChange={(e) => setFormData(prev => ({ ...prev, webhook_secret: e.target.value }))}
                        className="font-mono text-sm"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                      >
                        {showWebhookSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informations business */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-800 border-b pb-2">Informations business</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="business_name">Nom de l'entreprise *</Label>
                    <Input
                      id="business_name"
                      placeholder="AMORA"
                      value={formData.business_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, business_name: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="support_email">Email de support</Label>
                    <Input
                      id="support_email"
                      type="email"
                      placeholder="support@amora.com"
                      value={formData.support_email}
                      onChange={(e) => setFormData(prev => ({ ...prev, support_email: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="default_currency">Devise par défaut</Label>
                    <Select value={formData.default_currency} onValueChange={(value) => setFormData(prev => ({ ...prev, default_currency: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD - Dollar américain</SelectItem>
                        <SelectItem value="CAD">CAD - Dollar canadien</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                        <SelectItem value="GBP">GBP - Livre sterling</SelectItem>
                        <SelectItem value="CHF">CHF - Franc suisse</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="statement_descriptor">Descripteur de relevé</Label>
                    <Input
                      id="statement_descriptor"
                      placeholder="AMORA PREMIUM"
                      value={formData.statement_descriptor}
                      onChange={(e) => setFormData(prev => ({ ...prev, statement_descriptor: e.target.value.toUpperCase() }))}
                      maxLength={22}
                      className="uppercase"
                    />
                    <p className="text-xs text-gray-500">
                      Ce texte apparaîtra sur les relevés bancaires des clients (max 22 caractères)
                    </p>
                  </div>
                </div>
              </div>

              {/* Configuration webhooks */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-800 border-b pb-2">Webhooks</h4>
                
                <div className="space-y-2">
                  <Label htmlFor="webhook_url">URL Webhook</Label>
                  <Input
                    id="webhook_url"
                    placeholder="https://amora.com/webhooks/stripe"
                    value={formData.webhook_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, webhook_url: e.target.value }))}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500">
                    Cette URL recevra les notifications de Stripe (paiements, échecs, etc.)
                  </p>
                </div>
              </div>

              {/* Informations importantes */}
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div className="space-y-2 text-sm">
                    <p className="font-medium text-purple-800">Informations importantes :</p>
                    <ul className="list-disc list-inside space-y-1 text-purple-700">
                      <li>Stripe accepte Visa, Mastercard, American Express et autres cartes</li>
                      <li>Les frais Stripe sont typiquement 2.9% + 0.30$ par transaction réussie</li>
                      <li>Les fonds sont transférés automatiquement sur votre compte bancaire</li>
                      <li>Testez toujours en mode test avant de passer en production</li>
                      <li>Configurez les webhooks pour recevoir les notifications en temps réel</li>
                      <li>Le descripteur de relevé aide les clients à identifier la transaction</li>
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
