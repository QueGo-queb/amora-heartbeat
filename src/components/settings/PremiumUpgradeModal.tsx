import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Crown, 
  CreditCard, 
  Smartphone, 
  DollarSign, 
  Upload,
  Check,
  X,
  MapPin,
  Copy,
  ExternalLink,
  Coins,
  AlertCircle,
  QrCode,
  Building2,
  ArrowLeft,
  Upload as UploadIcon,
  CheckCircle,
  Clock,
  Pause,
  Play,
  Phone
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePremium } from '@/hooks/usePremium';
import { useUsdtLinks } from '@/hooks/useUsdtLinks';
import { useCajaVecina } from '@/hooks/useCajaVecina';
import { usePayPal } from '@/hooks/usePayPal';
import { useCurrentPricing } from '@/hooks/useCurrentPricing';
import { useMonCash } from '@/hooks/useMonCash';

interface PremiumUpgradeModalProps {
  open: boolean;
  onClose: () => void;
  userCountry?: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  countries: string[];
  available: boolean;
}

export function PremiumUpgradeModal({ open, onClose, userCountry }: PremiumUpgradeModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [selectedUsdtNetwork, setSelectedUsdtNetwork] = useState<'TRC20' | 'ERC20' | null>(null);
  const [loading, setLoading] = useState(false);
  const [cajaVecinaData, setCajaVecinaData] = useState({
    rut: '',
    receipt: null as File | null,
    transactionRef: ''
  });
  const [usdtData, setUsdtData] = useState({
    network: null as 'TRC20' | 'ERC20' | null,
    txHash: '',
    receipt: null as File | null
  });
  const [step, setStep] = useState<'methods' | 'usdt' | 'caja_vecina' | 'stripe'>('methods');
  
  const { toast } = useToast();
  const { upgradeToPremium } = usePremium();
  const { links: usdtLinks, loading: usdtLoading } = useUsdtLinks();
  const { accounts, submitPayment, loading: cajaVecinaLoading } = useCajaVecina();
  const { config: paypalConfig, createPayment: createPayPalPayment, loading: paypalLoading } = usePayPal();
  const { pricing } = useCurrentPricing();
  const { config: monCashConfig, submitPayment: submitMonCashPayment, loading: monCashLoading } = useMonCash();

  // Réinitialiser les données quand le modal s'ouvre
  useEffect(() => {
    if (open) {
      setStep('methods');
      setSelectedMethod('');
      setSelectedUsdtNetwork(null);
      setUsdtData({ network: null, txHash: '', receipt: null });
    }
  }, [open]);

  // Méthodes de paiement selon le pays
  const getPaymentMethods = (): PaymentMethod[] => {
    const allMethods: PaymentMethod[] = [
      {
        id: 'stripe',
        name: 'Carte de crédit/débit',
        icon: CreditCard,
        description: 'Visa, Mastercard, American Express',
        countries: ['US', 'CA', 'FR', 'Global'],
        available: true
      },
      {
        id: 'interac',
        name: 'Interac',
        icon: CreditCard,
        description: 'Paiement électronique canadien',
        countries: ['CA'],
        available: userCountry === 'Canada' || userCountry === 'CA'
      },
      {
        id: 'paypal',
        name: 'PayPal',
        icon: DollarSign,
        description: paypalConfig?.paypal_email 
          ? `Payer via ${paypalConfig.paypal_email}` 
          : 'Configuration PayPal requise',
        countries: ['US', 'Global'],
        available: !!paypalConfig?.paypal_email && paypalConfig.is_active
      },
      {
        id: 'usdt',
        name: 'USDT (Crypto)',
        icon: Coins,
        description: 'Tether USD sur réseau TRC20/ERC20',
        countries: ['Global'],
        // Rendre USDT toujours disponible pour les tests
        available: true
      },
      {
        id: 'moncash',
        name: 'MonCash',
        icon: Smartphone,
        description: monCashConfig?.phone_number && monCashConfig.is_active && !monCashConfig.is_paused
          ? `Envoyer à ${monCashConfig.phone_number}` 
          : 'Configuration MonCash requise',
        countries: ['HT'],
        available: true // CHANGER en true pour toujours afficher (sera géré dans le handler)
      },
      {
        id: 'caja_vecina',
        name: 'Caja Vecina',
        icon: Building2,
        description: 'Réseau de paiement chilien',
        countries: ['CL'],
        // Rendre Caja Vecina toujours disponible pour les tests
        available: true
      }
    ];

    return allMethods.filter(method => method.available);
  };

  const paymentMethods = getPaymentMethods();

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

  // Copier l'adresse USDT dans le presse-papiers
  const copyUsdtAddress = async (address: string, network: string) => {
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

  // Ajouter les handlers pour USDT et Caja Vecina
  const handlePaymentMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
    
    switch (methodId) {
      case 'stripe':
        setStep('stripe');
        break;
      case 'usdt':
        setStep('usdt');
        break;
      case 'moncash':
        setStep('moncash');
        break;
      case 'caja_vecina':
        setStep('caja_vecina');
        break;
      case 'paypal':
        handlePayPalPayment();
        break;
      default:
        // Pour les autres méthodes, afficher un message temporaire
        toast({
          title: "Méthode en développement",
          description: `La méthode ${paymentMethods.find(m => m.id === methodId)?.name} sera bientôt disponible.`,
        });
        break;
    }
  };

  const handleUsdtSubmit = async () => {
    setLoading(true);
    try {
      // Simuler la vérification USDT
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mettre à jour le plan utilisateur
      await upgradeToPremium('usdt');
      
      toast({
        title: "Paiement USDT vérifié !",
        description: "Votre compte est maintenant Premium.",
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de vérifier le paiement USDT.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCajaVecinaSubmit = async () => {
    if (!cajaVecinaData.receipt) return;
    
    try {
      // Utiliser le hook pour soumettre le paiement
      await submitPayment(
        accounts[0]?.id || 'default', 
        29.99, 
        cajaVecinaData.receipt,
        cajaVecinaData.transactionRef
      );
      
      toast({
        title: "Paiement soumis !",
        description: "Votre paiement Caja Vecina est en cours de vérification.",
      });
      
      onClose();
    } catch (error) {
      console.error('Erreur Caja Vecina:', error);
    }
  };

  const handlePayPalPayment = async () => {
    if (!paypalConfig?.paypal_email) {
      toast({
        title: "PayPal non configuré",
        description: "La méthode PayPal n'est pas encore configurée par l'administrateur.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createPayPalPayment(29.99);
      // La redirection vers PayPal se fait automatiquement dans le hook
    } catch (error) {
      console.error('Erreur PayPal:', error);
    }
  };

  const premiumFeatures = [
    { name: 'Messages illimités', free: false, premium: true },
    { name: 'Publications avec liens', free: false, premium: true },
    { name: 'Photos et vidéos', free: false, premium: true },
    { name: 'Profil mis en avant', free: false, premium: true },
    { name: 'Recherche avancée', free: false, premium: true },
    { name: 'Support prioritaire', free: false, premium: true },
    { name: 'Publications de base', free: true, premium: true },
    { name: 'Voir les profils', free: true, premium: true }
  ];

  // Fonction locale simple pour formatter les prix
  const getFormattedPrice = (currency?: string) => {
    const targetCurrency = currency || 'USD';
    
    switch (targetCurrency.toUpperCase()) {
      case 'CAD':
        return pricing.price_cad ? `$${pricing.price_cad} CAD` : `$${pricing.price_usd}`;
      case 'CLP':
        return pricing.price_clp ? `$${pricing.price_clp.toLocaleString()} CLP` : `$${(pricing.price_usd * 800).toLocaleString()} CLP`;
      case 'HTG':
        return pricing.price_htg ? `${pricing.price_htg} G` : `${(pricing.price_usd * 133).toLocaleString()} G`;
      default:
        return `$${pricing.price_usd}`;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {/* Ajouter le bouton de retour */}
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onClose}
              className="shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex-1">
              <DialogTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-500" />
                Mon abonnement Premium
              </DialogTitle>
              <DialogDescription>
                Choisissez votre méthode de paiement préférée
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {step === 'methods' && (
          <div className="space-y-6">
            {/* Avantages Premium */}
            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-500" />
                  Avantages Premium
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Messages illimités</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Voir qui vous a liké</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Filtres avancés</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Profil mis en avant</span>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <span className="text-2xl font-bold text-purple-600">
                    {getFormattedPrice(userCountry === 'Canada' ? 'CAD' : 
                      userCountry === 'Chile' ? 'CLP' : 
                      userCountry === 'Haiti' ? 'HTG' : 'USD')}
                  </span>
                  <span className="text-gray-600 ml-2">/ mois</span>
                </div>
              </CardContent>
            </Card>

            {/* Méthodes de paiement */}
            <Card>
              <CardHeader>
                <CardTitle>Méthodes de paiement disponibles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {paymentMethods.map((method) => (
                    <Card 
                      key={method.id}
                      className={`cursor-pointer transition-all ${
                        selectedMethod === method.id 
                          ? 'ring-2 ring-purple-500 bg-purple-50' 
                          : 'hover:shadow-md'
                      } ${method.id === 'paypal' && !paypalConfig?.paypal_email ? 'opacity-50' : ''}`}
                      onClick={() => handlePaymentMethodSelect(method.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <method.icon className="w-8 h-8 text-purple-600" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{method.name}</h3>
                              {method.id === 'paypal' && paypalConfig?.paypal_email && (
                                <Badge variant="secondary" className="bg-green-100 text-green-800">
                                  Configuré
                                </Badge>
                              )}
                              {method.id === 'paypal' && !paypalConfig?.paypal_email && (
                                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                                  Non configuré
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{method.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Message d'information PayPal si non configuré */}
                {paymentMethods.some(m => m.id === 'paypal') && !paypalConfig?.paypal_email && (
                  <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center gap-2 text-orange-800">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        PayPal sera disponible une fois configuré par l'administrateur
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {step === 'usdt' && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => setStep('methods')}>
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <CardTitle className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-orange-500" />
                  Paiement USDT (Tether)
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Instructions de paiement - MODIFIER CETTE SECTION */}
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Coins className="w-4 h-4" />
                  Instructions de paiement USDT
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Envoyez exactement <strong>{pricing.price_usd} USDT</strong> à l'adresse ci-dessous</li>
                  <li>Utilisez le réseau <strong>TRC20</strong> (Tron) pour des frais réduits</li>
                  <li>Copiez le hash de transaction après l'envoi</li>
                  <li>Ou prenez une capture d'écran de la transaction</li>
                </ol>
              </div>

              {/* Sélection du réseau */}
              <div className="space-y-3">
                <Label>Choisissez le réseau</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Card 
                    className={`cursor-pointer ${usdtData.network === 'TRC20' ? 'ring-2 ring-orange-500' : ''}`}
                    onClick={() => setUsdtData(prev => ({ ...prev, network: 'TRC20' }))}
                  >
                    <CardContent className="p-3 text-center">
                      <div className="font-medium">TRC20</div>
                      <div className="text-xs text-gray-600">Frais réduits</div>
                    </CardContent>
                  </Card>
                  <Card 
                    className={`cursor-pointer ${usdtData.network === 'ERC20' ? 'ring-2 ring-orange-500' : ''}`}
                    onClick={() => setUsdtData(prev => ({ ...prev, network: 'ERC20' }))}
                  >
                    <CardContent className="p-3 text-center">
                      <div className="font-medium">ERC20</div>
                      <div className="text-xs text-gray-600">Ethereum</div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Adresse de paiement */}
              {usdtData.network && (
                <div className="space-y-3">
                  <Label>Adresse USDT ({usdtData.network})</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={usdtData.network === 'TRC20' ? 'TXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXx' : '0xXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button variant="outline" size="icon">
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Hash de transaction */}
              <div className="space-y-2">
                <Label htmlFor="txHash">Hash de transaction</Label>
                <Input
                  id="txHash"
                  value={usdtData.txHash}
                  onChange={(e) => setUsdtData(prev => ({ ...prev, txHash: e.target.value }))}
                  placeholder="Collez le hash de votre transaction ici"
                />
              </div>

              {/* Upload de reçu */}
              <div className="space-y-2">
                <Label>Ou téléchargez une capture d'écran</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setUsdtData(prev => ({ ...prev, receipt: file }));
                      }
                    }}
                    className="hidden"
                    id="usdt-receipt"
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => document.getElementById('usdt-receipt')?.click()}
                  >
                    Choisir un fichier
                  </Button>
                  {usdtData.receipt && (
                    <p className="text-sm text-green-600 mt-2">
                      ✓ {usdtData.receipt.name}
                    </p>
                  )}
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep('methods')}>
                  Retour
                </Button>
                <Button
                  onClick={handleUsdtSubmit}
                  disabled={loading || (!usdtData.txHash && !usdtData.receipt)}
                  className="flex-1 btn-hero"
                >
                  {loading ? 'Vérification...' : 'Vérifier le paiement USDT'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'moncash' && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => setStep('methods')}>
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-green-500" />
                  Paiement MonCash
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {monCashConfig && monCashConfig.is_active && !monCashConfig.is_paused ? (
                <>
                  {/* Instructions */}
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-semibold mb-3">Instructions de paiement</h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>Ouvrez votre application MonCash</li>
                      <li>Envoyez <strong>{pricing.price_htg ? `${pricing.price_htg} HTG` : `${(pricing.price_usd * 133).toLocaleString()} HTG`}</strong></li>
                      <li>Au numéro <strong>{monCashConfig.phone_number}</strong></li>
                      <li>Conservez le reçu de transaction</li>
                    </ol>
                  </div>

                  {/* Informations du destinataire */}
                  <div className="p-4 bg-gray-50 border rounded-lg">
                    <h4 className="font-semibold mb-3">Informations de transfert</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Destinataire:</strong> {monCashConfig.account_name}</div>
                      <div><strong>Numéro MonCash:</strong> {monCashConfig.phone_number}</div>
                      <div><strong>Montant:</strong> {pricing.price_htg ? `${pricing.price_htg} HTG` : `${(pricing.price_usd * 133).toLocaleString()} HTG`}</div>
                    </div>
                  </div>

                  {/* Formulaire de soumission */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="sender_phone">Votre numéro MonCash</Label>
                      <Input
                        id="sender_phone"
                        placeholder="+509 0000 0000"
                        value={monCashData.senderPhone}
                        onChange={(e) => setMonCashData(prev => ({ ...prev, senderPhone: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="transaction_ref">Référence de transaction</Label>
                      <Input
                        id="transaction_ref"
                        placeholder="Référence de votre transfert MonCash"
                        value={monCashData.transactionRef}
                        onChange={(e) => setMonCashData(prev => ({ ...prev, transactionRef: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Reçu de transaction (optionnel)</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setMonCashData(prev => ({ ...prev, receipt: file }));
                            }
                          }}
                          className="hidden"
                          id="moncash-receipt"
                        />
                        <Button 
                          variant="outline" 
                          onClick={() => document.getElementById('moncash-receipt')?.click()}
                        >
                          Choisir un fichier
                        </Button>
                        {monCashData.receipt && (
                          <p className="text-sm text-green-600 mt-2">
                            ✓ {monCashData.receipt.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Boutons d'action */}
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep('methods')}>
                      Retour
                    </Button>
                    <Button
                      onClick={() => handleMonCashSubmit()}
                      disabled={monCashLoading || !monCashData.senderPhone || !monCashData.transactionRef}
                      className="flex-1 btn-hero"
                    >
                      {monCashLoading ? 'Vérification...' : 'Soumettre le paiement'}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Smartphone className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-600 mb-2">MonCash temporairement indisponible</p>
                  <p className="text-sm text-gray-500">La méthode MonCash n'est pas configurée ou est en pause.</p>
                  <Button variant="outline" onClick={() => setStep('methods')} className="mt-4">
                    Choisir une autre méthode
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {step === 'caja_vecina' && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => setStep('methods')}>
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-500" />
                  Paiement Caja Vecina
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Instructions - MODIFIER CETTE SECTION */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold mb-3">Instructions de paiement</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Rendez-vous dans n'importe quelle Caja Vecina</li>
                  <li>Effectuez un dépôt de <strong>{pricing.price_clp ? `${pricing.price_clp.toLocaleString()} CLP` : `${(pricing.price_usd * 800).toLocaleString()} CLP`}</strong></li>
                  <li>Conservez le reçu de transaction</li>
                  <li>Téléchargez une photo claire du reçu ci-dessous</li>
                </ol>
              </div>

              {/* Informations du compte - MODIFIER CETTE SECTION */}
              <div className="p-4 bg-gray-50 border rounded-lg">
                <h4 className="font-semibold mb-3">Informations de dépôt</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Compte:</strong> 1234567890</div>
                  <div><strong>Titulaire:</strong> Amora Heartbeat SPA</div>
                  <div><strong>RUT:</strong> 12.345.678-9</div>
                  <div><strong>Montant:</strong> {pricing.price_clp ? `${pricing.price_clp.toLocaleString()} CLP` : `${(pricing.price_usd * 800).toLocaleString()} CLP`}</div>
                </div>
              </div>

              {/* Upload du reçu */}
              <div className="space-y-2">
                <Label>Reçu de transaction *</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setCajaVecinaData(prev => ({ ...prev, receipt: file }));
                      }
                    }}
                    className="hidden"
                    id="caja-receipt"
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => document.getElementById('caja-receipt')?.click()}
                  >
                    Choisir un fichier
                  </Button>
                  {cajaVecinaData.receipt && (
                    <p className="text-sm text-green-600 mt-2">
                      ✓ {cajaVecinaData.receipt.name}
                    </p>
                  )}
                </div>
              </div>

              {/* Référence de transaction */}
              <div className="space-y-2">
                <Label htmlFor="transactionRef">Référence de transaction (optionnel)</Label>
                <Input
                  id="transactionRef"
                  value={cajaVecinaData.transactionRef}
                  onChange={(e) => setCajaVecinaData(prev => ({ ...prev, transactionRef: e.target.value }))}
                  placeholder="Ex: TXN123456789"
                />
              </div>

              {/* Boutons d'action */}
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep('methods')}>
                  Retour
                </Button>
                <Button
                  onClick={handleCajaVecinaSubmit}
                  disabled={cajaVecinaLoading || !cajaVecinaData.receipt}
                  className="flex-1 btn-hero"
                >
                  {cajaVecinaLoading ? 'Vérification...' : 'Soumettre le paiement'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'stripe' && (
          <div>
            {/* Intégrer le composant StripeCardForm ici */}
            <div className="flex items-center gap-2 mb-4">
              <Button variant="ghost" size="icon" onClick={() => setStep('methods')}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h3 className="text-lg font-semibold">Paiement par carte</h3>
            </div>
            {/* Le composant StripeCardForm sera affiché ici */}
            <div className="text-center py-8 text-gray-600">
              <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Intégration Stripe en cours...</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
