# Checklist de Auditoria do Painel Admin

## ✅ Páginas Auditadas

### 1. Users (AdminUsers.tsx)
- [x] RLS policies para admin visualizar todos os perfis
- [x] Edge function `delete-user` com exclusão completa do auth.users
- [x] Revogação de sessões ao excluir usuário
- [x] Aba de "Usuários Órfãos" (auth.users sem profile)
- [x] Exclusão por email (para usuários sem profile)
- [x] Dialog de confirmação com aviso de irreversibilidade
- [x] Logs de auditoria na exclusão

### 2. Subscriptions (AdminSubscriptions.tsx)
- [x] RLS policy: `Admins can view all subscriptions`
- [x] Visualização de todas as assinaturas
- [ ] Ações de cancelamento manual (se necessário)

### 3. Payments (AdminPayments.tsx)
- [x] RLS policy: `Admins can view all payments`
- [x] Policies de `pix_payments` corrigidas (sem INSERT público)
- [x] Webhook de pagamento via service_role

### 4. Tickets (AdminTickets.tsx)
- [x] RLS policies para admin visualizar todos os tickets
- [x] Visualização de mensagens de tickets
- [x] Atribuição e alteração de status

### 5. Reports (AdminReports.tsx)
- [x] RLS para diagnostics e diagnostic_items
- [x] Visualização de relatórios de diagnóstico
- [x] Geração de PDFs

### 6. Settings (AdminSettings.tsx)
- [x] RLS para system_settings
- [x] Alteração de configurações do sistema
- [x] Logs de auditoria

## ✅ Edge Functions Auditadas

| Função | JWT | Status |
|--------|-----|--------|
| `delete-user` | Manual (admin check) | ✅ Atualizada |
| `list-orphan-users` | Manual (admin check) | ✅ Nova |
| `send-contact-email` | false | ✅ OK |
| `create-pix-qrcode` | false | ✅ OK |
| `abacatepay-webhook` | false | ✅ OK |

## ✅ RLS Policies Adicionadas

### Tabelas com políticas de admin
- `diagnostics`: SELECT para admins
- `diagnostic_items`: SELECT para admins
- `vehicles`: SELECT para admins
- `user_subscriptions`: SELECT para admins
- `pix_payments`: SELECT para admins (INSERT/UPDATE via service_role)
- `payments`: SELECT para admins
- `checkout_sessions`: SELECT para admins
- `support_tickets`: SELECT/UPDATE para admins
- `ticket_messages`: SELECT para admins
- `usage_tracking`: SELECT para admins
- `data_recordings`: SELECT para admins
- `coding_executions`: SELECT para admins
- `obd_settings`: SELECT para admins

## ✅ Correções de Segurança

1. **Usuários órfãos**: Usuários em auth.users sem profile agora são detectados e podem ser excluídos
2. **Login bloqueado**: useAuth.tsx agora verifica se profile existe; se não, impede login
3. **Sessões revogadas**: deleteUser invalida todas as sessões ao excluir do auth.users
4. **Políticas de pagamento**: Removidas políticas públicas de INSERT/UPDATE em pix_payments

## 📝 Testes E2E

Arquivo: `e2e/admin-panel.spec.ts`

- [x] Users: tabela com colunas corretas
- [x] Users: tabs de usuários e órfãos
- [x] Users: botão excluir por email
- [x] Users: filtro de busca
- [x] Subscriptions: página carrega
- [x] Payments: página carrega
- [x] Tickets: página carrega
- [x] Reports: página carrega
- [x] Settings: página carrega

## 🔒 Recomendações Pendentes (Manual)

1. **Leaked Password Protection**: Habilitar no Supabase Dashboard > Auth > Security
2. **Rate Limiting**: Configurar no Supabase Dashboard > Auth > Rate Limits
3. **MFA para Admins**: Considerar 2FA obrigatório para contas admin
4. **Backup de Dados**: Verificar políticas de backup do Supabase
5. **Logs de Acesso**: Implementar dashboard de audit_logs para admins

## Executar Testes

```bash
# Executar todos os testes admin
npx playwright test e2e/admin-panel.spec.ts

# Executar com UI
npx playwright test e2e/admin-panel.spec.ts --ui

# Executar com debug
npx playwright test e2e/admin-panel.spec.ts --debug
```
