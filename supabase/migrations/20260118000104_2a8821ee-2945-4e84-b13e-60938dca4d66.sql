-- Create OBD settings table for advanced configuration
CREATE TABLE public.obd_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  -- ATST Configuration (timeout)
  atst_value INTEGER NOT NULL DEFAULT 32 CHECK (atst_value >= 0 AND atst_value <= 255),
  atst_mode TEXT NOT NULL DEFAULT 'auto' CHECK (atst_mode IN ('auto', 'manual')),
  -- Request optimization
  optimize_requests BOOLEAN NOT NULL DEFAULT false,
  -- Protocol settings
  preferred_protocol TEXT DEFAULT 'auto',
  -- Connection preferences
  auto_reconnect BOOLEAN NOT NULL DEFAULT true,
  connection_timeout_seconds INTEGER NOT NULL DEFAULT 30,
  -- Real-time parameters
  max_simultaneous_parameters INTEGER NOT NULL DEFAULT 4,
  polling_interval_ms INTEGER NOT NULL DEFAULT 100,
  -- Advanced ELM327 commands
  custom_init_commands TEXT[] DEFAULT '{}',
  -- Metadata
  last_successful_protocol TEXT,
  last_connection_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.obd_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own OBD settings"
ON public.obd_settings
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own OBD settings"
ON public.obd_settings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own OBD settings"
ON public.obd_settings
FOR UPDATE
USING (auth.uid() = user_id);

-- Index
CREATE INDEX idx_obd_settings_user_id ON public.obd_settings(user_id);

-- Trigger for updated_at
CREATE TRIGGER update_obd_settings_updated_at
BEFORE UPDATE ON public.obd_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();