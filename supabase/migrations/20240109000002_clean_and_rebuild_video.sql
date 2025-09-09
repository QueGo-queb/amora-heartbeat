-- Script de nettoyage et reconstruction propre

-- 1. Supprimer toutes les tables vidéo si elles existent
DROP TABLE IF EXISTS video_analytics CASCADE;
DROP TABLE IF EXISTS video_matching_preferences CASCADE;  
DROP TABLE IF EXISTS video_profiles CASCADE;
DROP VIEW IF EXISTS video_stats CASCADE;
DROP FUNCTION IF EXISTS update_video_profiles_timestamp() CASCADE;
DROP FUNCTION IF EXISTS cleanup_old_video_analytics() CASCADE;

-- 2. Supprimer les colonnes vidéo de users (si elles existent)
ALTER TABLE public.users 
DROP COLUMN IF EXISTS video_profile_url,
DROP COLUMN IF EXISTS video_thumbnail_url,
DROP COLUMN IF EXISTS video_approved,
DROP COLUMN IF EXISTS video_uploaded_at;

-- 3. Recréer tout proprement
-- Ajouter colonnes vidéo à la table users
ALTER TABLE public.users 
ADD COLUMN video_profile_url TEXT,
ADD COLUMN video_thumbnail_url TEXT,
ADD COLUMN video_approved BOOLEAN DEFAULT false,
ADD COLUMN video_uploaded_at TIMESTAMPTZ;

-- 4. Table métadonnées vidéo
CREATE TABLE video_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_size_bytes INTEGER NOT NULL,
  duration_seconds NUMERIC(5,2) NOT NULL,
  format TEXT NOT NULL,
  resolution TEXT NOT NULL,
  thumbnail_url TEXT,
  storage_path TEXT NOT NULL,
  upload_completed_at TIMESTAMPTZ,
  moderation_status TEXT DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected', 'reviewing')),
  moderation_notes TEXT,
  moderated_at TIMESTAMPTZ,
  moderated_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT video_duration_check CHECK (duration_seconds > 0 AND duration_seconds <= 30),
  CONSTRAINT video_size_check CHECK (file_size_bytes > 0 AND file_size_bytes <= 100 * 1024 * 1024),
  CONSTRAINT one_video_per_user UNIQUE(user_id)
);

-- 5. Table analytics vidéo
CREATE TABLE video_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID REFERENCES video_profiles(id) ON DELETE CASCADE NOT NULL,
  viewer_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'play', 'pause', 'complete', 'skip', 'like')),
  watch_duration_seconds NUMERIC(5,2) DEFAULT 0,
  viewer_ip_hash TEXT,
  user_agent_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Table préférences matching vidéo
CREATE TABLE video_matching_preferences (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  require_video_profile BOOLEAN DEFAULT false,
  video_weight_in_matching NUMERIC(2,1) DEFAULT 1.0 CHECK (video_weight_in_matching >= 0 AND video_weight_in_matching <= 2.0),
  auto_play_videos BOOLEAN DEFAULT true,
  show_in_feed BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Index
CREATE INDEX idx_video_analytics_video_id ON video_analytics(video_id);
CREATE INDEX idx_video_analytics_viewer_id ON video_analytics(viewer_id);
CREATE INDEX idx_video_analytics_event_type ON video_analytics(event_type);
CREATE INDEX idx_video_analytics_created_at ON video_analytics(created_at);
CREATE INDEX idx_video_profiles_user_id ON video_profiles(user_id);
CREATE INDEX idx_video_profiles_moderation_status ON video_profiles(moderation_status);
CREATE INDEX idx_video_profiles_created_at ON video_profiles(created_at);
CREATE INDEX idx_users_video_url ON public.users(video_profile_url) WHERE video_profile_url IS NOT NULL;
CREATE INDEX idx_users_video_approved ON public.users(video_approved) WHERE video_approved = true;

-- 8. Activer RLS
ALTER TABLE video_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_matching_preferences ENABLE ROW LEVEL SECURITY;

-- 9. Politiques RLS simples (sans admin)
CREATE POLICY "video_profiles_select_approved" ON video_profiles FOR SELECT USING (moderation_status = 'approved');
CREATE POLICY "video_profiles_select_own" ON video_profiles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "video_profiles_insert_own" ON video_profiles FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "video_profiles_update_own" ON video_profiles FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "video_profiles_delete_own" ON video_profiles FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "video_analytics_select_own" ON video_analytics FOR SELECT USING (
  EXISTS (SELECT 1 FROM video_profiles vp WHERE vp.id = video_id AND vp.user_id = auth.uid())
);
CREATE POLICY "video_analytics_insert_all" ON video_analytics FOR INSERT WITH CHECK (true);

CREATE POLICY "video_preferences_all_own" ON video_matching_preferences FOR ALL USING (user_id = auth.uid());

-- 10. Fonctions et triggers
CREATE OR REPLACE FUNCTION update_video_profiles_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER video_profiles_update_timestamp
  BEFORE UPDATE ON video_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_video_profiles_timestamp();

-- 11. Vue statistiques
CREATE VIEW video_stats AS
SELECT 
  COUNT(*) as total_videos,
  COUNT(*) FILTER (WHERE moderation_status = 'approved') as approved_videos,
  COUNT(*) FILTER (WHERE moderation_status = 'pending') as pending_videos,
  COUNT(*) FILTER (WHERE moderation_status = 'rejected') as rejected_videos,
  AVG(duration_seconds) as avg_duration,
  AVG(file_size_bytes / 1024 / 1024) as avg_size_mb
FROM video_profiles;

-- 12. Fonction de nettoyage
CREATE OR REPLACE FUNCTION cleanup_old_video_analytics()
RETURNS void AS $$
BEGIN
  DELETE FROM video_analytics WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
