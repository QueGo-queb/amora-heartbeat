/**
 * Migration pour étendre le système d'événements existant
 * - Ajouter les colonnes manquantes à la table events existante
 * - Créer les tables event_participants et event_notifications
 * - Ajouter les index et politiques RLS
 */

-- 1. Étendre la table events existante avec les nouvelles colonnes
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS event_type TEXT DEFAULT 'meetup' CHECK (event_type IN ('speed_dating', 'group_chat', 'virtual_date', 'workshop', 'meetup', 'game_night', 'discussion')),
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'scheduled' CHECK (status IN ('draft', 'scheduled', 'live', 'completed', 'cancelled')),
ADD COLUMN IF NOT EXISTS end_time TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC',
ADD COLUMN IF NOT EXISTS max_participants INTEGER DEFAULT 50 CHECK (max_participants > 0 AND max_participants <= 500),
ADD COLUMN IF NOT EXISTS min_participants INTEGER DEFAULT 2 CHECK (min_participants > 0),
ADD COLUMN IF NOT EXISTS age_min INTEGER CHECK (age_min >= 18 AND age_min <= 100),
ADD COLUMN IF NOT EXISTS age_max INTEGER CHECK (age_max >= 18 AND age_max <= 100),
ADD COLUMN IF NOT EXISTS gender_restriction TEXT CHECK (gender_restriction IN ('none', 'women_only', 'men_only', 'non_binary_inclusive')),
ADD COLUMN IF NOT EXISTS cover_image_url TEXT,
ADD COLUMN IF NOT EXISTS banner_image_url TEXT,
ADD COLUMN IF NOT EXISTS virtual_room_url TEXT,
ADD COLUMN IF NOT EXISTS virtual_room_password TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS requires_approval BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS send_reminders BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS allow_chat BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS record_session BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS participants_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS waitlist_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Renommer la colonne date en start_time pour cohérence (si besoin)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'date') THEN
        ALTER TABLE public.events RENAME COLUMN date TO start_time;
    END IF;
END $$;

-- Mettre à jour end_time pour les événements existants (1h par défaut)
UPDATE public.events 
SET end_time = start_time + INTERVAL '1 hour'
WHERE end_time IS NULL;

-- 2. Table des participants et RSVP
CREATE TABLE IF NOT EXISTS public.event_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'waitlisted', 'confirmed', 'attended', 'no_show', 'cancelled')),
  registration_type TEXT DEFAULT 'normal' CHECK (registration_type IN ('normal', 'vip', 'organizer', 'moderator')),
  
  -- Données RSVP
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  attended_at TIMESTAMPTZ,
  
  -- Préférences participant
  dietary_restrictions TEXT,
  accessibility_needs TEXT,
  special_requests TEXT,
  privacy_level TEXT DEFAULT 'normal' CHECK (privacy_level IN ('private', 'normal', 'public')),
  
  -- Feedback post-événement
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT CHECK (length(feedback) <= 1000),
  would_recommend BOOLEAN,
  feedback_submitted_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Un utilisateur ne peut s'inscrire qu'une fois par événement
  UNIQUE(event_id, user_id)
);

-- 3. Table des notifications d'événements
CREATE TABLE IF NOT EXISTS public.event_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('reminder_24h', 'reminder_1h', 'event_start', 'event_cancelled', 'event_updated', 'new_participant')),
  
  -- Contenu notification
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- État
  sent_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  
  -- Canaux de diffusion
  send_email BOOLEAN DEFAULT true,
  send_push BOOLEAN DEFAULT true,
  send_in_app BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Table des catégories d'événements
CREATE TABLE IF NOT EXISTS public.event_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  icon_name TEXT,
  color_hex TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insérer des catégories par défaut
INSERT INTO public.event_categories (name, description, icon_name, color_hex) VALUES
('Speed Dating', 'Rencontres rapides en ligne', 'heart', '#E91E63'),
('Discussions', 'Groupes de discussion thématiques', 'message-circle', '#2196F3'),
('Jeux', 'Soirées jeux et activités ludiques', 'gamepad-2', '#4CAF50'),
('Ateliers', 'Ateliers de développement personnel', 'book-open', '#FF9800'),
('Meetups', 'Rencontres communautaires', 'users', '#9C27B0')
ON CONFLICT (name) DO NOTHING;

-- 5. Index pour les performances
CREATE INDEX IF NOT EXISTS idx_events_created_by ON public.events(created_by);
CREATE INDEX IF NOT EXISTS idx_events_start_time ON public.events(start_time);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_events_event_type ON public.events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_is_public ON public.events(is_public);
CREATE INDEX IF NOT EXISTS idx_events_tags ON public.events USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_event_participants_event_id ON public.event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_user_id ON public.event_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_status ON public.event_participants(status);

CREATE INDEX IF NOT EXISTS idx_event_notifications_user_id ON public.event_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_event_notifications_sent_at ON public.event_notifications(sent_at);

-- 6. Activer RLS sur les nouvelles tables
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_categories ENABLE ROW LEVEL SECURITY;

-- 7. Politiques RLS pour event_participants
CREATE POLICY "Users can view event participants"
ON public.event_participants FOR SELECT
USING (
  user_id = auth.uid() 
  OR EXISTS (SELECT 1 FROM public.events WHERE id = event_id AND created_by = auth.uid())
);

CREATE POLICY "Users can register for events"
ON public.event_participants FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their participation"
ON public.event_participants FOR UPDATE
USING (user_id = auth.uid());

-- 8. Politiques RLS pour event_notifications
CREATE POLICY "Users can view their notifications"
ON public.event_notifications FOR SELECT
USING (user_id = auth.uid());

-- 9. Politiques RLS pour event_categories (lecture publique)
CREATE POLICY "Anyone can view event categories"
ON public.event_categories FOR SELECT
USING (is_active = true);

-- 10. Triggers pour automatisation
-- Mettre à jour participants_count
CREATE OR REPLACE FUNCTION update_event_participants_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.events 
    SET participants_count = participants_count + 1,
        updated_at = NOW()
    WHERE id = NEW.event_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.events 
    SET participants_count = participants_count - 1,
        updated_at = NOW()
    WHERE id = OLD.event_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_participants_count
AFTER INSERT OR DELETE ON public.event_participants
FOR EACH ROW EXECUTE FUNCTION update_event_participants_count();

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_event_participants_updated_at
BEFORE UPDATE ON public.event_participants
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
