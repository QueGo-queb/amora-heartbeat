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
import { 
  Plus, 
  Edit, 
  Trash2, 
  DollarSign,
  Save,
  Check,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { usePremiumPricing } from '@/hooks/usePremiumPricing';
import { convertPriceFromUSD, formatPrice } from '@/lib/currencyConverter';
import { useToast } from '@/hooks/use-toast';

interface PremiumPricingManagerProps {
  open: boolean;
  onClose: () => void;
}

export const PremiumPricingManager = ({ open, onClose }: PremiumPricingManagerProps) => {
  const { prices, activePricing, loading, savePricing, activatePricing, deletePricing } = usePremiumPricing();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    price_usd: '',
    is_active: false
  });
  const [converting, setConverting] = useState(false);
  const [convertedPrices, setConvertedPrices] = useState<any>(null);
  const { toast } = useToast();

  // Convertir automatiquement quand le prix USD change
  const handleUSDPriceChange = async (usdPrice: string) => {
    setFormData(prev => ({ ...prev, price_usd: usdPrice }));
    
    const numPrice = parseFloat(usdPrice);
    if (numPrice > 0) {
      setConverting(true);
      try {
        const converted = await convertPriceFromUSD(numPrice);
        setConvertedPrices(converted);
      } catch (error) {
        console.error('Erreur conversion:', error);
        toast({
          title: "Erreur de conversion",
          description: "Impossible de récupérer les taux de change",
          variant: "destructive",
        });
      } finally {
        setConverting(false);
      }
    } else {
      setConvertedPrices(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!convertedPrices) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir un prix USD valide",
        variant: "destructive",
      });
      return;
    }

    try {
      await savePricing({
        price_usd: convertedPrices.price_usd,
        price_eur: convertedPrices.price_eur,
        price_cad: convertedPrices.price_cad,
        price_clp: convertedPrices.price_clp,
        price_htg: convertedPrices.price_htg,
        currency: 'USD',
        exchange_rates: convertedPrices.rates,
        is_active: formData.is_active
      });
      
      setShowForm(false);
      setEditingId(null);
      resetForm();
    } catch (error) {
      console.error('Erreur sauvegarde prix:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      price_usd: '',
      is_active: false
    });
    setConvertedPrices(null);
  };

  const handleEdit = (price: any) => {
    setFormData({
      price_usd: price.price_usd.toString(),
      is_active: price.is_active
    });
    setEditingId(price.id);
    setShowForm(true);
    // Recharger les conversions pour ce prix
    handleUSDPriceChange(price.price_usd.toString());
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-500" />
            Gestion des Prix Premium
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Prix actuel */}
          {activePricing && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-800">Prix Actuel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                  <div>
                    <span className="font-medium">USD:</span> {formatPrice(activePricing.price_usd, 'USD')}
                  </div>
                  <div>
                    <span className="font-medium">EUR:</span> {activePricing.price_eur ? formatPrice(activePricing.price_eur, 'EUR') : 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">CAD:</span> {activePricing.price_cad ? formatPrice(activePricing.price_cad, 'CAD') : 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">CLP:</span> {activePricing.price_clp ? formatPrice(activePricing.price_clp, 'CLP') : 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">HTG:</span> {activePricing.price_htg ? formatPrice(activePricing.price_htg, 'HTG') : 'N/A'}
                  </div>
                </div>
                {activePricing.updated_at && (
                  <p className="text-xs text-green-600 mt-2">
                    Dernière mise à jour: {new Date(activePricing.updated_at).toLocaleString('fr-FR')}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Message d'information */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">💡 Conversion automatique des devises</p>
                  <p>Saisissez uniquement le prix en USD. Les prix dans les autres devises sont calculés automatiquement selon les taux de change actuels.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bouton d'ajout */}
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Historique des prix ({prices.length})</h3>
            <Button 
              onClick={() => {
                resetForm();
                setEditingId(null);
                setShowForm(true);
              }}
              className="btn-hero"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouveau prix
            </Button>
          </div>

          {/* Formulaire */}
          {showForm && (
            <Card className="border-2 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg">
                  {editingId ? 'Modifier le prix' : 'Nouveau prix'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Prix USD */}
                  <div className="space-y-2">
                    <Label htmlFor="price_usd" className="text-base font-medium">
                      Prix en USD ($) *
                    </Label>
                    <Input
                      id="price_usd"
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={formData.price_usd}
                      onChange={(e) => handleUSDPriceChange(e.target.value)}
                      placeholder="Ex: 29.99"
                      required
                      className="text-lg"
                    />
                  </div>

                  {/* Aperçu des conversions */}
                  {converting && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Conversion en cours...
                    </div>
                  )}

                  {convertedPrices && !converting && (
                    <Card className="bg-gray-50 border-gray-200">
                      <CardHeader>
                        <CardTitle className="text-sm text-gray-700">
                          Aperçu des prix convertis
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium">EUR:</span> {formatPrice(convertedPrices.price_eur, 'EUR')}
                          </div>
                          <div>
                            <span className="font-medium">CAD:</span> {formatPrice(convertedPrices.price_cad, 'CAD')}
                          </div>
                          <div>
                            <span className="font-medium">CLP:</span> {formatPrice(convertedPrices.price_clp, 'CLP')}
                          </div>
                          <div>
                            <span className="font-medium">HTG:</span> {formatPrice(convertedPrices.price_htg, 'HTG')}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Taux mis à jour: {new Date(convertedPrices.last_updated).toLocaleString('fr-FR')}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Activer immédiatement */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Switch
                        checked={formData.is_active}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                      />
                      Activer ce prix immédiatement
                    </Label>
                    {formData.is_active && (
                      <p className="text-xs text-orange-600">
                        ⚠️ Cela désactivera automatiquement le prix actuellement actif
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowForm(false)}
                    >
                      Annuler
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={loading || converting || !convertedPrices}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {loading ? 'Sauvegarde...' : 'Sauvegarder'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Liste des prix */}
          <div className="space-y-4">
            {prices.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-gray-500">
                  <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg mb-2">Aucun prix configuré</p>
                  <p className="text-sm">Définissez le premier prix premium pour votre application</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {prices.map((price) => (
                  <Card key={price.id} className={`${price.is_active ? 'ring-2 ring-green-500' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-lg font-semibold">{formatPrice(price.price_usd, 'USD')}</span>
                            {price.is_active && (
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                <Check className="w-3 h-3 mr-1" />
                                Actif
                              </Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
                            {price.price_eur && <div>EUR: {formatPrice(price.price_eur, 'EUR')}</div>}
                            {price.price_cad && <div>CAD: {formatPrice(price.price_cad, 'CAD')}</div>}
                            {price.price_clp && <div>CLP: {formatPrice(price.price_clp, 'CLP')}</div>}
                            {price.price_htg && <div>HTG: {formatPrice(price.price_htg, 'HTG')}</div>}
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            Créé le {new Date(price.created_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        
                        <div className="flex gap-2">
                          {!price.is_active && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => activatePricing(price.id)}
                              disabled={loading}
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Activer
                            </Button>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEdit(price)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          {!price.is_active && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => deletePricing(price.id)}
                              className="text-red-600"
                              disabled={loading}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};