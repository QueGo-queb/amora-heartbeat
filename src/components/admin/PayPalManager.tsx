import { useState } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  DollarSign, 
  Save,
  Mail,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { usePayPal } from '@/hooks/usePayPal';

interface PayPalManagerProps {
  open: boolean;
  onClose: () => void;
}

export const PayPalManager = ({ open, onClose }: PayPalManagerProps) => {
  const { config, loading, updateConfig } = usePayPal();
  const [email, setEmail] = useState(config?.paypal_email || '');
  const [isEditing, setIsEditing] = useState(!config);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      return;
    }

    try {
      await updateConfig(email);
      setIsEditing(false);
    } catch (error) {
      console.error('Erreur mise à jour PayPal:', error);
    }
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-blue-500" />
            Configuration PayPal
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Statut actuel */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Statut de la configuration</CardTitle>
            </CardHeader>
            <CardContent>
              {config ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <div>
                      <div className="font-medium">PayPal configuré</div>
                      <div className="text-sm text-gray-600">{config.paypal_email}</div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Actif
                  </Badge>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                  <div>
                    <div className="font-medium">PayPal non configuré</div>
                    <div className="text-sm text-gray-600">
                      Ajoutez votre email PayPal pour activer les paiements
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Formulaire de configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {isEditing ? 'Configurer PayPal' : 'Modifier la configuration'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!isEditing && config ? (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Mail className="w-4 h-4 text-gray-600" />
                      <span className="font-medium">Email PayPal actuel</span>
                    </div>
                    <div className="text-lg">{config.paypal_email}</div>
                  </div>
                  
                  <Button 
                    onClick={() => {
                      setEmail(config.paypal_email);
                      setIsEditing(true);
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    Modifier l'email PayPal
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="paypal_email">Email PayPal *</Label>
                    <Input
                      id="paypal_email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="votre-email@paypal.com"
                      required
                    />
                    {email && !validateEmail(email) && (
                      <p className="text-sm text-red-600">
                        Veuillez entrer une adresse email valide
                      </p>
                    )}
                  </div>

                  <Alert>
                    <AlertCircle className="w-4 h-4" />
                    <AlertDescription>
                      <strong>Important :</strong> Assurez-vous que cet email correspond à votre compte PayPal Business 
                      et que vous avez activé les paiements instantanés (IPN) si nécessaire.
                    </AlertDescription>
                  </Alert>

                  <div className="flex gap-3">
                    {config && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsEditing(false)}
                      >
                        Annuler
                      </Button>
                    )}
                    <Button 
                      type="submit" 
                      disabled={loading || !email || !validateEmail(email)}
                      className="flex-1"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {loading ? 'Sauvegarde...' : 'Sauvegarder'}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Informations sur PayPal */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg text-blue-800">
                Comment ça fonctionne ?
              </CardTitle>
            </CardHeader>
            <CardContent className="text-blue-700">
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-200 flex items-center justify-center text-xs font-bold mt-0.5">
                    1
                  </div>
                  <div>
                    <strong>Configuration :</strong> Entrez l'email de votre compte PayPal Business
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-200 flex items-center justify-center text-xs font-bold mt-0.5">
                    2
                  </div>
                  <div>
                    <strong>Paiement :</strong> Les utilisateurs sont redirigés vers PayPal pour payer
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-200 flex items-center justify-center text-xs font-bold mt-0.5">
                    3
                  </div>
                  <div>
                    <strong>Confirmation :</strong> Le plan Premium est activé automatiquement après paiement
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};