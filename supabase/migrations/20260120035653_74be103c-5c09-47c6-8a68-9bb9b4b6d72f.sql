-- Schedule cleanup of incomplete signups daily at 3 AM UTC
SELECT cron.schedule(
  'cleanup-incomplete-signups-daily',
  '0 3 * * *',
  $$
  SELECT
    net.http_post(
        url:='https://txxgmxxssnogumcwsfvn.supabase.co/functions/v1/cleanup-incomplete-signups',
        headers:=jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4eGdteHhzc25vZ3VtY3dzZnZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2MDY3OTcsImV4cCI6MjA4NDE4Mjc5N30.CpsvNMco1a5E3TjzWh37aUwcBvKjKi3WSlbjOKbx6w0'
        ),
        body:=jsonb_build_object('time', now()::text)
    ) as request_id;
  $$
);