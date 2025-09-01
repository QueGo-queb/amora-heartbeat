export interface PaymentIntentResponse {
  clientSecret: string;
}

export interface PaymentFormData {
  card: any;
  billing_details: {
    name: string;
    email: string;
  };
}

export interface Transaction {
  id: string;
  user_id: string;
  amount_cents: number;
  currency: string;
  stripe_payment_intent_id: string;
  status: 'created' | 'succeeded' | 'failed';
  created_at: string;
}

export interface User {
  id: string;
  plan: 'free' | 'premium';
  premium_since: string | null;
  payment_method: string | null;
}
