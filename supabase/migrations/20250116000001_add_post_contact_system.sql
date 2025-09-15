-- Migration pour ajouter le système de contact depuis les publications
-- Créé le 16/01/2025

-- Table pour les demandes de contact depuis les publications
CREATE TABLE IF NOT EXISTS post_contact_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    requester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    message TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'ignored')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, requester_id) -- Un utilisateur ne peut faire qu'une demande par publication
);

-- Table pour les conversations initiées depuis les publications
CREATE TABLE IF NOT EXISTS post_initiated_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_request_id UUID NOT NULL REFERENCES post_contact_requests(id) ON DELETE CASCADE,
    conversation_id UUID, -- Sera rempli quand une conversation sera créée
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_post_contact_requests_post_id ON post_contact_requests(post_id);
CREATE INDEX IF NOT EXISTS idx_post_contact_requests_requester_id ON post_contact_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_post_contact_requests_recipient_id ON post_contact_requests(recipient_id);
CREATE INDEX IF NOT EXISTS idx_post_contact_requests_status ON post_contact_requests(status);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_post_contact_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
CREATE TRIGGER trigger_update_post_contact_requests_updated_at
    BEFORE UPDATE ON post_contact_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_post_contact_requests_updated_at();

-- RLS (Row Level Security) Policies
ALTER TABLE post_contact_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_initiated_conversations ENABLE ROW LEVEL SECURITY;

-- Policy: Les utilisateurs peuvent voir leurs propres demandes de contact
CREATE POLICY "Users can view their own contact requests" ON post_contact_requests
    FOR SELECT USING (
        requester_id = auth.uid() OR 
        recipient_id = auth.uid()
    );

-- Policy: Les utilisateurs peuvent créer des demandes de contact
CREATE POLICY "Users can create contact requests" ON post_contact_requests
    FOR INSERT WITH CHECK (
        requester_id = auth.uid() AND 
        recipient_id != auth.uid() -- Ne peut pas s'envoyer une demande à soi-même
    );

-- Policy: Les utilisateurs peuvent mettre à jour le statut de leurs demandes reçues
CREATE POLICY "Users can update received contact requests" ON post_contact_requests
    FOR UPDATE USING (
        recipient_id = auth.uid()
    );

-- Policy: Les utilisateurs peuvent supprimer leurs propres demandes
CREATE POLICY "Users can delete their own contact requests" ON post_contact_requests
    FOR DELETE USING (
        requester_id = auth.uid()
    );

-- Policies pour post_initiated_conversations
CREATE POLICY "Users can view their initiated conversations" ON post_initiated_conversations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM post_contact_requests pcr 
            WHERE pcr.id = post_initiated_conversations.contact_request_id 
            AND (pcr.requester_id = auth.uid() OR pcr.recipient_id = auth.uid())
        )
    );

CREATE POLICY "Users can create initiated conversations" ON post_initiated_conversations
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM post_contact_requests pcr 
            WHERE pcr.id = post_initiated_conversations.contact_request_id 
            AND pcr.requester_id = auth.uid()
        )
    );

-- Fonction pour créer une demande de contact depuis une publication
CREATE OR REPLACE FUNCTION create_post_contact_request(
    p_post_id UUID,
    p_message TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_requester_id UUID;
    v_recipient_id UUID;
    v_contact_request_id UUID;
BEGIN
    -- Vérifier que l'utilisateur est connecté
    v_requester_id := auth.uid();
    IF v_requester_id IS NULL THEN
        RAISE EXCEPTION 'User must be authenticated';
    END IF;

    -- Récupérer l'auteur de la publication
    SELECT user_id INTO v_recipient_id 
    FROM posts 
    WHERE id = p_post_id;
    
    IF v_recipient_id IS NULL THEN
        RAISE EXCEPTION 'Post not found';
    END IF;

    -- Vérifier que l'utilisateur ne s'envoie pas une demande à lui-même
    IF v_requester_id = v_recipient_id THEN
        RAISE EXCEPTION 'Cannot send contact request to yourself';
    END IF;

    -- Créer la demande de contact
    INSERT INTO post_contact_requests (post_id, requester_id, recipient_id, message)
    VALUES (p_post_id, v_requester_id, v_recipient_id, p_message)
    RETURNING id INTO v_contact_request_id;

    RETURN v_contact_request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour accepter une demande de contact et créer une conversation
CREATE OR REPLACE FUNCTION accept_post_contact_request(
    p_contact_request_id UUID
)
RETURNS UUID AS $$
DECLARE
    v_contact_request RECORD;
    v_conversation_id UUID;
BEGIN
    -- Récupérer la demande de contact
    SELECT * INTO v_contact_request 
    FROM post_contact_requests 
    WHERE id = p_contact_request_id AND recipient_id = auth.uid();
    
    IF v_contact_request.id IS NULL THEN
        RAISE EXCEPTION 'Contact request not found or not authorized';
    END IF;

    -- Mettre à jour le statut
    UPDATE post_contact_requests 
    SET status = 'accepted', updated_at = NOW()
    WHERE id = p_contact_request_id;

    -- Créer une conversation (si le système de conversations existe)
    -- Pour l'instant, on retourne l'ID de la demande acceptée
    -- Cette partie peut être étendue selon votre système de conversations existant
    
    -- Enregistrer que cette demande a initié une conversation
    INSERT INTO post_initiated_conversations (contact_request_id)
    VALUES (p_contact_request_id)
    RETURNING id INTO v_conversation_id;

    RETURN v_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour décliner une demande de contact
CREATE OR REPLACE FUNCTION decline_post_contact_request(
    p_contact_request_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE post_contact_requests 
    SET status = 'declined', updated_at = NOW()
    WHERE id = p_contact_request_id AND recipient_id = auth.uid();
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
