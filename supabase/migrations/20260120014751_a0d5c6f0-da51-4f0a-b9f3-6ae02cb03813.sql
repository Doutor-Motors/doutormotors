-- Remover policies públicas de INSERT/UPDATE em pix_payments (muito permissivas)
-- e adicionar validação básica

DROP POLICY IF EXISTS "Atualização pública de pagamentos PIX" ON public.pix_payments;
DROP POLICY IF EXISTS "Inserção pública de pagamentos PIX" ON public.pix_payments;

-- Manter apenas leitura pública (para verificar status) e deixar insert/update para service_role
-- O webhook usa service_role key, então não precisa de policy pública

-- Service role pode gerenciar todos os pagamentos PIX
CREATE POLICY "Service role can manage pix payments"
ON public.pix_payments
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');