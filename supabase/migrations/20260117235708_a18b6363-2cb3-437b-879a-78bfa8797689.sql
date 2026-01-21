-- Create data recordings table for storing OBD data sessions
CREATE TABLE public.data_recordings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  parameters_count INTEGER DEFAULT 0,
  data_points_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'recording' CHECK (status IN ('recording', 'completed', 'cancelled')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create data points table for individual readings
CREATE TABLE public.recording_data_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recording_id UUID NOT NULL REFERENCES public.data_recordings(id) ON DELETE CASCADE,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  parameters JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.data_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recording_data_points ENABLE ROW LEVEL SECURITY;

-- RLS Policies for data_recordings
CREATE POLICY "Users can view own recordings"
ON public.data_recordings
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recordings"
ON public.data_recordings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recordings"
ON public.data_recordings
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recordings"
ON public.data_recordings
FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for recording_data_points
CREATE POLICY "Users can view own data points"
ON public.recording_data_points
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.data_recordings dr
    WHERE dr.id = recording_data_points.recording_id
    AND dr.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert own data points"
ON public.recording_data_points
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.data_recordings dr
    WHERE dr.id = recording_data_points.recording_id
    AND dr.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete own data points"
ON public.recording_data_points
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.data_recordings dr
    WHERE dr.id = recording_data_points.recording_id
    AND dr.user_id = auth.uid()
  )
);

-- Indexes for performance
CREATE INDEX idx_data_recordings_user_id ON public.data_recordings(user_id);
CREATE INDEX idx_data_recordings_vehicle_id ON public.data_recordings(vehicle_id);
CREATE INDEX idx_data_recordings_status ON public.data_recordings(status);
CREATE INDEX idx_recording_data_points_recording_id ON public.recording_data_points(recording_id);
CREATE INDEX idx_recording_data_points_timestamp ON public.recording_data_points(timestamp);

-- Trigger for updated_at
CREATE TRIGGER update_data_recordings_updated_at
BEFORE UPDATE ON public.data_recordings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();