import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Smartphone, DollarSign, Upload, Crown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePremium } from '@/hooks/usePremium';

interface PaymentMethodsProps {
  onPaymentSuccess?: () => void;
}

export function PaymentMethods({ onPaymentSuccess }: PaymentMethodsProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [cajaVecinaData, setCajaVecinaData] = useState({
    rut: '',
    receipt: null as File | null,
    amount: '29.99'
  });
  const { toast } = useToast();
  const { upgradeToPremium } = usePremium();

  const paymentMethods = [
    {
      id: 'stripe',
      name: 'Carte de crédit/débit',
      icon: CreditCard,
      description: 'Visa, Mastercard, American Express',
      countries: ['Global']
    },
    {
      id: 'interac',
      name: 'Interac',
      icon: CreditCard,
      description: 'Paiement électronique canadien',
      countries: ['Canada']
    },
    {
      id: 'paypal',
      name: 'PayPal',
      icon: DollarSign,
      description: 'Compte PayPal ou carte via PayPal',
      countries: ['Global']
    },
    {
      id: 'usdt',
      name: 'USDT (Crypto)',
      icon: DollarSign,
      description: 'Tether USD sur réseau TRC20',
      countries: ['Global']
    },
    {
      id: 'moncash',
      name: 'MonCash',
      icon: Smartphone,
      description: 'Portefeuille mobile haïtien',
      countries: ['Haïti']
    },
    {
      id: 'caja_vecina',
      name: 'Caja Vecina',
      icon: Smartphone,
      description: 'Réseau de paiement chilien',
      countries: ['Chili']
    }
  ];

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
          // Rediriger vers Stripe Checkout
          window.location.href = '/api/create-checkout-session';
          break;
          
        case 'caja_vecina':
          // Générer RUT et afficher instructions
          const rut = generateRUT();
          setCajaVecinaData(prev => ({ ...prev, rut }));
          toast({
            title: "Instructions Caja Vecina",
            description: `Utilisez le RUT: ${rut} pour effectuer le paiement de $29.99 USD`,
          });
          break;
          
        case 'paypal':
          // Rediriger vers PayPal
          window.open('https://paypal.me/amora/29.99', '_blank');
          break;
          
        case 'usdt':
          // Afficher adresse crypto
          toast({
            title: "Paiement USDT",
            description: "Adresse TRC20: TXYZabc123... (29.99 USDT)",
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
                      <Icon className="w-5 h-5" />
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

      {/* Section spéciale Caja Vecina */}
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
                <li>Payez le montant : <strong>$29.99 USD</strong></li>
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
