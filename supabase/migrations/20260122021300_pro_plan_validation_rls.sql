-- ============================================================================
-- MIGRAÇÃO CRÍTICA DE SEGURANÇA - VALIDAÇÃO DE PLANO PRO
-- Data: 2026-01-22
-- Objetivo: Corrigir vulnerabilidade que permite usuários Basic acessarem 
--           features Pro através de manipulação do frontend
-- ============================================================================

-- 1. CRIAR FUNÇÃO HELPER PARA VERIFICAR PLANO PRO
-- Esta função será usada pelas políticas RLS para validar se o usuário tem plano Pro ativo

CREATE OR REPLACE FUNCTION public.user_has_pro_plan(user_id_param uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM user_subscriptions
    WHERE user_id = user_id_param
      AND status = 'active'
      AND plan_type = 'pro'
  ) OR EXISTS (
    -- Admin sempre tem acesso Pro
    SELECT 1
    FROM user_roles
    WHERE user_id = user_id_param
      AND role = 'admin'
  );
$$;

COMMENT ON FUNCTION public.user_has_pro_plan IS 
'Verifica se o usuário tem plano Pro ativo ou é admin. Usado por políticas RLS.';

-- 2. POLÍTICAS RLS PARA DATA_RECORDINGS (Feature Pro)
-- Remove políticas antigas se existirem
DROP POLICY IF EXISTS "Users can view own data recordings" ON public.data_recordings;
DROP POLICY IF EXISTS "Users can insert own data recordings" ON public.data_recordings;
DROP POLICY IF EXISTS "Users can update own data recordings" ON public.data_recordings;
DROP POLICY IF EXISTS "Users can delete own data recordings" ON public.data_recordings;

-- SELECT: Usuário pode ver apenas suas próprias gravações
CREATE POLICY "Users can view own data recordings"
ON public.data_recordings
FOR SELECT
USING (user_id = auth.uid());

-- INSERT: APENAS usuários Pro podem criar gravações
CREATE POLICY "Only Pro users can insert data recordings"
ON public.data_recordings
FOR INSERT
WITH CHECK (
  user_id = auth.uid() 
  AND public.user_has_pro_plan(auth.uid())
);

-- UPDATE: Usuário pode atualizar apenas suas próprias gravações
CREATE POLICY "Users can update own data recordings"
ON public.data_recordings
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- DELETE: Usuário pode deletar apenas suas próprias gravações
CREATE POLICY "Users can delete own data recordings"
ON public.data_recordings
FOR DELETE
USING (user_id = auth.uid());

-- 3. POLÍTICAS RLS PARA RECORDING_DATA_POINTS (Feature Pro)
DROP POLICY IF EXISTS "Users can view own recording data points" ON public.recording_data_points;
DROP POLICY IF EXISTS "Users can insert own recording data points" ON public.recording_data_points;
DROP POLICY IF EXISTS "Users can delete own recording data points" ON public.recording_data_points;

-- SELECT: Usuário pode ver pontos de suas próprias gravações
CREATE POLICY "Users can view own recording data points"
ON public.recording_data_points
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM data_recordings
    WHERE data_recordings.id = recording_data_points.recording_id
      AND data_recordings.user_id = auth.uid()
  )
);

-- INSERT: APENAS usuários Pro podem inserir pontos de dados
CREATE POLICY "Only Pro users can insert recording data points"
ON public.recording_data_points
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM data_recordings
    WHERE data_recordings.id = recording_data_points.recording_id
      AND data_recordings.user_id = auth.uid()
  )
  AND public.user_has_pro_plan(auth.uid())
);

-- DELETE: Usuário pode deletar pontos de suas próprias gravações
CREATE POLICY "Users can delete own recording data points"
ON public.recording_data_points
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM data_recordings
    WHERE data_recordings.id = recording_data_points.recording_id
      AND data_recordings.user_id = auth.uid()
  )
);

-- 4. POLÍTICAS RLS PARA CODING_EXECUTIONS (Feature Pro)
DROP POLICY IF EXISTS "Users can view own coding executions" ON public.coding_executions;
DROP POLICY IF EXISTS "Users can insert own coding executions" ON public.coding_executions;

-- SELECT: Usuário pode ver apenas suas próprias execuções
CREATE POLICY "Users can view own coding executions"
ON public.coding_executions
FOR SELECT
USING (user_id = auth.uid());

-- INSERT: APENAS usuários Pro podem executar funções de coding
CREATE POLICY "Only Pro users can insert coding executions"
ON public.coding_executions
FOR INSERT
WITH CHECK (
  user_id = auth.uid()
  AND public.user_has_pro_plan(auth.uid())
);

-- 5. VALIDAÇÃO DE LIMITE DE DIAGNÓSTICOS MENSAIS (Basic: 5, Pro: ilimitado)
-- Criar função para verificar se usuário atingiu limite de diagnósticos

CREATE OR REPLACE FUNCTION public.user_can_create_diagnostic(user_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_plan text;
  diagnostics_this_month integer;
  max_diagnostics integer;
BEGIN
  -- Verifica se é admin (acesso ilimitado)
  IF EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = user_id_param AND role = 'admin'
  ) THEN
    RETURN true;
  END IF;

  -- Busca o plano do usuário
  SELECT plan_type INTO user_plan
  FROM user_subscriptions
  WHERE user_id = user_id_param
    AND status = 'active'
  ORDER BY created_at DESC
  LIMIT 1;

  -- Se não tem plano ativo, não pode criar diagnóstico
  IF user_plan IS NULL THEN
    RETURN false;
  END IF;

  -- Pro tem diagnósticos ilimitados
  IF user_plan = 'pro' THEN
    RETURN true;
  END IF;

  -- Basic tem limite de 5 por mês
  IF user_plan = 'basic' THEN
    max_diagnostics := 5;
    
    -- Conta diagnósticos do mês atual
    SELECT COUNT(*) INTO diagnostics_this_month
    FROM diagnostics
    WHERE user_id = user_id_param
      AND created_at >= date_trunc('month', CURRENT_DATE);
    
    RETURN diagnostics_this_month < max_diagnostics;
  END IF;

  -- Default: não permite
  RETURN false;
END;
$$;

COMMENT ON FUNCTION public.user_can_create_diagnostic IS 
'Valida se usuário pode criar novo diagnóstico baseado no plano (Basic: 5/mês, Pro: ilimitado)';

-- 6. POLÍTICA RLS PARA DIAGNOSTICS COM VALIDAÇÃO DE LIMITE
DROP POLICY IF EXISTS "Users can insert own diagnostics" ON public.diagnostics;

CREATE POLICY "Users can insert own diagnostics with plan limits"
ON public.diagnostics
FOR INSERT
WITH CHECK (
  user_id = auth.uid()
  AND public.user_can_create_diagnostic(auth.uid())
);

-- 7. ÍNDICES ADICIONAIS PARA PERFORMANCE DAS NOVAS QUERIES
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_status_plan 
ON public.user_subscriptions(user_id, status, plan_type);

-- Índice removido: date_trunc não é IMMUTABLE
-- Para queries de diagnósticos mensais, use WHERE created_at >= date_trunc('month', CURRENT_DATE)

-- 8. GRANT EXECUTE NAS FUNÇÕES PARA AUTHENTICATED USERS
GRANT EXECUTE ON FUNCTION public.user_has_pro_plan TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_can_create_diagnostic TO authenticated;

-- 9. COMENTÁRIOS DE AUDITORIA
COMMENT ON POLICY "Only Pro users can insert data recordings" ON public.data_recordings IS
'SEGURANÇA CRÍTICA: Impede usuários Basic de criarem gravações de dados via manipulação do frontend';

COMMENT ON POLICY "Only Pro users can insert coding executions" ON public.coding_executions IS
'SEGURANÇA CRÍTICA: Impede usuários Basic de executarem funções de coding via manipulação do frontend';

COMMENT ON POLICY "Users can insert own diagnostics with plan limits" ON public.diagnostics IS
'SEGURANÇA: Valida limite de 5 diagnósticos/mês para Basic, ilimitado para Pro';
