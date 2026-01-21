-- ================================================
-- SECURITY FIX: Add access controls to cleanup functions
-- Ensure only service_role or admins can execute cleanup
-- ================================================

-- Update cleanup_old_data function with access control
CREATE OR REPLACE FUNCTION public.cleanup_old_data()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_audit_deleted integer;
  v_cache_stats_deleted integer;
  v_webhook_deleted integer;
  v_rate_limits_deleted integer;
  v_transcription_deleted integer;
  v_expired_sessions_deleted integer;
  v_caller_role text;
BEGIN
  -- Get the current role making the request
  v_caller_role := current_setting('request.jwt.claim.role', true);
  
  -- Only allow service_role (cron/edge functions) or authenticated admins
  IF v_caller_role IS DISTINCT FROM 'service_role' THEN
    IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin') THEN
      RAISE EXCEPTION 'Access denied: admin or service role privileges required';
    END IF;
  END IF;

  -- Delete audit logs older than 90 days
  DELETE FROM public.audit_logs 
  WHERE created_at < now() - interval '90 days';
  GET DIAGNOSTICS v_audit_deleted = ROW_COUNT;

  -- Delete cache statistics older than 30 days
  DELETE FROM public.cache_statistics 
  WHERE created_at < now() - interval '30 days';
  GET DIAGNOSTICS v_cache_stats_deleted = ROW_COUNT;

  -- Delete webhook logs older than 30 days
  DELETE FROM public.webhook_logs 
  WHERE created_at < now() - interval '30 days';
  GET DIAGNOSTICS v_webhook_deleted = ROW_COUNT;

  -- Delete old rate limits
  DELETE FROM public.contact_rate_limits 
  WHERE last_attempt_at < now() - interval '7 days';
  GET DIAGNOSTICS v_rate_limits_deleted = ROW_COUNT;

  -- Delete expired video transcription cache
  DELETE FROM public.video_transcription_cache 
  WHERE (expires_at IS NOT NULL AND expires_at < now())
     OR (expires_at IS NULL AND updated_at < now() - interval '60 days');
  GET DIAGNOSTICS v_transcription_deleted = ROW_COUNT;

  -- Delete expired/abandoned checkout sessions older than 7 days
  DELETE FROM public.checkout_sessions 
  WHERE status IN ('expired', 'abandoned') 
    AND created_at < now() - interval '7 days';
  GET DIAGNOSTICS v_expired_sessions_deleted = ROW_COUNT;

  RETURN jsonb_build_object(
    'success', true,
    'deleted', jsonb_build_object(
      'audit_logs', v_audit_deleted,
      'cache_statistics', v_cache_stats_deleted,
      'webhook_logs', v_webhook_deleted,
      'rate_limits', v_rate_limits_deleted,
      'transcription_cache', v_transcription_deleted,
      'checkout_sessions', v_expired_sessions_deleted
    ),
    'executed_at', now()
  );
END;
$$;

-- Update cleanup_old_rate_limits function with access control
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_caller_role text;
BEGIN
  -- Get the current role making the request
  v_caller_role := current_setting('request.jwt.claim.role', true);
  
  -- Only allow service_role (cron/edge functions) or authenticated admins
  IF v_caller_role IS DISTINCT FROM 'service_role' THEN
    IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin') THEN
      RAISE EXCEPTION 'Access denied: admin or service role privileges required';
    END IF;
  END IF;

  DELETE FROM contact_rate_limits 
  WHERE last_attempt_at < now() - interval '7 days';
END;
$$;

-- Add comment for documentation
COMMENT ON FUNCTION public.cleanup_old_data() IS 'Cleanup old data from various tables. Requires admin or service_role privileges.';
COMMENT ON FUNCTION public.cleanup_old_rate_limits() IS 'Cleanup old rate limit records. Requires admin or service_role privileges.';