-- Allow users to delete messages from their own conversations
CREATE POLICY "Users can delete messages from their conversations"
ON public.expert_messages
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM expert_conversations
    WHERE expert_conversations.id = expert_messages.conversation_id
    AND expert_conversations.user_id = auth.uid()
  )
);

-- Create a view for popular questions ranking (aggregated from all users)
CREATE OR REPLACE VIEW public.popular_questions_ranking AS
SELECT 
  question_text,
  question_icon,
  question_color,
  question_gradient,
  SUM(usage_count) as total_usage,
  COUNT(DISTINCT user_id) as unique_users,
  MAX(last_used_at) as last_used
FROM public.expert_favorite_questions
GROUP BY question_text, question_icon, question_color, question_gradient
ORDER BY total_usage DESC, unique_users DESC
LIMIT 20;

-- Grant access to authenticated users
GRANT SELECT ON public.popular_questions_ranking TO authenticated;