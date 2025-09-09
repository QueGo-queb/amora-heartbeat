/**
 * Migration pour le système IA de modération et suggestions
 * - Table moderation_requests pour les requêtes de modération
 * - Table ai_suggestions pour les suggestions de profils
 * - Table content_flags pour le flagging automatique
 * - Table ai_analytics pour le tracking des performances IA
 * - Politiques RLS et index
 */

-- 1. Table des requêtes de modération IA
CREATE TABLE IF NOT EXISTS public.moderation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL, -- ID du contenu à modérer (post, message, profil)
  content_type TEXT NOT NULL CHECK (content_type IN ('post', 'message', 'profile', 'comment', 'event')),
  content_text TEXT NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Résultats de modération
  ai_provider TEXT DEFAULT 'openai' CHECK (ai_provider IN ('openai', 'huggingface', 'custom')),
  moderation_status TEXT DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected', 'reviewing', 'escalated')),
  confidence_score NUMERIC(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  
  -- Détection des catégories
  is_toxic BOOLEAN DEFAULT false,
  is_spam BOOLEAN DEFAULT false,
  is_harassment BOOLEAN DEFAULT false,
  is_hate_speech BOOLEAN DEFAULT false,
  is_sexual_content BOOLEAN DEFAULT false,
  is_violence BOOLEAN DEFAULT false,
  is_self_harm BOOLEAN DEFAULT false,
  
  -- Scores détaillés par catégorie
  toxicity_score NUMERIC(3,2) DEFAULT 0,
  spam_score NUMERIC(3,2) DEFAULT 0,
  harassment_score NUMERIC(3,2) DEFAULT 0,
  hate_speech_score NUMERIC(3,2) DEFAULT 0,
  sexual_content_score NUMERIC(3,2) DEFAULT 0,
  violence_score NUMERIC(3,2) DEFAULT 0,
  self_harm_score NUMERIC(3,2) DEFAULT 0,
  
  -- Métadonnées
  ai_response JSONB DEFAULT '{}',
  processing_time_ms INTEGER,
  api_cost_cents INTEGER DEFAULT 0,
  
  -- Actions prises
  action_taken TEXT CHECK (action_taken IN ('none', 'warning', 'content_hidden', 'content_removed', 'user_suspended', 'escalated')),
  action_reason TEXT,
  reviewed_by UUID REFERENCES public.users(id),
  reviewed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Table des suggestions IA de profils
CREATE TABLE IF NOT EXISTS public.ai_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  suggested_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Type et contexte de suggestion
  suggestion_type TEXT NOT NULL CHECK (suggestion_type IN ('compatibility', 'similar_interests', 'activity_based', 'location_based', 'behavior_pattern')),
  suggestion_reason TEXT NOT NULL,
  
  -- Scoring IA
  ai_provider TEXT DEFAULT 'custom' CHECK (ai_provider IN ('openai', 'custom', 'collaborative_filtering')),
  compatibility_score NUMERIC(3,2) NOT NULL CHECK (compatibility_score >= 0 AND compatibility_score <= 1),
  confidence_level TEXT DEFAULT 'medium' CHECK (confidence_level IN ('low', 'medium', 'high')),
  
  -- Facteurs de matching
  interest_similarity NUMERIC(3,2) DEFAULT 0,
  behavior_similarity NUMERIC(3,2) DEFAULT 0,
  activity_compatibility NUMERIC(3,2) DEFAULT 0,
  location_proximity NUMERIC(3,2) DEFAULT 0,
  age_compatibility NUMERIC(3,2) DEFAULT 0,
  
  -- Métadonnées et contexte
  matching_factors JSONB DEFAULT '{}',
  ai_explanation TEXT,
  processing_data JSONB DEFAULT '{}',
  
  -- Interactions et feedback
  presented_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  liked_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  user_feedback TEXT CHECK (user_feedback IN ('good_match', 'bad_match', 'irrelevant', 'already_know')),
  
  -- Gestion
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Un utilisateur ne peut avoir qu'une suggestion active pour un autre utilisateur
  UNIQUE(user_id, suggested_user_id, suggestion_type)
);

-- 3. Table des flags de contenu automatiques
CREATE TABLE IF NOT EXISTS public.content_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('post', 'message', 'profile', 'comment', 'event')),
  flagged_by_ai BOOLEAN DEFAULT true,
  flagged_by_users TEXT[] DEFAULT '{}', -- Array des user_ids qui ont signalé
  
  -- Type de problème détecté
  flag_type TEXT NOT NULL CHECK (flag_type IN ('inappropriate_content', 'spam', 'fake_profile', 'harassment', 'copyright', 'other')),
  flag_severity TEXT DEFAULT 'medium' CHECK (flag_severity IN ('low', 'medium', 'high', 'critical')),
  
  -- Détails du flag
  ai_detection_confidence NUMERIC(3,2),
  human_reports_count INTEGER DEFAULT 0,
  flag_description TEXT,
  evidence_data JSONB DEFAULT '{}',
  
  -- Statut et résolution
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved_valid', 'resolved_invalid', 'escalated')),
  resolution_action TEXT CHECK (resolution_action IN ('no_action', 'content_warning', 'content_hidden', 'content_removed', 'user_warned', 'user_suspended')),
  resolved_by UUID REFERENCES public.users(id),
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Table d'analytics IA pour améliorer les algorithmes
CREATE TABLE IF NOT EXISTS public.ai_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Type d'opération IA
  operation_type TEXT NOT NULL CHECK (operation_type IN ('moderation', 'suggestion', 'matching', 'content_analysis')),
  ai_provider TEXT NOT NULL,
  model_version TEXT,
  
  -- Métriques de performance
  processing_time_ms INTEGER NOT NULL,
  api_cost_cents INTEGER DEFAULT 0,
  accuracy_score NUMERIC(3,2) CHECK (accuracy_score >= 0 AND accuracy_score <= 1),
  
  -- Données d'entrée (anonymisées)
  input_size_chars INTEGER,
  input_type TEXT,
  input_language TEXT DEFAULT 'fr',
  
  -- Résultats
  output_confidence NUMERIC(3,2),
  output_categories TEXT[],
  was_successful BOOLEAN DEFAULT true,
  error_message TEXT,
  
  -- Feedback et apprentissage
  human_validation BOOLEAN, -- Si un humain a validé/invalidé le résultat
  user_satisfaction_score INTEGER CHECK (user_satisfaction_score >= 1 AND user_satisfaction_score <= 5),
  
  -- Métadonnées
  request_metadata JSONB DEFAULT '{}',
  response_metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Table des préférences IA utilisateur
CREATE TABLE IF NOT EXISTS public.ai_preferences (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Préférences de modération
  auto_moderation_enabled BOOLEAN DEFAULT true,
  moderation_sensitivity TEXT DEFAULT 'medium' CHECK (moderation_sensitivity IN ('low', 'medium', 'high')),
  
  -- Préférences de suggestions
  ai_suggestions_enabled BOOLEAN DEFAULT true,
  suggestion_frequency TEXT DEFAULT 'daily' CHECK (suggestion_frequency IN ('never', 'weekly', 'daily', 'real_time')),
  max_suggestions_per_day INTEGER DEFAULT 5 CHECK (max_suggestions_per_day >= 0 AND max_suggestions_per_day <= 20),
  
  -- Types de suggestions désirées
  want_compatibility_suggestions BOOLEAN DEFAULT true,
  want_interest_suggestions BOOLEAN DEFAULT true,
  want_activity_suggestions BOOLEAN DEFAULT true,
  want_location_suggestions BOOLEAN DEFAULT false,
  
  -- Préférences d'apprentissage
  allow_behavior_analysis BOOLEAN DEFAULT true,
  allow_interaction_tracking BOOLEAN DEFAULT true,
  share_anonymous_data BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Index pour les performances
CREATE INDEX IF NOT EXISTS idx_moderation_requests_content ON public.moderation_requests(content_id, content_type);
CREATE INDEX IF NOT EXISTS idx_moderation_requests_user ON public.moderation_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_moderation_requests_status ON public.moderation_requests(moderation_status);
CREATE INDEX IF NOT EXISTS idx_moderation_requests_created ON public.moderation_requests(created_at);

CREATE INDEX IF NOT EXISTS idx_ai_suggestions_user ON public.ai_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_suggested_user ON public.ai_suggestions(suggested_user_id);
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_type ON public.ai_suggestions(suggestion_type);
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_active ON public.ai_suggestions(is_active, expires_at);
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_score ON public.ai_suggestions(compatibility_score DESC);

CREATE INDEX IF NOT EXISTS idx_content_flags_content ON public.content_flags(content_id, content_type);
CREATE INDEX IF NOT EXISTS idx_content_flags_status ON public.content_flags(status);
CREATE INDEX IF NOT EXISTS idx_content_flags_severity ON public.content_flags(flag_severity);
CREATE INDEX IF NOT EXISTS idx_content_flags_created ON public.content_flags(created_at);

CREATE INDEX IF NOT EXISTS idx_ai_analytics_operation ON public.ai_analytics(operation_type);
CREATE INDEX IF NOT EXISTS idx_ai_analytics_provider ON public.ai_analytics(ai_provider);
CREATE INDEX IF NOT EXISTS idx_ai_analytics_created ON public.ai_analytics(created_at);

-- 7. Activer RLS
ALTER TABLE public.moderation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_preferences ENABLE ROW LEVEL SECURITY;

-- 8. Politiques RLS
DO $$ 
BEGIN
    -- Moderation requests : utilisateurs voient leurs requêtes, admins voient tout
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'moderation_requests' AND policyname = 'Users can view their moderation requests'
    ) THEN
        CREATE POLICY "Users can view their moderation requests"
        ON public.moderation_requests FOR SELECT
        USING (user_id = auth.uid());
    END IF;

    -- AI suggestions : utilisateurs voient leurs suggestions
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ai_suggestions' AND policyname = 'Users can view their suggestions'
    ) THEN
        CREATE POLICY "Users can view their suggestions"
        ON public.ai_suggestions FOR SELECT
        USING (user_id = auth.uid());
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ai_suggestions' AND policyname = 'Users can update their suggestions'
    ) THEN
        CREATE POLICY "Users can update their suggestions"
        ON public.ai_suggestions FOR UPDATE
        USING (user_id = auth.uid());
    END IF;

    -- Content flags : admins seulement
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'content_flags' AND policyname = 'Only admins can view content flags'
    ) THEN
        CREATE POLICY "Only admins can view content flags"
        ON public.content_flags FOR SELECT
        USING (
          EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND email = 'clodenerc@yahoo.fr'
          )
        );
    END IF;

    -- AI preferences : utilisateurs gèrent leurs préférences
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ai_preferences' AND policyname = 'Users can manage their AI preferences'
    ) THEN
        CREATE POLICY "Users can manage their AI preferences"
        ON public.ai_preferences FOR ALL
        USING (user_id = auth.uid());
    END IF;
END $$;

-- 9. Fonctions utilitaires pour l'IA

-- Fonction pour créer une préférence IA par défaut
CREATE OR REPLACE FUNCTION create_default_ai_preferences(target_user_id UUID)
RETURNS void AS $$
BEGIN
    INSERT INTO public.ai_preferences (user_id)
    VALUES (target_user_id)
    ON CONFLICT (user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour nettoyer les anciennes suggestions
CREATE OR REPLACE FUNCTION cleanup_expired_suggestions()
RETURNS void AS $$
BEGIN
    UPDATE public.ai_suggestions 
    SET is_active = false
    WHERE expires_at < NOW() AND is_active = true;
    
    -- Supprimer les suggestions très anciennes (plus de 30 jours)
    DELETE FROM public.ai_suggestions 
    WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- 10. Triggers

-- Trigger pour créer les préférences IA par défaut
CREATE OR REPLACE FUNCTION trigger_create_ai_preferences()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM create_default_ai_preferences(NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'users_after_insert_ai_preferences' AND tgrelid = 'public.users'::regclass
    ) THEN
        CREATE TRIGGER users_after_insert_ai_preferences
        AFTER INSERT ON public.users
        FOR EACH ROW EXECUTE FUNCTION trigger_create_ai_preferences();
    END IF;
END $$;

-- Trigger pour updated_at
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_moderation_requests_updated_at'
    ) THEN
        CREATE TRIGGER trigger_moderation_requests_updated_at
        BEFORE UPDATE ON public.moderation_requests
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_ai_suggestions_updated_at'
    ) THEN
        CREATE TRIGGER trigger_ai_suggestions_updated_at
        BEFORE UPDATE ON public.ai_suggestions
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_content_flags_updated_at'
    ) THEN
        CREATE TRIGGER trigger_content_flags_updated_at
        BEFORE UPDATE ON public.content_flags
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_ai_preferences_updated_at'
    ) THEN
        CREATE TRIGGER trigger_ai_preferences_updated_at
        BEFORE UPDATE ON public.ai_preferences
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;
