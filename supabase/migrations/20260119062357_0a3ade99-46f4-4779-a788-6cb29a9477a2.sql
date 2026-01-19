-- Add trigger to log admin access to contact_messages table
-- This provides an audit trail for when admins read sensitive customer data

-- Create function to log admin reads on contact_messages
CREATE OR REPLACE FUNCTION public.log_admin_contact_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if the accessing user is an admin
  IF public.has_role(auth.uid(), 'admin') THEN
    INSERT INTO public.audit_logs (
      user_id,
      action,
      entity_type,
      entity_id,
      metadata
    ) VALUES (
      auth.uid(),
      'read',
      'contact_messages',
      NEW.id,
      jsonb_build_object(
        'email', NEW.email,
        'subject', NEW.subject,
        'accessed_at', now()
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Note: PostgreSQL doesn't support triggers on SELECT operations directly.
-- Audit logging for reads should be implemented at the application/edge function level.
-- Instead, let's add a policy that logs admin updates/deletes on contact_messages

-- Create trigger to log admin modifications to contact_messages
CREATE OR REPLACE FUNCTION public.log_contact_message_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs (
      user_id,
      action,
      entity_type,
      entity_id,
      old_value,
      new_value,
      metadata
    ) VALUES (
      auth.uid(),
      'update',
      'contact_messages',
      NEW.id,
      to_jsonb(OLD),
      to_jsonb(NEW),
      jsonb_build_object('operation', 'status_change')
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (
      user_id,
      action,
      entity_type,
      entity_id,
      old_value,
      metadata
    ) VALUES (
      auth.uid(),
      'delete',
      'contact_messages',
      OLD.id,
      to_jsonb(OLD),
      jsonb_build_object('operation', 'message_deleted')
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create the trigger on contact_messages
DROP TRIGGER IF EXISTS audit_contact_message_changes ON public.contact_messages;
CREATE TRIGGER audit_contact_message_changes
  AFTER UPDATE OR DELETE ON public.contact_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.log_contact_message_changes();

-- Also add audit logging for profile changes by admins
CREATE OR REPLACE FUNCTION public.log_profile_admin_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log admin changes (not user's own profile updates)
  IF auth.uid() IS NOT NULL AND auth.uid() != NEW.user_id AND public.has_role(auth.uid(), 'admin') THEN
    IF TG_OP = 'UPDATE' THEN
      INSERT INTO public.audit_logs (
        user_id,
        action,
        entity_type,
        entity_id,
        old_value,
        new_value,
        metadata
      ) VALUES (
        auth.uid(),
        'admin_update',
        'profiles',
        NEW.id,
        to_jsonb(OLD),
        to_jsonb(NEW),
        jsonb_build_object('target_user_id', NEW.user_id)
      );
    ELSIF TG_OP = 'DELETE' THEN
      INSERT INTO public.audit_logs (
        user_id,
        action,
        entity_type,
        entity_id,
        old_value,
        metadata
      ) VALUES (
        auth.uid(),
        'admin_delete',
        'profiles',
        OLD.id,
        to_jsonb(OLD),
        jsonb_build_object('target_user_id', OLD.user_id)
      );
    END IF;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create the trigger on profiles
DROP TRIGGER IF EXISTS audit_profile_admin_changes ON public.profiles;
CREATE TRIGGER audit_profile_admin_changes
  AFTER UPDATE OR DELETE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.log_profile_admin_changes();