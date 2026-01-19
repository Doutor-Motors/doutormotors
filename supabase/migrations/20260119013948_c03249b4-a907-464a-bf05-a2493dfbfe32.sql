-- =====================================================
-- SECURITY MIGRATION: Fix Critical Vulnerabilities
-- =====================================================

-- 1. Enable Leaked Password Protection (Auth Config)
-- Note: This needs to be enabled in Supabase Dashboard under Authentication > Security
-- The migration below addresses RLS vulnerabilities

-- 2. FIX: Add explicit denial for anonymous users on profiles table
-- This prevents potential profile enumeration if auth is bypassed
CREATE POLICY "deny_anon_access_profiles" 
ON public.profiles 
FOR SELECT 
TO anon 
USING (false);

-- 3. FIX: Restrict contact_messages INSERT to validate source
-- Drop the overly permissive policy and create a more secure one
DROP POLICY IF EXISTS "Anyone can insert contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Service role can insert contact messages" ON public.contact_messages;

-- Create rate-limited insert policy (allows inserts but with validation)
CREATE POLICY "Validated contact message inserts" 
ON public.contact_messages 
FOR INSERT 
TO anon, authenticated
WITH CHECK (
  -- Basic validation: email format and required fields
  email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  AND length(name) >= 2
  AND length(name) <= 100
  AND length(message) >= 10
  AND length(message) <= 5000
  AND length(subject) >= 3
  AND length(subject) <= 200
);

-- 4. FIX: Separate webhook policy from user policy for subscriptions
-- Drop the combined policy that allows user OR admin updates
DROP POLICY IF EXISTS "Service role can update subscriptions via webhook" ON public.user_subscriptions;

-- Create separate policies: one for admin access, none for regular users
-- (Webhooks should use service_role which bypasses RLS)
CREATE POLICY "Admins can update subscriptions" 
ON public.user_subscriptions 
FOR UPDATE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Users should NOT be able to update their own subscription status
-- Stripe webhooks use service_role which bypasses RLS

-- 5. Add explicit denial for anon on sensitive tables
CREATE POLICY "deny_anon_access_audit_logs" 
ON public.audit_logs 
FOR ALL 
TO anon 
USING (false)
WITH CHECK (false);

CREATE POLICY "deny_anon_access_user_subscriptions" 
ON public.user_subscriptions 
FOR ALL 
TO anon 
USING (false)
WITH CHECK (false);

CREATE POLICY "deny_anon_access_support_tickets" 
ON public.support_tickets 
FOR ALL 
TO anon 
USING (false)
WITH CHECK (false);

CREATE POLICY "deny_anon_access_vehicles" 
ON public.vehicles 
FOR ALL 
TO anon 
USING (false)
WITH CHECK (false);

CREATE POLICY "deny_anon_access_diagnostics" 
ON public.diagnostics 
FOR ALL 
TO anon 
USING (false)
WITH CHECK (false);

CREATE POLICY "deny_anon_access_user_roles" 
ON public.user_roles 
FOR ALL 
TO anon 
USING (false)
WITH CHECK (false);

-- 6. Ensure OBD settings custom commands are validated
-- Add a constraint to limit custom_init_commands array size
ALTER TABLE public.obd_settings 
ADD CONSTRAINT check_custom_commands_limit 
CHECK (
  custom_init_commands IS NULL 
  OR array_length(custom_init_commands, 1) <= 10
);

-- 7. Create validation function for safe OBD commands
CREATE OR REPLACE FUNCTION public.validate_obd_command(command text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow only alphanumeric commands starting with AT or standard OBD PIDs
  -- Block potentially dangerous commands
  IF command IS NULL THEN
    RETURN true;
  END IF;
  
  -- Commands should be alphanumeric and reasonable length
  IF length(command) > 20 THEN
    RETURN false;
  END IF;
  
  -- Allow AT commands and standard hex PIDs
  IF command ~ '^(AT[A-Z0-9 ]{0,15}|[0-9A-Fa-f]{2,8})$' THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;