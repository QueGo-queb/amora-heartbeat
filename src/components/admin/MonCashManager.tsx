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
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Smartphone, 
  Save,
  Pause,
  Play,
  CheckCircle,
  AlertCircle,
  Phone
} from 'lucide-react';
import { useMonCash } from '@/hooks/useMonCash';

interface MonCashManagerProps {
  open: boolean;
  onClose: () => void;
}

export const MonCashManager = ({ open, onClose }: MonCashManagerProps) => {
  const { config, loading, updateConfig, togglePause } = useMonCash();
  const [isEditing, setIsEditing] = useState(!config);
  const [formData, setFormData] = useState({
    phone_number: config?.phone_number || '',
    account_name: config?.account_name || '',
    is_active: config?.is_active ?? true,
    is_paused: config?.is_paused ?? false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.phone_number || !formData.account_name) {
      return;
    }

    try {
      await updateConfig(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Erreur mise à jour MonCash:', error);
    }
  };

  const handleTogglePause = async () => {
    if (!config) return;
    await togglePause(!config.is_paused);
  };

  const validatePhoneNumber = (phone: string) => {
    // Format haïtien : +509 XXXX XXXX
    const phoneRegex = /^\+509\s\d{4}\s\d{4}$/;
    return phoneRegex.test(phone);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-green-500" />
            Configuration MonCash
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Statut actuel */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Statut de MonCash</CardTitle>
            </CardHeader>
            <CardContent>
              {config ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <div>
                        <div className="font-medium">MonCash configuré</div>
                        <div className="text-sm text-gray-600">{config.phone_number}</div>
                        <div className="text-sm text-gray-600">{config.account_name}</div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge 
                        variant="secondary" 
                        className={config.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                      >
                        {config.is_active ? 'Actif' : 'Inactif'}
                      </Badge>
                      {config.is_active && (
                        <Badge 
                          variant="secondary" 
                          className={config.is_paused ? "bg-orange-100 text-orange-800" : "bg-blue-100 text-blue-800"}
                        >
                          {config.is_paused ? 'En pause' : 'Disponible'}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Bouton pause/reprise */}
                  {config.is_active && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={handleTogglePause}
                        disabled={loading}
                        className={config.is_paused ? "text-green-600" : "text-orange-600"}
                      >
                        {config.is_paused ? (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Reprendre MonCash
                          </>
                        ) : (
                          <>
                            <Pause className="w-4 h-4 mr-2" />
                            Mettre en pause
                          </>
                        )}
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={() => {
                          setFormData({
                            phone_number: config.phone_number,
                            account_name: config.account_name,
                            is_active: config.is_active,
                            is_paused: config.is_paused
                          });
                          setIsEditing(true);
                        }}
                      >
                        Modifier
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                  <div>
                    <div className="font-medium">MonCash non configuré</div>
                    <div className="text-sm text-gray-600">
                      Ajoutez vos informations MonCash pour activer les paiements
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Formulaire de configuration */}
          {isEditing && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {config ? 'Modifier MonCash' : 'Configurer MonCash'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone_number">Numéro de téléphone MonCash *</Label>
                    <Input
                      id="phone_number"
                      value={formData.phone_number}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone_number: e.target.value }))}
                      placeholder="+509 0000 0000"
                      required
                    />
                    {formData.phone_number && !validatePhoneNumber(formData.phone_number) && (
                      <p className="text-sm text-red-600">
                        Format requis : +509 XXXX XXXX
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="account_name">Nom du titulaire *</Label>
                    <Input
                      id="account_name"
                      value={formData.account_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, account_name: e.target.value }))}
                      placeholder="Ex: Jean Baptiste"
                      required
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="is_active">Activer MonCash</Label>
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                    />
                  </div>

                  <Alert>
                    <Phone className="w-4 h-4" />
                    <AlertDescription>
                      <strong>Important :</strong> Assurez-vous que ce numéro MonCash est actif 
                      et peut recevoir des paiements. Les utilisateurs enverront de l'argent à ce numéro.
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
                      disabled={loading || !formData.phone_number || !formData.account_name || !validatePhoneNumber(formData.phone_number)}
                      className="flex-1"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {loading ? 'Sauvegarde...' : 'Sauvegarder'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Informations sur MonCash */}
          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-lg text-green-800">
                Comment ça fonctionne ?
              </CardTitle>
            </CardHeader>
            <CardContent className="text-green-700">
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-green-200 flex items-center justify-center text-xs font-bold mt-0.5">
                    1
                  </div>
                  <div>
                    <strong>Configuration :</strong> Ajoutez votre numéro MonCash pour recevoir les paiements
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-green-200 flex items-center justify-center text-xs font-bold mt-0.5">
                    2
                  </div>
                  <div>
                    <strong>Paiement :</strong> Les utilisateurs haïtiens envoient l'argent via MonCash
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-green-200 flex items-center justify-center text-xs font-bold mt-0.5">
                    3
                  </div>
                  <div>
                    <strong>Vérification :</strong> Vous validez manuellement les transactions reçues
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-green-200 flex items-center justify-center text-xs font-bold mt-0.5">
                    4
                  </div>
                  <div>
                    <strong>Pause :</strong> Utilisez le bouton pause pour désactiver temporairement
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
