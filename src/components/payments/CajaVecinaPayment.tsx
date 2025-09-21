import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  ArrowLeft, 
  Upload, 
  MapPin,
  CreditCard,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useCajaVecina } from '@/hooks/useCajaVecina';
import { useToast } from '@/hooks/use-toast';
import { AMORA_PRICING, formatPrice } from '@/constants/pricing';

interface CajaVecinaPaymentProps {
  onBack: () => void;
}

export const CajaVecinaPayment = ({ onBack }: CajaVecinaPaymentProps) => {
  const { accounts, submitPayment, loading } = useCajaVecina();
  const { toast } = useToast();
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [transactionRef, setTransactionRef] = useState('');
  const [step, setStep] = useState<'select' | 'upload' | 'success'>('select');

  const handleAccountSelect = (accountId: string) => {
    setSelectedAccount(accountId);
    setStep('upload');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFile(file);
    }
  };

  const handleSubmit = async () => {
    if (!selectedAccount) return;

    try {
      await submitPayment(selectedAccount, AMORA_PRICING.premium.monthly.usd, receiptFile || undefined, transactionRef);
      setStep('success');
    } catch (error) {
      console.error('Erreur soumission:', error);
    }
  };

  if (step === 'success') {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
          <h3 className="text-xl font-semibold mb-2">Paiement soumis !</h3>
          <p className="text-gray-600 mb-4">
            Votre paiement est en cours de vérification. Vous recevrez une notification 
            une fois qu'il sera validé par notre équipe.
          </p>
          <Badge variant="secondary" className="mb-4">
            <Clock className="w-4 h-4 mr-1" />
            Vérification sous 24h
          </Badge>
          <div className="space-y-2">
            <Button onClick={onBack} variant="outline" className="w-full">
              Retour aux paramètres
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === 'upload') {
    const account = accounts.find(a => a.id === selectedAccount);
    
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setStep('select')}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-500" />
              Finaliser le paiement
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Informations du compte */}
          {account && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold mb-3">Informations de paiement</h4>
              <div className="space-y-2 text-sm">
                <div><strong>Titulaire:</strong> {account.account_name}</div>
                <div><strong>Numéro de compte:</strong> {account.account_number}</div>
                <div><strong>RUT:</strong> {account.rut}</div>
                <div><strong>Montant:</strong> {formatPrice(AMORA_PRICING.premium.monthly.usd)} (≈ 9,500 CLP)</div>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-semibold mb-3">Instructions</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Rendez-vous dans n'importe quelle Caja Vecina</li>
              <li>Effectuez un dépôt de 29,000 CLP sur le compte ci-dessus</li>
              <li>Conservez le reçu de transaction</li>
              <li>Téléchargez une photo claire du reçu ci-dessous</li>
            </ol>
          </div>

          {/* Upload du reçu */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="receipt">Reçu de transaction *</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Cliquez pour télécharger ou glissez votre reçu ici
                  </p>
                  <input
                    id="receipt"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => document.getElementById('receipt')?.click()}
                  >
                    Choisir un fichier
                  </Button>
                </div>
              </div>
              {receiptFile && (
                <p className="text-sm text-green-600">
                  ✓ Fichier sélectionné: {receiptFile.name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="transaction_ref">Référence de transaction (optionnel)</Label>
              <Input
                id="transaction_ref"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                placeholder="Ex: TXN123456789"
              />
            </div>
          </div>

          {/* Bouton de soumission */}
          <Button 
            onClick={handleSubmit}
            disabled={!receiptFile || loading}
            className="w-full btn-hero"
          >
            {loading ? 'Envoi en cours...' : 'Soumettre le paiement'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-500" />
            Paiement Caja Vecina
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-2 text-sm text-blue-600">
          <MapPin className="w-4 h-4" />
          <span>Disponible uniquement au Chili</span>
        </div>

        {accounts.length === 0 ? (
          <div className="text-center py-8">
            <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-600">
              Aucun compte Caja Vecina disponible pour le moment.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <h4 className="font-semibold">Choisissez un compte pour le paiement :</h4>
            
            {accounts.map((account) => (
              <Card 
                key={account.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleAccountSelect(account.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-6 h-6 text-blue-600" />
                      <div>
                        <div className="font-medium">{account.account_name}</div>
                        <div className="text-sm text-gray-600">
                          Compte: {account.account_number}
                        </div>
                        <div className="text-sm text-gray-600">
                          RUT: {account.rut}
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary">Actif</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
