import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { buffer } from 'micro';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature']!;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).json({ error: 'Webhook signature verification failed' });
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSuccess(paymentIntent);
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailure(failedPayment);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const userId = paymentIntent.metadata.userId;

  if (!userId) {
    console.error('No userId in payment metadata');
    return;
  }

  try {
    // 1. Mettre à jour le statut de la transaction
    const { error: transactionError } = await supabase
      .from('transactions')
      .update({ status: 'succeeded' })
      .eq('stripe_payment_intent_id', paymentIntent.id);

    if (transactionError) {
      console.error('Erreur mise à jour transaction:', transactionError);
    }

    // 2. Mettre à jour le plan utilisateur vers Premium
    const { error: userError } = await supabase
      .from('users')
      .update({
        plan: 'premium',
        premium_since: new Date().toISOString(),
        payment_method: 'stripe'
      })
      .eq('user_id', userId);

    if (userError) {
      console.error('Erreur mise à jour plan utilisateur:', userError);
    } else {
      console.log(`✅ Utilisateur ${userId} mis à niveau vers Premium`);
    }

  } catch (error) {
    console.error('Erreur handling payment success:', error);
  }
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  try {
    // Mettre à jour le statut de la transaction
    const { error } = await supabase
      .from('transactions')
      .update({ status: 'failed' })
      .eq('stripe_payment_intent_id', paymentIntent.id);

    if (error) {
      console.error('Erreur mise à jour transaction échouée:', error);
    }

  } catch (error) {
    console.error('Erreur handling payment failure:', error);
  }
}
