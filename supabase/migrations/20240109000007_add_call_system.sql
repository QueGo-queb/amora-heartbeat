/**
 * Migration pour le système d'appels audio/vidéo
 * - Table call_sessions pour les sessions d'appel
 * - Table call_participants pour tracking des participants
 * - Table call_logs pour l'historique
 * - Politiques RLS sécurisées
 * - Index pour performance temps réel
 */

-- 1. Table des sessions d'appel
CREATE TABLE IF NOT EXISTS public.call_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caller_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Type et configuration de l'appel
  call_type TEXT NOT NULL CHECK (call_type IN ('audio', 'video')),
  status TEXT DEFAULT 'initiating' CHECK (status IN ('initiating', 'ringing', 'connecting', 'active', 'ended', 'cancelled', 'failed', 'rejected')),
  
  -- Données de signalisation WebRTC (temporaires)
  caller_sdp JSONB,
  receiver_sdp JSONB,
  ice_candidates JSONB DEFAULT '[]',
  
  -- Métadonnées de l'appel
  connection_quality TEXT DEFAULT 'unknown' CHECK (connection_quality IN ('excellent', 'good', 'poor', 'unknown')),
  duration_seconds INTEGER DEFAULT 0,
  
  -- Timestamps critiques
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Contraintes de sécurité
  CONSTRAINT different_participants CHECK (caller_id != receiver_id),
  CONSTRAINT valid_duration CHECK (duration_seconds >= 0)
);

-- 2. Table des participants (pour futurs appels de groupe)
CREATE TABLE IF NOT EXISTS public.call_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_session_id UUID REFERENCES public.call_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Statut du participant
  status TEXT DEFAULT 'invited' CHECK (status IN ('invited', 'joined', 'left', 'kicked')),
  role TEXT DEFAULT 'participant' CHECK (role IN ('caller', 'receiver', 'participant')),
  
  -- Métadonnées techniques
  joined_at TIMESTAMPTZ,
  left_at TIMESTAMPTZ,
  connection_info JSONB DEFAULT '{}',
  
  -- Un utilisateur ne peut être qu'une fois dans un appel
  UNIQUE(call_session_id, user_id)
);

-- 3. Table des logs d'appels (historique)
CREATE TABLE IF NOT EXISTS public.call_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_session_id UUID REFERENCES public.call_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Détails du log
  action TEXT NOT NULL CHECK (action IN ('call_initiated', 'call_answered', 'call_rejected', 'call_ended', 'connection_failed', 'quality_degraded')),
  details JSONB DEFAULT '{}',
  
  -- Horodatage
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Table des paramètres d'appel utilisateur
CREATE TABLE IF NOT EXISTS public.call_preferences (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Préférences d'appel
  allow_calls_from TEXT DEFAULT 'matches' CHECK (allow_calls_from IN ('everyone', 'matches', 'premium', 'none')),
  auto_answer BOOLEAN DEFAULT false,
  call_notifications BOOLEAN DEFAULT true,
  video_quality TEXT DEFAULT 'auto' CHECK (video_quality IN ('low', 'medium', 'high', 'auto')),
  audio_echo_cancellation BOOLEAN DEFAULT true,
  
  -- Disponibilité
  available_for_calls BOOLEAN DEFAULT true,
  available_hours_start TIME DEFAULT '08:00:00',
  available_hours_end TIME DEFAULT '22:00:00',
  timezone TEXT DEFAULT 'UTC',
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Index pour performance temps réel
CREATE INDEX IF NOT EXISTS idx_call_sessions_caller_id ON call_sessions(caller_id);
CREATE INDEX IF NOT EXISTS idx_call_sessions_receiver_id ON call_sessions(receiver_id);
CREATE INDEX IF NOT EXISTS idx_call_sessions_status ON call_sessions(status);
CREATE INDEX IF NOT EXISTS idx_call_sessions_active ON call_sessions(status, last_activity_at) WHERE status IN ('initiating', 'ringing', 'connecting', 'active');
CREATE INDEX IF NOT EXISTS idx_call_sessions_recent ON call_sessions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_call_participants_session_id ON call_participants(call_session_id);
CREATE INDEX IF NOT EXISTS idx_call_participants_user_id ON call_participants(user_id);

CREATE INDEX IF NOT EXISTS idx_call_logs_session_id ON call_logs(call_session_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_user_id ON call_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_action ON call_logs(action);

-- 6. Triggers pour mise à jour automatique
CREATE OR REPLACE FUNCTION update_call_last_activity()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_activity_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_call_sessions_activity
  BEFORE UPDATE ON call_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_call_last_activity();

-- Trigger pour mettre à jour la durée de l'appel
CREATE OR REPLACE FUNCTION update_call_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ended_at IS NOT NULL AND OLD.ended_at IS NULL THEN
    IF NEW.started_at IS NOT NULL THEN
      NEW.duration_seconds = EXTRACT(EPOCH FROM (NEW.ended_at - NEW.started_at))::INTEGER;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_call_sessions_duration
  BEFORE UPDATE ON call_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_call_duration();

-- 7. Fonction de nettoyage des sessions expirées
CREATE OR REPLACE FUNCTION cleanup_expired_call_sessions()
RETURNS INTEGER AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  -- Nettoyer les sessions abandonnées (plus de 2 minutes sans activité)
  UPDATE call_sessions 
  SET status = 'failed', ended_at = NOW()
  WHERE status IN ('initiating', 'ringing', 'connecting') 
    AND last_activity_at < (NOW() - INTERVAL '2 minutes');
  
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  
  -- Purger les données SDP anciennes (plus de 1 heure)
  UPDATE call_sessions 
  SET caller_sdp = NULL, receiver_sdp = NULL, ice_candidates = '[]'
  WHERE ended_at < (NOW() - INTERVAL '1 hour')
    AND (caller_sdp IS NOT NULL OR receiver_sdp IS NOT NULL);
  
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. RLS Policies
ALTER TABLE call_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_preferences ENABLE ROW LEVEL SECURITY;

-- Policies pour call_sessions
CREATE POLICY "Participants can view their call sessions" ON call_sessions
  FOR SELECT USING (auth.uid() = caller_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can create calls" ON call_sessions
  FOR INSERT WITH CHECK (auth.uid() = caller_id);

CREATE POLICY "Participants can update call sessions" ON call_sessions
  FOR UPDATE USING (auth.uid() = caller_id OR auth.uid() = receiver_id);

-- Policies pour call_participants
CREATE POLICY "Participants can view call participants" ON call_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM call_sessions cs 
      WHERE cs.id = call_session_id 
      AND (cs.caller_id = auth.uid() OR cs.receiver_id = auth.uid())
    )
  );

CREATE POLICY "Users can join calls" ON call_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their participation" ON call_participants
  FOR UPDATE USING (auth.uid() = user_id);

-- Policies pour call_logs
CREATE POLICY "Users can view their call logs" ON call_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create call logs" ON call_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies pour call_preferences
CREATE POLICY "Users can manage their call preferences" ON call_preferences
  FOR ALL USING (auth.uid() = user_id);

-- 9. Fonction pour vérifier si un appel est autorisé
CREATE OR REPLACE FUNCTION can_user_call(caller_uuid UUID, receiver_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  receiver_prefs RECORD;
  has_match BOOLEAN;
BEGIN
  -- Vérifier les préférences du receiver
  SELECT * INTO receiver_prefs 
  FROM call_preferences 
  WHERE user_id = receiver_uuid;
  
  -- Si pas de préférences, utiliser les valeurs par défaut
  IF receiver_prefs IS NULL THEN
    receiver_prefs.allow_calls_from := 'matches';
    receiver_prefs.available_for_calls := true;
  END IF;
  
  -- Vérifier la disponibilité générale
  IF NOT receiver_prefs.available_for_calls THEN
    RETURN false;
  END IF;
  
  -- Vérifier selon les préférences d'autorisation
  CASE receiver_prefs.allow_calls_from
    WHEN 'none' THEN
      RETURN false;
    WHEN 'everyone' THEN
      RETURN true;
    WHEN 'matches' THEN
      -- Vérifier s'il y a un match confirmé
      SELECT EXISTS(
        SELECT 1 FROM matches 
        WHERE ((user_id_1 = caller_uuid AND user_id_2 = receiver_uuid) 
           OR (user_id_1 = receiver_uuid AND user_id_2 = caller_uuid))
        AND status = 'matched'
      ) INTO has_match;
      RETURN has_match;
    WHEN 'premium' THEN
      -- Vérifier si l'appelant est premium (à implémenter selon votre logique)
      RETURN true; -- Temporaire
    ELSE
      RETURN false;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Insérer les préférences par défaut pour les utilisateurs existants
INSERT INTO call_preferences (user_id)
SELECT id FROM users 
WHERE NOT EXISTS (
  SELECT 1 FROM call_preferences cp WHERE cp.user_id = users.id
);

COMMENT ON TABLE call_sessions IS 'Sessions d''appels audio/vidéo avec signalisation WebRTC';
COMMENT ON TABLE call_participants IS 'Participants aux appels (support futur appels de groupe)';
COMMENT ON TABLE call_logs IS 'Historique des actions sur les appels';
COMMENT ON TABLE call_preferences IS 'Préférences d''appel des utilisateurs';
