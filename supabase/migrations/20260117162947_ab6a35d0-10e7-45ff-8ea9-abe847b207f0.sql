-- Create a table for system alerts/notifications sent by admin
CREATE TABLE public.system_alerts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info',
    priority TEXT NOT NULL DEFAULT 'normal',
    target_type TEXT NOT NULL DEFAULT 'all',
    target_user_ids UUID[] DEFAULT NULL,
    target_role TEXT DEFAULT NULL,
    sent_by UUID NOT NULL,
    send_email BOOLEAN NOT NULL DEFAULT false,
    email_sent_count INTEGER DEFAULT 0,
    read_by UUID[] DEFAULT ARRAY[]::UUID[],
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.system_alerts ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins can manage system alerts"
ON public.system_alerts
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Users can view alerts targeted to them or all users
CREATE POLICY "Users can view their alerts"
ON public.system_alerts
FOR SELECT
TO authenticated
USING (
    target_type = 'all' 
    OR (target_type = 'specific' AND auth.uid() = ANY(target_user_ids))
    OR (target_type = 'role' AND (
        (target_role = 'user' AND public.has_role(auth.uid(), 'user'))
        OR (target_role = 'admin' AND public.has_role(auth.uid(), 'admin'))
    ))
);

-- Users can mark alerts as read (update read_by array)
CREATE POLICY "Users can mark alerts as read"
ON public.system_alerts
FOR UPDATE
TO authenticated
USING (
    target_type = 'all' 
    OR (target_type = 'specific' AND auth.uid() = ANY(target_user_ids))
    OR (target_type = 'role' AND (
        (target_role = 'user' AND public.has_role(auth.uid(), 'user'))
        OR (target_role = 'admin' AND public.has_role(auth.uid(), 'admin'))
    ))
)
WITH CHECK (
    target_type = 'all' 
    OR (target_type = 'specific' AND auth.uid() = ANY(target_user_ids))
    OR (target_type = 'role' AND (
        (target_role = 'user' AND public.has_role(auth.uid(), 'user'))
        OR (target_role = 'admin' AND public.has_role(auth.uid(), 'admin'))
    ))
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_system_alerts_updated_at
BEFORE UPDATE ON public.system_alerts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_system_alerts_target_type ON public.system_alerts(target_type);
CREATE INDEX idx_system_alerts_created_at ON public.system_alerts(created_at DESC);