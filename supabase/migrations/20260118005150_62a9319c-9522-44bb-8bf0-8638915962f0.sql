-- Schedule daily KPI alerts check at 9 AM UTC
SELECT cron.schedule(
  'daily-kpi-alerts-check',
  '0 9 * * *',
  $$
  SELECT net.http_post(
    url := 'https://txxgmxxssnogumcwsfvn.supabase.co/functions/v1/check-kpi-alerts',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4eGdteHhzc25vZ3VtY3dzZnZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2MDY3OTcsImV4cCI6MjA4NDE4Mjc5N30.CpsvNMco1a5E3TjzWh37aUwcBvKjKi3WSlbjOKbx6w0"}'::jsonb,
    body := '{"scheduled": true}'::jsonb
  ) AS request_id;
  $$
);