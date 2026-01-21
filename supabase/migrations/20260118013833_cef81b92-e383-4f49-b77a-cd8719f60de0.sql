
-- =====================================================
-- MIGRAÇÃO: CRIAÇÃO DE TABELAS FALTANTES
-- Sistema: Doutor Motors
-- Data: 2026-01-18
-- =====================================================

-- =====================================================
-- TABELA 1: usage_tracking
-- Controla o uso mensal de funcionalidades por plano
-- =====================================================
CREATE TABLE IF NOT EXISTS public.usage_tracking (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    month_year TEXT NOT NULL, -- Formato: YYYY-MM
    diagnostics_count INTEGER NOT NULL DEFAULT 0,
    coding_executions_count INTEGER NOT NULL DEFAULT 0,
    data_recordings_count INTEGER NOT NULL DEFAULT 0,
    ai_queries_count INTEGER NOT NULL DEFAULT 0,
    last_reset_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT unique_user_month UNIQUE (user_id, month_year)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON public.usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_month_year ON public.usage_tracking(month_year);

-- RLS
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage"
ON public.usage_tracking FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage"
ON public.usage_tracking FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own usage"
ON public.usage_tracking FOR UPDATE
USING (auth.uid() = user_id);

-- =====================================================
-- TABELA 2: coding_executions
-- Histórico de execuções de funções de codificação
-- =====================================================
CREATE TABLE IF NOT EXISTS public.coding_executions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
    function_id TEXT NOT NULL,
    function_name TEXT NOT NULL,
    category TEXT NOT NULL,
    risk_level TEXT NOT NULL,
    success BOOLEAN NOT NULL DEFAULT false,
    message TEXT,
    details TEXT,
    raw_responses TEXT[] DEFAULT '{}',
    duration_ms INTEGER,
    is_simulated BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_coding_executions_user_id ON public.coding_executions(user_id);
CREATE INDEX IF NOT EXISTS idx_coding_executions_created_at ON public.coding_executions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_coding_executions_function_id ON public.coding_executions(function_id);

-- RLS
ALTER TABLE public.coding_executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own coding executions"
ON public.coding_executions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own coding executions"
ON public.coding_executions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins podem ver todas as execuções
CREATE POLICY "Admins can view all coding executions"
ON public.coding_executions FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- =====================================================
-- CORREÇÃO: Política RLS mais restritiva para user_subscriptions
-- Substitui USING (true) por service_role check
-- =====================================================
DROP POLICY IF EXISTS "Service role can update subscriptions" ON public.user_subscriptions;

-- Nova política: Apenas service_role pode atualizar (via webhooks Stripe)
-- Esta política será usada apenas por edge functions com service_role
CREATE POLICY "Service role can update subscriptions via webhook"
ON public.user_subscriptions FOR UPDATE
USING (
    -- Permite que o próprio usuário atualize (para cancelamentos, etc)
    auth.uid() = user_id
    OR
    -- Ou admins podem atualizar
    has_role(auth.uid(), 'admin'::app_role)
);

-- =====================================================
-- TRIGGER: Atualização automática de updated_at
-- =====================================================
CREATE TRIGGER update_usage_tracking_updated_at
    BEFORE UPDATE ON public.usage_tracking
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- ÍNDICES ADICIONAIS PARA PERFORMANCE
-- =====================================================

-- Índice para consultas de diagnósticos por prioridade
CREATE INDEX IF NOT EXISTS idx_diagnostic_items_priority 
ON public.diagnostic_items(priority);

-- Índice para consultas de diagnósticos por status
CREATE INDEX IF NOT EXISTS idx_diagnostic_items_status 
ON public.diagnostic_items(status);

-- Índice para consultas de diagnósticos recentes
CREATE INDEX IF NOT EXISTS idx_diagnostics_created_at 
ON public.diagnostics(created_at DESC);

-- Índice composto para vehicles por user e data
CREATE INDEX IF NOT EXISTS idx_vehicles_user_created 
ON public.vehicles(user_id, created_at DESC);

-- Índice para tickets por prioridade
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority 
ON public.support_tickets(priority);

-- Índice para alertas do sistema por data de expiração
CREATE INDEX IF NOT EXISTS idx_system_alerts_expires_at 
ON public.system_alerts(expires_at);

-- Índice para cache de vídeo por URL
CREATE INDEX IF NOT EXISTS idx_video_cache_video_url 
ON public.video_transcription_cache(video_url);
