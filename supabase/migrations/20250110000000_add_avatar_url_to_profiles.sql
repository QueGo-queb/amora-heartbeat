-- Ajouter le champ avatar_url à la table profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Créer un index pour les performances
CREATE INDEX IF NOT EXISTS idx_profiles_avatar_url ON profiles(avatar_url);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

-- Mettre à jour les politiques RLS pour inclure avatar_url
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = id);

-- Permettre la lecture des avatars publics
CREATE POLICY "Avatar URLs are viewable by everyone" ON profiles
  FOR SELECT USING (true);
