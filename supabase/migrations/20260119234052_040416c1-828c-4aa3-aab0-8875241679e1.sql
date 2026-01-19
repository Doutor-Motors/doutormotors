-- ============================================
-- FASE 1: Sistema de Pagamentos PIX via PicPay
-- ============================================

-- 1.1 Adicionar CPF na tabela profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cpf TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_cpf ON public.profiles(cpf) WHERE cpf IS NOT NULL;

-- 1.2 Modificar user_subscriptions para suportar PicPay
ALTER TABLE public.user_subscriptions 
  ADD COLUMN IF NOT EXISTS picpay_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS picpay_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS next_billing_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'pix';

-- 1.3 Criar tabela payments
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  subscription_id UUID REFERENCES public.user_subscriptions(id) ON DELETE SET NULL,
  amount_cents INTEGER NOT NULL,
  method TEXT DEFAULT 'pix',
  status TEXT DEFAULT 'pending', -- pending, waiting_payment, paid, failed, refunded, expired
  picpay_transaction_id TEXT,
  picpay_charge_id TEXT UNIQUE,
  picpay_end_to_end_id TEXT,
  qr_code TEXT,
  qr_code_base64 TEXT,
  copy_paste_code TEXT,
  expires_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payments" 
  ON public.payments 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payments" 
  ON public.payments 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage payments" 
  ON public.payments 
  FOR ALL 
  TO service_role 
  USING (true)
  WITH CHECK (true);

-- Deny anonymous access
CREATE POLICY "deny_anon_access_payments" 
  ON public.payments 
  FOR ALL 
  USING (false) 
  WITH CHECK (false);

-- 1.4 Criar tabela checkout_sessions
CREATE TABLE IF NOT EXISTS public.checkout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  plan_type TEXT NOT NULL DEFAULT 'pro',
  amount_cents INTEGER NOT NULL DEFAULT 2990, -- R$ 29,90
  status TEXT DEFAULT 'pending', -- pending, processing, completed, abandoned, expired
  payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '30 minutes'),
  completed_at TIMESTAMPTZ,
  abandoned_at TIMESTAMPTZ,
  recovery_email_sent BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for checkout_sessions
ALTER TABLE public.checkout_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own checkout sessions" 
  ON public.checkout_sessions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own checkout sessions" 
  ON public.checkout_sessions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own checkout sessions" 
  ON public.checkout_sessions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage checkout sessions" 
  ON public.checkout_sessions 
  FOR ALL 
  TO service_role 
  USING (true)
  WITH CHECK (true);

-- Deny anonymous access
CREATE POLICY "deny_anon_access_checkout_sessions" 
  ON public.checkout_sessions 
  FOR ALL 
  USING (false) 
  WITH CHECK (false);

-- 1.5 Criar tabela webhook_logs (auditoria de segurança)
CREATE TABLE IF NOT EXISTS public.webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL,
  event_type TEXT,
  payload JSONB,
  signature_valid BOOLEAN,
  processed BOOLEAN DEFAULT false,
  error_message TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for webhook_logs - apenas service_role
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only on webhook_logs" 
  ON public.webhook_logs 
  FOR ALL 
  TO service_role 
  USING (true)
  WITH CHECK (true);

-- Deny all other access
CREATE POLICY "deny_all_access_webhook_logs" 
  ON public.webhook_logs 
  FOR ALL 
  USING (false) 
  WITH CHECK (false);

-- 1.6 Criar trigger para updated_at nas novas tabelas
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_checkout_sessions_updated_at
  BEFORE UPDATE ON public.checkout_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 1.7 Índices para performance
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_picpay_charge_id ON public.payments(picpay_charge_id);
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_user_id ON public.checkout_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_status ON public.checkout_sessions(status);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_provider ON public.webhook_logs(provider);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_created_at ON public.webhook_logs(created_at DESC);