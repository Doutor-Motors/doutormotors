-- Tabela para armazenar progresso do usuário nos tutoriais
CREATE TABLE public.tutorial_progress (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    tutorial_id UUID NOT NULL REFERENCES public.tutorial_cache(id) ON DELETE CASCADE,
    completed_steps INTEGER[] NOT NULL DEFAULT '{}',
    last_step INTEGER NOT NULL DEFAULT 0,
    watch_time_seconds INTEGER NOT NULL DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, tutorial_id)
);

-- Enable RLS
ALTER TABLE public.tutorial_progress ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view their own progress" 
ON public.tutorial_progress 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own progress" 
ON public.tutorial_progress 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" 
ON public.tutorial_progress 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own progress" 
ON public.tutorial_progress 
FOR DELETE 
USING (auth.uid() = user_id);

-- Trigger para updated_at
CREATE TRIGGER update_tutorial_progress_updated_at
BEFORE UPDATE ON public.tutorial_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para performance
CREATE INDEX idx_tutorial_progress_user_id ON public.tutorial_progress(user_id);
CREATE INDEX idx_tutorial_progress_tutorial_id ON public.tutorial_progress(tutorial_id);
CREATE INDEX idx_tutorial_progress_completed_at ON public.tutorial_progress(completed_at) WHERE completed_at IS NOT NULL;