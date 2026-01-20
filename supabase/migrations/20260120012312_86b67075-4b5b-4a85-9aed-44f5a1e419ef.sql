-- Cron job para verificar renovação de assinaturas diariamente às 8h
SELECT cron.schedule(
  'daily-subscription-renewal-check',
  '0 8 * * *',
  $$
  SELECT
    net.http_post(
        url:='https://txxgmxxssnogumcwsfvn.supabase.co/functions/v1/check-subscription-renewal',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4eGdteHhzc25vZ3VtY3dzZnZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2MDY3OTcsImV4cCI6MjA4NDE4Mjc5N30.CpsvNMco1a5E3TjzWh37aUwcBvKjKi3WSlbjOKbx6w0"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);