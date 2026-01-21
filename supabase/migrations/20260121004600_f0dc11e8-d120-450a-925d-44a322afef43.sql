-- Fix security definer view - recreate with security_invoker = true
DROP VIEW IF EXISTS public.popular_questions_ranking;

CREATE VIEW public.popular_questions_ranking 
WITH (security_invoker = true) AS
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