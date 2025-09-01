/**
 * Politiques RLS (Row Level Security) pour sécuriser l'accès aux données
 * Permet aux utilisateurs authentifiés d'accéder aux posts publics
 * et aux auteurs de gérer leurs propres posts
 */

-- Activer RLS sur toutes les tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Politiques pour profiles
-- Permettre la lecture des profils publics
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

-- Permettre aux utilisateurs de modifier leur propre profil
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Permettre aux utilisateurs de créer leur profil
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Politiques pour posts
-- Permettre la lecture des posts publics
CREATE POLICY "Public posts are viewable by everyone" ON posts
  FOR SELECT USING (visibility = 'public');

-- Permettre aux auteurs de voir leurs posts privés
CREATE POLICY "Users can view own posts" ON posts
  FOR SELECT USING (auth.uid() = user_id);

-- Permettre aux auteurs de créer des posts
CREATE POLICY "Users can create posts" ON posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Permettre aux auteurs de modifier leurs posts
CREATE POLICY "Users can update own posts" ON posts
  FOR UPDATE USING (auth.uid() = user_id);

-- Permettre aux auteurs de supprimer leurs posts
CREATE POLICY "Users can delete own posts" ON posts
  FOR DELETE USING (auth.uid() = user_id);

-- Politiques pour likes
-- Permettre la lecture des likes
CREATE POLICY "Likes are viewable by everyone" ON likes
  FOR SELECT USING (true);

-- Permettre aux utilisateurs de créer des likes
CREATE POLICY "Users can create likes" ON likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Permettre aux utilisateurs de supprimer leurs likes
CREATE POLICY "Users can delete own likes" ON likes
  FOR DELETE USING (auth.uid() = user_id);

-- Politiques pour comments
-- Permettre la lecture des commentaires
CREATE POLICY "Comments are viewable by everyone" ON comments
  FOR SELECT USING (true);

-- Permettre aux utilisateurs de créer des commentaires
CREATE POLICY "Users can create comments" ON comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Permettre aux utilisateurs de modifier leurs commentaires
CREATE POLICY "Users can update own comments" ON comments
  FOR UPDATE USING (auth.uid() = user_id);

-- Permettre aux utilisateurs de supprimer leurs commentaires
CREATE POLICY "Users can delete own comments" ON comments
  FOR DELETE USING (auth.uid() = user_id);

-- Note : Pour l'API serveur avec service role, utiliser le client admin
-- qui bypass automatiquement RLS avec la clé service role
