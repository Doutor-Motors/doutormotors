# ⚠️ CONFIGURAÇÕES DE PRODUÇÃO NECESSÁRIAS

Este arquivo documenta as variáveis de ambiente que precisam ser configuradas para produção.

## Cloudflare Turnstile (Anti-bot em Formulário de Contato)

```env
VITE_TURNSTILE_SITE_KEY=your-production-turnstile-site-key
```

**Como obter:**
1. Acesse: https://dash.cloudflare.com
2. Navegue até Turnstile
3. Crie um novo site
4. Copie a "Site Key" e configure na variável acima

**Nota:** A chave de teste `1x00000000000000000000AA` funciona apenas em desenvolvimento. Em produção, você DEVE usar uma chave real para evitar spam.

---

## Supabase (Backend)

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Já configurado via `src/integrations/supabase/client.ts` (hardcoded para produção).

---

## Edge Functions (No painel Supabase)

Configure no painel do Supabase (Settings → Edge Functions → Secrets):

```env
GEMINI_API_KEY=your-google-gemini-api-key
ABACATEPAY_API_KEY=your-abacatepay-api-key
ABACATEPAY_WEBHOOK_SECRET=your-webhook-secret
FIRECRAWL_API_KEY=your-firecrawl-api-key
ELEVENLABS_API_KEY=your-elevenlabs-api-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key (gerado automaticamente)
```

---

## Deploy Checklist

- [ ] Configurar `VITE_TURNSTILE_SITE_KEY` no Vercel/Netlify
- [ ] Verificar se modo OBD está com `isSimulated=false`
- [ ] Confirmar que função `simulate-pix-payment` foi removida
- [ ] Testar pagamento real com valor mínimo (R$ 0,01)
- [ ] Configurar backup automático no Supabase
- [ ] Ativar monitoramento (Sentry)

---

**Última atualização:** 2026-01-22  
**Sistema:** Modo Produção Ativado ✅
