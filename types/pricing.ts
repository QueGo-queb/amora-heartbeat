export interface SubscriptionPlan {
  id: string;
  name: string;
  price_usd: number;
  price_eur?: number;
  price_cad?: number;
  price_clp?: number;
  price_htg?: number;
  currency: string;
  duration_months: number;
  features: string[];
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CreatePlanRequest {
  name: string;
  price_usd: number;
  price_eur?: number;
  price_cad?: number;
  price_clp?: number;
  price_htg?: number;
  currency: string;
  duration_months: number;
  features: string[];
  sort_order?: number;
}

export interface UpdatePlanRequest extends CreatePlanRequest {
  id: string;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  start_date: string;
  end_date?: string;
  status: 'active' | 'inactive' | 'canceled';
  created_at: string;
}

export interface PaymentTransaction {
  id: string;
  user_id: string;
  subscription_id?: string;
  plan_id?: string;
  stripe_payment_intent_id?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'canceled';
  payment_method?: string;
  failure_reason?: string;
  metadata: Record<string, any>;
  created_at: string;
}
