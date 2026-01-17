-- Create enum for ticket status
CREATE TYPE public.ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');

-- Create enum for ticket priority
CREATE TYPE public.ticket_priority AS ENUM ('low', 'medium', 'high', 'urgent');

-- Create enum for ticket category
CREATE TYPE public.ticket_category AS ENUM ('technical', 'account', 'billing', 'diagnostic', 'general');

-- Create support_tickets table
CREATE TABLE public.support_tickets (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    ticket_number TEXT NOT NULL UNIQUE,
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    category public.ticket_category NOT NULL DEFAULT 'general',
    priority public.ticket_priority NOT NULL DEFAULT 'medium',
    status public.ticket_status NOT NULL DEFAULT 'open',
    assigned_to UUID,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
    diagnostic_id UUID REFERENCES public.diagnostics(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    closed_at TIMESTAMP WITH TIME ZONE
);

-- Create ticket_messages table for conversation thread
CREATE TABLE public.ticket_messages (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    message TEXT NOT NULL,
    is_staff BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_notification_preferences table
CREATE TABLE public.user_notification_preferences (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    email_critical_diagnostics BOOLEAN NOT NULL DEFAULT true,
    email_diagnostic_completed BOOLEAN NOT NULL DEFAULT true,
    email_ticket_updates BOOLEAN NOT NULL DEFAULT true,
    email_account_updates BOOLEAN NOT NULL DEFAULT true,
    email_marketing BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create function to generate ticket number
CREATE OR REPLACE FUNCTION public.generate_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.ticket_number := 'TKT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for ticket number generation
CREATE TRIGGER generate_ticket_number_trigger
BEFORE INSERT ON public.support_tickets
FOR EACH ROW
EXECUTE FUNCTION public.generate_ticket_number();

-- Create trigger for updated_at on support_tickets
CREATE TRIGGER update_support_tickets_updated_at
BEFORE UPDATE ON public.support_tickets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for updated_at on user_notification_preferences
CREATE TRIGGER update_notification_preferences_updated_at
BEFORE UPDATE ON public.user_notification_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS on all tables
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notification_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for support_tickets

-- Users can view their own tickets
CREATE POLICY "Users can view own tickets"
ON public.support_tickets FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own tickets
CREATE POLICY "Users can create own tickets"
ON public.support_tickets FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own tickets (limited)
CREATE POLICY "Users can update own tickets"
ON public.support_tickets FOR UPDATE
USING (auth.uid() = user_id);

-- Admins can view all tickets
CREATE POLICY "Admins can view all tickets"
ON public.support_tickets FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admins can update all tickets
CREATE POLICY "Admins can update all tickets"
ON public.support_tickets FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete tickets
CREATE POLICY "Admins can delete tickets"
ON public.support_tickets FOR DELETE
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for ticket_messages

-- Users can view messages on their tickets
CREATE POLICY "Users can view messages on own tickets"
ON public.ticket_messages FOR SELECT
USING (EXISTS (
    SELECT 1 FROM public.support_tickets t
    WHERE t.id = ticket_messages.ticket_id
    AND t.user_id = auth.uid()
));

-- Users can create messages on their tickets
CREATE POLICY "Users can create messages on own tickets"
ON public.ticket_messages FOR INSERT
WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
        SELECT 1 FROM public.support_tickets t
        WHERE t.id = ticket_messages.ticket_id
        AND t.user_id = auth.uid()
    )
);

-- Admins can view all messages
CREATE POLICY "Admins can view all messages"
ON public.ticket_messages FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admins can create messages on any ticket
CREATE POLICY "Admins can create messages on any ticket"
ON public.ticket_messages FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for user_notification_preferences

-- Users can view their own preferences
CREATE POLICY "Users can view own notification preferences"
ON public.user_notification_preferences FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own preferences
CREATE POLICY "Users can insert own notification preferences"
ON public.user_notification_preferences FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own preferences
CREATE POLICY "Users can update own notification preferences"
ON public.user_notification_preferences FOR UPDATE
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_support_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX idx_support_tickets_created_at ON public.support_tickets(created_at DESC);
CREATE INDEX idx_ticket_messages_ticket_id ON public.ticket_messages(ticket_id);
CREATE INDEX idx_user_notification_preferences_user_id ON public.user_notification_preferences(user_id);