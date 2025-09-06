-- Créer la table pour les liens de paiement USDT
CREATE TABLE IF NOT EXISTS public.usdt_payment_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trc20_address TEXT,
  erc20_address TEXT,
  trc20_qr_code TEXT, -- URL vers QR code TRC20 (optionnel)
  erc20_qr_code TEXT, -- URL vers QR code ERC20 (optionnel)
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activer RLS
ALTER TABLE public.usdt_payment_links ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "USDT links are viewable by everyone" ON public.usdt_payment_links
  FOR SELECT USING (is_active = true);

CREATE POLICY "Only admins can manage USDT links" ON public.usdt_payment_links
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'clodenerc@yahoo.fr'
    )
  );

-- Insérer des liens par défaut (optionnel)
INSERT INTO public.usdt_payment_links (trc20_address, erc20_address, created_by) 
VALUES (
  'TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE',
  '0x742d35Cc6634C0532925a3b8D4C9db96C4C2C7b4',
  (SELECT id FROM auth.users WHERE email = 'clodenerc@yahoo.fr' LIMIT 1)
);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_usdt_links_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_usdt_links_updated_at
  BEFORE UPDATE ON public.usdt_payment_links
  FOR EACH ROW EXECUTE FUNCTION update_usdt_links_updated_at();
