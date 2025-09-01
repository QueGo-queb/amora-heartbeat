-- Ajouter les colonnes premium à la table users
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS plan text DEFAULT 'free',
ADD COLUMN IF NOT EXISTS premium_since timestamp with time zone,
ADD COLUMN IF NOT EXISTS payment_method text;

-- Créer la table transactions
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    amount_cents INTEGER NOT NULL,
    currency TEXT DEFAULT 'usd',
    stripe_payment_intent_id TEXT UNIQUE,
    status TEXT CHECK (status IN ('created', 'succeeded', 'failed')) DEFAULT 'created',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer les index pour les performances
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_stripe_payment_intent_id ON public.transactions(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_users_plan ON public.users(plan);

-- Activer RLS sur la table transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour transactions
CREATE POLICY "Users can view own transactions" ON public.transactions
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Service role can manage all transactions" ON public.transactions
    FOR ALL USING (auth.role() = 'service_role');

-- Politiques RLS pour users (mise à jour)
CREATE POLICY "Users can view all profiles" ON public.users
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Service role can update user plans" ON public.users
    FOR UPDATE USING (auth.role() = 'service_role');
