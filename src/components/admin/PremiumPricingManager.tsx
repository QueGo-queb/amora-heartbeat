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
  AlertCircle
} from 'lucide-react';
import { usePremiumPricing } from '@/hooks/usePremiumPricing';

interface PremiumPricingManagerProps {
  open: boolean;
  onClose: () => void;
}

export const PremiumPricingManager = ({ open, onClose }: PremiumPricingManagerProps) => {
  const { prices, activePricing, loading, savePricing, activatePricing, deletePricing } = usePremiumPricing();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    price_usd: 29.99,
    price_eur: 27.99,
    price_cad: 39.99,
    price_clp: 29000,
    price_htg: 3999,
    currency: 'USD',
    is_active: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await savePricing(formData);
      setShowForm(false);
      setEditingId(null);
      resetForm();
    } catch (error) {
      console.error('Erreur sauvegarde prix:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      price_usd: 29.99,
      price_eur: 27.99,
      price_cad: 39.99,
      price_clp: 29000,
      price_htg: 3999,
      currency: 'USD',
      is_active: false
    });
  };

  const handleEdit = (price: any) => {
    setFormData({
      price_usd: price.price_usd,
      price_eur: price.price_eur || 27.99,
      price_cad: price.price_cad || 39.99,
      price_clp: price.price_clp || 29000,
      price_htg: price.price_htg || 3999,
      currency: price.currency,
      is_active: price.is_active
    });
    setEditingId(price.id);
    setShowForm(true);
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
                    <span className="font-medium">USD:</span> ${activePricing.price_usd}
                  </div>
                  <div>
                    <span className="font-medium">EUR:</span> €{activePricing.price_eur || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">CAD:</span> ${activePricing.price_cad || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">CLP:</span> ${activePricing.price_clp || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">HTG:</span> {activePricing.price_htg || 'N/A'} G
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

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
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price_usd">Prix USD ($) *</Label>
                      <Input
                        id="price_usd"
                        type="number"
                        step="0.01"
                        value={formData.price_usd}
                        onChange={(e) => setFormData(prev => ({ ...prev, price_usd: parseFloat(e.target.value) }))}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="price_eur">Prix EUR (€)</Label>
                      <Input
                        id="price_eur"
                        type="number"
                        step="0.01"
                        value={formData.price_eur}
                        onChange={(e) => setFormData(prev => ({ ...prev, price_eur: parseFloat(e.target.value) }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="price_cad">Prix CAD ($)</Label>
                      <Input
                        id="price_cad"
                        type="number"
                        step="0.01"
                        value={formData.price_cad}
                        onChange={(e) => setFormData(prev => ({ ...prev, price_cad: parseFloat(e.target.value) }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="price_clp">Prix CLP ($)</Label>
                      <Input
                        id="price_clp"
                        type="number"
                        value={formData.price_clp}
                        onChange={(e) => setFormData(prev => ({ ...prev, price_clp: parseInt(e.target.value) }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="price_htg">Prix HTG (Gourde)</Label>
                      <Input
                        id="price_htg"
                        type="number"
                        step="0.01"
                        value={formData.price_htg}
                        onChange={(e) => setFormData(prev => ({ ...prev, price_htg: parseFloat(e.target.value) }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Switch
                          checked={formData.is_active}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                        />
                        Activer immédiatement
                      </Label>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowForm(false)}
                    >
                      Annuler
                    </Button>
                    <Button type="submit" disabled={loading}>
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
                  <p>Aucun prix configuré</p>
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
                            <span className="text-lg font-semibold">${price.price_usd} USD</span>
                            {price.is_active && (
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                <Check className="w-3 h-3 mr-1" />
                                Actif
                              </Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
                            {price.price_eur && <div>EUR: €{price.price_eur}</div>}
                            {price.price_cad && <div>CAD: ${price.price_cad}</div>}
                            {price.price_clp && <div>CLP: ${price.price_clp}</div>}
                            {price.price_htg && <div>HTG: {price.price_htg}G</div>}
                          </div>
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