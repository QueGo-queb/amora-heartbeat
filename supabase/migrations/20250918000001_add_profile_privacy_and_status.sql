-- Migration pour ajouter la confidentialité des profils et le statut utilisateur
-- Date: 2025-09-18

-- Ajouter les colonnes de confidentialité et statut à la table profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS profile_visibility TEXT DEFAULT 'public' 
  CHECK (profile_visibility IN ('public', 'friends', 'private')),
ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'pending'
  CHECK (account_status IN ('pending', 'verified', 'active', 'suspended'));

-- Mettre à jour les profils existants pour les rendre actifs
UPDATE profiles 
SET account_status = 'active' 
WHERE account_status IS NULL OR account_status = 'pending';

-- Supprimer l'ancienne politique problématique
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;

-- Créer la nouvelle politique basée sur la confidentialité
CREATE POLICY "Profiles are viewable based on privacy settings" ON profiles
  FOR SELECT USING (
    profile_visibility = 'public'
    OR auth.uid() = id
    OR (
      profile_visibility = 'friends'
      AND EXISTS (
        SELECT 1 FROM friendships 
        WHERE (user1_id = auth.uid() AND user2_id = profiles.id)
           OR (user2_id = auth.uid() AND user1_id = profiles.id)
      )
    )
  );

-- Créer une table friendships si elle n'existe pas (pour la politique friends)
CREATE TABLE IF NOT EXISTS friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  user2_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user1_id, user2_id)
);

-- Index pour optimiser les requêtes de friendships
CREATE INDEX IF NOT EXISTS idx_friendships_user1 ON friendships(user1_id);
CREATE INDEX IF NOT EXISTS idx_friendships_user2 ON friendships(user2_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON friendships(status);

-- RLS pour friendships
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own friendships" ON friendships
  FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can create friendships" ON friendships
  FOR INSERT WITH CHECK (auth.uid() = user1_id);

CREATE POLICY "Users can update their own friendships" ON friendships
  FOR UPDATE USING (auth.uid() = user1_id OR auth.uid() = user2_id);
