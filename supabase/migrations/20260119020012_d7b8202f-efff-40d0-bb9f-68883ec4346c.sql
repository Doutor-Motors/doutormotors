-- Create contact form analytics table
CREATE TABLE public.contact_form_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL, -- 'submission', 'honeypot_blocked', 'captcha_failed', 'rate_limited', 'validation_error'
  ip_address TEXT,
  email TEXT,
  subject TEXT,
  blocked_reason TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for analytics queries
CREATE INDEX idx_contact_analytics_event_type ON public.contact_form_analytics(event_type);
CREATE INDEX idx_contact_analytics_created_at ON public.contact_form_analytics(created_at DESC);
CREATE INDEX idx_contact_analytics_ip ON public.contact_form_analytics(ip_address);

-- Enable RLS
ALTER TABLE public.contact_form_analytics ENABLE ROW LEVEL SECURITY;

-- Only service role can insert (from edge function)
CREATE POLICY "Service role can insert analytics"
  ON public.contact_form_analytics
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Admins can view analytics
CREATE POLICY "Admins can view analytics"
  ON public.contact_form_analytics
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Deny anonymous access
CREATE POLICY "Deny anonymous access to analytics"
  ON public.contact_form_analytics
  FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);

-- Create a view for daily analytics summary
CREATE OR REPLACE VIEW public.contact_analytics_summary AS
SELECT 
  DATE(created_at) as date,
  event_type,
  COUNT(*) as count,
  COUNT(DISTINCT ip_address) as unique_ips
FROM public.contact_form_analytics
WHERE created_at > now() - interval '30 days'
GROUP BY DATE(created_at), event_type
ORDER BY date DESC, event_type;