import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Heart, Shield, CreditCard, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCurrentPricing } from '@/hooks/useCurrentPricing';

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#9e2146',
    },
  },
};

export function StripeCardForm() {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { pricing, formatPrice } = useCurrentPricing();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Récupérer l'utilisateur actuel
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError('Vous devez être connecté pour effectuer un paiement.');
        setLoading(false);
        return;
      }

      // ✅ CORRECTION: URL du backend séparé
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          amount: 2999
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la création du paiement');
      }

      const { clientSecret, paymentIntentId } = await response.json();

      // Confirmer le paiement avec Stripe
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement)!,
            billing_details: {
              email: user.email,
            },
          },
        }
      );

      if (confirmError) {
        setError(confirmError.message || 'Erreur lors du paiement');
        setLoading(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // ✅ Paiement réussi
        toast({
          title: "Paiement réussi !",
          description: "Votre abonnement Premium a été activé.",
        });

        // Rediriger vers la page de succès
        navigate('/premium-success');
      }

    } catch (err: any) {
      console.error('Erreur paiement:', err);
      setError(err.message || 'Une erreur est survenue lors du paiement');
      
      toast({
        title: "Erreur de paiement",
        description: err.message || "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center mb-4">
          <Heart className="w-6 h-6 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent">
          Abonnement Premium
        </CardTitle>
        <p className="text-gray-600">
          Débloquez toutes les fonctionnalités d'Amora
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Prix */}
        <div className="text-center p-4 bg-gradient-to-r from-pink-50 to-red-50 rounded-lg border">
          <div className="text-3xl font-bold text-gray-900">
            {formatPrice(pricing.premium.monthly)}
          </div>
          <div className="text-sm text-gray-600">par mois</div>
        </div>

        {/* Fonctionnalités Premium */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-green-500" />
            <span className="text-sm">Messages illimités</span>
          </div>
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-green-500" />
            <span className="text-sm">Appels audio et vidéo</span>
          </div>
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-green-500" />
            <span className="text-sm">Profil mis en avant</span>
          </div>
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-green-500" />
            <span className="text-sm">Filtres avancés</span>
          </div>
        </div>

        {/* Formulaire de paiement */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-4 border rounded-lg bg-white">
            <CardElement options={CARD_ELEMENT_OPTIONS} />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            disabled={!stripe || loading}
            className="w-full bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Traitement...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                Payer {formatPrice(pricing.premium.monthly)}
              </>
            )}
          </Button>
        </form>

        <p className="text-xs text-gray-500 text-center">
          Paiement sécurisé par Stripe. Annulation possible à tout moment.
        </p>
      </CardContent>
    </Card>
  );
}
