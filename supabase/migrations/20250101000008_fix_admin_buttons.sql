-- Créer la table paypal_config si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.paypal_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  paypal_email TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer la table caja_vecina_accounts si elle n'existe pas
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

-- Activer RLS
ALTER TABLE public.paypal_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.caja_vecina_accounts ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour PayPal
CREATE POLICY "Users can view active paypal config" ON public.paypal_config
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage paypal config" ON public.paypal_config
    FOR ALL USING (auth.jwt() ->> 'email' = 'admin@amora.com');

-- Politiques RLS pour Caja Vecina
CREATE POLICY "Users can view active caja vecina accounts" ON public.caja_vecina_accounts
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage caja vecina accounts" ON public.caja_vecina_accounts
    FOR ALL USING (auth.jwt() ->> 'email' = 'admin@amora.com');
