-- Limpar cache inválido da tabela video_transcription_cache
-- Deletar entradas que:
-- 1. Não tem youtube_video_id válido (NULL ou menor que 11 caracteres)
-- 2. E não tem elaborated_steps válidos (NULL ou array vazio)
-- 3. Ou que contém "NOT FOUND" no título ou descrição

DELETE FROM video_transcription_cache
WHERE 
  -- Sem vídeo válido E sem steps válidos
  (
    (youtube_video_id IS NULL OR length(youtube_video_id) < 11)
    AND (elaborated_steps IS NULL OR elaborated_steps = '[]'::jsonb)
  )
  -- Ou título/descrição indicando NOT FOUND
  OR translated_title ILIKE '%not found%'
  OR translated_title ILIKE '%não encontrado%'
  OR translated_description ILIKE '%not found%';