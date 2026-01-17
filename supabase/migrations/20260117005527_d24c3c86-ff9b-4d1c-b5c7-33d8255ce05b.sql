-- Update admin user role to 'admin'
UPDATE public.user_roles 
SET role = 'admin' 
WHERE user_id = '3e340919-e7f9-4c4b-9a49-13fec37c04c4';

-- Ensure the cliente teste has 'user' role (should already be set by trigger, but confirming)
UPDATE public.user_roles 
SET role = 'user' 
WHERE user_id = '0b02b199-f569-4bdd-87de-81dd1cf2537e';