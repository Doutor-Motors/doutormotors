-- Create maintenance reminders table for scheduled notifications
CREATE TABLE public.maintenance_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('oil_change', 'tire_rotation', 'brake_inspection', 'air_filter', 'coolant', 'transmission', 'battery', 'spark_plugs', 'timing_belt', 'custom')),
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  due_mileage INTEGER,
  last_service_date TIMESTAMP WITH TIME ZONE,
  last_service_mileage INTEGER,
  interval_months INTEGER DEFAULT 6,
  interval_km INTEGER DEFAULT 10000,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  notification_sent BOOLEAN NOT NULL DEFAULT false,
  notification_sent_at TIMESTAMP WITH TIME ZONE,
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('critical', 'attention', 'preventive')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.maintenance_reminders ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own maintenance reminders"
ON public.maintenance_reminders
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own maintenance reminders"
ON public.maintenance_reminders
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own maintenance reminders"
ON public.maintenance_reminders
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own maintenance reminders"
ON public.maintenance_reminders
FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_maintenance_reminders_updated_at
BEFORE UPDATE ON public.maintenance_reminders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for performance
CREATE INDEX idx_maintenance_reminders_user_id ON public.maintenance_reminders(user_id);
CREATE INDEX idx_maintenance_reminders_vehicle_id ON public.maintenance_reminders(vehicle_id);
CREATE INDEX idx_maintenance_reminders_due_date ON public.maintenance_reminders(due_date);
CREATE INDEX idx_maintenance_reminders_notification_sent ON public.maintenance_reminders(notification_sent) WHERE notification_sent = false;