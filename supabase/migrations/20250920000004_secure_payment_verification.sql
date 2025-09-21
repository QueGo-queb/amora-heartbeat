-- ✅ TABLES SÉCURISÉES POUR VÉRIFICATION DES PAIEMENTS

-- Table pour les paiements USDT vérifiés
CREATE TABLE IF NOT EXISTS usdt_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_hash TEXT UNIQUE NOT NULL,
  network TEXT NOT NULL CHECK (network IN ('TRC20', 'ERC20')),
  amount_usdt DECIMAL(20,6) NOT NULL,
  from_address TEXT NOT NULL,
  to_address TEXT NOT NULL,
  blockchain_timestamp TIMESTAMPTZ NOT NULL,
  status TEXT CHECK (status IN ('pending', 'verified', 'failed')) DEFAULT 'pending',
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table pour les notifications admin
CREATE TABLE IF NOT EXISTS admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Améliorer la table caja_vecina_payments
ALTER TABLE caja_vecina_payments 
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS receipt_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS amount_verified BOOLEAN DEFAULT FALSE;

-- Fonction sécurisée pour activer Premium après vérification
CREATE OR REPLACE FUNCTION activate_premium_after_verification(
  payment_user_id UUID,
  payment_method_name TEXT,
  transaction_reference TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  current_plan TEXT;
BEGIN
  -- Vérifier que l'utilisateur n'est pas déjà Premium
  SELECT plan INTO current_plan FROM users WHERE id = payment_user_id;
  
  IF current_plan = 'premium' THEN
    RAISE NOTICE 'User % is already premium', payment_user_id;
    RETURN FALSE;
  END IF;
  
  -- Activer Premium
  UPDATE users 
  SET 
    plan = 'premium',
    premium_since = NOW(),
    payment_method = payment_method_name,
    updated_at = NOW()
  WHERE id = payment_user_id;
  
  -- Log de sécurité
  INSERT INTO admin_notifications (type, title, content, data)
  VALUES (
    'premium_activation',
    'Activation Premium automatique',
    'Un utilisateur a été mis à niveau vers Premium',
    jsonb_build_object(
      'user_id', payment_user_id,
      'payment_method', payment_method_name,
      'transaction_reference', transaction_reference,
      'activated_at', NOW()
    )
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour empêcher l'activation manuelle non autorisée
CREATE OR REPLACE FUNCTION prevent_unauthorized_premium_activation()
RETURNS TRIGGER AS $$
BEGIN
  -- Seuls les admins ou le système peuvent activer Premium
  IF NEW.plan = 'premium' AND OLD.plan != 'premium' THEN
    -- Vérifier qu'il y a une transaction valide ou que c'est un admin
    IF NOT EXISTS (
      SELECT 1 FROM transactions 
      WHERE user_id = NEW.id 
        AND status = 'succeeded' 
        AND created_at > NOW() - INTERVAL '1 hour'
    ) AND auth.jwt() ->> 'email' != 'clodenerc@yahoo.fr' THEN
      RAISE EXCEPTION 'Activation Premium non autorisée sans paiement vérifié';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_prevent_unauthorized_premium_activation
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION prevent_unauthorized_premium_activation();

-- Index pour les performances
CREATE INDEX idx_usdt_payments_hash ON usdt_payments(transaction_hash);
CREATE INDEX idx_usdt_payments_user ON usdt_payments(user_id);
CREATE INDEX idx_admin_notifications_unread ON admin_notifications(is_read, created_at);

-- RLS
ALTER TABLE usdt_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own USDT payments" ON usdt_payments
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create USDT payments" ON usdt_payments
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Only admins can view notifications" ON admin_notifications
  FOR SELECT USING (auth.jwt() ->> 'email' = 'clodenerc@yahoo.fr');
