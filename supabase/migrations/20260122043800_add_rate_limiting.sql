-- Tabela para rastreamento de rate limiting
CREATE TABLE IF NOT EXISTS public.rate_limit_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address TEXT,
  endpoint TEXT NOT NULL,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para consultas rápidas por usuário/endpoint
CREATE INDEX IF NOT EXISTS idx_rate_limit_user_endpoint 
  ON public.rate_limit_tracking(user_id, endpoint, window_start);

-- Índice para consultas por IP (usuários não autenticados)
CREATE INDEX IF NOT EXISTS idx_rate_limit_ip_endpoint 
  ON public.rate_limit_tracking(ip_address, endpoint, window_start);

-- Função para limpar registros antigos (executar periodicamente)
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.rate_limit_tracking
  WHERE window_start < NOW() - INTERVAL '1 hour';
END;
$$;

-- RLS: Apenas service_role pode manipular esta tabela
ALTER TABLE public.rate_limit_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access"
  ON public.rate_limit_tracking
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Comentários
COMMENT ON TABLE public.rate_limit_tracking IS 'Rastreia requisições para rate limiting por usuário/IP';
COMMENT ON FUNCTION public.cleanup_old_rate_limits IS 'Remove registros de rate limit com mais de 1 hora';
