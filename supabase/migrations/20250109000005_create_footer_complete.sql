-- Migration complète pour créer tout le système de footer
-- Cette migration crée les tables et insère les données réelles

-- Table pour le contenu du footer
CREATE TABLE IF NOT EXISTS footer_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL DEFAULT 'Amora',
  company_description TEXT NOT NULL DEFAULT 'La plateforme de rencontres qui unit les cœurs du monde entier',
  company_stats JSONB NOT NULL DEFAULT '[
    {"icon": "users", "value": "50K+", "label": "Utilisateurs actifs"},
    {"icon": "globe", "value": "25+", "label": "Pays"},
    {"icon": "heart", "value": "10K+", "label": "Couples formés"}
  ]',
  contact_email TEXT DEFAULT 'contact@amora.com',
  contact_hours TEXT DEFAULT 'Lun-Ven 9h-18h',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table pour les liens du footer
CREATE TABLE IF NOT EXISTS footer_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('quick_links', 'support', 'legal')),
  name TEXT NOT NULL,
  href TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table pour les réseaux sociaux
CREATE TABLE IF NOT EXISTS footer_socials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  href TEXT NOT NULL,
  color_class TEXT DEFAULT '',
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insérer le contenu par défaut
INSERT INTO footer_content (company_name, company_description, company_stats, contact_email, contact_hours)
VALUES (
  'Amora',
  'La plateforme de rencontres qui unit les cœurs du monde entier. Trouvez l''amour authentique grâce à notre algorithme de compatibilité avancé.',
  '[
    {"icon": "users", "value": "50K+", "label": "Utilisateurs actifs"},
    {"icon": "globe", "value": "25+", "label": "Pays"},
    {"icon": "heart", "value": "10K+", "label": "Couples formés"}
  ]',
  'contact@amora.com',
  'Lun-Ven 9h-18h'
) ON CONFLICT DO NOTHING;

-- Insérer les liens du footer
INSERT INTO footer_links (category, name, href, order_index, is_active) VALUES
-- Support
('support', 'FAQ', '/faq', 1, true),
('support', 'Centre d''aide', '/help-center', 2, true),
('support', 'Support', '/contact', 3, true),

-- Légal
('legal', 'Conditions d''utilisation', '/terms-of-service', 1, true),
('legal', 'Politique de confidentialité', '/privacy-policy', 2, true),
('legal', 'Cookies', '/cookies-policy', 3, true),
('legal', 'Mentions légales', '/legal-notices', 4, true)
ON CONFLICT DO NOTHING;

-- Insérer les réseaux sociaux
INSERT INTO footer_socials (name, icon_name, href, color_class, order_index, is_active) VALUES
('Facebook', 'facebook', 'https://facebook.com/amora', 'text-blue-500', 1, true),
('Instagram', 'instagram', 'https://instagram.com/amora', 'text-pink-500', 2, true),
('Twitter', 'twitter', 'https://twitter.com/amora', 'text-blue-400', 3, true),
('LinkedIn', 'linkedin', 'https://linkedin.com/company/amora', 'text-blue-600', 4, true),
('YouTube', 'youtube', 'https://youtube.com/@amora', 'text-red-500', 5, true)
ON CONFLICT DO NOTHING;

-- Indexes pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_footer_links_category ON footer_links(category, order_index);
CREATE INDEX IF NOT EXISTS idx_footer_links_active ON footer_links(is_active);
CREATE INDEX IF NOT EXISTS idx_footer_socials_order ON footer_socials(order_index);
CREATE INDEX IF NOT EXISTS idx_footer_socials_active ON footer_socials(is_active);

-- Triggers pour updated_at
CREATE TRIGGER update_footer_content_updated_at 
  BEFORE UPDATE ON footer_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_footer_links_updated_at 
  BEFORE UPDATE ON footer_links
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_footer_socials_updated_at 
  BEFORE UPDATE ON footer_socials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE footer_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE footer_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE footer_socials ENABLE ROW LEVEL SECURITY;

-- Lecture publique pour tous
CREATE POLICY "Allow public read footer_content" ON footer_content
  FOR SELECT USING (is_active = true);

CREATE POLICY "Allow public read footer_links" ON footer_links
  FOR SELECT USING (is_active = true);

CREATE POLICY "Allow public read footer_socials" ON footer_socials
  FOR SELECT USING (is_active = true);

-- Modification uniquement pour les admins
CREATE POLICY "Allow admin full access footer_content" ON footer_content
  FOR ALL USING (auth.jwt() ->> 'email' = 'clodenerc@yahoo.fr');

CREATE POLICY "Allow admin full access footer_links" ON footer_links
  FOR ALL USING (auth.jwt() ->> 'email' = 'clodenerc@yahoo.fr');

CREATE POLICY "Allow admin full access footer_socials" ON footer_socials
  FOR ALL USING (auth.jwt() ->> 'email' = 'clodenerc@yahoo.fr');
