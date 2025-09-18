-- Migration pour automatiser les préférences d'appel et logique premium
-- Date: 2025-09-18

-- 1. Fonction pour créer automatiquement les préférences d'appel
CREATE OR REPLACE FUNCTION public.create_default_call_preferences() 
RETURNS trigger AS $$
BEGIN
  -- Créer les préférences d'appel par défaut pour le nouveau profil
  INSERT INTO public.call_preferences (
    user_id,
    allow_calls_from,
    available_for_calls,
    auto_answer,
    call_notifications,
    video_quality
  ) VALUES (
    NEW.id,
    'premium',  -- 🔒 Seuls les premium peuvent appeler par défaut
    false,      -- 🔒 Pas disponible pour les appels (sauf si premium)
    false,
    true,
    'auto'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Trigger pour créer automatiquement les préférences d'appel
DROP TRIGGER IF EXISTS on_profile_created_call_prefs ON public.profiles;
CREATE TRIGGER on_profile_created_call_prefs
  AFTER INSERT ON public.profiles
  FOR EACH ROW 
  EXECUTE FUNCTION public.create_default_call_preferences();

-- 3. Fonction pour mettre à jour les permissions d'appel selon le plan
CREATE OR REPLACE FUNCTION public.update_call_permissions_on_plan_change() 
RETURNS trigger AS $$
BEGIN
  -- Si l'utilisateur devient premium
  IF NEW.plan = 'premium' AND (OLD.plan IS NULL OR OLD.plan != 'premium') THEN
    UPDATE call_preferences 
    SET 
      available_for_calls = true,
      allow_calls_from = 'everyone'  -- Premium peut recevoir d'autres premium
    WHERE user_id = NEW.id;
    
    -- Log de l'activation
    INSERT INTO call_logs (call_session_id, user_id, action, details)
    VALUES (
      NULL, 
      NEW.id, 
      'premium_activated', 
      '{"message": "Fonctionnalités d''appel activées avec le plan premium"}'::jsonb
    );
  
  -- Si l'utilisateur perd le premium
  ELSIF (NEW.plan IS NULL OR NEW.plan != 'premium') AND OLD.plan = 'premium' THEN
    UPDATE call_preferences 
    SET 
      available_for_calls = false,
      allow_calls_from = 'premium'  -- Ne peut plus recevoir que des premium
    WHERE user_id = NEW.id;
    
    -- Terminer tous les appels actifs
    UPDATE call_sessions 
    SET status = 'ended', ended_at = NOW()
    WHERE (caller_id = NEW.id OR receiver_id = NEW.id) 
      AND status IN ('initiating', 'ringing', 'connecting', 'active');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Trigger pour mettre à jour les permissions lors du changement de plan
DROP TRIGGER IF EXISTS on_plan_change_call_permissions ON public.profiles;
CREATE TRIGGER on_plan_change_call_permissions
  AFTER UPDATE OF plan ON public.profiles
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_call_permissions_on_plan_change();

-- 5. Fonction pour vérifier si un utilisateur peut passer un appel (premium requis)
CREATE OR REPLACE FUNCTION public.can_user_initiate_call(caller_uuid UUID, receiver_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  caller_plan TEXT;
  receiver_prefs RECORD;
BEGIN
  -- Vérifier que l'appelant est premium
  SELECT plan INTO caller_plan 
  FROM profiles 
  WHERE id = caller_uuid;
  
  IF caller_plan != 'premium' THEN
    RETURN false;  -- 🔒 Seuls les premium peuvent appeler
  END IF;
  
  -- Vérifier les préférences du receiver
  SELECT * INTO receiver_prefs 
  FROM call_preferences 
  WHERE user_id = receiver_uuid;
  
  -- Si pas de préférences, ne pas autoriser
  IF receiver_prefs IS NULL THEN
    RETURN false;
  END IF;
  
  -- Vérifier la disponibilité
  IF NOT receiver_prefs.available_for_calls THEN
    RETURN false;
  END IF;
  
  -- Vérifier les permissions selon les préférences
  CASE receiver_prefs.allow_calls_from
    WHEN 'none' THEN
      RETURN false;
    WHEN 'everyone' THEN
      RETURN true;  -- Mais l'appelant doit toujours être premium
    WHEN 'premium' THEN
      -- Les deux doivent être premium
      RETURN caller_plan = 'premium';
    WHEN 'matches' THEN
      -- Pour l'instant, traiter comme premium
      RETURN caller_plan = 'premium';
    ELSE
      RETURN false;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Mettre à jour les préférences existantes selon le plan actuel
UPDATE call_preferences 
SET 
  available_for_calls = CASE 
    WHEN profiles.plan = 'premium' THEN true 
    ELSE false 
  END,
  allow_calls_from = CASE 
    WHEN profiles.plan = 'premium' THEN 'everyone'
    ELSE 'premium'
  END
FROM profiles 
WHERE call_preferences.user_id = profiles.id;

-- 7. Politique RLS mise à jour pour les appels premium
DROP POLICY IF EXISTS "Users can create calls" ON call_sessions;
CREATE POLICY "Premium users can create calls" ON call_sessions
  FOR INSERT WITH CHECK (
    auth.uid() = caller_id 
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND plan = 'premium'
    )
  );

-- 8. Ajouter une colonne pour tracker les tentatives d'appel non-premium
ALTER TABLE call_logs 
ADD COLUMN IF NOT EXISTS blocked_reason TEXT;

-- 9. Fonction pour logger les tentatives d'appel bloquées
CREATE OR REPLACE FUNCTION public.log_blocked_call_attempt(
  caller_uuid UUID, 
  receiver_uuid UUID, 
  reason TEXT
) RETURNS void AS $$
BEGIN
  INSERT INTO call_logs (user_id, action, details, blocked_reason)
  VALUES (
    caller_uuid,
    'call_blocked',
    jsonb_build_object(
      'receiver_id', receiver_uuid,
      'reason', reason,
      'timestamp', NOW()
    ),
    reason
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
