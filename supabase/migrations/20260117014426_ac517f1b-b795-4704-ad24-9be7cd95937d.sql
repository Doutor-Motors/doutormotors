-- Inserir role admin para o usuário andrejuliosilvaecom2@gmail.com
INSERT INTO public.user_roles (user_id, role)
VALUES ('3e340919-e7f9-4c4b-9a49-13fec37c04c4', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;