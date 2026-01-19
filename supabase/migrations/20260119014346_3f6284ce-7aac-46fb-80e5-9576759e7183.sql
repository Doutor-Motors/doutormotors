-- =====================================================
-- SECURITY MIGRATION: Move extensions to dedicated schema
-- =====================================================

-- 1. Create a dedicated schema for extensions
CREATE SCHEMA IF NOT EXISTS extensions;

-- 2. Move pg_net extension to the extensions schema
-- First drop and recreate in new schema
DROP EXTENSION IF EXISTS pg_net;
CREATE EXTENSION pg_net SCHEMA extensions;

-- 3. Create rate limiting table for contact form
CREATE TABLE IF NOT EXISTS public.contact_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text NOT NULL,
  email text,
  attempts_count integer NOT NULL DEFAULT 1,
  first_attempt_at timestamp with time zone NOT NULL DEFAULT now(),
  last_attempt_at timestamp with time zone NOT NULL DEFAULT now(),
  blocked_until timestamp with time zone,
  UNIQUE(ip_address)
);

-- Enable RLS
ALTER TABLE public.contact_rate_limits ENABLE ROW LEVEL SECURITY;

-- Only service role can access rate limits (via edge function)
CREATE POLICY "Service role only" 
ON public.contact_rate_limits 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- Deny all access to anon and authenticated
CREATE POLICY "Deny anon access" 
ON public.contact_rate_limits 
FOR ALL 
TO anon, authenticated
USING (false)
WITH CHECK (false);

-- 4. Create function to check and update rate limit
CREATE OR REPLACE FUNCTION public.check_contact_rate_limit(
  p_ip_address text,
  p_email text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_record contact_rate_limits%ROWTYPE;
  v_max_attempts integer := 5; -- Max 5 attempts
  v_window_minutes integer := 60; -- Per hour
  v_block_minutes integer := 120; -- Block for 2 hours if exceeded
  v_result jsonb;
BEGIN
  -- Check if IP is currently blocked
  SELECT * INTO v_record 
  FROM contact_rate_limits 
  WHERE ip_address = p_ip_address;
  
  IF v_record IS NOT NULL THEN
    -- Check if blocked
    IF v_record.blocked_until IS NOT NULL AND v_record.blocked_until > now() THEN
      RETURN jsonb_build_object(
        'allowed', false,
        'reason', 'blocked',
        'blocked_until', v_record.blocked_until,
        'remaining_minutes', EXTRACT(EPOCH FROM (v_record.blocked_until - now())) / 60
      );
    END IF;
    
    -- Check if within rate limit window
    IF v_record.first_attempt_at > now() - (v_window_minutes || ' minutes')::interval THEN
      IF v_record.attempts_count >= v_max_attempts THEN
        -- Block the IP
        UPDATE contact_rate_limits 
        SET blocked_until = now() + (v_block_minutes || ' minutes')::interval,
            last_attempt_at = now()
        WHERE ip_address = p_ip_address;
        
        RETURN jsonb_build_object(
          'allowed', false,
          'reason', 'rate_limited',
          'blocked_until', now() + (v_block_minutes || ' minutes')::interval,
          'remaining_minutes', v_block_minutes
        );
      ELSE
        -- Increment counter
        UPDATE contact_rate_limits 
        SET attempts_count = attempts_count + 1,
            last_attempt_at = now(),
            email = COALESCE(p_email, email)
        WHERE ip_address = p_ip_address;
        
        RETURN jsonb_build_object(
          'allowed', true,
          'attempts_remaining', v_max_attempts - v_record.attempts_count - 1
        );
      END IF;
    ELSE
      -- Reset counter (window expired)
      UPDATE contact_rate_limits 
      SET attempts_count = 1,
          first_attempt_at = now(),
          last_attempt_at = now(),
          blocked_until = NULL,
          email = COALESCE(p_email, email)
      WHERE ip_address = p_ip_address;
      
      RETURN jsonb_build_object(
        'allowed', true,
        'attempts_remaining', v_max_attempts - 1
      );
    END IF;
  ELSE
    -- New IP, create record
    INSERT INTO contact_rate_limits (ip_address, email)
    VALUES (p_ip_address, p_email);
    
    RETURN jsonb_build_object(
      'allowed', true,
      'attempts_remaining', v_max_attempts - 1
    );
  END IF;
END;
$$;

-- 5. Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_contact_rate_limits_ip ON public.contact_rate_limits(ip_address);
CREATE INDEX IF NOT EXISTS idx_contact_rate_limits_blocked ON public.contact_rate_limits(blocked_until) WHERE blocked_until IS NOT NULL;

-- 6. Create cleanup function for old rate limit records
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM contact_rate_limits 
  WHERE last_attempt_at < now() - interval '7 days';
END;
$$;