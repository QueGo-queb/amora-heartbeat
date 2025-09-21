/**
 * Formulaire sécurisé pour les paiements Caja Vecina
 * Avec upload de reçu et vérification admin obligatoire
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileImage, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { useSecureCajaVecina } from '@/hooks/useSecureCajaVecina';
import { useCajaVecina } from '@/hooks/useCajaVecina';
import { AMORA_PRICING, formatPrice } from '@/constants/pricing';

export function SecureCajaVecinaForm() {
  const [selectedAccount, setSelectedAccount] = useState('');
  const [amount, setAmount] = useState(AMORA_PRICING.premium.monthly.usd.toString()); // ✅ CORRECTION: "9.99"
  const [transactionRef, setTransactionRef] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { accounts } = useCajaVecina();
  const { loading, submitPaymentForVerification } = useSecureCajaVecina();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validation du fichier
      if (file.size > 5 * 1024 * 1024) { // 5MB max
        setError('Le fichier ne doit pas dépasser 5MB');
        return;
      }
      
      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
        setError('Seuls les fichiers JPG et PNG sont acceptés');
        return;
      }

      setReceiptFile(file);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validations
    if (!selectedAccount) {
      setError('Veuillez sélectionner un compte Caja Vecina');
      return;
    }

    if (!receiptFile) {
      setError('Le reçu de paiement est obligatoire');
      return;
    }

    if (!transactionRef.trim()) {
      setError('La référence de transaction est obligatoire');
      return;
    }

    const numAmount = parseFloat(amount);
    if (numAmount < AMORA_PRICING.minimum.usd) { // ✅ CORRECTION: 9.99
      setError(`Le montant minimum est de ${formatPrice(AMORA_PRICING.minimum.usd)}`);
      return;
    }

    try {
      const result = await submitPaymentForVerification(
        selectedAccount,
        numAmount,
        receiptFile,
        transactionRef.trim()
      );

      if (result.success) {
        // Reset du formulaire
        setSelectedAccount('');
        setTransactionRef('');
        setReceiptFile(null);
      }
    } catch (error) {
      console.error('Erreur soumission paiement:', error);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center gap-2 justify-center">
          <img src="/flags/cl.png" alt="Chili" className="w-6 h-6" />
          Paiement Caja Vecina
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Paiement sécurisé avec vérification manuelle
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Sélection du compte */}
          <div className="space-y-2">
            <Label>Compte de destination *</Label>
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="w-full p-2 border rounded-md"
              required
            >
              <option value="">Choisir un compte</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.account_name} - {account.account_number}
                </option>
              ))}
            </select>
          </div>

          {/* Montant */}
          <div className="space-y-2">
            <Label>Montant (USD) *</Label>
            <Input
              type="number"
              step="0.01"
              min="29.99"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="29.99"
              required
            />
            <p className="text-xs text-muted-foreground">
              Minimum : $29.99 USD pour l'abonnement Premium mensuel
            </p>
          </div>

          {/* Référence de transaction */}
          <div className="space-y-2">
            <Label>Référence de transaction *</Label>
            <Input
              value={transactionRef}
              onChange={(e) => setTransactionRef(e.target.value)}
              placeholder="Ex: CV123456789"
              required
            />
            <p className="text-xs text-muted-foreground">
              Numéro de référence fourni par Caja Vecina
            </p>
          </div>

          {/* Upload du reçu */}
          <div className="space-y-2">
            <Label>Reçu de paiement *</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <input
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                onChange={handleFileChange}
                className="hidden"
                id="receipt-upload"
                required
              />
              <label htmlFor="receipt-upload" className="cursor-pointer">
                <div className="text-center">
                  {receiptFile ? (
                    <div className="flex items-center gap-2 justify-center text-green-600">
                      <FileImage className="w-5 h-5" />
                      <span className="text-sm">{receiptFile.name}</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 mx-auto text-gray-400" />
                      <p className="text-sm text-gray-600">
                        Cliquez pour télécharger le reçu
                      </p>
                      <p className="text-xs text-gray-500">
                        JPG, PNG - Max 5MB
                      </p>
                    </div>
                  )}
                </div>
              </label>
            </div>
          </div>

          {/* Instructions */}
          <Alert>
            <Clock className="w-4 h-4" />
            <AlertDescription>
              <strong>Processus de vérification :</strong>
              <ol className="list-decimal list-inside mt-2 space-y-1 text-xs">
                <li>Effectuez le paiement vers le compte sélectionné</li>
                <li>Téléchargez le reçu de Caja Vecina</li>
                <li>Saisissez la référence de transaction</li>
                <li>Notre équipe vérifiera sous 24h</li>
                <li>Activation automatique après approbation</li>
              </ol>
            </AlertDescription>
          </Alert>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                Soumission en cours...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Soumettre pour vérification
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
