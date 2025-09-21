-- ✅ CRÉATION DU SYSTÈME DE NOTIFICATIONS
-- Table pour stocker toutes les notifications utilisateur

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('like', 'comment', 'message', 'match', 'premium', 'system')),
  title TEXT NOT NULL,
  content TEXT,
  data JSONB DEFAULT '{}', -- Données supplémentaires (ex: post_id, sender_id)
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ -- Pour les notifications temporaires
);

-- Indexes pour les performances
CREATE INDEX idx_notifications_user_unread ON notifications (user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_user_created ON notifications (user_id, created_at DESC);
CREATE INDEX idx_notifications_type ON notifications (type);

-- RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Fonction pour créer une notification
CREATE OR REPLACE FUNCTION create_notification(
  target_user_id UUID,
  notification_type TEXT,
  notification_title TEXT,
  notification_content TEXT DEFAULT NULL,
  notification_data JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, type, title, content, data)
  VALUES (target_user_id, notification_type, notification_title, notification_content, notification_data)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour marquer comme lu
CREATE OR REPLACE FUNCTION mark_notification_as_read(notification_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE notifications 
  SET is_read = TRUE, read_at = NOW()
  WHERE id = notification_id AND user_id = auth.uid();
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers pour créer automatiquement des notifications

-- Notification quand quelqu'un like un post
CREATE OR REPLACE FUNCTION notify_post_liked()
RETURNS TRIGGER AS $$
BEGIN
  -- Ne pas notifier si l'utilisateur like son propre post
  IF NEW.user_id != (SELECT user_id FROM posts WHERE id = NEW.post_id) THEN
    PERFORM create_notification(
      (SELECT user_id FROM posts WHERE id = NEW.post_id),
      'like',
      'Nouveau like !',
      'Quelqu''un a aimé votre publication',
      jsonb_build_object('post_id', NEW.post_id, 'liker_id', NEW.user_id)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Notification quand quelqu'un commente un post
CREATE OR REPLACE FUNCTION notify_post_commented()
RETURNS TRIGGER AS $$
BEGIN
  -- Ne pas notifier si l'utilisateur commente son propre post
  IF NEW.user_id != (SELECT user_id FROM posts WHERE id = NEW.post_id) THEN
    PERFORM create_notification(
      (SELECT user_id FROM posts WHERE id = NEW.post_id),
      'comment',
      'Nouveau commentaire !',
      'Quelqu''un a commenté votre publication',
      jsonb_build_object('post_id', NEW.post_id, 'commenter_id', NEW.user_id)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Notification pour nouveaux messages
CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_notification(
    NEW.receiver_id,
    'message',
    'Nouveau message !',
    'Vous avez reçu un nouveau message',
    jsonb_build_object('message_id', NEW.id, 'sender_id', NEW.sender_id)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer les triggers
CREATE TRIGGER trigger_notify_post_liked
  AFTER INSERT ON likes
  FOR EACH ROW EXECUTE FUNCTION notify_post_liked();

CREATE TRIGGER trigger_notify_post_commented
  AFTER INSERT ON comments
  FOR EACH ROW EXECUTE FUNCTION notify_post_commented();

CREATE TRIGGER trigger_notify_new_message
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION notify_new_message();
