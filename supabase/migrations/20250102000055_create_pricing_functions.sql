-- Fonctions PostgreSQL pour gérer les prix premium sans problème de RLS

-- Fonction pour récupérer tous les prix (admin seulement)
CREATE OR REPLACE FUNCTION get_all_premium_pricing(admin_email TEXT)
RETURNS TABLE (
  id UUID,
  price_usd DECIMAL,
  price_eur DECIMAL,
  price_cad DECIMAL,
  price_clp DECIMAL,
  price_htg DECIMAL,
  currency TEXT,
  exchange_rates JSONB,
  is_active BOOLEAN,
  created_by UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  -- Vérifier que c'est l'admin
  IF admin_email != 'clodenerc@yahoo.fr' THEN
    RAISE EXCEPTION 'Accès non autorisé';
  END IF;
  
  RETURN QUERY
  SELECT p.id, p.price_usd, p.price_eur, p.price_cad, p.price_clp, p.price_htg,
         p.currency, p.exchange_rates, p.is_active, p.created_by, p.created_at, p.updated_at
  FROM premium_pricing p
  ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour récupérer le prix actif (public)
CREATE OR REPLACE FUNCTION get_active_premium_pricing()
RETURNS TABLE (
  id UUID,
  price_usd DECIMAL,
  price_eur DECIMAL,
  price_cad DECIMAL,
  price_clp DECIMAL,
  price_htg DECIMAL,
  currency TEXT,
  exchange_rates JSONB,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.price_usd, p.price_eur, p.price_cad, p.price_clp, p.price_htg,
         p.currency, p.exchange_rates, p.is_active, p.created_at, p.updated_at
  FROM premium_pricing p
  WHERE p.is_active = true
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour sauvegarder un prix (admin seulement)
CREATE OR REPLACE FUNCTION save_premium_pricing(
  admin_email TEXT,
  p_price_usd DECIMAL,
  p_price_eur DECIMAL DEFAULT NULL,
  p_price_cad DECIMAL DEFAULT NULL,
  p_price_clp DECIMAL DEFAULT NULL,
  p_price_htg DECIMAL DEFAULT NULL,
  p_currency TEXT DEFAULT 'USD',
  p_exchange_rates JSONB DEFAULT '{}',
  p_is_active BOOLEAN DEFAULT false,
  p_created_by UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  new_id UUID;
BEGIN
  -- Vérifier que c'est l'admin
  IF admin_email != 'clodenerc@yahoo.fr' THEN
    RAISE EXCEPTION 'Accès non autorisé';
  END IF;
  
  -- Si on active ce prix, désactiver les autres
  IF p_is_active THEN
    UPDATE premium_pricing SET is_active = false WHERE is_active = true;
  END IF;
  
  -- Insérer le nouveau prix
  INSERT INTO premium_pricing (
    price_usd, price_eur, price_cad, price_clp, price_htg,
    currency, exchange_rates, is_active, created_by
  ) VALUES (
    p_price_usd, p_price_eur, p_price_cad, p_price_clp, p_price_htg,
    p_currency, p_exchange_rates, p_is_active, p_created_by
  ) RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
