-- Sistema de Logs de Auditoria de Segurança
-- Rastreia tentativas de bypass, acessos não autorizados e ações suspeitas

CREATE TABLE IF NOT EXISTS public.security_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address TEXT,
  user_agent TEXT,
  event_type TEXT NOT NULL, -- 'unauthorized_access', 'plan_bypass_attempt', 'rate_limit_exceeded', etc
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  resource TEXT, -- qual recurso estava sendo acessado
  action TEXT, -- qual ação foi tentada
  details JSONB, -- dados adicionais sobre o evento
  blocked BOOLEAN DEFAULT true, -- se a ação foi bloqueada
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_security_audit_user ON public.security_audit_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_audit_type ON public.security_audit_logs(event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_audit_severity ON public.security_audit_logs(severity, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_audit_ip ON public.security_audit_logs(ip_address, created_at DESC);

-- Função para criar log de auditoria (simplifica uso em triggers/functions)
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_user_id UUID,
  p_ip_address TEXT,
  p_user_agent TEXT,
  p_event_type TEXT,
  p_severity TEXT,
  p_resource TEXT,
  p_action TEXT,
  p_details JSONB DEFAULT NULL,
  p_blocked BOOLEAN DEFAULT true
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO public.security_audit_logs (
    user_id,
    ip_address,
    user_agent,
    event_type,
    severity,
    resource,
    action,
    details,
    blocked
  ) VALUES (
    p_user_id,
    p_ip_address,
    p_user_agent,
    p_event_type,
    p_severity,
    p_resource,
    p_action,
    p_details,
    p_blocked
  ) RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;

-- RLS: Apenas admins podem ver logs de auditoria
ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view security logs"
  ON public.security_audit_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Service role pode inserir (usado pelas Edge Functions)
CREATE POLICY "Service role can insert logs"
  ON public.security_audit_logs
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Função de limpeza (manter apenas últimos 90 dias)
CREATE OR REPLACE FUNCTION public.cleanup_old_security_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.security_audit_logs
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$;

COMMENT ON TABLE public.security_audit_logs IS 'Logs de auditoria de segurança - rastreia tentativas de bypass e acessos suspeitos';
COMMENT ON FUNCTION public.log_security_event IS 'Cria uma entrada de log de segurança';
COMMENT ON FUNCTION public.cleanup_old_security_logs IS 'Remove logs de segurança com mais de 90 dias';
