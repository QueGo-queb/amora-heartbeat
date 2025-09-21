/**
 * Serveur Express pour gérer les paiements Stripe
 * À déployer séparément de votre frontend React
 */

import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configuration Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// Configuration Supabase
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Route pour créer un PaymentIntent
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { userId, amount = 2999 } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    // Vérifier l'utilisateur
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
      amount,
      currency: 'usd',
      metadata: {
        userId: userId,
        plan: 'premium',
        userEmail: user.email
      },
      receipt_email: user.email,
    });

    // Enregistrer la transaction
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        amount_cents: amount,
        currency: 'usd',
        stripe_payment_intent_id: paymentIntent.id,
        status: 'created'
      });

    if (transactionError) {
      console.error('Transaction error:', transactionError);
    }

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });

  } catch (error) {
    console.error('Payment intent error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Webhook Stripe
app.post('/api/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature']!;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).send('Webhook signature verification failed');
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object as Stripe.PaymentIntent);
        break;
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const userId = paymentIntent.metadata.userId;

  // Mettre à jour le statut de la transaction
  await supabase
    .from('transactions')
    .update({ status: 'succeeded' })
    .eq('stripe_payment_intent_id', paymentIntent.id);

  // Mettre à jour le plan utilisateur
  await supabase
    .from('users')
    .update({
      plan: 'premium',
      premium_since: new Date().toISOString(),
      payment_method: 'stripe'
    })
    .eq('user_id', userId);

  console.log(`✅ User ${userId} upgraded to Premium`);
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  await supabase
    .from('transactions')
    .update({ status: 'failed' })
    .eq('stripe_payment_intent_id', paymentIntent.id);
}

app.listen(PORT, () => {
  console.log(`🚀 Payment server running on port ${PORT}`);
});
