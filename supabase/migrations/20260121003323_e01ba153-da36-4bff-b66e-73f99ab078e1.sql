-- Create table for user's favorite quick questions
CREATE TABLE public.expert_favorite_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  question_text TEXT NOT NULL,
  question_icon TEXT NOT NULL DEFAULT 'HelpCircle',
  question_color TEXT NOT NULL DEFAULT 'text-primary',
  question_gradient TEXT NOT NULL DEFAULT 'from-primary/20 to-primary/5',
  usage_count INTEGER NOT NULL DEFAULT 1,
  last_used_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, question_text)
);

-- Enable RLS
ALTER TABLE public.expert_favorite_questions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own favorite questions" 
ON public.expert_favorite_questions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own favorite questions" 
ON public.expert_favorite_questions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own favorite questions" 
ON public.expert_favorite_questions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorite questions" 
ON public.expert_favorite_questions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_expert_favorite_questions_user ON public.expert_favorite_questions(user_id);
CREATE INDEX idx_expert_favorite_questions_usage ON public.expert_favorite_questions(user_id, usage_count DESC);