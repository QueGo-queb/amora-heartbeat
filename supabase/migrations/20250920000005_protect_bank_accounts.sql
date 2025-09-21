-- ✅ PROTECTION MAXIMALE DES COMPTES BANCAIRES ADMIN
-- Empêche toute modification automatique non autorisée

-- Table d'audit pour tracker toutes les tentatives de modification
CREATE TABLE IF NOT EXISTS bank_account_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID,
  action_type TEXT NOT NULL CHECK (action_type IN ('INSERT', 'UPDATE', 'DELETE', 'ATTEMPT_BLOCKED')),
  old_values JSONB,
  new_values JSONB,
  performed_by UUID REFERENCES auth.users(id),
  performed_by_email TEXT,
  ip_address INET,
  user_agent TEXT,
  is_authorized BOOLEAN DEFAULT FALSE,
  blocked_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fonction pour vérifier les droits d'admin
CREATE OR REPLACE FUNCTION is_authorized_admin()
RETURNS BOOLEAN AS $$
DECLARE
  current_user_email TEXT;
BEGIN
  -- Récupérer l'email de l'utilisateur connecté
  SELECT auth.jwt() ->> 'email' INTO current_user_email;
  
  -- Seul clodenerc@yahoo.fr est autorisé
  RETURN current_user_email = 'clodenerc@yahoo.fr';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour logger les tentatives de modification
CREATE OR REPLACE FUNCTION log_bank_account_action(
  p_account_id UUID,
  p_action_type TEXT,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL,
  p_blocked_reason TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
  current_user_id UUID;
  current_user_email TEXT;
BEGIN
  -- Récupérer les infos de l'utilisateur actuel
  SELECT auth.uid() INTO current_user_id;
  SELECT auth.jwt() ->> 'email' INTO current_user_email;
  
  INSERT INTO bank_account_audit_log (
    account_id,
    action_type,
    old_values,
    new_values,
    performed_by,
    performed_by_email,
    is_authorized,
    blocked_reason
  ) VALUES (
    p_account_id,
    p_action_type,
    p_old_values,
    p_new_values,
    current_user_id,
    current_user_email,
    is_authorized_admin(),
    p_blocked_reason
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ✅ TRIGGER DE PROTECTION POUR INSERTIONS
CREATE OR REPLACE FUNCTION protect_bank_account_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- Vérifier si l'utilisateur est autorisé
  IF NOT is_authorized_admin() THEN
    -- Logger la tentative bloquée
    PERFORM log_bank_account_action(
      NEW.id,
      'ATTEMPT_BLOCKED',
      NULL,
      row_to_json(NEW)::jsonb,
      'Tentative d''ajout de compte bancaire par utilisateur non autorisé'
    );
    
    RAISE EXCEPTION 'SÉCURITÉ: Seul l''administrateur peut ajouter des comptes bancaires. Tentative loggée.';
  END IF;
  
  -- Logger l'action autorisée
  PERFORM log_bank_account_action(
    NEW.id,
    'INSERT',
    NULL,
    row_to_json(NEW)::jsonb
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ✅ TRIGGER DE PROTECTION POUR MODIFICATIONS
CREATE OR REPLACE FUNCTION protect_bank_account_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Vérifier si l'utilisateur est autorisé
  IF NOT is_authorized_admin() THEN
    -- Logger la tentative bloquée
    PERFORM log_bank_account_action(
      OLD.id,
      'ATTEMPT_BLOCKED',
      row_to_json(OLD)::jsonb,
      row_to_json(NEW)::jsonb,
      'Tentative de modification de compte bancaire par utilisateur non autorisé'
    );
    
    RAISE EXCEPTION 'SÉCURITÉ: Seul l''administrateur peut modifier des comptes bancaires. Tentative loggée.';
  END IF;
  
  -- Logger la modification autorisée
  PERFORM log_bank_account_action(
    OLD.id,
    'UPDATE',
    row_to_json(OLD)::jsonb,
    row_to_json(NEW)::jsonb
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ✅ TRIGGER DE PROTECTION POUR SUPPRESSIONS
CREATE OR REPLACE FUNCTION protect_bank_account_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- Vérifier si l'utilisateur est autorisé
  IF NOT is_authorized_admin() THEN
    -- Logger la tentative bloquée
    PERFORM log_bank_account_action(
      OLD.id,
      'ATTEMPT_BLOCKED',
      row_to_json(OLD)::jsonb,
      NULL,
      'Tentative de suppression de compte bancaire par utilisateur non autorisé'
    );
    
    RAISE EXCEPTION 'SÉCURITÉ: Seul l''administrateur peut supprimer des comptes bancaires. Tentative loggée.';
  END IF;
  
  -- Logger la suppression autorisée
  PERFORM log_bank_account_action(
    OLD.id,
    'DELETE',
    row_to_json(OLD)::jsonb,
    NULL
  );
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Appliquer les triggers sur toutes les tables de comptes bancaires
-- (Adapter selon vos tables existantes)

-- Pour AdminBankAccountManager (si vous avez une table bank_accounts)
CREATE TABLE IF NOT EXISTS admin_bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_type TEXT NOT NULL CHECK (account_type IN ('bank', 'card', 'mobile')),
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_holder TEXT NOT NULL,
  country TEXT NOT NULL,
  currency TEXT NOT NULL,
  iban TEXT,
  swift TEXT,
  routing_number TEXT,
  transit_number TEXT,
  institution_number TEXT,
  mobile_email TEXT,
  mobile_phone TEXT,
  mobile_provider TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Appliquer les triggers de protection
CREATE TRIGGER trigger_protect_bank_account_insert
  BEFORE INSERT ON admin_bank_accounts
  FOR EACH ROW EXECUTE FUNCTION protect_bank_account_insert();

CREATE TRIGGER trigger_protect_bank_account_update
  BEFORE UPDATE ON admin_bank_accounts
  FOR EACH ROW EXECUTE FUNCTION protect_bank_account_update();

CREATE TRIGGER trigger_protect_bank_account_delete
  BEFORE DELETE ON admin_bank_accounts
  FOR EACH ROW EXECUTE FUNCTION protect_bank_account_delete();

-- Protection pour Caja Vecina
CREATE TRIGGER trigger_protect_caja_vecina_insert
  BEFORE INSERT ON caja_vecina_accounts
  FOR EACH ROW EXECUTE FUNCTION protect_bank_account_insert();

CREATE TRIGGER trigger_protect_caja_vecina_update
  BEFORE UPDATE ON caja_vecina_accounts
  FOR EACH ROW EXECUTE FUNCTION protect_bank_account_update();

CREATE TRIGGER trigger_protect_caja_vecina_delete
  BEFORE DELETE ON caja_vecina_accounts
  FOR EACH ROW EXECUTE FUNCTION protect_bank_account_delete();

-- Protection pour USDT
CREATE TRIGGER trigger_protect_usdt_links_insert
  BEFORE INSERT ON usdt_payment_links
  FOR EACH ROW EXECUTE FUNCTION protect_bank_account_insert();

CREATE TRIGGER trigger_protect_usdt_links_update
  BEFORE UPDATE ON usdt_payment_links
  FOR EACH ROW EXECUTE FUNCTION protect_bank_account_update();

CREATE TRIGGER trigger_protect_usdt_links_delete
  BEFORE DELETE ON usdt_payment_links
  FOR EACH ROW EXECUTE FUNCTION protect_bank_account_delete();

-- RLS strict pour les comptes bancaires
ALTER TABLE admin_bank_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admin can view bank accounts" ON admin_bank_accounts
  FOR SELECT USING (is_authorized_admin());

CREATE POLICY "Only admin can manage bank accounts" ON admin_bank_accounts
  FOR ALL USING (is_authorized_admin());

-- Index pour l'audit
CREATE INDEX idx_bank_audit_log_created_at ON bank_account_audit_log(created_at DESC);
CREATE INDEX idx_bank_audit_log_account_id ON bank_account_audit_log(account_id);
CREATE INDEX idx_bank_audit_log_unauthorized ON bank_account_audit_log(is_authorized) WHERE is_authorized = FALSE;

-- Vue pour les tentatives non autorisées (monitoring)
CREATE OR REPLACE VIEW unauthorized_bank_access_attempts AS
SELECT 
  id,
  account_id,
  action_type,
  performed_by_email,
  blocked_reason,
  created_at
FROM bank_account_audit_log
WHERE is_authorized = FALSE
ORDER BY created_at DESC;
