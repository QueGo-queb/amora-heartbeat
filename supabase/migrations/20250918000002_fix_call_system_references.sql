-- Migration pour corriger les références des tables d'appel vers profiles
-- Date: 2025-09-18

-- 1. Supprimer les anciennes contraintes
ALTER TABLE call_sessions DROP CONSTRAINT IF EXISTS call_sessions_caller_id_fkey;
ALTER TABLE call_sessions DROP CONSTRAINT IF EXISTS call_sessions_receiver_id_fkey;
ALTER TABLE call_preferences DROP CONSTRAINT IF EXISTS call_preferences_user_id_fkey;
ALTER TABLE call_participants DROP CONSTRAINT IF EXISTS call_participants_user_id_fkey;
ALTER TABLE call_logs DROP CONSTRAINT IF EXISTS call_logs_user_id_fkey;

-- 2. Ajouter les nouvelles contraintes vers profiles
ALTER TABLE call_sessions 
ADD CONSTRAINT call_sessions_caller_id_fkey 
FOREIGN KEY (caller_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE call_sessions 
ADD CONSTRAINT call_sessions_receiver_id_fkey 
FOREIGN KEY (receiver_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE call_preferences 
ADD CONSTRAINT call_preferences_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE call_participants 
ADD CONSTRAINT call_participants_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE call_logs 
ADD CONSTRAINT call_logs_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 3. Insérer les préférences par défaut pour tous les profils existants
INSERT INTO call_preferences (user_id, allow_calls_from, available_for_calls)
SELECT id, 'everyone', true FROM profiles
WHERE id NOT IN (SELECT user_id FROM call_preferences);

-- 4. Mettre à jour la fonction can_user_call pour utiliser profiles
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
    receiver_prefs.allow_calls_from := 'everyone';  -- Modifié pour permettre plus facilement
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
      -- Pour l'instant, autoriser tout le monde (à implémenter selon votre logique de matching)
      RETURN true;
    WHEN 'premium' THEN
      -- Vérifier si l'appelant est premium
      SELECT EXISTS(
        SELECT 1 FROM profiles 
        WHERE id = caller_uuid AND plan = 'premium'
      ) INTO has_match;
      RETURN has_match;
    ELSE
      RETURN true;  -- Par défaut, autoriser
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
