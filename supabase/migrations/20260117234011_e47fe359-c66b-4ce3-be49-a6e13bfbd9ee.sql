-- Drop existing permissive policies
DROP POLICY IF EXISTS "Anyone can read cached transcriptions" ON public.video_transcription_cache;
DROP POLICY IF EXISTS "Service role can manage cache" ON public.video_transcription_cache;

-- Create new secure policies
-- Authenticated users can read cached transcriptions
CREATE POLICY "Authenticated users can read cached transcriptions"
ON public.video_transcription_cache
FOR SELECT
TO authenticated
USING (true);

-- Only service role can insert (via edge functions)
CREATE POLICY "Service role can insert cache"
ON public.video_transcription_cache
FOR INSERT
TO service_role
WITH CHECK (true);

-- Only service role can update cache
CREATE POLICY "Service role can update cache"
ON public.video_transcription_cache
FOR UPDATE
TO service_role
USING (true);

-- Only service role can delete cache
CREATE POLICY "Service role can delete cache"
ON public.video_transcription_cache
FOR DELETE
TO service_role
USING (true);