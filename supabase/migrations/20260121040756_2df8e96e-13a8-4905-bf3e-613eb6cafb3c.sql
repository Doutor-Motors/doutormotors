
-- =====================================================
-- 1. TABELA DE ESTATÍSTICAS DE CACHE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.cache_statistics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_type text NOT NULL, -- 'tutorial', 'procedure', 'transcription', 'solution'
  operation text NOT NULL, -- 'hit', 'miss', 'expired', 'evicted'
  key_identifier text, -- Optional: specific key that was accessed
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Índice para consultas por tipo e período
CREATE INDEX IF NOT EXISTS idx_cache_statistics_type_created ON public.cache_statistics (cache_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cache_statistics_operation ON public.cache_statistics (operation, created_at DESC);

-- RLS
ALTER TABLE public.cache_statistics ENABLE ROW LEVEL SECURITY;

-- Apenas admins podem ver estatísticas
DO $$ BEGIN
  CREATE POLICY "Admins can view cache statistics" 
  ON public.cache_statistics FOR SELECT 
  USING (has_role(auth.uid(), 'admin'::app_role));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Service role pode inserir (para edge functions)
DO $$ BEGIN
  CREATE POLICY "Service role can insert cache statistics" 
  ON public.cache_statistics FOR INSERT 
  WITH CHECK (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Service role pode deletar (para limpeza)
DO $$ BEGIN
  CREATE POLICY "Service role can delete cache statistics" 
  ON public.cache_statistics FOR DELETE 
  USING (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =====================================================
-- 2. VIEW AGREGADA DE ESTATÍSTICAS DE CACHE
-- =====================================================
CREATE OR REPLACE VIEW public.cache_statistics_summary AS
SELECT 
  cache_type,
  DATE(created_at) as date,
  COUNT(*) FILTER (WHERE operation = 'hit') as hits,
  COUNT(*) FILTER (WHERE operation = 'miss') as misses,
  COUNT(*) FILTER (WHERE operation = 'expired') as expired,
  COUNT(*) FILTER (WHERE operation = 'evicted') as evicted,
  COUNT(*) as total_operations,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE operation = 'hit') / NULLIF(COUNT(*), 0),
    2
  ) as hit_rate_percent
FROM public.cache_statistics
GROUP BY cache_type, DATE(created_at)
ORDER BY date DESC, cache_type;

-- =====================================================
-- 3. ÍNDICES OTIMIZADOS PARA TABELAS FREQUENTES
-- (Removidos índices com now() que não são IMMUTABLE)
-- =====================================================

-- tutorial_cache: busca por slug e categoria
CREATE INDEX IF NOT EXISTS idx_tutorial_cache_slug ON public.tutorial_cache (slug);
CREATE INDEX IF NOT EXISTS idx_tutorial_cache_category ON public.tutorial_cache (category_pt);
CREATE INDEX IF NOT EXISTS idx_tutorial_cache_processed ON public.tutorial_cache (is_processed) WHERE is_processed = false;

-- carcare_procedure_cache: busca por marca/modelo/categoria
CREATE INDEX IF NOT EXISTS idx_procedure_cache_brand_model ON public.carcare_procedure_cache (brand, model);
CREATE INDEX IF NOT EXISTS idx_procedure_cache_category ON public.carcare_procedure_cache (category);
CREATE INDEX IF NOT EXISTS idx_procedure_cache_expires ON public.carcare_procedure_cache (expires_at);

-- expert_conversations: busca por usuário e data
CREATE INDEX IF NOT EXISTS idx_expert_conversations_user_updated ON public.expert_conversations (user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_expert_conversations_pinned ON public.expert_conversations (user_id, is_pinned) WHERE is_pinned = true;

-- expert_messages: busca por conversa
CREATE INDEX IF NOT EXISTS idx_expert_messages_conversation ON public.expert_messages (conversation_id, created_at DESC);

-- maintenance_reminders: busca por veículo e status
CREATE INDEX IF NOT EXISTS idx_maintenance_reminders_vehicle ON public.maintenance_reminders (vehicle_id, is_completed);
CREATE INDEX IF NOT EXISTS idx_maintenance_reminders_due ON public.maintenance_reminders (due_date, is_completed);
CREATE INDEX IF NOT EXISTS idx_maintenance_reminders_user_pending ON public.maintenance_reminders (user_id, is_completed);

-- diagnostics: busca por veículo e status
CREATE INDEX IF NOT EXISTS idx_diagnostics_vehicle_status ON public.diagnostics (vehicle_id, status);
CREATE INDEX IF NOT EXISTS idx_diagnostics_user_created ON public.diagnostics (user_id, created_at DESC);

-- diagnostic_items: busca por diagnóstico e prioridade
CREATE INDEX IF NOT EXISTS idx_diagnostic_items_diagnostic ON public.diagnostic_items (diagnostic_id, priority);

-- vehicles: busca por usuário
CREATE INDEX IF NOT EXISTS idx_vehicles_user ON public.vehicles (user_id);

-- payments: busca por usuário e status
CREATE INDEX IF NOT EXISTS idx_payments_user_status ON public.payments (user_id, status);
CREATE INDEX IF NOT EXISTS idx_payments_created ON public.payments (created_at DESC);

-- user_subscriptions: busca por usuário e status
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status ON public.user_subscriptions (user_id, status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_expires ON public.user_subscriptions (expires_at, status);

-- audit_logs: busca por usuário e tipo
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_created ON public.audit_logs (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs (entity_type, created_at DESC);

-- video_transcription_cache: busca por URL
CREATE INDEX IF NOT EXISTS idx_video_transcription_url ON public.video_transcription_cache (video_url);
CREATE INDEX IF NOT EXISTS idx_video_transcription_youtube ON public.video_transcription_cache (youtube_video_id) WHERE youtube_video_id IS NOT NULL;

-- support_tickets: busca por usuário e status
CREATE INDEX IF NOT EXISTS idx_tickets_user_status ON public.support_tickets (user_id, status);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned ON public.support_tickets (assigned_to, status) WHERE assigned_to IS NOT NULL;

-- =====================================================
-- 4. FUNÇÃO DE LIMPEZA AUTOMÁTICA
-- =====================================================
CREATE OR REPLACE FUNCTION public.cleanup_old_data()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_audit_deleted integer;
  v_cache_stats_deleted integer;
  v_webhook_deleted integer;
  v_rate_limits_deleted integer;
  v_transcription_deleted integer;
  v_expired_sessions_deleted integer;
BEGIN
  -- Delete audit logs older than 90 days
  DELETE FROM public.audit_logs 
  WHERE created_at < now() - interval '90 days';
  GET DIAGNOSTICS v_audit_deleted = ROW_COUNT;

  -- Delete cache statistics older than 30 days
  DELETE FROM public.cache_statistics 
  WHERE created_at < now() - interval '30 days';
  GET DIAGNOSTICS v_cache_stats_deleted = ROW_COUNT;

  -- Delete webhook logs older than 30 days
  DELETE FROM public.webhook_logs 
  WHERE created_at < now() - interval '30 days';
  GET DIAGNOSTICS v_webhook_deleted = ROW_COUNT;

  -- Delete old rate limits
  DELETE FROM public.contact_rate_limits 
  WHERE last_attempt_at < now() - interval '7 days';
  GET DIAGNOSTICS v_rate_limits_deleted = ROW_COUNT;

  -- Delete expired video transcription cache
  DELETE FROM public.video_transcription_cache 
  WHERE (expires_at IS NOT NULL AND expires_at < now())
     OR (expires_at IS NULL AND updated_at < now() - interval '60 days');
  GET DIAGNOSTICS v_transcription_deleted = ROW_COUNT;

  -- Delete expired/abandoned checkout sessions older than 7 days
  DELETE FROM public.checkout_sessions 
  WHERE status IN ('expired', 'abandoned') 
    AND created_at < now() - interval '7 days';
  GET DIAGNOSTICS v_expired_sessions_deleted = ROW_COUNT;

  RETURN jsonb_build_object(
    'success', true,
    'deleted', jsonb_build_object(
      'audit_logs', v_audit_deleted,
      'cache_statistics', v_cache_stats_deleted,
      'webhook_logs', v_webhook_deleted,
      'rate_limits', v_rate_limits_deleted,
      'transcription_cache', v_transcription_deleted,
      'checkout_sessions', v_expired_sessions_deleted
    ),
    'executed_at', now()
  );
END;
$$;

-- =====================================================
-- 5. COMENTÁRIOS NAS TABELAS PARA DOCUMENTAÇÃO
-- =====================================================
COMMENT ON TABLE public.cache_statistics IS 'Estatísticas de uso do cache para monitorar hit/miss rates';
COMMENT ON VIEW public.cache_statistics_summary IS 'Resumo agregado das estatísticas de cache por dia e tipo';
COMMENT ON FUNCTION public.cleanup_old_data IS 'Remove dados antigos automaticamente (audit logs > 90 dias, cache stats > 30 dias, etc)';
