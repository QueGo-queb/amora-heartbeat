/**
 * Migration pour le mode voyage
 * - Table travel_sessions pour les sessions de voyage virtuel
 * - Table travel_preferences pour les préférences utilisateur
 * - Table location_cache pour optimiser les recherches géographiques
 * - Extension de la table users avec virtual_location
 * - Politiques RLS et index
 */

-- 1. Ajouter les colonnes de voyage à la table users
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS virtual_location TEXT,
ADD COLUMN IF NOT EXISTS virtual_country TEXT,
ADD COLUMN IF NOT EXISTS virtual_city TEXT,
ADD COLUMN IF NOT EXISTS virtual_latitude NUMERIC(10,8),
ADD COLUMN IF NOT EXISTS virtual_longitude NUMERIC(11,8),
ADD COLUMN IF NOT EXISTS travel_mode_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS travel_session_id UUID,
ADD COLUMN IF NOT EXISTS travel_activated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS travel_expires_at TIMESTAMPTZ;

-- 2. Table des sessions de voyage
CREATE TABLE IF NOT EXISTS public.travel_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Destination
  destination_country TEXT NOT NULL,
  destination_city TEXT NOT NULL,
  destination_region TEXT,
  destination_coordinates POINT, -- PostGIS point pour géolocalisation
  destination_timezone TEXT,
  
  -- Dates de voyage
  travel_start_date DATE NOT NULL,
  travel_end_date DATE NOT NULL,
  virtual_start_date TIMESTAMPTZ DEFAULT NOW(),
  virtual_end_date TIMESTAMPTZ NOT NULL,
  
  -- Type de voyage
  travel_type TEXT DEFAULT 'leisure' CHECK (travel_type IN ('leisure', 'business', 'relocation', 'study', 'other')),
  travel_purpose TEXT,
  accommodation_type TEXT CHECK (accommodation_type IN ('hotel', 'airbnb', 'friend', 'family', 'unknown')),
  
  -- Paramètres de matching
  search_radius_km INTEGER DEFAULT 50 CHECK (search_radius_km >= 1 AND search_radius_km <= 500),
  show_to_locals BOOLEAN DEFAULT true,
  show_to_travelers BOOLEAN DEFAULT true,
  show_to_residents BOOLEAN DEFAULT false,
  
  -- Préférences de rencontre
  looking_for_activities TEXT[] DEFAULT '{}',
  available_for_meetup BOOLEAN DEFAULT true,
  preferred_meeting_types TEXT[] DEFAULT '{}', -- ['coffee', 'dinner', 'sightseeing', 'nightlife', 'cultural']
  languages_spoken TEXT[] DEFAULT '{}',
  
  -- Statut et métadonnées
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'cancelled')),
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'matches_only', 'private')),
  
  -- Statistiques
  profile_views INTEGER DEFAULT 0,
  matches_made INTEGER DEFAULT 0,
  conversations_started INTEGER DEFAULT 0,
  meetups_planned INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Contraintes
  CONSTRAINT valid_travel_dates CHECK (travel_end_date >= travel_start_date),
  CONSTRAINT valid_virtual_dates CHECK (virtual_end_date > virtual_start_date),
  CONSTRAINT future_travel CHECK (travel_start_date >= CURRENT_DATE)
);

-- 3. Table des préférences de voyage par utilisateur
CREATE TABLE IF NOT EXISTS public.travel_preferences (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Préférences générales
  auto_enable_on_travel BOOLEAN DEFAULT false,
  max_sessions_per_month INTEGER DEFAULT 3 CHECK (max_sessions_per_month >= 0 AND max_sessions_per_month <= 10),
  default_search_radius_km INTEGER DEFAULT 50,
  default_session_duration_days INTEGER DEFAULT 14,
  
  -- Notifications
  notify_local_matches BOOLEAN DEFAULT true,
  notify_fellow_travelers BOOLEAN DEFAULT true,
  notify_travel_tips BOOLEAN DEFAULT false,
  
  -- Visibilité et sécurité
  share_travel_plans BOOLEAN DEFAULT false,
  verify_travelers_only BOOLEAN DEFAULT false,
  require_photo_verification BOOLEAN DEFAULT false,
  
  -- Types de voyage préférés
  preferred_travel_types TEXT[] DEFAULT '{"leisure"}',
  interested_in_business_travel BOOLEAN DEFAULT false,
  interested_in_relocation_help BOOLEAN DEFAULT false,
  
  -- Données d'apprentissage
  successful_meetups_count INTEGER DEFAULT 0,
  travel_experience_level TEXT DEFAULT 'beginner' CHECK (travel_experience_level IN ('beginner', 'intermediate', 'expert', 'local_expert')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Table de cache des localisations pour optimiser les recherches
CREATE TABLE IF NOT EXISTS public.location_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identifiants de lieu
  country TEXT NOT NULL,
  city TEXT NOT NULL,
  region TEXT,
  full_address TEXT,
  
  -- Coordonnées
  latitude NUMERIC(10,8) NOT NULL,
  longitude NUMERIC(11,8) NOT NULL,
  coordinates POINT, -- PostGIS pour recherches géospatiales
  
  -- Métadonnées
  timezone TEXT,
  country_code TEXT, -- ISO 3166-1 alpha-2
  language_codes TEXT[], -- Langues principales de la région
  currency_code TEXT,
  
  -- Popularité et statistiques
  user_count INTEGER DEFAULT 0, -- Nombre d'utilisateurs dans cette ville
  traveler_count INTEGER DEFAULT 0, -- Nombre de voyageurs actifs
  popular_activities TEXT[] DEFAULT '{}',
  
  -- Données de géocodage
  geocoding_provider TEXT DEFAULT 'nominatim',
  geocoding_accuracy TEXT,
  last_geocoded_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Index et recherche
  search_terms TEXT, -- Termes de recherche normalisés
  is_verified BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Contraintes
  UNIQUE(country, city, region),
  CONSTRAINT valid_coordinates CHECK (
    latitude >= -90 AND latitude <= 90 AND
    longitude >= -180 AND longitude <= 180
  )
);

-- 5. Table des interactions en mode voyage
CREATE TABLE IF NOT EXISTS public.travel_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  traveler_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  local_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  travel_session_id UUID REFERENCES public.travel_sessions(id) ON DELETE CASCADE,
  
  -- Type d'interaction
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('profile_view', 'like', 'super_like', 'message', 'meetup_request', 'meetup_confirmed')),
  
  -- Contexte
  interaction_context JSONB DEFAULT '{}',
  message_content TEXT,
  meetup_details JSONB DEFAULT '{}',
  
  -- Géolocalisation de l'interaction
  interaction_location POINT,
  distance_km NUMERIC(8,2),
  
  -- Statut et suivi
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired', 'completed')),
  response_time_hours INTEGER,
  
  -- Métadonnées
  interaction_source TEXT DEFAULT 'app' CHECK (interaction_source IN ('app', 'notification', 'email', 'web')),
  user_agent TEXT,
  ip_hash TEXT, -- Hash de l'IP pour analytics
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Contraintes
  CONSTRAINT no_self_interaction CHECK (traveler_id != local_user_id)
);

-- 6. Vues pour faciliter les requêtes

-- Vue des voyageurs actifs avec leur destination
CREATE OR REPLACE VIEW active_travelers AS
SELECT 
    u.id as user_id,
    u.full_name,
    u.age,
    u.gender,
    u.virtual_city,
    u.virtual_country,
    u.travel_activated_at,
    u.travel_expires_at,
    ts.destination_city,
    ts.destination_country,
    ts.travel_start_date,
    ts.travel_end_date,
    ts.travel_type,
    ts.search_radius_km,
    ts.looking_for_activities,
    ts.status as travel_status
FROM public.users u
JOIN public.travel_sessions ts ON u.travel_session_id = ts.id
WHERE u.travel_mode_enabled = true 
  AND u.travel_expires_at > NOW()
  AND ts.status = 'active';

-- Vue des locaux disponibles pour rencontrer des voyageurs
CREATE OR REPLACE VIEW locals_available_for_travelers AS
SELECT 
    u.id as user_id,
    u.full_name,
    u.age,
    u.gender,
    u.city,
    u.country,
    tp.notify_fellow_travelers,
    tp.share_travel_plans,
    tp.travel_experience_level
FROM public.users u
LEFT JOIN public.travel_preferences tp ON u.id = tp.user_id
WHERE u.travel_mode_enabled = false
  AND (tp.notify_fellow_travelers = true OR tp.notify_fellow_travelers IS NULL);

-- 7. Index pour les performances géospatiales et temporelles
CREATE INDEX IF NOT EXISTS idx_users_travel_mode ON public.users(travel_mode_enabled, travel_expires_at);
CREATE INDEX IF NOT EXISTS idx_users_virtual_location ON public.users(virtual_country, virtual_city) WHERE travel_mode_enabled = true;
CREATE INDEX IF NOT EXISTS idx_users_coordinates ON public.users(virtual_latitude, virtual_longitude) WHERE travel_mode_enabled = true;

CREATE INDEX IF NOT EXISTS idx_travel_sessions_user ON public.travel_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_travel_sessions_destination ON public.travel_sessions(destination_country, destination_city);
CREATE INDEX IF NOT EXISTS idx_travel_sessions_dates ON public.travel_sessions(travel_start_date, travel_end_date);
CREATE INDEX IF NOT EXISTS idx_travel_sessions_status ON public.travel_sessions(status);
CREATE INDEX IF NOT EXISTS idx_travel_sessions_active ON public.travel_sessions(status, virtual_end_date) WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_location_cache_country_city ON public.location_cache(country, city);
CREATE INDEX IF NOT EXISTS idx_location_cache_coordinates ON public.location_cache(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_location_cache_search ON public.location_cache USING gin(to_tsvector('simple', search_terms));

CREATE INDEX IF NOT EXISTS idx_travel_interactions_traveler ON public.travel_interactions(traveler_id);
CREATE INDEX IF NOT EXISTS idx_travel_interactions_local ON public.travel_interactions(local_user_id);
CREATE INDEX IF NOT EXISTS idx_travel_interactions_session ON public.travel_interactions(travel_session_id);
CREATE INDEX IF NOT EXISTS idx_travel_interactions_type ON public.travel_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_travel_interactions_created ON public.travel_interactions(created_at);

-- 8. Activer RLS
ALTER TABLE public.travel_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_interactions ENABLE ROW LEVEL SECURITY;

-- 9. Politiques RLS
DO $$ 
BEGIN
    -- Travel sessions : utilisateurs gèrent leurs sessions
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'travel_sessions' AND policyname = 'Users can manage their travel sessions'
    ) THEN
        CREATE POLICY "Users can manage their travel sessions"
        ON public.travel_sessions FOR ALL
        USING (user_id = auth.uid());
    END IF;

    -- Lecture publique des sessions actives pour le matching
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'travel_sessions' AND policyname = 'Anyone can view active public travel sessions'
    ) THEN
        CREATE POLICY "Anyone can view active public travel sessions"
        ON public.travel_sessions FOR SELECT
        USING (status = 'active' AND visibility = 'public' AND virtual_end_date > NOW());
    END IF;

    -- Travel preferences : utilisateurs gèrent leurs préférences
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'travel_preferences' AND policyname = 'Users can manage their travel preferences'
    ) THEN
        CREATE POLICY "Users can manage their travel preferences"
        ON public.travel_preferences FOR ALL
        USING (user_id = auth.uid());
    END IF;

    -- Location cache : lecture publique
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'location_cache' AND policyname = 'Anyone can view location cache'
    ) THEN
        CREATE POLICY "Anyone can view location cache"
        ON public.location_cache FOR SELECT
        USING (true);
    END IF;

    -- Travel interactions : utilisateurs voient leurs interactions
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'travel_interactions' AND policyname = 'Users can view their travel interactions'
    ) THEN
        CREATE POLICY "Users can view their travel interactions"
        ON public.travel_interactions FOR SELECT
        USING (traveler_id = auth.uid() OR local_user_id = auth.uid());
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'travel_interactions' AND policyname = 'Users can create travel interactions'
    ) THEN
        CREATE POLICY "Users can create travel interactions"
        ON public.travel_interactions FOR INSERT
        WITH CHECK (traveler_id = auth.uid() OR local_user_id = auth.uid());
    END IF;
END $$;

-- 10. Fonctions utilitaires

-- Fonction pour activer le mode voyage
CREATE OR REPLACE FUNCTION activate_travel_mode(
    p_user_id UUID,
    p_destination_country TEXT,
    p_destination_city TEXT,
    p_travel_start_date DATE,
    p_travel_end_date DATE,
    p_travel_type TEXT DEFAULT 'leisure',
    p_search_radius_km INTEGER DEFAULT 50
) RETURNS UUID AS $$
DECLARE
    session_id UUID;
    virtual_end_date TIMESTAMPTZ;
BEGIN
    -- Calculer la date de fin virtuelle (jusqu'à la fin du voyage + 7 jours)
    virtual_end_date := (p_travel_end_date + INTERVAL '7 days')::TIMESTAMPTZ;
    
    -- Créer la session de voyage
    INSERT INTO public.travel_sessions (
        user_id, destination_country, destination_city,
        travel_start_date, travel_end_date, virtual_end_date,
        travel_type, search_radius_km, status
    ) VALUES (
        p_user_id, p_destination_country, p_destination_city,
        p_travel_start_date, p_travel_end_date, virtual_end_date,
        p_travel_type, p_search_radius_km, 'active'
    ) RETURNING id INTO session_id;
    
    -- Mettre à jour l'utilisateur
    UPDATE public.users SET
        travel_mode_enabled = true,
        travel_session_id = session_id,
        virtual_country = p_destination_country,
        virtual_city = p_destination_city,
        travel_activated_at = NOW(),
        travel_expires_at = virtual_end_date
    WHERE id = p_user_id;
    
    -- Mettre à jour le cache de localisation
    UPDATE public.location_cache 
    SET traveler_count = traveler_count + 1,
        updated_at = NOW()
    WHERE country = p_destination_country AND city = p_destination_city;
    
    RETURN session_id;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour désactiver le mode voyage
CREATE OR REPLACE FUNCTION deactivate_travel_mode(p_user_id UUID) RETURNS void AS $$
DECLARE
    old_country TEXT;
    old_city TEXT;
BEGIN
    -- Récupérer l'ancienne destination
    SELECT virtual_country, virtual_city INTO old_country, old_city
    FROM public.users WHERE id = p_user_id;
    
    -- Désactiver le mode voyage
    UPDATE public.users SET
        travel_mode_enabled = false,
        travel_session_id = NULL,
        virtual_country = NULL,
        virtual_city = NULL,
        virtual_latitude = NULL,
        virtual_longitude = NULL,
        travel_activated_at = NULL,
        travel_expires_at = NULL
    WHERE id = p_user_id;
    
    -- Marquer la session comme terminée
    UPDATE public.travel_sessions SET
        status = 'completed',
        updated_at = NOW()
    WHERE user_id = p_user_id AND status = 'active';
    
    -- Mettre à jour le cache de localisation
    IF old_country IS NOT NULL AND old_city IS NOT NULL THEN
        UPDATE public.location_cache 
        SET traveler_count = GREATEST(traveler_count - 1, 0),
            updated_at = NOW()
        WHERE country = old_country AND city = old_city;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour nettoyer les sessions expirées
CREATE OR REPLACE FUNCTION cleanup_expired_travel_sessions() RETURNS void AS $$
BEGIN
    -- Désactiver les utilisateurs avec des sessions expirées
    UPDATE public.users SET
        travel_mode_enabled = false,
        travel_session_id = NULL,
        virtual_country = NULL,
        virtual_city = NULL,
        virtual_latitude = NULL,
        virtual_longitude = NULL,
        travel_activated_at = NULL,
        travel_expires_at = NULL
    WHERE travel_mode_enabled = true 
      AND travel_expires_at < NOW();
    
    -- Marquer les sessions comme expirées
    UPDATE public.travel_sessions SET
        status = 'completed',
        updated_at = NOW()
    WHERE status = 'active' 
      AND virtual_end_date < NOW();
      
    -- Nettoyer les anciennes interactions (plus de 90 jours)
    DELETE FROM public.travel_interactions 
    WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- 11. Triggers

-- Trigger pour créer les préférences de voyage par défaut
CREATE OR REPLACE FUNCTION trigger_create_travel_preferences()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.travel_preferences (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'users_after_insert_travel_preferences' AND tgrelid = 'public.users'::regclass
    ) THEN
        CREATE TRIGGER users_after_insert_travel_preferences
        AFTER INSERT ON public.users
        FOR EACH ROW EXECUTE FUNCTION trigger_create_travel_preferences();
    END IF;
END $$;

-- Trigger pour updated_at
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_travel_sessions_updated_at'
    ) THEN
        CREATE TRIGGER trigger_travel_sessions_updated_at
        BEFORE UPDATE ON public.travel_sessions
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_travel_preferences_updated_at'
    ) THEN
        CREATE TRIGGER trigger_travel_preferences_updated_at
        BEFORE UPDATE ON public.travel_preferences
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_location_cache_updated_at'
    ) THEN
        CREATE TRIGGER trigger_location_cache_updated_at
        BEFORE UPDATE ON public.location_cache
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_travel_interactions_updated_at'
    ) THEN
        CREATE TRIGGER trigger_travel_interactions_updated_at
        BEFORE UPDATE ON public.travel_interactions
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- 12. Données initiales pour le cache de localisation (principales villes)
INSERT INTO public.location_cache (country, city, latitude, longitude, timezone, country_code, language_codes, currency_code, search_terms) VALUES
('France', 'Paris', 48.8566, 2.3522, 'Europe/Paris', 'FR', '{"fr"}', 'EUR', 'paris france capitale'),
('France', 'Lyon', 45.7640, 4.8357, 'Europe/Paris', 'FR', '{"fr"}', 'EUR', 'lyon france rhone'),
('France', 'Marseille', 43.2965, 5.3698, 'Europe/Paris', 'FR', '{"fr"}', 'EUR', 'marseille france provence'),
('Spain', 'Madrid', 40.4168, -3.7038, 'Europe/Madrid', 'ES', '{"es"}', 'EUR', 'madrid spain espagne capitale'),
('Spain', 'Barcelona', 41.3851, 2.1734, 'Europe/Madrid', 'ES', '{"es","ca"}', 'EUR', 'barcelona spain barcelone espagne catalogne'),
('Italy', 'Rome', 41.9028, 12.4964, 'Europe/Rome', 'IT', '{"it"}', 'EUR', 'rome italy italia capitale'),
('Italy', 'Milan', 45.4642, 9.1900, 'Europe/Rome', 'IT', '{"it"}', 'EUR', 'milan italy milano italia'),
('Germany', 'Berlin', 52.5200, 13.4050, 'Europe/Berlin', 'DE', '{"de"}', 'EUR', 'berlin germany allemagne capitale'),
('Germany', 'Munich', 48.1351, 11.5820, 'Europe/Berlin', 'DE', '{"de"}', 'EUR', 'munich germany münchen allemagne'),
('United Kingdom', 'London', 51.5074, -0.1278, 'Europe/London', 'GB', '{"en"}', 'GBP', 'london england uk royaume uni'),
('United States', 'New York', 40.7128, -74.0060, 'America/New_York', 'US', '{"en"}', 'USD', 'new york usa etats unis'),
('United States', 'Los Angeles', 34.0522, -118.2437, 'America/Los_Angeles', 'US', '{"en"}', 'USD', 'los angeles usa californie'),
('Canada', 'Toronto', 43.6532, -79.3832, 'America/Toronto', 'CA', '{"en","fr"}', 'CAD', 'toronto canada'),
('Japan', 'Tokyo', 35.6762, 139.6503, 'Asia/Tokyo', 'JP', '{"ja"}', 'JPY', 'tokyo japan japon'),
('Australia', 'Sydney', -33.8688, 151.2093, 'Australia/Sydney', 'AU', '{"en"}', 'AUD', 'sydney australia australie')
ON CONFLICT (country, city) DO UPDATE SET
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    timezone = EXCLUDED.timezone,
    country_code = EXCLUDED.country_code,
    language_codes = EXCLUDED.language_codes,
    currency_code = EXCLUDED.currency_code,
    search_terms = EXCLUDED.search_terms,
    updated_at = NOW();
