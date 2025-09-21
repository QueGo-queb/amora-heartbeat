/**
 * Formulaire de paiement temporaire pour la production
 * Utilise Stripe Elements avec simulation côté client
 * ⚠️ À remplacer par le vrai système avec backend
 */

import { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { usePremium } from '@/hooks/usePremium';

export function TemporaryPaymentForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { upgradeToPremium } = usePremium();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error('Card element not found');

      // ✅ SOLUTION TEMPORAIRE: Valider la carte sans paiement réel
      const { error: tokenError, token } = await stripe.createToken(cardElement);

      if (tokenError) {
        setError(tokenError.message || 'Carte invalide');
        return;
      }

      // ✅ SIMULATION: Si la carte est valide, activer Premium
      if (token) {
        const result = await upgradeToPremium();
        
        if (result.success) {
          toast({
            title: "✅ Upgrade réussi !",
            description: "Votre compte Premium a été activé (mode test)",
          });
        }
      }

    } catch (err: any) {
      setError(err.message || 'Erreur lors du traitement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Alert>
        <AlertDescription>
          ⚠️ Mode test : Utilisez 4242 4242 4242 4242 pour tester
        </AlertDescription>
      </Alert>
      
      <div className="p-4 border rounded-lg">
        <CardElement />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Traitement...' : 'Activer Premium (Test)'}
      </Button>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </form>
  );
}
