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

      // Simuler la création du PaymentIntent (à remplacer par votre API)
      // Pour l'instant, on simule un paiement réussi
      const cardElement = elements.getElement(CardElement);
      
      if (!cardElement) {
        setError('Élément de carte non trouvé');
        setLoading(false);
        return;
      }

      // Créer le token de paiement
      const { error: tokenError, token } = await stripe.createToken(cardElement);

      if (tokenError) {
        setError(tokenError.message || 'Erreur lors de la création du token');
        setLoading(false);
        return;
      }

      // Mettre à jour le plan utilisateur
      const { error: updateError } = await supabase
        .from('users')
        .update({
          plan: 'premium',
          premium_since: new Date().toISOString(),
          payment_method: 'stripe'
        })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      // Créer la transaction
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          amount_cents: 2999, // $29.99
          currency: 'usd',
          status: 'succeeded',
          stripe_payment_intent_id: token.id
        });

      if (transactionError) {
        console.error('Erreur transaction:', transactionError);
      }

      toast({
        title: "Paiement réussi !",
        description: "Votre compte est maintenant Premium.",
      });

      navigate('/premium-success');

    } catch (err) {
      console.error('Erreur paiement:', err);
      setError('Une erreur inattendue est survenue');
      navigate('/premium-fail');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto culture-card">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <CreditCard className="w-5 h-5" />
          Paiement sécurisé
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations de prix */}
          <div className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-500" />
                <span className="font-medium">Plan Premium</span>
              </div>
              <span className="text-2xl font-bold text-purple-600">
                {formatPrice('USD')}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Accès illimité à toutes les fonctionnalités
            </p>
          </div>

          {/* Élément de carte Stripe */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Informations de carte</label>
            <div className="p-3 border rounded-lg bg-white">
              <CardElement options={CARD_ELEMENT_OPTIONS} />
            </div>
          </div>

          {/* Sécurité */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Shield className="w-4 h-4" />
            <span>Paiement sécurisé par Stripe</span>
          </div>

          {/* Erreur */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Bouton de paiement */}
          <Button 
            type="submit" 
            disabled={!stripe || loading}
            className="w-full btn-hero"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Traitement...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                Payer {formatPrice('USD')}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
