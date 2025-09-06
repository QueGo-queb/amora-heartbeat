-- Créer la table pour la configuration PayPal
CREATE TABLE IF NOT EXISTS public.paypal_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  paypal_email TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer la table pour les paiements PayPal
CREATE TABLE IF NOT EXISTS public.paypal_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  paypal_transaction_id TEXT,
  amount DECIMAL(10,2) NOT NULL DEFAULT 29.99,
  currency TEXT DEFAULT 'USD',
  payer_email TEXT,
  status TEXT CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')) DEFAULT 'pending',
  paypal_response JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_paypal_payments_user_id ON public.paypal_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_paypal_payments_transaction_id ON public.paypal_payments(paypal_transaction_id);

-- Activer RLS
ALTER TABLE public.paypal_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paypal_payments ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Users can view active paypal config" ON public.paypal_config
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage paypal config" ON public.paypal_config
    FOR ALL USING (auth.jwt() ->> 'email' = 'admin@amora.com');

CREATE POLICY "Users can view own paypal payments" ON public.paypal_payments
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create paypal payments" ON public.paypal_payments
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all paypal payments" ON public.paypal_payments
    FOR ALL USING (auth.jwt() ->> 'email' = 'admin@amora.com');
