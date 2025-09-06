-- Migration pour s'assurer que toutes les tables nécessaires existent
-- Cette migration peut être exécutée plusieurs fois sans problème

-- 1. Table PayPal Config
CREATE TABLE IF NOT EXISTS public.paypal_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  paypal_email TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Table Caja Vecina Accounts
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

-- 3. Table Caja Vecina Payments
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

-- 4. Table PayPal Payments
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

-- 5. Table USDT Links
CREATE TABLE IF NOT EXISTS public.usdt_payment_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trc20_address TEXT,
  erc20_address TEXT,
  trc20_qr_code TEXT,
  erc20_qr_code TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activer RLS sur toutes les tables
ALTER TABLE public.paypal_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.caja_vecina_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.caja_vecina_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paypal_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usdt_payment_links ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Users can view active paypal config" ON public.paypal_config;
DROP POLICY IF EXISTS "Admins can manage paypal config" ON public.paypal_config;
DROP POLICY IF EXISTS "Users can view active caja vecina accounts" ON public.caja_vecina_accounts;
DROP POLICY IF EXISTS "Admins can manage caja vecina accounts" ON public.caja_vecina_accounts;
DROP POLICY IF EXISTS "Users can view own caja vecina payments" ON public.caja_vecina_payments;
DROP POLICY IF EXISTS "Users can create caja vecina payments" ON public.caja_vecina_payments;
DROP POLICY IF EXISTS "Admins can manage all caja vecina payments" ON public.caja_vecina_payments;
DROP POLICY IF EXISTS "Users can view own paypal payments" ON public.paypal_payments;
DROP POLICY IF EXISTS "Users can create paypal payments" ON public.paypal_payments;
DROP POLICY IF EXISTS "Admins can manage all paypal payments" ON public.paypal_payments;
DROP POLICY IF EXISTS "Public can view active usdt links" ON public.usdt_payment_links;
DROP POLICY IF EXISTS "Admins can manage usdt links" ON public.usdt_payment_links;

-- Créer les nouvelles politiques RLS
-- PayPal Config
CREATE POLICY "Users can view active paypal config" ON public.paypal_config
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage paypal config" ON public.paypal_config
    FOR ALL USING (auth.jwt() ->> 'email' = 'admin@amora.com');

-- Caja Vecina Accounts
CREATE POLICY "Users can view active caja vecina accounts" ON public.caja_vecina_accounts
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage caja vecina accounts" ON public.caja_vecina_accounts
    FOR ALL USING (auth.jwt() ->> 'email' = 'admin@amora.com');

-- Caja Vecina Payments
CREATE POLICY "Users can view own caja vecina payments" ON public.caja_vecina_payments
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create caja vecina payments" ON public.caja_vecina_payments
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all caja vecina payments" ON public.caja_vecina_payments
    FOR ALL USING (auth.jwt() ->> 'email' = 'admin@amora.com');

-- PayPal Payments
CREATE POLICY "Users can view own paypal payments" ON public.paypal_payments
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create paypal payments" ON public.paypal_payments
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all paypal payments" ON public.paypal_payments
    FOR ALL USING (auth.jwt() ->> 'email' = 'admin@amora.com');

-- USDT Links
CREATE POLICY "Public can view active usdt links" ON public.usdt_payment_links
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage usdt links" ON public.usdt_payment_links
    FOR ALL USING (auth.jwt() ->> 'email' = 'admin@amora.com');

-- Créer les index pour les performances
CREATE INDEX IF NOT EXISTS idx_paypal_config_active ON public.paypal_config(is_active);
CREATE INDEX IF NOT EXISTS idx_caja_vecina_accounts_active ON public.caja_vecina_accounts(is_active);
CREATE INDEX IF NOT EXISTS idx_caja_vecina_payments_user_id ON public.caja_vecina_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_caja_vecina_payments_status ON public.caja_vecina_payments(status);
CREATE INDEX IF NOT EXISTS idx_paypal_payments_user_id ON public.paypal_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_paypal_payments_transaction_id ON public.paypal_payments(paypal_transaction_id);
CREATE INDEX IF NOT EXISTS idx_usdt_links_active ON public.usdt_payment_links(is_active);

-- Insérer des données de test si les tables sont vides
INSERT INTO public.paypal_config (paypal_email, is_active, created_at)
SELECT 'admin@example.com', false, NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.paypal_config);

INSERT INTO public.caja_vecina_accounts (account_number, account_name, rut, is_active, created_at)
SELECT '1234567890', 'Compte Test', '12.345.678-9', false, NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.caja_vecina_accounts);

INSERT INTO public.usdt_payment_links (trc20_address, erc20_address, is_active, created_at)
SELECT 'TXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXx', '0xXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', false, NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.usdt_payment_links);
