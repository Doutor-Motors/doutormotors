-- Create table for manually blocked IPs
CREATE TABLE public.blocked_ips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address TEXT NOT NULL UNIQUE,
  reason TEXT,
  blocked_by UUID NOT NULL,
  blocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.blocked_ips ENABLE ROW LEVEL SECURITY;

-- Only admins can manage blocked IPs
CREATE POLICY "Admins can view blocked IPs"
  ON public.blocked_ips
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert blocked IPs"
  ON public.blocked_ips
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update blocked IPs"
  ON public.blocked_ips
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete blocked IPs"
  ON public.blocked_ips
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Service role can check blocked IPs (for edge functions)
CREATE POLICY "Service role can view blocked IPs"
  ON public.blocked_ips
  FOR SELECT
  USING (true);

-- Index for fast lookups
CREATE INDEX idx_blocked_ips_ip_address ON public.blocked_ips(ip_address);
CREATE INDEX idx_blocked_ips_active ON public.blocked_ips(is_active) WHERE is_active = true;

-- Add trigger for updated_at
CREATE TRIGGER update_blocked_ips_updated_at
  BEFORE UPDATE ON public.blocked_ips
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();