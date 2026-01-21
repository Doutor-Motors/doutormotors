-- Create audit_logs table for tracking critical user and admin actions
CREATE TABLE public.audit_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    old_value JSONB,
    new_value JSONB,
    metadata JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for common queries
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_entity_type ON public.audit_logs(entity_type);
CREATE INDEX idx_audit_logs_entity_id ON public.audit_logs(entity_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_user_action ON public.audit_logs(user_id, action);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Admins can view all audit logs
CREATE POLICY "Admins can view all audit logs"
ON public.audit_logs
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Users can view their own audit logs
CREATE POLICY "Users can view own audit logs"
ON public.audit_logs
FOR SELECT
USING (auth.uid() = user_id);

-- Allow authenticated users to insert their own audit logs
CREATE POLICY "Users can insert own audit logs"
ON public.audit_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow admins to insert audit logs for any user (for admin actions)
CREATE POLICY "Admins can insert any audit logs"
ON public.audit_logs
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add comments for documentation
COMMENT ON TABLE public.audit_logs IS 'Stores audit trail of critical user and admin actions';
COMMENT ON COLUMN public.audit_logs.action IS 'The action performed (e.g., LOGIN, LOGOUT, UPDATE_PROFILE, DELETE_VEHICLE)';
COMMENT ON COLUMN public.audit_logs.entity_type IS 'The type of entity affected (e.g., user, vehicle, diagnostic, subscription)';
COMMENT ON COLUMN public.audit_logs.entity_id IS 'The ID of the affected entity';
COMMENT ON COLUMN public.audit_logs.old_value IS 'Previous value before the change (for updates)';
COMMENT ON COLUMN public.audit_logs.new_value IS 'New value after the change (for updates/creates)';
COMMENT ON COLUMN public.audit_logs.metadata IS 'Additional contextual information about the action';