-- Activer l'extension pg_cron si pas déjà fait
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Créer un job cron qui s'exécute tous les jours à 9h00 UTC
SELECT cron.schedule(
  'check-premium-expiration',
  '0 9 * * *', -- Tous les jours à 9h00 UTC
  $$
  SELECT
    net.http_post(
      url:='https://your-project-ref.supabase.co/functions/v1/check-premium-expiration',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.service_role_key') || '"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
  $$
);
