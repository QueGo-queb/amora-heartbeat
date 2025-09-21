-- ✅ AMÉLIORATION FUTURE: Ajouter le tracking des messages lus
ALTER TABLE messages 
ADD COLUMN is_read BOOLEAN DEFAULT FALSE,
ADD COLUMN read_at TIMESTAMPTZ;

-- Index pour optimiser les requêtes de messages non lus
CREATE INDEX idx_messages_unread ON messages (receiver_id, is_read) 
WHERE is_read = FALSE;

-- Fonction pour marquer un message comme lu
CREATE OR REPLACE FUNCTION mark_message_as_read(message_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE messages 
  SET is_read = TRUE, read_at = NOW()
  WHERE id = message_id;
END;
$$ LANGUAGE plpgsql;
