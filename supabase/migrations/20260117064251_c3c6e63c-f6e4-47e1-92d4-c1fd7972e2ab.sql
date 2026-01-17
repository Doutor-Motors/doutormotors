-- Tabela para armazenar aceites de termos legais
CREATE TABLE public.legal_consents (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    consent_type TEXT NOT NULL, -- 'terms_of_use', 'privacy_policy', 'liability_waiver'
    consent_version TEXT NOT NULL DEFAULT '1.0',
    consented_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.legal_consents ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own consents
CREATE POLICY "Users can view their own consents"
ON public.legal_consents
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own consents
CREATE POLICY "Users can insert their own consents"
ON public.legal_consents
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_legal_consents_user_id ON public.legal_consents(user_id);
CREATE INDEX idx_legal_consents_type ON public.legal_consents(consent_type);