-- Adicionar índices faltantes para melhor performance
-- Índice em user_roles.user_id para consultas de role
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);

-- Índice em user_notification_preferences.user_id
CREATE INDEX IF NOT EXISTS idx_user_notification_preferences_user_id ON public.user_notification_preferences(user_id);

-- Índice em ticket_messages.ticket_id para consultas de mensagens
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket_id ON public.ticket_messages(ticket_id);

-- Índice em tutorial_categories.slug para buscas
CREATE INDEX IF NOT EXISTS idx_tutorial_categories_slug ON public.tutorial_categories(slug);

-- Índice em tutorial_favorites para consultas do usuário
CREATE INDEX IF NOT EXISTS idx_tutorial_favorites_user_id ON public.tutorial_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_tutorial_favorites_tutorial_id ON public.tutorial_favorites(tutorial_id);

-- Índice em carcare_categories.category_id
CREATE INDEX IF NOT EXISTS idx_carcare_categories_category_id ON public.carcare_categories(category_id);

-- Índice composto em carcare_procedure_cache para buscas por veículo
CREATE INDEX IF NOT EXISTS idx_carcare_procedure_cache_brand_model ON public.carcare_procedure_cache(brand, model);

-- Índice em system_settings.key para buscas rápidas
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON public.system_settings(key);