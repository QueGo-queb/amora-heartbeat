-- ✅ AUDIT DE SÉCURITÉ - COMPLÉTER TOUTES LES POLITIQUES RLS

-- Table messages - Sécuriser complètement
DROP POLICY IF EXISTS "Users can view own messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;

CREATE POLICY "Users can view own messages" ON messages
  FOR SELECT USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

-- Table posts - Améliorer les politiques
DROP POLICY IF EXISTS "Posts are publicly viewable" ON posts;
CREATE POLICY "Posts are publicly viewable" ON posts
  FOR SELECT USING (visibility = 'public' OR user_id = auth.uid());

-- Table likes - Sécuriser
CREATE POLICY "Users can view likes" ON likes
  FOR SELECT USING (true);

CREATE POLICY "Users can like posts" ON likes
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can unlike posts" ON likes
  FOR DELETE USING (user_id = auth.uid());

-- Table comments - Sécuriser
CREATE POLICY "Users can view comments" ON comments
  FOR SELECT USING (true);

CREATE POLICY "Users can create comments" ON comments
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own comments" ON comments
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own comments" ON comments
  FOR DELETE USING (user_id = auth.uid());

-- Table notifications - Sécuriser
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Fonction de sécurité pour vérifier les permissions Premium
CREATE OR REPLACE FUNCTION check_premium_access(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_plan TEXT;
BEGIN
  SELECT plan INTO user_plan
  FROM users
  WHERE user_id = user_uuid OR id = user_uuid;
  
  RETURN COALESCE(user_plan = 'premium', FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour limiter les actions des utilisateurs gratuits
CREATE OR REPLACE FUNCTION check_free_user_limits(
  user_uuid UUID,
  action_type TEXT,
  daily_limit INTEGER DEFAULT 10
)
RETURNS BOOLEAN AS $$
DECLARE
  today_count INTEGER;
  is_premium BOOLEAN;
BEGIN
  -- Vérifier si l'utilisateur est premium
  SELECT check_premium_access(user_uuid) INTO is_premium;
  
  -- Si premium, pas de limite
  IF is_premium THEN
    RETURN TRUE;
  END IF;
  
  -- Compter les actions d'aujourd'hui selon le type
  CASE action_type
    WHEN 'messages' THEN
      SELECT COUNT(*) INTO today_count
      FROM messages
      WHERE sender_id = user_uuid 
        AND created_at >= CURRENT_DATE;
    
    WHEN 'likes' THEN
      SELECT COUNT(*) INTO today_count
      FROM likes
      WHERE user_id = user_uuid 
        AND created_at >= CURRENT_DATE;
    
    ELSE
      RETURN TRUE; -- Par défaut, autoriser
  END CASE;
  
  -- Vérifier la limite
  RETURN today_count < daily_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour limiter les messages des utilisateurs gratuits
CREATE OR REPLACE FUNCTION enforce_message_limits()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT check_free_user_limits(NEW.sender_id, 'messages', 5) THEN
    RAISE EXCEPTION 'Limite quotidienne de messages atteinte. Passez au Premium pour envoyer plus de messages.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_enforce_message_limits
  BEFORE INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION enforce_message_limits();

-- Trigger pour limiter les likes des utilisateurs gratuits
CREATE OR REPLACE FUNCTION enforce_like_limits()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT check_free_user_limits(NEW.user_id, 'likes', 20) THEN
    RAISE EXCEPTION 'Limite quotidienne de likes atteinte. Passez au Premium pour plus d''interactions.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_enforce_like_limits
  BEFORE INSERT ON likes
  FOR EACH ROW EXECUTE FUNCTION enforce_like_limits();
