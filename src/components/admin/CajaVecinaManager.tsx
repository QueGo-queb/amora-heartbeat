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
import { 
  Plus, 
  Building2, 
  CreditCard, 
  Save,
  Trash2,
  Eye
} from 'lucide-react';
import { useCajaVecina } from '@/hooks/useCajaVecina';

interface CajaVecinaManagerProps {
  open: boolean;
  onClose: () => void;
}

export const CajaVecinaManager = ({ open, onClose }: CajaVecinaManagerProps) => {
  const { accounts, loading, createAccount } = useCajaVecina();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    account_number: '',
    account_name: '',
    rut: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAccount(formData);
      setFormData({ account_number: '', account_name: '', rut: '' });
      setShowForm(false);
    } catch (error) {
      console.error('Erreur création compte:', error);
    }
  };

  const generateRUT = () => {
    // Générer un RUT chilien valide
    const number = Math.floor(Math.random() * 99999999) + 1;
    const checkDigit = calculateCheckDigit(number);
    return `${number.toLocaleString('es-CL')}-${checkDigit}`;
  };

  const calculateCheckDigit = (rut: number): string => {
    let sum = 0;
    let multiplier = 2;
    
    while (rut > 0) {
      sum += (rut % 10) * multiplier;
      rut = Math.floor(rut / 10);
      multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }
    
    const remainder = sum % 11;
    const checkDigit = 11 - remainder;
    
    if (checkDigit === 11) return '0';
    if (checkDigit === 10) return 'K';
    return checkDigit.toString();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-500" />
            Gestion des comptes Caja Vecina
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Bouton d'ajout */}
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Gérez les comptes Caja Vecina disponibles pour les paiements Premium
            </p>
            <Button 
              onClick={() => setShowForm(true)}
              className="btn-hero"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un compte
            </Button>
          </div>

          {/* Formulaire d'ajout */}
          {showForm && (
            <Card className="border-2 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg">Nouveau compte Caja Vecina</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="account_number">Numéro de compte</Label>
                      <Input
                        id="account_number"
                        value={formData.account_number}
                        onChange={(e) => setFormData(prev => ({ ...prev, account_number: e.target.value }))}
                        placeholder="Ex: 1234567890"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="account_name">Nom du titulaire</Label>
                      <Input
                        id="account_name"
                        value={formData.account_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, account_name: e.target.value }))}
                        placeholder="Ex: Juan Pérez"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="rut">RUT</Label>
                      <div className="flex gap-2">
                        <Input
                          id="rut"
                          value={formData.rut}
                          onChange={(e) => setFormData(prev => ({ ...prev, rut: e.target.value }))}
                          placeholder="Ex: 12.345.678-9"
                          required
                        />
                        <Button 
                          type="button"
                          variant="outline"
                          onClick={() => setFormData(prev => ({ ...prev, rut: generateRUT() }))}
                        >
                          Générer
                        </Button>
                      </div>
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

          {/* Liste des comptes */}
          <div className="space-y-4">
            <h3 className="font-semibold">Comptes actifs ({accounts.length})</h3>
            
            {accounts.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-gray-500">
                  <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Aucun compte Caja Vecina configuré</p>
                  <p className="text-sm">Ajoutez un compte pour permettre les paiements chiliens</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {accounts.map((account) => (
                  <Card key={account.id} className="culture-card">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          <CreditCard className="w-4 h-4" />
                          {account.account_name}
                        </CardTitle>
                        <Badge variant="secondary">Actif</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="text-sm">
                        <span className="font-medium">Compte:</span> {account.account_number}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">RUT:</span> {account.rut}
                      </div>
                      
                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          Voir
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-1" />
                          Désactiver
                        </Button>
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