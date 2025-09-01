/**
 * Migration pour créer les tables d'administration
 * - Table ads : publicités avec différents types de médias
 * - Table promotions : promotions payantes et boostées
 * - Table ads_impressions : tracking des impressions
 * - Table ads_clicks : tracking des clics
 */

-- Table des publicités
CREATE TABLE IF NOT EXISTS ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  type TEXT NOT NULL CHECK (type IN ('text', 'image', 'gif', 'video', 'lottie')),
  media JSONB DEFAULT '{}',
  target_tags TEXT[] DEFAULT '{}',
  target_location JSONB DEFAULT NULL,
  start_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Contraintes
  CONSTRAINT ads_dates_check CHECK (end_at > start_at),
  CONSTRAINT ads_media_check CHECK (
    (type = 'text' AND media = '{}') OR
    (type IN ('image', 'gif', 'video', 'lottie') AND media != '{}')
  )
);

-- Table des promotions
CREATE TABLE IF NOT EXISTS promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  promo_type TEXT NOT NULL CHECK (promo_type IN ('discount', 'featured', 'boost', 'premium')),
  params JSONB DEFAULT '{}',
  start_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  price_cents INTEGER DEFAULT NULL,
  stripe_product_id TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Contraintes
  CONSTRAINT promotions_dates_check CHECK (end_at > start_at)
);

-- Table de tracking des impressions publicitaires
CREATE TABLE IF NOT EXISTS ads_impressions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id UUID REFERENCES ads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  ip_address INET,
  user_agent TEXT,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Éviter les doublons
  UNIQUE(ad_id, user_id, DATE(viewed_at))
);

-- Table de tracking des clics publicitaires
CREATE TABLE IF NOT EXISTS ads_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id UUID REFERENCES ads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  ip_address INET,
  user_agent TEXT,
  clicked_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des signalements pour modération
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reported_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reported_post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL CHECK (report_type IN ('spam', 'inappropriate', 'harassment', 'fake', 'other')),
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Contraintes
  CONSTRAINT reports_target_check CHECK (
    (reported_user_id IS NOT NULL AND reported_post_id IS NULL) OR
    (reported_user_id IS NULL AND reported_post_id IS NOT NULL)
  )
);

-- Indexes pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_ads_active_dates ON ads (is_active, start_at, end_at);
CREATE INDEX IF NOT EXISTS idx_ads_target_tags ON ads USING GIN (target_tags);
CREATE INDEX IF NOT EXISTS idx_ads_type ON ads (type);
CREATE INDEX IF NOT EXISTS idx_ads_created_by ON ads (created_by);

CREATE INDEX IF NOT EXISTS idx_promotions_active_dates ON promotions (is_active, start_at, end_at);
CREATE INDEX IF NOT EXISTS idx_promotions_type ON promotions (promo_type);
CREATE INDEX IF NOT EXISTS idx_promotions_created_by ON promotions (created_by);

CREATE INDEX IF NOT EXISTS idx_ads_impressions_ad_date ON ads_impressions (ad_id, viewed_at);
CREATE INDEX IF NOT EXISTS idx_ads_impressions_user ON ads_impressions (user_id);

CREATE INDEX IF NOT EXISTS idx_ads_clicks_ad_date ON ads_clicks (ad_id, clicked_at);
CREATE INDEX IF NOT EXISTS idx_ads_clicks_user ON ads_clicks (user_id);

CREATE INDEX IF NOT EXISTS idx_reports_status ON reports (status);
CREATE INDEX IF NOT EXISTS idx_reports_type ON reports (report_type);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports (created_at);

-- Triggers pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ads_updated_at BEFORE UPDATE ON ads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_promotions_updated_at BEFORE UPDATE ON promotions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour calculer l'âge
CREATE OR REPLACE FUNCTION calculate_age(birth_date DATE)
RETURNS INTEGER AS $$
BEGIN
  RETURN EXTRACT(YEAR FROM AGE(birth_date));
END;
$$ LANGUAGE plpgsql;

-- Vue pour les statistiques d'administration
CREATE OR REPLACE VIEW admin_stats AS
SELECT 
  (SELECT COUNT(*) FROM profiles) as total_users,
  (SELECT COUNT(*) FROM profiles WHERE plan = 'premium') as premium_users,
  (SELECT COUNT(*) FROM posts WHERE visibility = 'public') as total_posts,
  (SELECT COUNT(*) FROM ads WHERE is_active = true AND NOW() BETWEEN start_at AND end_at) as active_ads,
  (SELECT COUNT(*) FROM promotions WHERE is_active = true AND NOW() BETWEEN start_at AND end_at) as active_promotions,
  (SELECT COUNT(*) FROM reports WHERE status = 'pending') as pending_reports,
  (SELECT COALESCE(SUM(amount_cents), 0) FROM transactions WHERE status = 'succeeded') as total_revenue_cents;
