-- Create table for storing conversation history
CREATE TABLE public.expert_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Nova Conversa',
  vehicle_context JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for storing individual messages
CREATE TABLE public.expert_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.expert_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  image_url TEXT,
  suggested_tutorials JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.expert_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expert_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
CREATE POLICY "Users can view their own conversations" 
ON public.expert_conversations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversations" 
ON public.expert_conversations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations" 
ON public.expert_conversations 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations" 
ON public.expert_conversations 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for messages (through conversation ownership)
CREATE POLICY "Users can view messages from their conversations" 
ON public.expert_messages 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.expert_conversations 
    WHERE id = expert_messages.conversation_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can create messages in their conversations" 
ON public.expert_messages 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.expert_conversations 
    WHERE id = expert_messages.conversation_id 
    AND user_id = auth.uid()
  )
);

-- Create indexes for performance
CREATE INDEX idx_expert_conversations_user_id ON public.expert_conversations(user_id);
CREATE INDEX idx_expert_conversations_updated_at ON public.expert_conversations(updated_at DESC);
CREATE INDEX idx_expert_messages_conversation_id ON public.expert_messages(conversation_id);
CREATE INDEX idx_expert_messages_created_at ON public.expert_messages(created_at);

-- Trigger to update conversation's updated_at when messages are added
CREATE OR REPLACE FUNCTION public.update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.expert_conversations 
  SET updated_at = now() 
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_conversation_on_message
AFTER INSERT ON public.expert_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_conversation_timestamp();