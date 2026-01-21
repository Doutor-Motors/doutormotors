-- =====================================================
-- ADMIN RLS POLICIES - Tabelas que ainda precisam de policies
-- =====================================================

-- 1. diagnostics - Admin pode ver todos os diagnósticos
CREATE POLICY "Admins can view all diagnostics"
ON public.diagnostics
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all diagnostics"
ON public.diagnostics
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete all diagnostics"
ON public.diagnostics
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- 2. diagnostic_items - Admin pode ver todos os itens de diagnóstico
CREATE POLICY "Admins can view all diagnostic items"
ON public.diagnostic_items
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all diagnostic items"
ON public.diagnostic_items
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete all diagnostic items"
ON public.diagnostic_items
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- 3. vehicles - Admin pode ver todos os veículos
CREATE POLICY "Admins can view all vehicles"
ON public.vehicles
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all vehicles"
ON public.vehicles
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete all vehicles"
ON public.vehicles
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- 4. data_recordings - Admin pode ver todas as gravações
CREATE POLICY "Admins can view all recordings"
ON public.data_recordings
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete all recordings"
ON public.data_recordings
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- 5. recording_data_points - Admin pode ver todos os pontos de dados
CREATE POLICY "Admins can view all data points"
ON public.recording_data_points
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete all data points"
ON public.recording_data_points
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- 6. coding_executions - Admin pode ver e deletar execuções de codificação
CREATE POLICY "Admins can update coding executions"
ON public.coding_executions
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete coding executions"
ON public.coding_executions
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- 7. usage_tracking - Admin pode ver uso de todos os usuários
CREATE POLICY "Admins can view all usage tracking"
ON public.usage_tracking
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- 8. legal_consents - Admin pode ver consentimentos
CREATE POLICY "Admins can view all legal consents"
ON public.legal_consents
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- 9. user_notification_preferences - Admin pode ver preferências
CREATE POLICY "Admins can view all notification preferences"
ON public.user_notification_preferences
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- 10. obd_settings - Admin pode ver configurações OBD
CREATE POLICY "Admins can view all obd settings"
ON public.obd_settings
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- 11. pix_payments - Admin pode gerenciar pagamentos PIX
CREATE POLICY "Admins can manage all pix payments"
ON public.pix_payments
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 12. payments - Admin pode ver todos os pagamentos
CREATE POLICY "Admins can view all payments"
ON public.payments
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all payments"
ON public.payments
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- 13. checkout_sessions - Admin pode ver todas as sessões de checkout
CREATE POLICY "Admins can view all checkout sessions"
ON public.checkout_sessions
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all checkout sessions"
ON public.checkout_sessions
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));