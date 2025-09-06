-- Créer les tables manquantes si elles n'existent pas déjà

-- Table pour les liens USDT (si pas déjà créée)
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

-- Table pour les transactions (si pas déjà créée)
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    amount_cents INTEGER NOT NULL,
    currency TEXT DEFAULT 'usd',
    stripe_payment_intent_id TEXT UNIQUE,
    status TEXT CHECK (status IN ('created', 'succeeded', 'failed')) DEFAULT 'created',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les rapports (si pas déjà créée)
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID REFERENCES auth.users(id),
  reported_user_id UUID REFERENCES auth.users(id),
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les ads (si pas déjà créée)
CREATE TABLE IF NOT EXISTS public.ads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les promotions (si pas déjà créée)
CREATE TABLE IF NOT EXISTS public.promotions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  discount_percentage INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activer RLS sur toutes les tables
ALTER TABLE public.usdt_payment_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

-- Politiques RLS basiques
CREATE POLICY "Public can view active usdt links" ON public.usdt_payment_links
    FOR SELECT USING (is_active = true);

CREATE POLICY "Users can view own transactions" ON public.transactions
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create reports" ON public.reports
    FOR INSERT WITH CHECK (reporter_id = auth.uid());

CREATE POLICY "Public can view active ads" ON public.ads
    FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view active promotions" ON public.promotions
    FOR SELECT USING (is_active = true);

-- Politiques admin
CREATE POLICY "Admins can manage all" ON public.usdt_payment_links
    FOR ALL USING (auth.jwt() ->> 'email' = 'admin@amora.com');

CREATE POLICY "Admins can manage transactions" ON public.transactions
    FOR ALL USING (auth.jwt() ->> 'email' = 'admin@amora.com');

CREATE POLICY "Admins can manage reports" ON public.reports
    FOR ALL USING (auth.jwt() ->> 'email' = 'admin@amora.com');

CREATE POLICY "Admins can manage ads" ON public.ads
    FOR ALL USING (auth.jwt() ->> 'email' = 'admin@amora.com');

CREATE POLICY "Admins can manage promotions" ON public.promotions
    FOR ALL USING (auth.jwt() ->> 'email' = 'admin@amora.com');

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_reporter_id ON public.reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_reported_user_id ON public.reports(reported_user_id);
