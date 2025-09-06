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
import { 
  Coins, 
  Save, 
  Copy, 
  ExternalLink,
  AlertCircle,
  CheckCircle,
  QrCode
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUsdtLinks } from '@/hooks/useUsdtLinks';

interface UsdtLinksManagerProps {
  open: boolean;
  onClose: () => void;
}

export function UsdtLinksManager({ open, onClose }: UsdtLinksManagerProps) {
  const [formData, setFormData] = useState({
    trc20_address: '',
    erc20_address: '',
    trc20_qr_code: '',
    erc20_qr_code: ''
  });
  const [isAdmin, setIsAdmin] = useState(false);
  
  const { links, loading, saving, saveUsdtLinks, checkAdminAccess } = useUsdtLinks();
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      checkAdminAccess().then(setIsAdmin);
      
      // Charger les données existantes
      if (links) {
        setFormData({
          trc20_address: links.trc20_address || '',
          erc20_address: links.erc20_address || '',
          trc20_qr_code: links.trc20_qr_code || '',
          erc20_qr_code: links.erc20_qr_code || ''
        });
      }
    }
  }, [open, links, checkAdminAccess]);

  const handleSave = async () => {
    if (!formData.trc20_address && !formData.erc20_address) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir au moins une adresse USDT",
        variant: "destructive",
      });
      return;
    }

    const result = await saveUsdtLinks(
      formData.trc20_address,
      formData.erc20_address,
      formData.trc20_qr_code,
      formData.erc20_qr_code
    );

    if (result.success) {
      onClose();
    }
  };

  const copyAddress = async (address: string, network: string) => {
    try {
      await navigator.clipboard.writeText(address);
      toast({
        title: "Adresse copiée",
        description: `Adresse ${network} copiée dans le presse-papiers`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de copier l'adresse",
        variant: "destructive",
      });
    }
  };

  const validateAddress = (address: string, network: 'TRC20' | 'ERC20') => {
    if (!address) return null;
    
    if (network === 'TRC20') {
      return address.startsWith('T') && address.length === 34;
    } else {
      return address.startsWith('0x') && address.length === 42;
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="w-6 h-6 text-orange-500" />
            Gérer les liens USDT
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Statut actuel */}
          {links && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Configuration actuelle</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">TRC20</Badge>
                      {links.trc20_address ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-orange-500" />
                      )}
                    </div>
                    {links.trc20_address && (
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-gray-100 p-1 rounded flex-1">
                          {links.trc20_address}
                        </code>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyAddress(links.trc20_address!, 'TRC20')}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">ERC20</Badge>
                      {links.erc20_address ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-orange-500" />
                      )}
                    </div>
                    {links.erc20_address && (
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-gray-100 p-1 rounded flex-1">
                          {links.erc20_address}
                        </code>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyAddress(links.erc20_address!, 'ERC20')}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Formulaire de modification */}
          <Card>
            <CardHeader>
              <CardTitle>Modifier les adresses USDT</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* TRC20 */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800">TRC20 (Tron)</Badge>
                  <span className="text-sm text-gray-600">Frais réduits, confirmations rapides</span>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="trc20_address">Adresse TRC20</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="trc20_address"
                      placeholder="TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE"
                      value={formData.trc20_address}
                      onChange={(e) => setFormData(prev => ({ ...prev, trc20_address: e.target.value }))}
                      className={`font-mono text-sm ${
                        formData.trc20_address && !validateAddress(formData.trc20_address, 'TRC20')
                          ? 'border-red-500' 
                          : formData.trc20_address && validateAddress(formData.trc20_address, 'TRC20')
                          ? 'border-green-500'
                          : ''
                      }`}
                    />
                    {formData.trc20_address && validateAddress(formData.trc20_address, 'TRC20') && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                  {formData.trc20_address && !validateAddress(formData.trc20_address, 'TRC20') && (
                    <p className="text-xs text-red-600">
                      Adresse TRC20 invalide (doit commencer par 'T' et faire 34 caractères)
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="trc20_qr_code">URL QR Code TRC20 (optionnel)</Label>
                  <Input
                    id="trc20_qr_code"
                    placeholder="https://exemple.com/qr-trc20.png"
                    value={formData.trc20_qr_code}
                    onChange={(e) => setFormData(prev => ({ ...prev, trc20_qr_code: e.target.value }))}
                  />
                </div>
              </div>

              {/* ERC20 */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-100 text-blue-800">ERC20 (Ethereum)</Badge>
                  <span className="text-sm text-gray-600">Réseau principal, plus de compatibilité</span>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="erc20_address">Adresse ERC20</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="erc20_address"
                      placeholder="0x742d35Cc6634C0532925a3b8D4C9db96C4C2C7b4"
                      value={formData.erc20_address}
                      onChange={(e) => setFormData(prev => ({ ...prev, erc20_address: e.target.value }))}
                      className={`font-mono text-sm ${
                        formData.erc20_address && !validateAddress(formData.erc20_address, 'ERC20')
                          ? 'border-red-500' 
                          : formData.erc20_address && validateAddress(formData.erc20_address, 'ERC20')
                          ? 'border-green-500'
                          : ''
                      }`}
                    />
                    {formData.erc20_address && validateAddress(formData.erc20_address, 'ERC20') && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                  {formData.erc20_address && !validateAddress(formData.erc20_address, 'ERC20') && (
                    <p className="text-xs text-red-600">
                      Adresse ERC20 invalide (doit commencer par '0x' et faire 42 caractères)
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="erc20_qr_code">URL QR Code ERC20 (optionnel)</Label>
                  <Input
                    id="erc20_qr_code"
                    placeholder="https://exemple.com/qr-erc20.png"
                    value={formData.erc20_qr_code}
                    onChange={(e) => setFormData(prev => ({ ...prev, erc20_qr_code: e.target.value }))}
                  />
                </div>
              </div>

              {/* Informations importantes */}
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div className="space-y-2 text-sm">
                    <p className="font-medium text-yellow-800">Informations importantes :</p>
                    <ul className="list-disc list-inside space-y-1 text-yellow-700">
                      <li>Ces adresses seront visibles par tous les utilisateurs lors du paiement</li>
                      <li>Vérifiez soigneusement les adresses avant de sauvegarder</li>
                      <li>Les modifications sont appliquées immédiatement pour tous les utilisateurs</li>
                      <li>Gardez une sauvegarde de vos clés privées en sécurité</li>
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
              disabled={saving || loading || (!formData.trc20_address && !formData.erc20_address)}
              className="btn-hero"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Sauvegarde...' : 'Sauvegarder les liens'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}