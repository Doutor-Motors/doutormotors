-- Tabela para pagamentos PIX via AbacatePay
CREATE TABLE public.pix_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pix_id TEXT UNIQUE, -- ID retornado pela API AbacatePay
  amount INTEGER NOT NULL, -- Valor em centavos
  status TEXT NOT NULL DEFAULT 'pending', -- pending, paid, expired, cancelled
  br_code TEXT, -- Código PIX copia e cola
  qr_code_url TEXT, -- URL da imagem do QR code
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_cellphone TEXT,
  customer_tax_id TEXT NOT NULL, -- CPF/CNPJ
  description TEXT,
  metadata JSONB DEFAULT '{}',
  expires_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS (políticas públicas para demonstração)
ALTER TABLE public.pix_payments ENABLE ROW LEVEL SECURITY;

-- Política de leitura pública
CREATE POLICY "Leitura pública de pagamentos PIX"
ON public.pix_payments
FOR SELECT
USING (true);

-- Política de inserção pública
CREATE POLICY "Inserção pública de pagamentos PIX"
ON public.pix_payments
FOR INSERT
WITH CHECK (true);

-- Política de atualização pública
CREATE POLICY "Atualização pública de pagamentos PIX"
ON public.pix_payments
FOR UPDATE
USING (true);

-- Trigger para updated_at
CREATE TRIGGER update_pix_payments_updated_at
BEFORE UPDATE ON public.pix_payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Habilitar Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.pix_payments;

-- Índices para performance
CREATE INDEX idx_pix_payments_pix_id ON public.pix_payments(pix_id);
CREATE INDEX idx_pix_payments_status ON public.pix_payments(status);
CREATE INDEX idx_pix_payments_customer_email ON public.pix_payments(customer_email);