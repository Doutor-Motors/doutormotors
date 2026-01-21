-- Add RLS policies for admins to manage subscriptions

-- Allow admins to insert subscriptions
DROP POLICY IF EXISTS "Admins can insert subscriptions" ON public.user_subscriptions;
CREATE POLICY "Admins can insert subscriptions"
ON public.user_subscriptions
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Allow admins to delete subscriptions (if needed)
DROP POLICY IF EXISTS "Admins can delete subscriptions" ON public.user_subscriptions;
CREATE POLICY "Admins can delete subscriptions"
ON public.user_subscriptions
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'::public.app_role));