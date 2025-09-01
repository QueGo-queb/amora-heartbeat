'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Shield, CreditCard } from 'lucide-react';
import { supabaseClient } from '@/lib/supabaseClient';

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
  const router = useRouter();
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
      const { data: { user } } = await supabaseClient.auth.getUser();
      
      if (!user) {
        setError('Vous devez être connecté pour effectuer un paiement.');
        setLoading(false);
        return;
      }

      // Créer le PaymentIntent
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création du paiement');
      }

      const { clientSecret } = await response.json();

      // Confirmer le paiement
      const { error: paymentError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement)!,
            billing_details: {
              name: user.user_metadata?.full_name || 'Utilisateur Amora',
              email: user.email!,
            },
          },
        }
      );

      if (paymentError) {
        setError(paymentError.message || 'Erreur lors du paiement');
        router.push('/premium-fail');
      } else if (paymentIntent?.status === 'succeeded') {
        router.push('/premium-success');
      }
    } catch (err) {
      setError('Une erreur inattendue est survenue');
      router.push('/premium-fail');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto culture-card">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Heart className="w-6 h-6 text-heart-red" />
          <CardTitle className="text-2xl">Premium Amora</CardTitle>
        </div>
        <p className="text-muted-foreground">
          Débloquez toutes les fonctionnalités premium
        </p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">Plan Premium</span>
                <span className="text-2xl font-bold text-heart-red">$9.99</span>
              </div>
              <p className="text-sm text-muted-foreground">par mois</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Informations de paiement
              </label>
              <div className="p-3 border rounded-md bg-background">
                <CardElement options={CARD_ELEMENT_OPTIONS} />
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={!stripe || loading}
            className="w-full btn-hero relative"
          >
            {loading ? (
              <>
                <div className="heart-logo">
                  <div className="heart-shape animate-pulse" />
                </div>
                <span className="ml-2">Traitement en cours...</span>
              </>
            ) : (
              <>
                <span>Payer $9.99 avec ma carte</span>
                <div className="flex items-center gap-1 ml-2">
                  <Shield className="w-4 h-4" />
                  <span className="text-xs">Sécurisé</span>
                </div>
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Paiement sécurisé par Stripe. Vos informations de carte ne sont jamais stockées.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
