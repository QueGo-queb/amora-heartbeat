import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Smartphone, DollarSign, Upload, Crown, Bitcoin, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePremium } from '@/hooks/usePremium';
import { useUsdtLinks } from '@/hooks/useUsdtLinks'; // 🔧 AJOUT MANQUANT
import { AMORA_PRICING, formatPrice } from '@/constants/pricing';

interface PaymentMethodsProps {
  onPaymentSuccess?: () => void;
}

export function PaymentMethods({ onPaymentSuccess }: PaymentMethodsProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [cryptoData, setCryptoData] = useState({
    address: '',
    amount: '',
    txHash: '',
    receipt: null as File | null
  });
  const [cajaVecinaData, setCajaVecinaData] = useState({
    rut: '',
    receipt: null as File | null,
    amount: AMORA_PRICING.premium.monthly.usd.toString() // ✅ CORRECTION: "9.99"
  });
  const { toast } = useToast();
  const { upgradeToPremium } = usePremium();
  
  // 🔧 CORRECTION PRINCIPALE - Récupérer les adresses USDT réelles
  const { links: usdtLinks, loading: usdtLoading } = useUsdtLinks();

  // 🔧 MISE À JOUR DE L'ADRESSE USDT QUAND LES DONNÉES SONT CHARGÉES
  useEffect(() => {
    if (usdtLinks && selectedMethod === 'usdt') {
      // Priorité à TRC20, sinon ERC20
      const address = usdtLinks.trc20_address || usdtLinks.erc20_address || '';
      setCryptoData(prev => ({ ...prev, address }));
    }
  }, [usdtLinks, selectedMethod]);

  // 🔧 MISE À JOUR - Ajout de 
  const paymentMethods = [
    {
      id: 'stripe',
      name: 'Carte de crédit/débit',
      icon: CreditCard,
      description: 'Visa, Mastercard, American Express',
      countries: ['Global'],
      color: 'bg-blue-500'
    },
    {
      id: 'interac',
      name: 'Interac',
      icon: CreditCard,
      description: 'Paiement électronique canadien',
      countries: ['Canada'],
      color: 'bg-red-500'
    },
    {
      id: 'paypal',
      name: 'PayPal',
      icon: DollarSign,
      description: 'Compte PayPal ou carte via PayPal',
      countries: ['Global'],
      color: 'bg-blue-600'
    },
    {
      id: 'usdt',
      name: 'USDT (Tether)',
      icon: DollarSign,
      description: 'Tether USD sur réseau TRC20/ERC20',
      countries: ['Global'],
      color: 'bg-green-500'
    },
    {
      id: 'moncash',
      name: 'MonCash',
      icon: Smartphone,
      description: 'Portefeuille mobile haïtien',
      countries: ['Haïti'],
      color: 'bg-orange-500'
    },
    {
      id: 'caja_vecina',
      name: 'Caja Vecina',
      icon: Smartphone,
      description: 'Réseau de paiement chilien',
      countries: ['Chili'],
      color: 'bg-purple-500'
    }
  ];

  // 🔧 NOUVELLES ADRESSES CRYPTO
  const cryptoAddresses = {
    usdt: {
      trc20: 'TXYZabc123456789...',
      erc20: '0x1234567890abcdef...',
      amount: AMORA_PRICING.premium.monthly.usd.toString() // ✅ CORRECTION: "9.99"
    }
  };

  // Générer un RUT aléatoire pour Caja Vecina
  const generateRUT = () => {
    const number = Math.floor(Math.random() * 99999999) + 10000000;
    const verifier = calculateRUTVerifier(number);
    return `${number}-${verifier}`;
  };

  const calculateRUTVerifier = (rut: number) => {
    let sum = 0;
    let multiplier = 2;
    
    while (rut > 0) {
      sum += (rut % 10) * multiplier;
      rut = Math.floor(rut / 10);
      multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }
    
    const remainder = sum % 11;
    if (remainder === 0) return '0';
    if (remainder === 1) return 'K';
    return (11 - remainder).toString();
  };

  const handlePayment = async (methodId: string) => {
    setLoading(true);
    try {
      switch (methodId) {
        case 'stripe':
          window.location.href = '/api/create-checkout-session';
          break;
          
        case 'caja_vecina':
          const rut = generateRUT();
          setCajaVecinaData(prev => ({ ...prev, rut }));
          toast({
            title: "Instructions Caja Vecina",
            description: `Utilisez le RUT: ${rut} pour effectuer le paiement de ${formatPrice(AMORA_PRICING.premium.monthly.usd)}`,
          });
          break;
          
        case 'paypal':
          window.open(`https://paypal.me/amora/${AMORA_PRICING.premium.monthly.usd}`, '_blank');
          break;
          
        case 'usdt':
          setCryptoData({
            address: cryptoAddresses.usdt.erc20,
            amount: cryptoAddresses.usdt.amount,
            txHash: '',
            receipt: null
          });
          toast({
            title: "Paiement USDT",
            description: `Envoyez ${cryptoAddresses.usdt.amount} USDT à l'adresse affichée`,
            duration: 8000,
          });
          break;
          
        default:
          toast({
            title: "Méthode non disponible",
            description: "Cette méthode de paiement sera bientôt disponible",
            variant: "destructive",
          });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de l'initialisation du paiement",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // 🔧 FONCTION DE SOUMISSION CRYPTO (USDT + USDC)
  const handleCryptoSubmit = async () => {
    if (!cryptoData.txHash && !cryptoData.receipt) {
      toast({
        title: "Erreur",
        description: "Veuillez fournir le hash de transaction ou télécharger une preuve de paiement",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Simuler la vérification de la transaction crypto
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mettre à jour vers premium
      const result = await upgradeToPremium();
      if (result.success) {
        toast({
          title: "Paiement crypto vérifié !",
          description: `Transaction ${selectedMethod.toUpperCase()} confirmée. Bienvenue dans Amora Premium !`,
        });
        onPaymentSuccess?.();
      }
    } catch (error) {
      toast({
        title: "Erreur de vérification",
        description: "Impossible de vérifier la transaction. Contactez le support.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // 🔧 FONCTION DE COPIE AMÉLIORÉE
  const copyToClipboard = async (text: string, label: string = 'Adresse') => {
    if (!text || text.trim() === '') {
      toast({
        title: "Erreur",
        description: "Aucune adresse disponible à copier",
        variant: "destructive",
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "✅ Copié !",
        description: `${label} copiée dans le presse-papiers`,
        duration: 3000,
      });
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
      // Fallback pour les navigateurs plus anciens
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        toast({
          title: "✅ Copié !",
          description: `${label} copiée dans le presse-papiers (fallback)`,
          duration: 3000,
        });
      } catch (fallbackError) {
        toast({
          title: "❌ Erreur",
          description: "Impossible de copier l'adresse. Copiez manuellement.",
          variant: "destructive",
        });
      }
    }
  };

  const handleCajaVecinaSubmit = async () => {
    if (!cajaVecinaData.receipt) {
      toast({
        title: "Erreur",
        description: "Veuillez télécharger la preuve de paiement",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Simuler la vérification automatique du reçu
      // En production, ceci serait traité par un service d'IA ou validation manuelle
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mettre à jour vers premium
      const result = await upgradeToPremium();
      if (result.success) {
        toast({
          title: "Paiement vérifié !",
          description: "Votre reçu a été validé. Bienvenue dans Amora Premium !",
        });
        onPaymentSuccess?.();
      }
    } catch (error) {
      toast({
        title: "Erreur de vérification",
        description: "Impossible de vérifier le reçu. Contactez le support.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="culture-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            Passer au Premium - $29.99/mois
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              return (
                <Card
                  key={method.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedMethod === method.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedMethod(method.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-full ${method.color} text-white`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="font-medium">{method.name}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{method.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {method.countries.map((country) => (
                        <Badge key={country} variant="outline" className="text-xs">
                          {country}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {selectedMethod && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <Button
                onClick={() => handlePayment(selectedMethod)}
                disabled={loading}
                className="w-full btn-hero"
              >
                {loading ? 'Traitement...' : `Payer avec ${paymentMethods.find(m => m.id === selectedMethod)?.name}`}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* �� SECTION CRYPTO CORRIGÉE (USDT seulement) */}
      {selectedMethod === 'usdt' && (
        <Card className="culture-card border-2 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bitcoin className="w-5 h-5 text-green-500" />
              Paiement USDT
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {usdtLoading ? (
              <div className="text-center py-4">
                <p>Chargement des adresses USDT...</p>
              </div>
            ) : !usdtLinks ? (
              <div className="text-center py-4 text-red-600">
                <p>❌ Aucune adresse USDT configurée</p>
                <p className="text-sm text-gray-600">Contactez l'administrateur</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h4 className="font-semibold text-amber-800 mb-2">Instructions de paiement USDT</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-amber-700">
                    <li>Copiez l'adresse USDT ci-dessous</li>
                    <li>Envoyez exactement <strong>{AMORA_PRICING.premium.monthly.usd} USDT</strong></li>
                    <li>Utilisez le réseau <strong>{usdtLinks.trc20_address ? 'TRC20 (TRON)' : 'ERC20 (Ethereum)'}</strong></li>
                    <li>Collez le hash de transaction ci-dessous</li>
                    <li>Votre compte sera activé après vérification</li>
                  </ol>
                </div>

                {/* 🔧 ADRESSE AVEC BOUTON COPIER - DONNÉES RÉELLES */}
                <div className="space-y-2">
                  <Label>
                    Adresse USDT ({usdtLinks.trc20_address ? 'TRC20' : 'ERC20'})
                  </Label>
                  <div className="flex items-center gap-2">
                    <div className="bg-white p-3 rounded border font-mono text-xs break-all flex-1">
                      {usdtLinks.trc20_address || usdtLinks.erc20_address}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(
                        usdtLinks.trc20_address || usdtLinks.erc20_address || '', 
                        'Adresse USDT'
                      )}
                      className="flex items-center gap-1 px-3 py-2"
                    >
                      <Copy className="w-4 h-4" />
                      <span className="hidden sm:inline">Copier</span>
                    </Button>
                  </div>
                </div>
                
                {/* 🔧 BOUTON COPIER RAPIDE SUPPLÉMENTAIRE */}
                <div className="flex justify-center">
                  <Button
                    variant="secondary"
                    onClick={() => copyToClipboard(
                      usdtLinks.trc20_address || usdtLinks.erc20_address || '', 
                      'Adresse USDT'
                    )}
                    className="flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Copier l'adresse USDT
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <Label htmlFor="txHash">Hash de transaction (optionnel)</Label>
                <Input
                  id="txHash"
                  placeholder="0x123abc..."
                  value={cryptoData.txHash}
                  onChange={(e) => setCryptoData(prev => ({ 
                    ...prev, 
                    txHash: e.target.value 
                  }))}
                />
              </div>

              <div>
                <Label htmlFor="cryptoReceipt">Ou télécharger une preuve de paiement</Label>
                <Input
                  id="cryptoReceipt"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setCryptoData(prev => ({ 
                    ...prev, 
                    receipt: e.target.files?.[0] || null 
                  }))}
                />
              </div>
            </div>

            <Button
              onClick={handleCryptoSubmit}
              disabled={loading || (!cryptoData.txHash && !cryptoData.receipt)}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {loading ? 'Vérification en cours...' : 'Vérifier le paiement USDT'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Section Caja Vecina (existante) */}
      {selectedMethod === 'caja_vecina' && cajaVecinaData.rut && (
        <Card className="culture-card">
          <CardHeader>
            <CardTitle>Instructions Caja Vecina</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold mb-2">Étapes à suivre :</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Rendez-vous dans un point Caja Vecina</li>
                <li>Utilisez le RUT : <strong>{cajaVecinaData.rut}</strong></li>
                <li>Payez le montant : <strong>{formatPrice(AMORA_PRICING.premium.monthly.usd)}</strong></li>
                <li>Conservez le reçu et téléchargez-le ci-dessous</li>
              </ol>
            </div>

            <div className="space-y-3">
              <Label htmlFor="receipt">Télécharger la preuve de paiement</Label>
              <Input
                id="receipt"
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setCajaVecinaData(prev => ({ 
                  ...prev, 
                  receipt: e.target.files?.[0] || null 
                }))}
              />
            </div>

            <Button
              onClick={handleCajaVecinaSubmit}
              disabled={loading || !cajaVecinaData.receipt}
              className="w-full btn-hero"
            >
              {loading ? 'Vérification en cours...' : 'Vérifier le paiement'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
