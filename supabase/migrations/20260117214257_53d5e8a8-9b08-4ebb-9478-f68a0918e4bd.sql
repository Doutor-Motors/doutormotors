-- Create table for caching video transcriptions and elaborated steps
CREATE TABLE public.video_transcription_cache (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    video_url TEXT NOT NULL UNIQUE,
    youtube_video_id TEXT,
    original_transcription TEXT,
    elaborated_steps JSONB,
    translated_title TEXT,
    translated_description TEXT,
    translated_video_description TEXT,
    transcription_used BOOLEAN DEFAULT false,
    vehicle_context TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '30 days')
);

-- Create index for faster lookups
CREATE INDEX idx_video_transcription_cache_video_url ON public.video_transcription_cache(video_url);
CREATE INDEX idx_video_transcription_cache_youtube_id ON public.video_transcription_cache(youtube_video_id);
CREATE INDEX idx_video_transcription_cache_expires ON public.video_transcription_cache(expires_at);

-- Enable RLS
ALTER TABLE public.video_transcription_cache ENABLE ROW LEVEL SECURITY;

-- Public read policy (anyone can read cached transcriptions)
CREATE POLICY "Anyone can read cached transcriptions"
ON public.video_transcription_cache
FOR SELECT
USING (true);

-- Service role can insert/update (edge functions use service role)
CREATE POLICY "Service role can manage cache"
ON public.video_transcription_cache
FOR ALL
USING (true)
WITH CHECK (true);

-- Trigger for updated_at
CREATE TRIGGER update_video_transcription_cache_updated_at
BEFORE UPDATE ON public.video_transcription_cache
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Comment explaining the table
COMMENT ON TABLE public.video_transcription_cache IS 'Cache for YouTube video transcriptions and AI-generated elaborated steps to avoid reprocessing';