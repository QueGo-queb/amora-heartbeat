-- Nettoyer les liens dupliqués dans footer_links
-- Supprimer TOUS les liens existants pour repartir à zéro
DELETE FROM footer_links;

-- Insérer UNIQUEMENT les liens fonctionnels (sans doublons)
INSERT INTO footer_links (category, name, href, order_index, is_active) VALUES
-- Support
('support', 'FAQ', '/faq', 1, true),
('support', 'Centre d''aide', '/help-center', 2, true),
('support', 'Contact', '/contact', 3, true),

-- Légal - URLS EXACTES qui correspondent aux pages statiques
('legal', 'Conditions d''utilisation', '/terms-of-service', 1, true),
('legal', 'Politique de confidentialité', '/privacy-policy', 2, true),
('legal', 'Politique des cookies', '/cookies-policy', 3, true),
('legal', 'Mentions légales', '/legal-notices', 4, true);
