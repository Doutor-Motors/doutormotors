# QA Checklist Automatizado - Doutor Motors

## 📋 Visão Geral

Sistema completo de QA automatizado com Playwright para validação pré-produção.

## 🚀 Execução

```bash
# Executar checklist completo
npx playwright test e2e/qa-checklist.spec.ts

# Executar testes de segurança
npx playwright test e2e/qa-security.spec.ts

# Executar testes de fluxos
npx playwright test e2e/qa-flows.spec.ts

# Executar TODOS os testes QA
npx playwright test e2e/qa-*.spec.ts

# Gerar relatório HTML
npx playwright test e2e/qa-*.spec.ts --reporter=html

# Gerar relatório JSON + converter
npx playwright test e2e/qa-*.spec.ts --reporter=json > qa-results.json
```

## 📊 Categorias de Testes

| Categoria | Arquivo | Itens |
|-----------|---------|-------|
| Autenticação | qa-checklist.spec.ts | 7 testes |
| Fluxos Principais | qa-flows.spec.ts | 25+ testes |
| Funcionalidades PRO | qa-checklist.spec.ts | 6 testes |
| Admin/Owner | qa-checklist.spec.ts | 9 testes |
| Pagamentos PIX | qa-checklist.spec.ts | 3 testes |
| UX/UI | qa-checklist.spec.ts | 8 testes |
| Segurança | qa-security.spec.ts | 15+ testes |
| Performance | qa-checklist.spec.ts | 6 testes |

## 🔐 Configuração de Credenciais

```bash
# Para testes autenticados
export TEST_USER_EMAIL="seu-email@teste.com"
export TEST_USER_PASSWORD="sua-senha"
```

## ✅ Resultado Esperado

- **OK**: Teste passou
- **FALHA**: Problema detectado
- **NÃO APLICÁVEL**: Teste pulado (sem contexto)

## 📈 Relatório Final

O relatório mostra taxa de sucesso e lista todos os itens com falha para correção.
