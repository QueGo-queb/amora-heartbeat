/**
 * Script de données de test pour le fil d'actualité
 * Crée 10 profils et 30 posts avec des intérêts variés
 */

-- Nettoyer les données existantes
DELETE FROM comments;
DELETE FROM likes;
DELETE FROM posts;
DELETE FROM profiles;

-- Insérer 10 profils de test
INSERT INTO profiles (id, email, full_name, gender, birthdate, location, interests, looking_for_gender, looking_for_age_min, looking_for_age_max, looking_for_interests) VALUES
-- Profils féminins
('550e8400-e29b-41d4-a716-446655440001', 'marie.dubois@test.com', 'Marie Dubois', 'female', '1995-03-15', 'Paris, France', ARRAY['voyage', 'cuisine', 'photographie', 'art'], 'male', 25, 35, ARRAY['voyage', 'cuisine']),
('550e8400-e29b-41d4-a716-446655440002', 'sophie.martin@test.com', 'Sophie Martin', 'female', '1992-07-22', 'Lyon, France', ARRAY['musique', 'danse', 'fitness', 'mode'], 'male', 28, 38, ARRAY['musique', 'fitness']),
('550e8400-e29b-41d4-a716-446655440003', 'julie.bernard@test.com', 'Julie Bernard', 'female', '1998-11-08', 'Marseille, France', ARRAY['littérature', 'cinéma', 'théâtre', 'poésie'], 'male', 22, 32, ARRAY['littérature', 'cinéma']),
('550e8400-e29b-41d4-a716-446655440004', 'laura.petit@test.com', 'Laura Petit', 'female', '1990-05-12', 'Toulouse, France', ARRAY['sport', 'nature', 'randonnée', 'yoga'], 'male', 30, 40, ARRAY['sport', 'nature']),
('550e8400-e29b-41d4-a716-446655440005', 'emma.roux@test.com', 'Emma Roux', 'female', '1993-09-30', 'Nantes, France', ARRAY['technologie', 'gaming', 'anime', 'manga'], 'male', 25, 35, ARRAY['technologie', 'gaming']),

-- Profils masculins
('550e8400-e29b-41d4-a716-446655440006', 'thomas.leroy@test.com', 'Thomas Leroy', 'male', '1994-01-18', 'Bordeaux, France', ARRAY['voyage', 'photographie', 'cuisine', 'sport'], 'female', 24, 34, ARRAY['voyage', 'cuisine']),
('550e8400-e29b-41d4-a716-446655440007', 'pierre.moreau@test.com', 'Pierre Moreau', 'male', '1991-12-03', 'Strasbourg, France', ARRAY['musique', 'instruments', 'concert', 'festival'], 'female', 27, 37, ARRAY['musique', 'concert']),
('550e8400-e29b-41d4-a716-446655440008', 'alexandre.simon@test.com', 'Alexandre Simon', 'male', '1996-08-25', 'Nice, France', ARRAY['littérature', 'philosophie', 'histoire', 'politique'], 'female', 22, 32, ARRAY['littérature', 'philosophie']),
('550e8400-e29b-41d4-a716-446655440009', 'nicolas.lefevre@test.com', 'Nicolas Lefèvre', 'male', '1989-04-14', 'Lille, France', ARRAY['sport', 'football', 'fitness', 'nutrition'], 'female', 30, 40, ARRAY['sport', 'fitness']),
('550e8400-e29b-41d4-a716-446655440010', 'david.mercier@test.com', 'David Mercier', 'male', '1997-06-20', 'Rennes, France', ARRAY['technologie', 'programmation', 'startup', 'innovation'], 'female', 23, 33, ARRAY['technologie', 'programmation']);

-- Insérer 30 posts de test
INSERT INTO posts (user_id, content, tags, visibility) VALUES
-- Posts de Marie (voyage, cuisine, photographie, art)
('550e8400-e29b-41d4-a716-446655440001', 'Juste de retour d''un voyage incroyable en Italie ! Les paysages de Toscane sont à couper le souffle. Qui d''autre a visité cette région ?', ARRAY['voyage', 'italie', 'toscane'], 'public'),
('550e8400-e29b-41d4-a716-446655440001', 'Nouvelle recette testée ce soir : risotto aux champignons et parmesan. Un délice ! ����', ARRAY['cuisine', 'risotto', 'recette'], 'public'),
('550e8400-e29b-41d4-a716-446655440001', 'Exposition d''art moderne au Centre Pompidou. Les œuvres de cette artiste contemporaine sont vraiment inspirantes.', ARRAY['art', 'exposition', 'culture'], 'public'),

-- Posts de Sophie (musique, danse, fitness, mode)
('550e8400-e29b-41d4-a716-446655440002', 'Concert de jazz hier soir, ambiance incroyable ! La musique live a quelque chose de magique. ��', ARRAY['musique', 'jazz', 'concert'], 'public'),
('550e8400-e29b-41d4-a716-446655440002', 'Séance de fitness ce matin, je me sens en pleine forme ! 💪 Qui d''autre fait du sport régulièrement ?', ARRAY['fitness', 'sport', 'motivation'], 'public'),
('550e8400-e29b-41d4-a716-446655440002', 'Nouvelle collection de mode printemps-été, les couleurs sont magnifiques cette année ! ��', ARRAY['mode', 'fashion', 'style'], 'public'),

-- Posts de Julie (littérature, cinéma, théâtre, poésie)
('550e8400-e29b-41d4-a716-446655440003', 'Lecture du soir : "Le Petit Prince" de Saint-Exupéry. Ce livre me touche à chaque fois. 📚', ARRAY['littérature', 'lecture', 'livre'], 'public'),
('550e8400-e29b-41d4-a716-446655440003', 'Film vu hier : "La La Land". La musique et la photographie sont sublimes ! 🎬', ARRAY['cinéma', 'film', 'musical'], 'public'),
('550e8400-e29b-41d4-a716-446655440003', 'Pièce de théâtre ce weekend, j''adore l''ambiance des salles de spectacle. ��', ARRAY['théâtre', 'spectacle', 'culture'], 'public'),

-- Posts de Laura (sport, nature, randonnée, yoga)
('550e8400-e29b-41d4-a716-446655440004', 'Randonnée en montagne ce weekend, les vues étaient époustouflantes ! 🏔️', ARRAY['randonnée', 'montagne', 'nature'], 'public'),
('550e8400-e29b-41d4-a716-446655440004', 'Séance de yoga ce matin, je me sens zen et détendue. ��‍♀️', ARRAY['yoga', 'bien-être', 'détente'], 'public'),
('550e8400-e29b-41d4-a716-446655440004', 'Match de tennis hier, j''ai gagné ! Le sport me donne tellement d''énergie. ��', ARRAY['sport', 'tennis', 'victoire'], 'public'),

-- Posts d'Emma (technologie, gaming, anime, manga)
('550e8400-e29b-41d4-a716-446655440005', 'Nouveau jeu vidéo sorti, les graphismes sont incroyables ! 🎮', ARRAY['gaming', 'jeu-vidéo', 'technologie'], 'public'),
('550e8400-e29b-41d4-a716-446655440005', 'Anime de la saison : vraiment addictif ! Les personnages sont attachants. ��', ARRAY['anime', 'japon', 'culture'], 'public'),
('550e8400-e29b-41d4-a716-446655440005', 'Découverte d''une nouvelle technologie révolutionnaire, l''avenir s''annonce passionnant ! 🤖', ARRAY['technologie', 'innovation', 'futur'], 'public'),

-- Posts de Thomas (voyage, photographie, cuisine, sport)
('550e8400-e29b-41d4-a716-446655440006', 'Séance photo ce matin, la lumière était parfaite ! 📸', ARRAY['photographie', 'art', 'créativité'], 'public'),
('550e8400-e29b-41d4-a716-446655440006', 'Cours de cuisine italienne hier, j''ai appris à faire de vraies pâtes fraîches ! ��', ARRAY['cuisine', 'italie', 'pâtes'], 'public'),
('550e8400-e29b-41d4-a716-446655440006', 'Match de foot avec les copains, ambiance conviviale ! ⚽', ARRAY['sport', 'football', 'amis'], 'public'),

-- Posts de Pierre (musique, instruments, concert, festival)
('550e8400-e29b-41d4-a716-446655440007', 'Répétition avec mon groupe hier soir, ça commence à bien sonner ! ��', ARRAY['musique', 'groupe', 'répétition'], 'public'),
('550e8400-e29b-41d4-a716-446655440007', 'Festival de musique ce weekend, l''ambiance était folle ! 🎵', ARRAY['festival', 'musique', 'ambiance'], 'public'),
('550e8400-e29b-41d4-a716-446655440007', 'Nouvel instrument acheté, je ne peux plus m''arrêter de jouer ! ��', ARRAY['musique', 'instrument', 'passion'], 'public'),

-- Posts d'Alexandre (littérature, philosophie, histoire, politique)
('550e8400-e29b-41d4-a716-446655440008', 'Lecture philosophique du soir : Nietzsche. Ses réflexions sur la vie sont fascinantes. ��', ARRAY['philosophie', 'nietzsche', 'réflexion'], 'public'),
('550e8400-e29b-41d4-a716-446655440008', 'Documentaire sur l''histoire de France, passionnant ! 🇫🇷', ARRAY['histoire', 'france', 'documentaire'], 'public'),
('550e8400-e29b-41d4-a716-446655440008', 'Débat politique intéressant hier soir, les échanges étaient constructifs. 🗣️', ARRAY['politique', 'débat', 'discussion'], 'public'),

-- Posts de Nicolas (sport, football, fitness, nutrition)
('550e8400-e29b-41d4-a716-446655440009', 'Match de foot hier, victoire 3-1 ! L''équipe était en feu ! ⚽🔥', ARRAY['football', 'victoire', 'sport'], 'public'),
('550e8400-e29b-41d4-a716-446655440009', 'Nouveau programme de fitness, je me sens plus fort chaque jour ! ��', ARRAY['fitness', 'musculation', 'progression'], 'public'),
('550e8400-e29b-41d4-a716-446655440009', 'Recette healthy : smoothie protéiné post-entraînement. Délicieux ! ��', ARRAY['nutrition', 'healthy', 'smoothie'], 'public'),

-- Posts de David (technologie, programmation, startup, innovation)
('550e8400-e29b-41d4-a716-446655440010', 'Nouveau projet de startup en cours, l''innovation est au cœur de tout ! ��', ARRAY['startup', 'innovation', 'projet'], 'public'),
('550e8400-e29b-41d4-a716-446655440010', 'Coding session de 4h, j''adore quand le code fonctionne parfaitement ! 💻', ARRAY['programmation', 'coding', 'développement'], 'public'),
('550e8400-e29b-41d4-a716-446655440010', 'Conférence tech hier, les nouvelles tendances sont passionnantes ! 🎤', ARRAY['technologie', 'conférence', 'tendances'], 'public');

-- Ajouter quelques likes pour tester
INSERT INTO likes (user_id, post_id) VALUES
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440006'),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440007'),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440008'),
('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440009'),
('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440010');

-- Ajouter quelques commentaires pour tester
INSERT INTO comments (post_id, user_id, content) VALUES
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440006', 'Magnifique photo ! J''adorerais visiter l''Italie aussi.'),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440007', 'Le jazz live est effectivement magique !'),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440008', 'Un classique qui ne vieillit jamais !'),
('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440009', 'Les montagnes sont toujours impressionnantes !'),
('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440010', 'Quel jeu ? Je suis curieux !');
