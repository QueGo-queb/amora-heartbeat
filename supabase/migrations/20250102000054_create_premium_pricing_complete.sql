-- Migration complète pour créer la table premium_pricing et corriger les permissions
-- Cette migration résout définitivement le problème

-- 1. Supprimer la table si elle existe (pour repartir proprement)
DROP TABLE IF EXISTS premium_pricing CASCADE;

-- 2. Créer la table premium_pricing complète
CREATE TABLE premium_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  price_usd DECIMAL(10,2) NOT NULL,
  price_eur DECIMAL(10,2),
  price_cad DECIMAL(10,2),
  price_clp DECIMAL(10,2),
  price_htg DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  exchange_rates JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT FALSE,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Créer les index pour les performances
CREATE INDEX idx_premium_pricing_active ON premium_pricing(is_active);
CREATE INDEX idx_premium_pricing_created_at ON premium_pricing(created_at);

-- 4. Contrainte pour s'assurer qu'un seul prix est actif à la fois
CREATE UNIQUE INDEX idx_premium_pricing_unique_active 
ON premium_pricing (is_active) 
WHERE is_active = true;

-- 5. Fonction pour activer un prix et désactiver les autres
CREATE OR REPLACE FUNCTION activate_premium_pricing(pricing_id UUID)
RETURNS void AS $$
BEGIN
  -- Désactiver tous les prix
  UPDATE premium_pricing SET is_active = false WHERE is_active = true;
  
  -- Activer le prix spécifié
  UPDATE premium_pricing 
  SET is_active = true, updated_at = NOW() 
  WHERE id = pricing_id;
END;
$$ LANGUAGE plpgsql;

-- 6. Activer RLS
ALTER TABLE premium_pricing ENABLE ROW LEVEL SECURITY;

-- 7. Politiques RLS simplifiées qui évitent le problème de permissions
-- Politique pour lecture : tout le monde peut voir les prix actifs
CREATE POLICY "Anyone can view active pricing" ON premium_pricing
  FOR SELECT USING (is_active = true);

-- Politique pour admin : utiliser l'email du JWT directement
CREATE POLICY "Admin can manage all pricing" ON premium_pricing
  FOR ALL USING (
    (current_setting('request.jwt.claims', true)::json ->> 'email') = 'clodenerc@yahoo.fr'
  );

-- 8. Insérer un prix par défaut pour tester
INSERT INTO premium_pricing (
  price_usd, 
  price_eur, 
  price_cad, 
  price_clp, 
  price_htg, 
  currency, 
  exchange_rates, 
  is_active
) VALUES (
  9.99, 
  8.50, 
  13.50, 
  8500.00, 
  1350.00, 
  'USD', 
  '{"USD": 1, "EUR": 0.85, "CAD": 1.35, "CLP": 850, "HTG": 135}', 
  true
);

-- 9. Commentaires pour documentation
COMMENT ON TABLE premium_pricing IS 'Table pour gérer les prix premium configurables par l''admin';
COMMENT ON COLUMN premium_pricing.exchange_rates IS 'Taux de change utilisés pour la conversion (format JSON)';
COMMENT ON COLUMN premium_pricing.is_active IS 'Indique si ce prix est actuellement actif (un seul peut être actif)';
