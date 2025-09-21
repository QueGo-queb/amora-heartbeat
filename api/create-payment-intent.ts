import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, priceId = 'price_premium_monthly' } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    // Vérifier que l'utilisateur existe
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, full_name')
      .eq('user_id', userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Créer le PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 2999, // $29.99 en centimes
      currency: 'usd',
      metadata: {
        userId: userId,
        plan: 'premium',
        userEmail: user.email
      },
      receipt_email: user.email,
    });

    // Enregistrer la transaction en "created"
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        amount_cents: 2999,
        currency: 'usd',
        stripe_payment_intent_id: paymentIntent.id,
        status: 'created'
      });

    if (transactionError) {
      console.error('Erreur enregistrement transaction:', transactionError);
    }

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });

  } catch (error) {
    console.error('Erreur création PaymentIntent:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
