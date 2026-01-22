-- Sistema de Cache de Respostas de IA
-- Economiza custos armazenando respostas de diagnósticos e soluções já geradas

CREATE TABLE IF NOT EXISTS public.ai_response_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT NOT NULL UNIQUE, -- hash dos inputs (dtc_codes + vehicle info)
  endpoint TEXT NOT NULL, -- 'diagnose', 'fetch-solution', etc
  request_payload JSONB NOT NULL,
  response_data JSONB NOT NULL,
  tokens_used INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accessed_at TIMESTAMPTZ DEFAULT NOW(),
  access_count INTEGER DEFAULT 1,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days')
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_ai_cache_key ON public.ai_response_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_ai_cache_endpoint ON public.ai_response_cache(endpoint, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_cache_expires ON public.ai_response_cache(expires_at);

-- Função para buscar cache (atualiza accessed_at e access_count)
CREATE OR REPLACE FUNCTION public.get_ai_cache(p_cache_key TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_response JSONB;
BEGIN
  -- Buscar e atualizar em uma transação
  UPDATE public.ai_response_cache
  SET 
    accessed_at = NOW(),
    access_count = access_count + 1
  WHERE cache_key = p_cache_key
    AND expires_at > NOW()
  RETURNING response_data INTO v_response;
  
  RETURN v_response;
END;
$$;

-- Função para salvar no cache
CREATE OR REPLACE FUNCTION public.save_ai_cache(
  p_cache_key TEXT,
  p_endpoint TEXT,
  p_request JSONB,
  p_response JSONB,
  p_tokens INTEGER DEFAULT 0,
  p_ttl_days INTEGER DEFAULT 7
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO public.ai_response_cache (
    cache_key,
    endpoint,
    request_payload,
    response_data,
    tokens_used,
    expires_at
  ) VALUES (
    p_cache_key,
    p_endpoint,
    p_request,
    p_response,
    p_tokens,
    NOW() + (p_ttl_days || ' days')::INTERVAL
  )
  ON CONFLICT (cache_key) DO UPDATE SET
    accessed_at = NOW(),
    access_count = ai_response_cache.access_count + 1
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$;

-- Função de limpeza (remove caches expirados)
CREATE OR REPLACE FUNCTION public.cleanup_expired_ai_cache()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.ai_response_cache
  WHERE expires_at < NOW();
END;
$$;

-- RLS: Service role pode acessar (usado pelas Edge Functions)
ALTER TABLE public.ai_response_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access to cache"
  ON public.ai_response_cache
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE public.ai_response_cache IS 'Cache de respostas de IA para economizar tokens e melhorar performance';
COMMENT ON FUNCTION public.get_ai_cache IS 'Busca resposta no cache e atualiza estatísticas de acesso';
COMMENT ON FUNCTION public.save_ai_cache IS 'Salva resposta de IA no cache';
