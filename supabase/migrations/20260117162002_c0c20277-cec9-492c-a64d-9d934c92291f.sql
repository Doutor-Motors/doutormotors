-- Create a table for system settings (global app configuration)
CREATE TABLE public.system_settings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    value JSONB NOT NULL DEFAULT '{}',
    description TEXT,
    category TEXT NOT NULL DEFAULT 'general',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can read settings
CREATE POLICY "Admins can view system settings"
ON public.system_settings
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can update settings
CREATE POLICY "Admins can update system settings"
ON public.system_settings
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can insert settings
CREATE POLICY "Admins can insert system settings"
ON public.system_settings
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_system_settings_updated_at
BEFORE UPDATE ON public.system_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default settings
INSERT INTO public.system_settings (key, value, description, category) VALUES
    ('app_name', '"Doutor Motors"', 'Nome da aplicação', 'general'),
    ('app_version', '"1.0.0"', 'Versão atual do sistema', 'general'),
    ('maintenance_mode', 'false', 'Modo de manutenção ativo', 'system'),
    ('debug_mode', 'false', 'Modo de depuração ativo', 'system'),
    ('email_notifications', 'true', 'Notificações por email habilitadas', 'notifications'),
    ('auto_backup', 'true', 'Backup automático diário', 'database'),
    ('max_vehicles_per_user', '10', 'Número máximo de veículos por usuário', 'limits'),
    ('max_diagnostics_history', '100', 'Histórico máximo de diagnósticos', 'limits'),
    ('session_timeout_minutes', '60', 'Tempo de sessão em minutos', 'security'),
    ('require_email_verification', 'true', 'Exigir verificação de email', 'security'),
    ('allow_new_registrations', 'true', 'Permitir novos cadastros', 'security'),
    ('obd_connection_timeout', '30', 'Timeout de conexão OBD em segundos', 'obd'),
    ('obd_retry_attempts', '3', 'Tentativas de reconexão OBD', 'obd'),
    ('support_email', '"suporte@doutormotors.com"', 'Email de suporte', 'contact'),
    ('support_phone', '"(11) 99999-9999"', 'Telefone de suporte', 'contact');