-- Créer la table pour les comptes Caja Vecina
CREATE TABLE IF NOT EXISTS public.caja_vecina_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_number TEXT NOT NULL,
  account_name TEXT NOT NULL,
  rut TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer la table pour les paiements Caja Vecina
CREATE TABLE IF NOT EXISTS public.caja_vecina_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  account_id UUID REFERENCES public.caja_vecina_accounts(id),
  amount DECIMAL(10,2) NOT NULL,
  receipt_image_url TEXT,
  transaction_reference TEXT,
  status TEXT CHECK (status IN ('pending', 'verified', 'rejected')) DEFAULT 'pending',
  admin_notes TEXT,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_caja_vecina_payments_user_id ON public.caja_vecina_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_caja_vecina_payments_status ON public.caja_vecina_payments(status);

-- Activer RLS
ALTER TABLE public.caja_vecina_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.caja_vecina_payments ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Users can view active accounts" ON public.caja_vecina_accounts
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage accounts" ON public.caja_vecina_accounts
    FOR ALL USING (auth.jwt() ->> 'email' = 'admin@amora.com');

CREATE POLICY "Users can view own payments" ON public.caja_vecina_payments
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create payments" ON public.caja_vecina_payments
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all payments" ON public.caja_vecina_payments
    FOR ALL USING (auth.jwt() ->> 'email' = 'admin@amora.com');
