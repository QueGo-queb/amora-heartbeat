/**
 * Migration pour créer la table footer_content
 * Permet de stocker le contenu modifiable du footer
 */

-- Table pour le contenu du footer
CREATE TABLE IF NOT EXISTS footer_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  links JSONB NOT NULL DEFAULT '{
    "home": "/",
    "about": "/about",
    "contact": "/contact", 
    "faq": "/faq",
    "terms": "/terms",
    "privacy": "/privacy"
  }',
  socials JSONB NOT NULL DEFAULT '{
    "facebook": "",
    "instagram": "",
    "twitter": "",
    "linkedin": "",
    "tiktok": ""
  }',
  newsletter_text TEXT DEFAULT 'Restez connecté avec Amora',
  copyright TEXT DEFAULT '© 2025 Amora - Tous droits réservés',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insérer un enregistrement par défaut
INSERT INTO footer_content (id, links, socials, newsletter_text, copyright)
VALUES (
  gen_random_uuid(),
  '{
    "home": "/",
    "about": "/about", 
    "contact": "/contact",
    "faq": "/faq",
    "terms": "/terms",
    "privacy": "/privacy"
  }',
  '{
    "facebook": "https://facebook.com/amora",
    "instagram": "https://instagram.com/amora",
    "twitter": "https://twitter.com/amora",
    "linkedin": "https://linkedin.com/company/amora",
    "tiktok": "https://tiktok.com/@amora"
  }',
  'Restez connecté avec Amora et recevez nos dernières actualités',
  '© 2025 Amora - Tous droits réservés'
) ON CONFLICT DO NOTHING;

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_footer_content_updated_at ON footer_content(updated_at);

-- RLS Policies
ALTER TABLE footer_content ENABLE ROW LEVEL SECURITY;

-- Permettre la lecture publique
CREATE POLICY "Allow public read access" ON footer_content
  FOR SELECT USING (true);

-- Permettre la modification uniquement aux admins (via service role)
CREATE POLICY "Allow admin update" ON footer_content
  FOR UPDATE USING (auth.jwt() ->> 'email' = 'clodenerc@yahoo.fr');

-- Permettre l'insertion uniquement aux admins
CREATE POLICY "Allow admin insert" ON footer_content
  FOR INSERT WITH CHECK (auth.jwt() ->> 'email' = 'clodenerc@yahoo.fr');
