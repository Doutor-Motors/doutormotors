-- Drop and recreate the view without SECURITY DEFINER issues
DROP VIEW IF EXISTS public.contact_analytics_summary;

-- Recreate as a regular view (inherits caller's permissions via RLS)
CREATE VIEW public.contact_analytics_summary 
WITH (security_invoker = true) AS
SELECT 
  DATE(created_at) as date,
  event_type,
  COUNT(*) as count,
  COUNT(DISTINCT ip_address) as unique_ips
FROM public.contact_form_analytics
WHERE created_at > now() - interval '30 days'
GROUP BY DATE(created_at), event_type
ORDER BY date DESC, event_type;