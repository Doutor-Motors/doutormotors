-- Add new columns to expert_conversations for pinning and better organization
ALTER TABLE public.expert_conversations 
ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS last_message_preview TEXT;

-- Create index for faster queries on pinned conversations
CREATE INDEX IF NOT EXISTS idx_expert_conversations_pinned 
ON public.expert_conversations(user_id, is_pinned DESC, updated_at DESC);

-- Add document support to expert_messages
ALTER TABLE public.expert_messages 
ADD COLUMN IF NOT EXISTS document_url TEXT,
ADD COLUMN IF NOT EXISTS document_name TEXT,
ADD COLUMN IF NOT EXISTS document_type TEXT;