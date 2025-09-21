/**
 * Formulaire sécurisé pour les paiements USDT
 * Avec vérification automatique sur blockchain
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Coins, Copy, ExternalLink, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { useSecureUsdtPayments } from '@/hooks/useSecureUsdtPayments';
import { useUsdtLinks } from '@/hooks/useUsdtLinks';
import { AMORA_PRICING, formatPrice } from '@/constants/pricing';

export function SecureUsdtForm() {
  const [network, setNetwork] = useState<'TRC20' | 'ERC20'>('TRC20');
  const [txHash, setTxHash] = useState('');
  const [amount] = useState(AMORA_PRICING.premium.monthly.usd); // ✅ CORRECTION: 9.99
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'payment' | 'verification'>('payment');

  const { links } = useUsdtLinks();
  const { loading, verifying, submitUsdtPayment } = useSecureUsdtPayments();

  const currentAddress = network === 'TRC20' ? links?.trc20_address : links?.erc20_address;

  const copyAddress = async () => {
    if (currentAddress) {
      try {
        await navigator.clipboard.writeText(currentAddress);
        // Toast success handled by the hook
      } catch (error) {
        setError('Impossible de copier l\'adresse');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation du hash de transaction
    if (!txHash.trim()) {
      setError('Le hash de transaction est obligatoire');
      return;
    }

    // Validation format selon le réseau
    if (network === 'TRC20' && !txHash.match(/^[a-fA-F0-9]{64}$/)) {
      setError('Hash de transaction TRC20 invalide (64 caractères hexadécimaux)');
      return;
    }

    if (network === 'ERC20' && !txHash.match(/^0x[a-fA-F0-9]{64}$/)) {
      setError('Hash de transaction ERC20 invalide (doit commencer par 0x)');
      return;
    }

    try {
      const result = await submitUsdtPayment(txHash.trim(), amount, network);
      
      if (result.success) {
        setStep('verification');
        setTxHash('');
      }
    } catch (error) {
      console.error('Erreur soumission USDT:', error);
    }
  };

  if (step === 'verification') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-2" />
          <CardTitle className="text-green-700">Paiement vérifié ✅</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Votre transaction USDT a été vérifiée sur la blockchain et votre compte Premium a été activé automatiquement !
          </p>
          <Button 
            onClick={() => window.location.reload()} 
            className="w-full"
          >
            Accéder aux fonctionnalités Premium
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center gap-2 justify-center">
          <Coins className="w-6 h-6 text-orange-500" />
          Paiement USDT
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Vérification automatique sur blockchain
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Sélection du réseau */}
        <div className="space-y-2">
          <Label>Réseau blockchain</Label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={network === 'TRC20' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setNetwork('TRC20')}
              className="flex-1"
            >
              <Badge className="bg-green-100 text-green-800 mr-2">TRC20</Badge>
              Tron (Frais faibles)
            </Button>
            <Button
              type="button"
              variant={network === 'ERC20' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setNetwork('ERC20')}
              className="flex-1"
            >
              <Badge className="bg-blue-100 text-blue-800 mr-2">ERC20</Badge>
              Ethereum
            </Button>
          </div>
        </div>

        {/* Adresse de paiement */}
        <div className="space-y-2">
          <Label>Adresse de paiement {network}</Label>
          <div className="flex items-center gap-2">
            <Input
              value={currentAddress || 'Adresse non configurée'}
              readOnly
              className="font-mono text-xs"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={copyAddress}
              disabled={!currentAddress}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Montant */}
        <div className="space-y-2">
          <Label>Montant à envoyer</Label>
          <Input
            value={`${amount} USDT`}
            readOnly
            className="font-semibold text-center"
          />
          <p className="text-xs text-center text-muted-foreground">
            Envoyez exactement ce montant vers l'adresse ci-dessus
          </p>
        </div>

        {/* Instructions */}
        <Alert>
          <Coins className="w-4 h-4" />
          <AlertDescription>
            <strong>Instructions :</strong>
            <ol className="list-decimal list-inside mt-2 space-y-1 text-xs">
              <li>Copiez l'adresse {network} ci-dessus</li>
              <li>Envoyez exactement {amount} USDT depuis votre wallet</li>
              <li>Copiez le hash de transaction</li>
              <li>Collez-le ci-dessous pour vérification automatique</li>
            </ol>
          </AlertDescription>
        </Alert>

        {/* Formulaire de vérification */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Hash de transaction *</Label>
            <Input
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
              placeholder={network === 'TRC20' ? 'a1b2c3d4e5f6...' : '0xa1b2c3d4e5f6...'}
              className="font-mono text-xs"
              required
            />
            <p className="text-xs text-muted-foreground">
              Hash de votre transaction {network} (64 caractères)
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button 
            type="submit" 
            disabled={loading || verifying || !currentAddress} 
            className="w-full"
          >
            {verifying ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Vérification blockchain...
              </>
            ) : loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Soumission...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Vérifier et activer Premium
              </>
            )}
          </Button>
        </form>

        {/* Lien vers explorateur blockchain */}
        {txHash && (
          <div className="text-center">
            <Button
              variant="link"
              size="sm"
              onClick={() => {
                const explorerUrl = network === 'TRC20'
                  ? `https://tronscan.org/#/transaction/${txHash}`
                  : `https://etherscan.io/tx/${txHash}`;
                window.open(explorerUrl, '_blank');
              }}
              className="text-xs"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              Voir sur {network === 'TRC20' ? 'TronScan' : 'Etherscan'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
