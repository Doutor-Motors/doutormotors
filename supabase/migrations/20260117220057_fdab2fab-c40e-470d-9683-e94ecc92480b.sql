-- Enable required extensions for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create cron job for weekly cache cleanup (Sundays at 03:00 UTC / 00:00 BRT)
SELECT cron.schedule(
  'weekly-cache-cleanup',
  '0 3 * * 0', -- Every Sunday at 03:00 UTC
  $$
  SELECT net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/cache-admin',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.supabase_service_role_key')
    ),
    body := '{"action": "run-scheduled-cleanup"}'::jsonb
  );
  $$
);

-- Insert initial cache cleanup setting
INSERT INTO public.system_settings (key, value, category, description)
VALUES (
  'cache_auto_cleanup',
  'true',
  'cache',
  'Enable automatic weekly cleanup of expired cache entries'
)
ON CONFLICT (key) DO UPDATE SET value = 'true', updated_at = now();