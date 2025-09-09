/**
 * Migration pour le système de badges et réputation
 * - Table badges pour les types de badges disponibles
 * - Table user_badges pour les badges obtenus par les utilisateurs
 * - Table reputation_scores pour le système de réputation
 * - Table reputation_actions pour tracer les actions qui affectent la réputation
 * - Politiques RLS et index
 */

-- 1. Table des types de badges disponibles
CREATE TABLE IF NOT EXISTS public.badge_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_name TEXT NOT NULL, -- Nom de l'icône Lucide React
  color_hex TEXT DEFAULT '#3B82F6',
  background_hex TEXT DEFAULT '#EFF6FF',
  rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
  category TEXT DEFAULT 'general' CHECK (category IN ('general', 'social', 'activity', 'achievement', 'special', 'premium')),
  
  -- Conditions d'obtention
  auto_awarded BOOLEAN DEFAULT true,
  requirement_type TEXT CHECK (requirement_type IN ('posts_count', 'likes_received', 'comments_count', 'events_organized', 'events_attended', 'days_active', 'profile_complete', 'verified', 'premium', 'manual')),
  requirement_threshold INTEGER DEFAULT 1,
  requirement_data JSONB DEFAULT '{}',
  
  -- Paramètres
  is_active BOOLEAN DEFAULT true,
  is_visible BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Table des badges obtenus par les utilisateurs
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  badge_type_id UUID REFERENCES public.badge_types(id) ON DELETE CASCADE NOT NULL,
  
  -- Détails de l'obtention
  awarded_at TIMESTAMPTZ DEFAULT NOW(),
  awarded_by UUID REFERENCES public.users(id), -- NULL si auto-attribué
  award_reason TEXT,
  award_context JSONB DEFAULT '{}', -- Données contextuelles (ex: event_id, post_id)
  
  -- Affichage
  is_displayed BOOLEAN DEFAULT true, -- L'utilisateur peut choisir d'afficher ou non
  display_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Un utilisateur ne peut avoir qu'une instance de chaque badge
  UNIQUE(user_id, badge_type_id)
);

-- 3. Table des scores de réputation
CREATE TABLE IF NOT EXISTS public.reputation_scores (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Scores par catégorie
  total_score INTEGER DEFAULT 0,
  social_score INTEGER DEFAULT 0, -- Interactions sociales positives
  activity_score INTEGER DEFAULT 0, -- Participation aux événements, posts
  quality_score INTEGER DEFAULT 0, -- Qualité du contenu, pas de signalements
  community_score INTEGER DEFAULT 0, -- Contribution à la communauté
  
  -- Statistiques
  positive_actions_count INTEGER DEFAULT 0,
  negative_actions_count INTEGER DEFAULT 0,
  reports_received INTEGER DEFAULT 0,
  reports_validated INTEGER DEFAULT 0, -- Reports qui se sont avérés valides
  
  -- Niveaux et seuils
  current_level INTEGER DEFAULT 1,
  next_level_threshold INTEGER DEFAULT 100,
  
  -- Multiplicateurs (pour premium, événements spéciaux)
  score_multiplier NUMERIC(3,2) DEFAULT 1.0,
  
  -- Dates importantes
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Table des actions qui affectent la réputation
CREATE TABLE IF NOT EXISTS public.reputation_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN (
    'post_created', 'post_liked', 'comment_made', 'comment_liked',
    'event_created', 'event_attended', 'event_completed',
    'profile_completed', 'verification_achieved', 'premium_subscribed',
    'report_received', 'report_dismissed', 'content_removed',
    'positive_feedback', 'negative_feedback', 'manual_adjustment'
  )),
  
  -- Impact sur la réputation
  score_change INTEGER NOT NULL, -- Peut être négatif
  category TEXT NOT NULL CHECK (category IN ('social', 'activity', 'quality', 'community')),
  
  -- Contexte de l'action
  source_type TEXT, -- 'post', 'event', 'comment', 'report', etc.
  source_id UUID, -- ID de l'objet source
  related_user_id UUID REFERENCES public.users(id), -- Utilisateur impliqué (qui a liké, signalé, etc.)
  
  -- Métadonnées
  reason TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- Validation et révision
  is_validated BOOLEAN DEFAULT true,
  validated_by UUID REFERENCES public.users(id),
  validated_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Insérer les badges par défaut avec ON CONFLICT pour éviter les doublons
INSERT INTO public.badge_types (name, display_name, description, icon_name, color_hex, background_hex, rarity, category, requirement_type, requirement_threshold) VALUES
-- Badges généraux
('newcomer', 'Nouveau membre', 'Bienvenue dans la communauté AMORA !', 'user-plus', '#10B981', '#ECFDF5', 'common', 'general', 'profile_complete', 1),
('active_member', 'Membre actif', 'Connecté pendant 7 jours consécutifs', 'calendar-check', '#3B82F6', '#EFF6FF', 'common', 'activity', 'days_active', 7),
('veteran', 'Vétéran', 'Membre depuis plus de 6 mois', 'crown', '#F59E0B', '#FEF3C7', 'rare', 'special', 'days_active', 180),

-- Badges sociaux
('first_post', 'Premier post', 'Votre premier post sur AMORA', 'edit-3', '#8B5CF6', '#F3E8FF', 'common', 'social', 'posts_count', 1),
('popular_poster', 'Posteur populaire', 'Vos posts ont reçu 100 likes au total', 'trending-up', '#EF4444', '#FEE2E2', 'uncommon', 'social', 'likes_received', 100),
('conversation_starter', 'Lanceur de discussions', 'Vous avez créé 50 commentaires', 'message-circle', '#06B6D4', '#CFFAFE', 'uncommon', 'social', 'comments_count', 50),

-- Badges événements
('event_organizer', 'Organisateur', 'Vous avez organisé votre premier événement', 'calendar-plus', '#10B981', '#ECFDF5', 'uncommon', 'activity', 'events_organized', 1),
('event_master', 'Maître des événements', 'Vous avez organisé 10 événements', 'calendar-star', '#F59E0B', '#FEF3C7', 'rare', 'activity', 'events_organized', 10),
('social_butterfly', 'Papillon social', 'Vous avez participé à 20 événements', 'users', '#EC4899', '#FCE7F3', 'uncommon', 'activity', 'events_attended', 20),

-- Badges premium et spéciaux
('verified', 'Compte vérifié', 'Votre compte a été vérifié', 'shield-check', '#10B981', '#ECFDF5', 'rare', 'special', 'verified', 1),
('premium_member', 'Membre Premium', 'Merci de soutenir AMORA', 'star', '#F59E0B', '#FEF3C7', 'epic', 'premium', 'premium', 1),
('community_guardian', 'Gardien de la communauté', 'Badge spécial pour les modérateurs', 'shield', '#8B5CF6', '#F3E8FF', 'legendary', 'special', 'manual', 1)

ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  icon_name = EXCLUDED.icon_name,
  color_hex = EXCLUDED.color_hex,
  background_hex = EXCLUDED.background_hex,
  rarity = EXCLUDED.rarity,
  category = EXCLUDED.category,
  requirement_type = EXCLUDED.requirement_type,
  requirement_threshold = EXCLUDED.requirement_threshold,
  updated_at = NOW();

-- 6. Index pour les performances
CREATE INDEX IF NOT EXISTS idx_badge_types_category ON public.badge_types(category);
CREATE INDEX IF NOT EXISTS idx_badge_types_rarity ON public.badge_types(rarity);
CREATE INDEX IF NOT EXISTS idx_badge_types_active ON public.badge_types(is_active);

CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON public.user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_type_id ON public.user_badges(badge_type_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_awarded_at ON public.user_badges(awarded_at);
CREATE INDEX IF NOT EXISTS idx_user_badges_displayed ON public.user_badges(is_displayed);

CREATE INDEX IF NOT EXISTS idx_reputation_scores_total_score ON public.reputation_scores(total_score);
CREATE INDEX IF NOT EXISTS idx_reputation_scores_level ON public.reputation_scores(current_level);

CREATE INDEX IF NOT EXISTS idx_reputation_actions_user_id ON public.reputation_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_reputation_actions_type ON public.reputation_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_reputation_actions_created_at ON public.reputation_actions(created_at);

-- 7. Activer RLS seulement si pas déjà activé
DO $$ 
BEGIN
    -- Vérifier et activer RLS pour badge_types
    IF NOT EXISTS (
        SELECT 1 FROM pg_class WHERE relname = 'badge_types' AND relrowsecurity = true
    ) THEN
        ALTER TABLE public.badge_types ENABLE ROW LEVEL SECURITY;
    END IF;
    
    -- Vérifier et activer RLS pour user_badges
    IF NOT EXISTS (
        SELECT 1 FROM pg_class WHERE relname = 'user_badges' AND relrowsecurity = true
    ) THEN
        ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
    END IF;
    
    -- Vérifier et activer RLS pour reputation_scores
    IF NOT EXISTS (
        SELECT 1 FROM pg_class WHERE relname = 'reputation_scores' AND relrowsecurity = true
    ) THEN
        ALTER TABLE public.reputation_scores ENABLE ROW LEVEL SECURITY;
    END IF;
    
    -- Vérifier et activer RLS pour reputation_actions
    IF NOT EXISTS (
        SELECT 1 FROM pg_class WHERE relname = 'reputation_actions' AND relrowsecurity = true
    ) THEN
        ALTER TABLE public.reputation_actions ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- 8. Politiques RLS (créer seulement si elles n'existent pas)
DO $$ 
BEGIN
    -- Badge types : lecture publique pour les badges actifs
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'badge_types' AND policyname = 'Anyone can view active badge types'
    ) THEN
        CREATE POLICY "Anyone can view active badge types"
        ON public.badge_types FOR SELECT
        USING (is_active = true AND is_visible = true);
    END IF;

    -- User badges : les utilisateurs voient leurs badges et ceux des autres si affichés
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_badges' AND policyname = 'Users can view displayed badges'
    ) THEN
        CREATE POLICY "Users can view displayed badges"
        ON public.user_badges FOR SELECT
        USING (is_displayed = true OR user_id = auth.uid());
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_badges' AND policyname = 'Users can update their badge display settings'
    ) THEN
        CREATE POLICY "Users can update their badge display settings"
        ON public.user_badges FOR UPDATE
        USING (user_id = auth.uid());
    END IF;

    -- Reputation scores : visibilité publique pour encourager l'engagement
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'reputation_scores' AND policyname = 'Anyone can view reputation scores'
    ) THEN
        CREATE POLICY "Anyone can view reputation scores"
        ON public.reputation_scores FOR SELECT
        USING (true);
    END IF;

    -- Reputation actions : utilisateurs voient leurs actions
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'reputation_actions' AND policyname = 'Users can view their reputation actions'
    ) THEN
        CREATE POLICY "Users can view their reputation actions"
        ON public.reputation_actions FOR SELECT
        USING (user_id = auth.uid());
    END IF;
END $$;

-- 9. Fonctions pour la gestion automatique des badges et réputation

-- Fonction pour calculer et mettre à jour le score de réputation
CREATE OR REPLACE FUNCTION update_reputation_score(target_user_id UUID)
RETURNS void AS $$
DECLARE
    total_social INTEGER := 0;
    total_activity INTEGER := 0;
    total_quality INTEGER := 0;
    total_community INTEGER := 0;
    new_total INTEGER := 0;
    new_level INTEGER := 1;
    next_threshold INTEGER := 100;
BEGIN
    -- Calculer les scores par catégorie
    SELECT 
        COALESCE(SUM(CASE WHEN category = 'social' THEN score_change ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN category = 'activity' THEN score_change ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN category = 'quality' THEN score_change ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN category = 'community' THEN score_change ELSE 0 END), 0)
    INTO total_social, total_activity, total_quality, total_community
    FROM public.reputation_actions
    WHERE user_id = target_user_id AND is_validated = true;
    
    -- Calculer le score total
    new_total := total_social + total_activity + total_quality + total_community;
    
    -- Calculer le niveau (chaque niveau = 100 points de plus)
    new_level := GREATEST(1, (new_total / 100) + 1);
    next_threshold := new_level * 100;
    
    -- Mettre à jour ou insérer le score
    INSERT INTO public.reputation_scores (
        user_id, total_score, social_score, activity_score, quality_score, community_score,
        current_level, next_level_threshold, last_updated
    ) VALUES (
        target_user_id, new_total, total_social, total_activity, total_quality, total_community,
        new_level, next_threshold, NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        total_score = EXCLUDED.total_score,
        social_score = EXCLUDED.social_score,
        activity_score = EXCLUDED.activity_score,
        quality_score = EXCLUDED.quality_score,
        community_score = EXCLUDED.community_score,
        current_level = EXCLUDED.current_level,
        next_level_threshold = EXCLUDED.next_level_threshold,
        last_updated = NOW();
END;
$$ LANGUAGE plpgsql;

-- Fonction pour vérifier et attribuer les badges automatiques
CREATE OR REPLACE FUNCTION check_and_award_badges(target_user_id UUID)
RETURNS void AS $$
DECLARE
    badge_record RECORD;
    user_stat INTEGER;
    should_award BOOLEAN;
BEGIN
    -- Parcourir tous les badges auto-attribués
    FOR badge_record IN 
        SELECT * FROM public.badge_types 
        WHERE auto_awarded = true AND is_active = true
    LOOP
        -- Vérifier si l'utilisateur a déjà ce badge
        IF NOT EXISTS (
            SELECT 1 FROM public.user_badges 
            WHERE user_id = target_user_id AND badge_type_id = badge_record.id
        ) THEN
            should_award := false;
            
            -- Vérifier les conditions selon le type de requirement
            CASE badge_record.requirement_type
                WHEN 'posts_count' THEN
                    SELECT COUNT(*) INTO user_stat 
                    FROM public.posts WHERE user_id = target_user_id;
                    should_award := user_stat >= badge_record.requirement_threshold;
                    
                WHEN 'likes_received' THEN
                    SELECT COALESCE(SUM(likes_count), 0) INTO user_stat 
                    FROM public.posts WHERE user_id = target_user_id;
                    should_award := user_stat >= badge_record.requirement_threshold;
                    
                WHEN 'events_organized' THEN
                    SELECT COUNT(*) INTO user_stat 
                    FROM public.events WHERE created_by = target_user_id;
                    should_award := user_stat >= badge_record.requirement_threshold;
                    
                WHEN 'events_attended' THEN
                    SELECT COUNT(*) INTO user_stat 
                    FROM public.event_participants 
                    WHERE user_id = target_user_id AND status IN ('attended', 'confirmed');
                    should_award := user_stat >= badge_record.requirement_threshold;
                    
                WHEN 'profile_complete' THEN
                    SELECT CASE 
                        WHEN full_name IS NOT NULL AND bio IS NOT NULL 
                        THEN 1 ELSE 0 END INTO user_stat
                    FROM public.users WHERE id = target_user_id;
                    should_award := user_stat >= badge_record.requirement_threshold;
                    
                ELSE
                    should_award := false;
            END CASE;
            
            -- Attribuer le badge si les conditions sont remplies
            IF should_award THEN
                INSERT INTO public.user_badges (user_id, badge_type_id, award_reason)
                VALUES (target_user_id, badge_record.id, 'Conditions automatiques remplies');
            END IF;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 10. Triggers pour automatisation

-- Trigger pour mettre à jour la réputation après chaque action
CREATE OR REPLACE FUNCTION trigger_update_reputation()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM update_reputation_score(NEW.user_id);
    PERFORM check_and_award_badges(NEW.user_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger seulement s'il n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'reputation_actions_after_insert'
    ) THEN
        CREATE TRIGGER reputation_actions_after_insert
        AFTER INSERT ON public.reputation_actions
        FOR EACH ROW EXECUTE FUNCTION trigger_update_reputation();
    END IF;
END $$;

-- Trigger pour attribuer le badge "Nouveau membre" à l'inscription
CREATE OR REPLACE FUNCTION trigger_award_newcomer_badge()
RETURNS TRIGGER AS $$
BEGIN
    -- Attribuer le badge newcomer
    INSERT INTO public.user_badges (user_id, badge_type_id, award_reason)
    SELECT NEW.id, bt.id, 'Bienvenue sur AMORA !'
    FROM public.badge_types bt
    WHERE bt.name = 'newcomer'
    ON CONFLICT (user_id, badge_type_id) DO NOTHING;
    
    -- Initialiser le score de réputation
    INSERT INTO public.reputation_scores (user_id, total_score)
    VALUES (NEW.id, 0)
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger seulement s'il n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'users_after_insert_badges' AND tgrelid = 'public.users'::regclass
    ) THEN
        CREATE TRIGGER users_after_insert_badges
        AFTER INSERT ON public.users
        FOR EACH ROW EXECUTE FUNCTION trigger_award_newcomer_badge();
    END IF;
END $$;

-- Trigger pour updated_at (utiliser la fonction existante)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_badge_types_updated_at'
    ) THEN
        CREATE TRIGGER trigger_badge_types_updated_at
        BEFORE UPDATE ON public.badge_types
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;
