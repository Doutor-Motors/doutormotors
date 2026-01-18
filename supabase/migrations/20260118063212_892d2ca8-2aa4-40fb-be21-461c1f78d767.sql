-- Tabela principal de cache de tutoriais do CarCareKiosk
CREATE TABLE public.tutorial_cache (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    source_url TEXT NOT NULL,
    title_original TEXT,
    title_pt TEXT,
    description_original TEXT,
    description_pt TEXT,
    category_original TEXT,
    category_pt TEXT,
    difficulty TEXT DEFAULT 'medium',
    duration_minutes INTEGER,
    thumbnail_url TEXT,
    video_url TEXT,
    youtube_video_id TEXT,
    steps JSONB DEFAULT '[]'::jsonb,
    tools JSONB DEFAULT '[]'::jsonb,
    safety_tips JSONB DEFAULT '[]'::jsonb,
    vehicle_makes JSONB DEFAULT '[]'::jsonb,
    vehicle_models JSONB DEFAULT '[]'::jsonb,
    vehicle_years JSONB DEFAULT '[]'::jsonb,
    views_count INTEGER DEFAULT 0,
    rating NUMERIC(3,2) DEFAULT 0,
    is_processed BOOLEAN DEFAULT false,
    last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_tutorial_cache_slug ON public.tutorial_cache(slug);
CREATE INDEX idx_tutorial_cache_category ON public.tutorial_cache(category_pt);
CREATE INDEX idx_tutorial_cache_vehicle ON public.tutorial_cache USING GIN(vehicle_makes);
CREATE INDEX idx_tutorial_cache_processed ON public.tutorial_cache(is_processed);

-- Tabela de categorias mapeadas
CREATE TABLE public.tutorial_categories (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    name_original TEXT NOT NULL,
    name_pt TEXT NOT NULL,
    icon TEXT,
    color TEXT,
    tutorials_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inserir categorias padrão
INSERT INTO public.tutorial_categories (slug, name_original, name_pt, icon, color) VALUES
('brakes', 'Brakes', 'Freios', 'disc', 'red'),
('suspension', 'Suspension', 'Suspensão', 'settings', 'blue'),
('engine', 'Engine', 'Motor', 'cog', 'gray'),
('electrical', 'Electrical', 'Elétrica', 'zap', 'yellow'),
('transmission', 'Transmission', 'Transmissão', 'settings-2', 'purple'),
('cooling', 'Cooling System', 'Sistema de Arrefecimento', 'thermometer', 'cyan'),
('exhaust', 'Exhaust', 'Escapamento', 'wind', 'orange'),
('steering', 'Steering', 'Direção', 'navigation', 'green'),
('interior', 'Interior', 'Interior', 'layout', 'brown'),
('exterior', 'Exterior', 'Exterior', 'car', 'silver'),
('maintenance', 'Maintenance', 'Manutenção', 'wrench', 'teal'),
('fuel', 'Fuel System', 'Sistema de Combustível', 'fuel', 'amber');

-- Tabela de favoritos do usuário
CREATE TABLE public.tutorial_favorites (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    tutorial_id UUID NOT NULL REFERENCES public.tutorial_cache(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, tutorial_id)
);

-- RLS para tutorial_cache (leitura pública)
ALTER TABLE public.tutorial_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tutoriais são públicos para leitura" ON public.tutorial_cache FOR SELECT USING (true);

-- RLS para tutorial_categories (leitura pública)
ALTER TABLE public.tutorial_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categorias são públicas para leitura" ON public.tutorial_categories FOR SELECT USING (true);

-- RLS para tutorial_favorites (usuário autenticado)
ALTER TABLE public.tutorial_favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuários podem ver seus favoritos" ON public.tutorial_favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem adicionar favoritos" ON public.tutorial_favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuários podem remover favoritos" ON public.tutorial_favorites FOR DELETE USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_tutorial_cache_updated_at
    BEFORE UPDATE ON public.tutorial_cache
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();