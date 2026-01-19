-- Tighten overly permissive RLS policies that used USING(true)/WITH CHECK(true)
-- Goal: remove accidental public write access while keeping intended service-role behavior.

-- carcare_categories
ALTER POLICY "Service role can manage categories"
ON public.carcare_categories
TO service_role
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- carcare_procedure_cache
ALTER POLICY "Service role can manage procedure cache"
ON public.carcare_procedure_cache
TO service_role
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- contact_rate_limits
ALTER POLICY "Service role only"
ON public.contact_rate_limits
TO service_role
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- contact_form_analytics
ALTER POLICY "Service role can insert analytics"
ON public.contact_form_analytics
TO service_role
WITH CHECK (auth.role() = 'service_role');

-- video_transcription_cache
ALTER POLICY "Service role can delete cache"
ON public.video_transcription_cache
TO service_role
USING (auth.role() = 'service_role');

ALTER POLICY "Service role can update cache"
ON public.video_transcription_cache
TO service_role
USING (auth.role() = 'service_role');

ALTER POLICY "Service role can insert cache"
ON public.video_transcription_cache
TO service_role
WITH CHECK (auth.role() = 'service_role');
