-- ============================================================================
-- MIGRAÇÃO DE SEGURANÇA CRÍTICA - DOUTOR MOTORS
-- Corrige vulnerabilidades identificadas no scan de segurança
-- ============================================================================

-- 1. CORRIGIR VULNERABILIDADE CRÍTICA: pix_payments exposto publicamente
-- Remove a política de leitura pública que expõe dados sensíveis de clientes
DROP POLICY IF EXISTS "Leitura pública de pagamentos PIX" ON public.pix_payments;

-- Adiciona políticas seguras para pix_payments
-- Apenas usuários autenticados podem ver seus próprios pagamentos (via metadata)
CREATE POLICY "Users can view own pix payments"
ON public.pix_payments
FOR SELECT
USING (
  (metadata->>'userId')::uuid = auth.uid() OR
  customer_email = (SELECT email FROM profiles WHERE user_id = auth.uid())
);

-- 2. CORRIGIR VIEWS COM SECURITY DEFINER
-- Recriar views sem SECURITY DEFINER para usar permissões do usuário

-- Drop e recria cache_statistics_summary
DROP VIEW IF EXISTS public.cache_statistics_summary;
CREATE VIEW public.cache_statistics_summary
WITH (security_invoker = true) AS
SELECT 
    cache_type,
    date(created_at) AS date,
    count(*) FILTER (WHERE operation = 'hit') AS hits,
    count(*) FILTER (WHERE operation = 'miss') AS misses,
    count(*) FILTER (WHERE operation = 'expired') AS expired,
    count(*) FILTER (WHERE operation = 'evicted') AS evicted,
    count(*) AS total_operations,
    round((100.0 * count(*) FILTER (WHERE operation = 'hit')::numeric) / NULLIF(count(*), 0)::numeric, 2) AS hit_rate_percent
FROM cache_statistics
GROUP BY cache_type, date(created_at)
ORDER BY date(created_at) DESC, cache_type;

-- Drop e recria contact_analytics_summary
DROP VIEW IF EXISTS public.contact_analytics_summary;
CREATE VIEW public.contact_analytics_summary
WITH (security_invoker = true) AS
SELECT 
    date(created_at) AS date,
    event_type,
    count(*) AS count,
    count(DISTINCT ip_address) AS unique_ips
FROM contact_form_analytics
WHERE created_at > (now() - interval '30 days')
GROUP BY date(created_at), event_type
ORDER BY date(created_at) DESC, event_type;

-- Drop e recria popular_questions_ranking
DROP VIEW IF EXISTS public.popular_questions_ranking;
CREATE VIEW public.popular_questions_ranking
WITH (security_invoker = true) AS
SELECT 
    question_text,
    question_icon,
    question_color,
    question_gradient,
    sum(usage_count) AS total_usage,
    count(DISTINCT user_id) AS unique_users,
    max(last_used_at) AS last_used
FROM expert_favorite_questions
GROUP BY question_text, question_icon, question_color, question_gradient
ORDER BY sum(usage_count) DESC, count(DISTINCT user_id) DESC
LIMIT 20;

-- 3. ADICIONAR ÍNDICES FALTANTES PARA PERFORMANCE

-- Índice para buscas de pagamentos PIX por email do cliente
CREATE INDEX IF NOT EXISTS idx_pix_payments_customer_email 
ON public.pix_payments(customer_email);

-- Índice para buscas de pagamentos PIX por status
CREATE INDEX IF NOT EXISTS idx_pix_payments_status 
ON public.pix_payments(status);

-- Índice para metadata do pix_payments (userId)
CREATE INDEX IF NOT EXISTS idx_pix_payments_metadata_user 
ON public.pix_payments USING gin(metadata);

-- Índice para user_subscriptions por user_id e status
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_status 
ON public.user_subscriptions(user_id, status);

-- Índice para profiles por email
CREATE INDEX IF NOT EXISTS idx_profiles_email 
ON public.profiles(email);

-- Índice para vehicles por user_id
CREATE INDEX IF NOT EXISTS idx_vehicles_user_id 
ON public.vehicles(user_id);

-- Índice para diagnostics por user_id e created_at
CREATE INDEX IF NOT EXISTS idx_diagnostics_user_created 
ON public.diagnostics(user_id, created_at DESC);

-- Índice para diagnostic_items por diagnostic_id
CREATE INDEX IF NOT EXISTS idx_diagnostic_items_diagnostic_id 
ON public.diagnostic_items(diagnostic_id);

-- Índice para expert_conversations por user_id
CREATE INDEX IF NOT EXISTS idx_expert_conversations_user_id 
ON public.expert_conversations(user_id);

-- Índice para expert_messages por conversation_id
CREATE INDEX IF NOT EXISTS idx_expert_messages_conversation_id 
ON public.expert_messages(conversation_id);

-- Índice para maintenance_reminders por user_id e vehicle_id
CREATE INDEX IF NOT EXISTS idx_maintenance_reminders_user_vehicle 
ON public.maintenance_reminders(user_id, vehicle_id);

-- Índice para maintenance_reminders por due_date
CREATE INDEX IF NOT EXISTS idx_maintenance_reminders_due_date 
ON public.maintenance_reminders(due_date) 
WHERE is_completed = false;

-- Índice para support_tickets por user_id e status
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_status 
ON public.support_tickets(user_id, status);

-- Índice para ticket_messages por ticket_id
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket_id 
ON public.ticket_messages(ticket_id);

-- 4. ADICIONAR CONSTRAINTS DE INTEGRIDADE FALTANTES

-- Garantir que o campo year de vehicles seja válido
ALTER TABLE public.vehicles
ADD CONSTRAINT chk_vehicles_year_range 
CHECK (year >= 1900 AND year <= EXTRACT(YEAR FROM CURRENT_DATE) + 2);

-- Garantir que amount em pix_payments seja positivo
ALTER TABLE public.pix_payments
ADD CONSTRAINT chk_pix_payments_amount_positive 
CHECK (amount > 0);

-- Garantir que status de pix_payments seja válido
ALTER TABLE public.pix_payments
ADD CONSTRAINT chk_pix_payments_status_valid 
CHECK (status IN ('pending', 'paid', 'expired', 'cancelled'));

-- Garantir que plan_type seja válido
ALTER TABLE public.user_subscriptions
ADD CONSTRAINT chk_user_subscriptions_plan_type 
CHECK (plan_type IN ('basic', 'pro'));

-- Garantir que status de subscription seja válido
ALTER TABLE public.user_subscriptions
ADD CONSTRAINT chk_user_subscriptions_status 
CHECK (status IN ('active', 'cancelled', 'expired', 'pending', 'trial'));

-- 5. ADICIONAR CAMPOS FALTANTES PARA AUDITORIA COMPLETA

-- Adicionar campo current_mileage em vehicles se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'vehicles' 
        AND column_name = 'current_mileage'
    ) THEN
        ALTER TABLE public.vehicles ADD COLUMN current_mileage integer DEFAULT NULL;
    END IF;
END $$;

-- 6. OTIMIZAR TRIGGER DE UPDATED_AT (garantir que existe em todas tabelas necessárias)

-- Criar trigger para vehicles se não existir
DROP TRIGGER IF EXISTS update_vehicles_updated_at ON public.vehicles;
CREATE TRIGGER update_vehicles_updated_at
    BEFORE UPDATE ON public.vehicles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Criar trigger para diagnostics se não existir
DROP TRIGGER IF EXISTS update_diagnostics_updated_at ON public.diagnostics;
CREATE TRIGGER update_diagnostics_updated_at
    BEFORE UPDATE ON public.diagnostics
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Criar trigger para diagnostic_items se não existir
DROP TRIGGER IF EXISTS update_diagnostic_items_updated_at ON public.diagnostic_items;
CREATE TRIGGER update_diagnostic_items_updated_at
    BEFORE UPDATE ON public.diagnostic_items
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Criar trigger para user_subscriptions se não existir
DROP TRIGGER IF EXISTS update_user_subscriptions_updated_at ON public.user_subscriptions;
CREATE TRIGGER update_user_subscriptions_updated_at
    BEFORE UPDATE ON public.user_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Criar trigger para pix_payments se não existir
DROP TRIGGER IF EXISTS update_pix_payments_updated_at ON public.pix_payments;
CREATE TRIGGER update_pix_payments_updated_at
    BEFORE UPDATE ON public.pix_payments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Criar trigger para maintenance_reminders se não existir
DROP TRIGGER IF EXISTS update_maintenance_reminders_updated_at ON public.maintenance_reminders;
CREATE TRIGGER update_maintenance_reminders_updated_at
    BEFORE UPDATE ON public.maintenance_reminders
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 7. GARANTIR RLS ATIVADO EM TODAS AS TABELAS SENSÍVEIS

ALTER TABLE public.pix_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnostics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnostic_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expert_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expert_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recording_data_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coding_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.obd_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_ips ENABLE ROW LEVEL SECURITY;

-- 8. COMENTÁRIOS DE DOCUMENTAÇÃO NAS TABELAS

COMMENT ON TABLE public.profiles IS 'Perfis de usuários do sistema. Criado automaticamente via trigger ao registrar.';
COMMENT ON TABLE public.vehicles IS 'Veículos cadastrados pelos usuários para diagnóstico.';
COMMENT ON TABLE public.diagnostics IS 'Sessões de diagnóstico OBD2 realizadas.';
COMMENT ON TABLE public.diagnostic_items IS 'Códigos DTC encontrados em cada diagnóstico.';
COMMENT ON TABLE public.user_subscriptions IS 'Assinaturas dos usuários (Basic/Pro).';
COMMENT ON TABLE public.pix_payments IS 'Pagamentos PIX processados via AbacatePay.';
COMMENT ON TABLE public.payments IS 'Histórico geral de pagamentos.';
COMMENT ON TABLE public.support_tickets IS 'Tickets de suporte abertos pelos usuários.';
COMMENT ON TABLE public.expert_conversations IS 'Conversas com o Expert IA.';
COMMENT ON TABLE public.maintenance_reminders IS 'Lembretes de manutenção agendados.';
COMMENT ON TABLE public.audit_logs IS 'Logs de auditoria de ações no sistema.';
COMMENT ON TABLE public.user_roles IS 'Roles de usuários (user/admin).';

-- 9. CRIAR FUNÇÃO PARA VALIDAÇÃO DE CPF

CREATE OR REPLACE FUNCTION public.validate_cpf(cpf text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    cpf_clean text;
    sum1 integer := 0;
    sum2 integer := 0;
    digit1 integer;
    digit2 integer;
    i integer;
BEGIN
    -- Remove caracteres não numéricos
    cpf_clean := regexp_replace(cpf, '[^0-9]', '', 'g');
    
    -- Verifica se tem 11 dígitos
    IF length(cpf_clean) != 11 THEN
        RETURN false;
    END IF;
    
    -- Verifica CPFs inválidos conhecidos
    IF cpf_clean IN ('00000000000', '11111111111', '22222222222', '33333333333',
                     '44444444444', '55555555555', '66666666666', '77777777777',
                     '88888888888', '99999999999') THEN
        RETURN false;
    END IF;
    
    -- Calcula primeiro dígito verificador
    FOR i IN 1..9 LOOP
        sum1 := sum1 + (substring(cpf_clean, i, 1)::integer * (11 - i));
    END LOOP;
    digit1 := (sum1 * 10) % 11;
    IF digit1 = 10 THEN digit1 := 0; END IF;
    
    -- Calcula segundo dígito verificador
    FOR i IN 1..10 LOOP
        sum2 := sum2 + (substring(cpf_clean, i, 1)::integer * (12 - i));
    END LOOP;
    digit2 := (sum2 * 10) % 11;
    IF digit2 = 10 THEN digit2 := 0; END IF;
    
    -- Verifica dígitos
    RETURN substring(cpf_clean, 10, 1)::integer = digit1 
       AND substring(cpf_clean, 11, 1)::integer = digit2;
END;
$$;

COMMENT ON FUNCTION public.validate_cpf IS 'Valida se um CPF brasileiro é válido (algoritmo oficial).';

-- 10. CRIAR FUNÇÃO PARA ESTATÍSTICAS DO SISTEMA

CREATE OR REPLACE FUNCTION public.get_system_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    result jsonb;
BEGIN
    -- Apenas admins podem executar
    IF NOT public.has_role(auth.uid(), 'admin') THEN
        RAISE EXCEPTION 'Acesso negado: apenas administradores podem ver estatísticas do sistema.';
    END IF;
    
    SELECT jsonb_build_object(
        'users', jsonb_build_object(
            'total', (SELECT count(*) FROM profiles),
            'admins', (SELECT count(*) FROM user_roles WHERE role = 'admin'),
            'with_subscription', (SELECT count(DISTINCT user_id) FROM user_subscriptions WHERE status = 'active')
        ),
        'vehicles', jsonb_build_object(
            'total', (SELECT count(*) FROM vehicles)
        ),
        'diagnostics', jsonb_build_object(
            'total', (SELECT count(*) FROM diagnostics),
            'this_month', (SELECT count(*) FROM diagnostics WHERE created_at >= date_trunc('month', CURRENT_DATE))
        ),
        'subscriptions', jsonb_build_object(
            'active_basic', (SELECT count(*) FROM user_subscriptions WHERE status = 'active' AND plan_type = 'basic'),
            'active_pro', (SELECT count(*) FROM user_subscriptions WHERE status = 'active' AND plan_type = 'pro')
        ),
        'support', jsonb_build_object(
            'open_tickets', (SELECT count(*) FROM support_tickets WHERE status IN ('open', 'in_progress'))
        ),
        'generated_at', now()
    ) INTO result;
    
    RETURN result;
END;
$$;

COMMENT ON FUNCTION public.get_system_stats IS 'Retorna estatísticas gerais do sistema (apenas admin).';
