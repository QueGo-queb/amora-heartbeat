-- ✅ HARMONISATION DES TABLES USERS/PROFILES
-- Cette migration unifie les données et corrige les incohérences

-- Étape 1: Ajouter les colonnes manquantes à la table users
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS user_id UUID DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS looking_for_gender TEXT,
ADD COLUMN IF NOT EXISTS looking_for_age_min INTEGER DEFAULT 18,
ADD COLUMN IF NOT EXISTS looking_for_age_max INTEGER DEFAULT 99,
ADD COLUMN IF NOT EXISTS looking_for_interests TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Étape 2: Créer une vue unifiée qui combine users et profiles
CREATE OR REPLACE VIEW public.user_profiles AS
SELECT 
  u.id,
  u.user_id,
  u.full_name,
  u.email,
  u.gender,
  u.age,
  u.country,
  u.region,
  u.city,
  u.bio,
  u.avatar_url,
  u.interests,
  u.looking_for_gender,
  u.looking_for_age_min,
  u.looking_for_age_max,
  u.looking_for_interests,
  u.plan,
  u.premium_since,
  u.payment_method,
  u.last_login,
  u.created_at,
  u.updated_at,
  -- Colonnes dérivées pour compatibilité
  CASE WHEN u.plan = 'premium' THEN true ELSE false END as is_premium
FROM public.users u;

-- Étape 3: Créer des fonctions pour maintenir la compatibilité avec profiles
CREATE OR REPLACE FUNCTION get_user_profile(user_uuid UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  full_name TEXT,
  email TEXT,
  gender TEXT,
  avatar_url TEXT,
  interests TEXT[],
  plan TEXT,
  premium_since TIMESTAMPTZ,
  is_premium BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.user_id,
    u.full_name,
    u.email,
    u.gender::TEXT,
    u.avatar_url,
    u.interests,
    u.plan,
    u.premium_since,
    CASE WHEN u.plan = 'premium' THEN true ELSE false END as is_premium
  FROM public.users u
  WHERE u.user_id = user_uuid OR u.id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Étape 4: Migrer les données de profiles vers users si elles existent
DO $$
BEGIN
  -- Vérifier si la table profiles existe et contient des données
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    -- Mettre à jour les users avec les données de profiles
    UPDATE public.users u
    SET 
      avatar_url = COALESCE(u.avatar_url, p.avatar_url),
      interests = COALESCE(u.interests, p.interests),
      looking_for_gender = COALESCE(u.looking_for_gender, p.looking_for_gender),
      looking_for_age_min = COALESCE(u.looking_for_age_min, p.looking_for_age_min),
      looking_for_age_max = COALESCE(u.looking_for_age_max, p.looking_for_age_max),
      looking_for_interests = COALESCE(u.looking_for_interests, p.looking_for_interests),
      plan = COALESCE(u.plan, p.plan),
      premium_since = COALESCE(u.premium_since, p.premium_since),
      last_login = COALESCE(u.last_login, p.last_login),
      updated_at = COALESCE(u.updated_at, p.updated_at)
    FROM profiles p
    WHERE u.email = p.email OR u.id = p.id;
  END IF;
END $$;

-- Étape 5: Créer des indexes pour les performances
CREATE INDEX IF NOT EXISTS idx_users_user_id ON public.users(user_id);
CREATE INDEX IF NOT EXISTS idx_users_plan ON public.users(plan);
CREATE INDEX IF NOT EXISTS idx_users_premium_since ON public.users(premium_since);

-- Étape 6: Politiques RLS pour la vue
CREATE POLICY "Users can view all user profiles" ON public.users
  FOR SELECT USING (true);

-- Étape 7: Fonction de mise à jour du profil utilisateur
CREATE OR REPLACE FUNCTION update_user_profile(
  user_uuid UUID,
  new_full_name TEXT DEFAULT NULL,
  new_avatar_url TEXT DEFAULT NULL,
  new_interests TEXT[] DEFAULT NULL,
  new_bio TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.users
  SET 
    full_name = COALESCE(new_full_name, full_name),
    avatar_url = COALESCE(new_avatar_url, avatar_url),
    interests = COALESCE(new_interests, interests),
    bio = COALESCE(new_bio, bio),
    updated_at = NOW()
  WHERE user_id = user_uuid OR id = user_uuid;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
