/**
 * Script de données de test pour les publicités et promotions
 * Crée 10 publicités variées et 3 promotions pour tester le système
 */

-- Nettoyer les données existantes
DELETE FROM ads_clicks;
DELETE FROM ads_impressions;
DELETE FROM ads;
DELETE FROM promotions;
DELETE FROM reports;

-- Insérer des publicités de test
INSERT INTO ads (title, content, type, media, target_tags, start_at, end_at, is_active, created_by) VALUES
-- Publicité texte
(
  'Découvrez AMORA Premium',
  'Rejoignez AMORA Premium et profitez de fonctionnalités exclusives : matching illimité, messages prioritaires, et bien plus encore ! 💕',
  'text',
  '{}',
  ARRAY['premium', 'dating', 'love'],
  NOW() - INTERVAL '1 day',
  NOW() + INTERVAL '30 days',
  true,
  '550e8400-e29b-41d4-a716-446655440001'
),

-- Publicité image
(
  'Voyagez avec votre âme sœur',
  'Trouvez l\'amour qui vous fera voyager aux quatre coins du monde. Des rencontres authentiques qui changent la vie.',
  'image',
  '{"url": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop", "width": 800, "height": 600, "alt": "Couple voyageant"}',
  ARRAY['voyage', 'amour', 'rencontre'],
  NOW() - INTERVAL '2 days',
  NOW() + INTERVAL '25 days',
  true,
  '550e8400-e29b-41d4-a716-446655440001'
),

-- Publicité GIF
(
  'Animation de l\'amour',
  'L\'amour est une belle aventure. Commencez la vôtre aujourd\'hui sur AMORA !',
  'gif',
  '{"url": "https://media.giphy.com/media/26BRv0ThflsHCqDrG/giphy.gif", "width": 480, "height": 270, "alt": "Cœur animé"}',
  ARRAY['amour', 'animation', 'cœur'],
  NOW() - INTERVAL '3 days',
  NOW() + INTERVAL '20 days',
  true,
  '550e8400-e29b-41d4-a716-446655440001'
),

-- Publicité vidéo
(
  'Témoignages d\'amour',
  'Découvrez les histoires d\'amour qui ont commencé sur AMORA. Votre histoire pourrait être la prochaine !',
  'video',
  '{"url": "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4", "width": 1280, "height": 720, "duration": 30, "thumbnail": "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&h=225&fit=crop"}',
  ARRAY['témoignage', 'histoire', 'amour'],
  NOW() - INTERVAL '4 days',
  NOW() + INTERVAL '15 days',
  true,
  '550e8400-e29b-41d4-a716-446655440001'
),

-- Publicité Lottie
(
  'Animation Lottie - Cœur battant',
  'Votre cœur bat-il pour quelqu\'un ? Trouvez cette personne sur AMORA !',
  'lottie',
  '{"url": "https://assets2.lottiefiles.com/packages/lf20_UJNc2t.json", "width": 400, "height": 300, "loop": true, "autoplay": true}',
  ARRAY['animation', 'cœur', 'amour'],
  NOW() - INTERVAL '5 days',
  NOW() + INTERVAL '10 days',
  true,
  '550e8400-e29b-41d4-a716-446655440001'
),

-- Publicité pour la musique
(
  'Partagez votre passion musicale',
  'La musique rapproche les cœurs. Trouvez quelqu\'un qui partage vos goûts musicaux !',
  'image',
  '{"url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop", "width": 800, "height": 600, "alt": "Instruments de musique"}',
  ARRAY['musique', 'passion', 'partage'],
  NOW() - INTERVAL '6 days',
  NOW() + INTERVAL '18 days',
  true,
  '550e8400-e29b-41d4-a716-446655440001'
),

-- Publicité pour le sport
(
  'Sport et bien-être ensemble',
  'Trouvez un partenaire de sport et de vie. L\'amour et la santé vont de pair !',
  'image',
  '{"url": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop", "width": 800, "height": 600, "alt": "Couple faisant du sport"}',
  ARRAY['sport', 'bien-être', 'santé'],
  NOW() - INTERVAL '7 days',
  NOW() + INTERVAL '22 days',
  true,
  '550e8400-e29b-41d4-a716-446655440001'
),

-- Publicité pour la cuisine
(
  'Cuisinez l\'amour ensemble',
  'L\'amour passe aussi par l\'estomac ! Trouvez quelqu\'un qui partage votre passion culinaire.',
  'image',
  '{"url": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop", "width": 800, "height": 600, "alt": "Cuisine romantique"}',
  ARRAY['cuisine', 'gastronomie', 'romantisme'],
  NOW() - INTERVAL '8 days',
  NOW() + INTERVAL '12 days',
  true,
  '550e8400-e29b-41d4-a716-446655440001'
),

-- Publicité pour les voyages
(
  'Voyagez en couple',
  'L\'amour n\'a pas de frontières. Découvrez le monde avec votre âme sœur !',
  'image',
  '{"url": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop", "width": 800, "height": 600, "alt": "Couple voyageant"}',
  ARRAY['voyage', 'aventure', 'découverte'],
  NOW() - INTERVAL '9 days',
  NOW() + INTERVAL '28 days',
  true,
  '550e8400-e29b-41d4-a716-446655440001'
),

-- Publicité pour la technologie
(
  'Innovation et amour',
  'L\'amour à l\'ère numérique. AMORA utilise la technologie pour créer des connexions authentiques.',
  'image',
  '{"url": "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop", "width": 800, "height": 600, "alt": "Technologie moderne"}',
  ARRAY['technologie', 'innovation', 'numérique'],
  NOW() - INTERVAL '10 days',
  NOW() + INTERVAL '35 days',
  true,
  '550e8400-e29b-41d4-a716-446655440001'
);

-- Insérer des promotions de test
INSERT INTO promotions (title, description, promo_type, params, start_at, end_at, is_active, created_by, price_cents) VALUES
(
  'Promotion Premium -50%',
  'Profitez de 50% de réduction sur votre premier mois d\'abonnement Premium !',
  'discount',
  '{"discount_percent": 50, "duration_months": 1, "code": "PREMIUM50"}',
  NOW() - INTERVAL '5 days',
  NOW() + INTERVAL '15 days',
  true,
  '550e8400-e29b-41d4-a716-446655440001',
  499
),

(
  'Boost de profil',
  'Mettez votre profil en avant pendant 7 jours et multipliez vos chances de rencontres !',
  'boost',
  '{"boost_duration_days": 7, "visibility_multiplier": 3, "featured_position": true}',
  NOW() - INTERVAL '3 days',
  NOW() + INTERVAL '20 days',
  true,
  '550e8400-e29b-41d4-a716-446655440001',
  999
),

(
  'Profil mis en avant',
  'Votre profil sera affiché en tête de liste pendant 24h pour maximiser vos chances !',
  'featured',
  '{"featured_duration_hours": 24, "priority_score": 100, "highlighted": true}',
  NOW() - INTERVAL '1 day',
  NOW() + INTERVAL '10 days',
  true,
  '550e8400-e29b-41d4-a716-446655440001',
  1499
);

-- Insérer quelques signalements de test
INSERT INTO reports (reporter_id, reported_user_id, reported_post_id, report_type, description, status) VALUES
(
  '550e8400-e29b-41d4-a716-446655440002',
  '550e8400-e29b-41d4-a716-446655440003',
  NULL,
  'inappropriate',
  'Profil avec photos inappropriées',
  'pending'
),

(
  '550e8400-e29b-41d4-a716-446655440004',
  NULL,
  '550e8400-e29b-41d4-a716-446655440001',
  'spam',
  'Contenu publicitaire non autorisé',
  'pending'
),

(
  '550e8400-e29b-41d4-a716-446655440005',
  '550e8400-e29b-41d4-a716-446655440006',
  NULL,
  'fake',
  'Profil suspect avec informations contradictoires',
  'pending'
);

-- Insérer quelques impressions et clics de test
INSERT INTO ads_impressions (ad_id, user_id, ip_address, user_agent) VALUES
(
  (SELECT id FROM ads WHERE title = 'Découvrez AMORA Premium' LIMIT 1),
  '550e8400-e29b-41d4-a716-446655440002',
  '192.168.1.1',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
),

(
  (SELECT id FROM ads WHERE title = 'Voyagez avec votre âme sœur' LIMIT 1),
  '550e8400-e29b-41d4-a716-446655440003',
  '192.168.1.2',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
);

INSERT INTO ads_clicks (ad_id, user_id, ip_address, user_agent) VALUES
(
  (SELECT id FROM ads WHERE title = 'Découvrez AMORA Premium' LIMIT 1),
  '550e8400-e29b-41d4-a716-446655440002',
  '192.168.1.1',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
);
