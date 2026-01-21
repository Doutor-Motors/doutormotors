# 🔗 MATRIZ DE DEPENDÊNCIAS DO SISTEMA - DOUTOR MOTORS

> **Versão:** 1.0  
> **Última atualização:** Janeiro 2026  
> **Objetivo:** Visão centralizada do funcionamento interno do sistema

---

## 📊 SUMÁRIO EXECUTIVO

| Categoria | Total | Críticos | Secundários |
|-----------|-------|----------|-------------|
| Páginas | 52 | 18 | 34 |
| Componentes | 89+ | 23 | 66+ |
| Hooks | 27 | 12 | 15 |
| Serviços | 15 | 7 | 8 |
| Edge Functions | 25 | 11 | 14 |
| Tabelas | 25+ | 15 | 10+ |

---

## 🗺️ 1. MAPA DE FLUXOS DE PÁGINAS

### 1.1 Fluxo de Aquisição (Público → Usuário)

```
┌─────────────┐     ┌──────────┐     ┌─────────────┐     ┌─────────────────────┐
│ LandingPage │────▶│ SignUp   │────▶│ SelectPlan  │────▶│ SubscriptionCheckout│
│     (/)     │     │ (/signup)│     │(/select-plan)│    │ (/subscription-     │
└─────────────┘     └──────────┘     └─────────────┘     │   checkout)         │
       │                                                  └──────────┬──────────┘
       │                                                             │
       ▼                                                             ▼
┌─────────────┐                                          ┌───────────────────┐
│   Login     │─────────────────────────────────────────▶│    Dashboard      │
│  (/login)   │                                          │   (/dashboard)    │
└─────────────┘                                          └───────────────────┘
```

**Dependências Críticas:**
| Origem | Destino | Tipo | Serviço |
|--------|---------|------|---------|
| SignUp | SelectPlan | Navegação | useAuth |
| SelectPlan | SubscriptionCheckout | Estado (plan) | useSubscription |
| SubscriptionCheckout | Dashboard | Webhook | abacatepay-webhook |
| Login | Dashboard | Auth | useAuth + Supabase Auth |

### 1.2 Fluxo Principal (Dashboard)

```
┌───────────────────────────────────────────────────────────────────────────┐
│                           DASHBOARD (/dashboard)                          │
│  Dependências: useAuth, useSubscription, useOBDConnection, useAppStore   │
└───────────────────────────────────────────────────────────────────────────┘
          │
          ├─────────────────────────────────────────────────────┐
          │                                                     │
          ▼                                                     ▼
┌───────────────────┐                               ┌───────────────────────┐
│  VehicleManager   │◀──────────────────────────────│   DiagnosticCenter    │
│(/dashboard/vehicles)│──────────────────────────────▶│ (/dashboard/diagnostics)│
└───────────────────┘    (requer veículo ativo)     └───────────────────────┘
                                                               │
                                                               ▼
                                                    ┌───────────────────────┐
                                                    │  DiagnosticReport     │
                                                    │(/dashboard/diagnostics/:id)
                                                    └───────────────────────┘
                                                               │
                                                               ▼
                                                    ┌───────────────────────┐
                                                    │   SolutionGuide       │
                                                    │(/dashboard/solutions/:id)
                                                    └───────────────────────┘
```

### 1.3 Fluxo de Estudo/Chat Expert

```
┌─────────────────┐     ┌────────────┐     ┌──────────────┐     ┌──────────────┐
│  StudyCarPage   │────▶│ BrandsView │────▶│  ModelsView  │────▶│CategoriesView│
│(/estude-seu-carro)    └────────────┘     └──────────────┘     └──────────────┘
└─────────────────┘                                                    │
                                                                       ▼
                              ┌──────────────────┐◀────────┌──────────────────┐
                              │  ExpertChatView  │         │  ProceduresView  │
                              │    (embedded)    │◀────────│   VideoView      │
                              └──────────────────┘         └──────────────────┘
```

**Edge Functions Envolvidas:**
| Função | Propósito | Dependência |
|--------|-----------|-------------|
| carcare-api | Busca marcas/modelos/categorias | Firecrawl API |
| automotive-expert-chat | Chat com IA | Lovable AI Gateway |
| search-tutorials | Busca tutoriais | Firecrawl API |
| fetch-tutorial | Detalhes de tutorial | Firecrawl + Lovable AI |

---

## 🧩 2. MATRIZ DE COMPONENTES

### 2.1 Componentes Críticos (Alterar com Cautela)

| Componente | Usado por | Dependências | Impacto de Falha |
|------------|-----------|--------------|------------------|
| `AuthProvider` | App.tsx (root) | Supabase Auth | ❌ Sistema inacessível |
| `ProtectedRoute` | 19 rotas | useAuth | ❌ Bypass de segurança |
| `AdminProtectedRoute` | 18 rotas | useAuth + useAdmin | ❌ Acesso admin exposto |
| `DashboardLayout` | 14 páginas | useAuth, useSubscription | ❌ Navegação quebrada |
| `OBDConnector` | DiagnosticCenter | useOBDConnection | ⚠️ Diagnósticos offline |
| `PaymentGuard` | Checkout pages | useAuth, useSubscription | ❌ Checkout quebrado |

### 2.2 Componentes Reutilizáveis

```
src/components/
├── ui/                     # 50+ componentes shadcn (críticos)
│   ├── button.tsx         
│   ├── card.tsx           
│   └── ...                
├── layout/                 # Estrutura de página
│   ├── Header.tsx         ← Usado por: páginas públicas
│   ├── Footer.tsx         ← Usado por: todas as páginas
│   └── FloatingMenuButton ← Mobile navigation
├── subscription/           # Sistema de pagamento
│   ├── PlanCard.tsx       ← SelectPlanPage, UpgradePage
│   ├── PixCheckoutModal   ← SubscriptionCheckoutPage
│   ├── UpgradePrompt      ← Dashboard, FeatureGate
│   └── FeatureGate        ← Controle PRO features
├── obd/                    # Conexão OBD2
│   ├── OBDConnector       ← DiagnosticCenter
│   ├── useOBDConnection   ← Hook central OBD
│   └── VehicleDataDisplay ← Leitura em tempo real
└── studycar/               # Fluxo de estudo
    ├── ExpertChatView     ← StudyCarPage
    ├── BrandsView         ← Navegação inicial
    └── hooks/             
        └── useExpertChat  ← Streaming de respostas
```

### 2.3 Dependências Cruzadas de Componentes

```
                    ┌─────────────────────┐
                    │     useAuth         │
                    │   (CRÍTICO)         │
                    └─────────┬───────────┘
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
          ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ ProtectedRoute  │ │  useSubscription │ │    useAdmin    │
└────────┬────────┘ └────────┬────────┘ └────────┬────────┘
         │                   │                   │
         ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ DashboardLayout │ │  FeatureGate    │ │AdminProtected   │
│                 │ │  ProFeatureGate │ │     Route       │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

---

## 🪝 3. MATRIZ DE HOOKS

### 3.1 Hooks por Categoria

| Categoria | Hook | Dependências | Páginas que Usam |
|-----------|------|--------------|------------------|
| **AUTH** | `useAuth` | Supabase Auth | Todas protegidas |
| | `useAdmin` | useAuth, profiles.role | Admin pages |
| | `useLegalConsent` | localStorage | Dashboard |
| **SUBSCRIPTION** | `useSubscription` | useAuth, user_subscriptions | Dashboard, Gates |
| | `useUserTier` | useSubscription, useAdmin | FeatureGate |
| | `useUsageTracking` | useAuth, usage_tracking | Dashboard |
| **OBD** | `useOBDConnection` | Bluetooth/WiFi APIs | DiagnosticCenter |
| | `useOBDSettings` | localStorage | OBDSettingsPage |
| | `useMileageSync` | useAuth, vehicles | useOBDConnection |
| **MANUTENÇÃO** | `useMaintenanceReminders` | useAuth, vehicles | Dashboard |
| | `useCalendarIntegration` | maintenance_reminders | MaintenancePage |
| **NOTIFICAÇÕES** | `useNotifications` | Context API | Global |
| | `usePushNotifications` | Web Push API | Profile |
| | `useAdminNotifications` | admin_notifications | Admin |
| **DADOS** | `useDataRecording` | OBD connection | DataRecordingPage |
| | `useCodingHistory` | coding_executions | CodingHistoryPage |
| | `useChartPreferences` | localStorage | Dashboard |
| **SISTEMA** | `useSystemStatus` | Múltiplas tabelas | ImplementationGuide |
| | `useRealtimeSubscription` | Supabase Realtime | AdminDashboard |
| | `usePlatformDetection` | navigator | OBD pages |

### 3.2 Grafo de Dependências de Hooks

```
useAuth ─────────────────────────────────────────────────────────────┐
    │                                                                │
    ├──▶ useAdmin ──▶ useUserTier ──▶ ProFeatureGate                │
    │                                                                │
    ├──▶ useSubscription ──┬──▶ FeatureGate                         │
    │                      └──▶ PaymentGuard                        │
    │                                                                │
    ├──▶ useMaintenanceReminders ──▶ MaintenanceManagerPage         │
    │                                                                │
    ├──▶ useCodingHistory ──▶ CodingHistoryPage                     │
    │                                                                │
    └──▶ useUsageTracking ──▶ UsageDisplay ──▶ Dashboard            │
                                                                     │
useOBDConnection ──┬──▶ useMileageSync ──▶ useMaintenanceReminders  │
                   └──▶ useDataRecording ──▶ DataRecordingPage      │
```

---

## ⚙️ 4. MATRIZ DE SERVIÇOS

### 4.1 Serviços Backend (Edge Functions)

| Serviço | Endpoint | Dependências Externas | Tabelas | Criticidade |
|---------|----------|----------------------|---------|-------------|
| **diagnose** | `/diagnose` | Lovable AI Gateway | diagnostics, diagnostic_items | 🔴 CRÍTICO |
| **automotive-expert-chat** | `/automotive-expert-chat` | Lovable AI, Firecrawl | expert_conversations, expert_messages | 🔴 CRÍTICO |
| **create-pix-qrcode** | `/create-pix-qrcode` | AbacatePay API | checkout_sessions, payments | 🔴 CRÍTICO |
| **abacatepay-webhook** | `/abacatepay-webhook` | - | payments, user_subscriptions | 🔴 CRÍTICO |
| **carcare-api** | `/carcare-api` | Firecrawl API | carcare_procedure_cache | 🟡 ALTO |
| **fetch-solution** | `/fetch-solution` | Firecrawl, Lovable AI | solution_cache | 🟡 ALTO |
| **fetch-tutorial** | `/fetch-tutorial` | Firecrawl, Lovable AI | tutorial_cache | 🟡 ALTO |
| **search-tutorials** | `/search-tutorials` | Firecrawl | - | 🟡 ALTO |
| **semantic-tutorial-search** | `/semantic-tutorial-search` | Lovable AI | tutorial_cache | 🟢 MÉDIO |
| **send-notification** | `/send-notification` | - | user_notification_preferences | 🟢 MÉDIO |
| **send-system-alert** | `/send-system-alert` | - | system_alerts | 🟢 MÉDIO |
| **check-maintenance-reminders** | CRON | - | maintenance_reminders, vehicles | 🟢 MÉDIO |
| **check-subscription-renewal** | CRON | - | user_subscriptions | 🟡 ALTO |
| **cleanup-old-data** | CRON | - | Múltiplas | 🟢 MÉDIO |
| **delete-user** | `/delete-user` | Supabase Admin | profiles, auth.users | 🔴 CRÍTICO |

### 4.2 Serviços Frontend

```
src/services/
├── diagnostics/
│   ├── engine.ts          # Análise DTC → Edge: diagnose
│   └── dtcDatabase.ts     # Fallback local de códigos DTC
│
├── obd/
│   ├── OBDConnectionManager.ts  # Singleton conexão OBD
│   ├── elm327Protocol.ts        # Comandos ELM327
│   └── codingFunctions.ts       # Funções de codificação
│
├── solutions/
│   ├── api.ts             # Busca soluções → Edge: fetch-solution
│   ├── cache.ts           # Cache local de soluções
│   ├── glossary.ts        # Termos técnicos
│   └── recommender.ts     # Recomendação de soluções
│
├── carcare/
│   └── api.ts             # API CarCare → Edge: carcare-api
│
├── cache/
│   └── statistics.ts      # Estatísticas de cache
│
├── pdf/
│   ├── pdfBaseGenerator.ts        # Base para todos PDFs
│   ├── diagnosticReportGenerator  # Relatório diagnóstico
│   ├── maintenanceReportGenerator # Relatório manutenção
│   ├── adminReportGenerator       # Relatório admin
│   └── expertConversationPDF...   # Export chat
│
└── dataRecording/
    └── export.ts          # Export CSV/JSON de gravações
```

---

## 🗄️ 5. MATRIZ DE DADOS (SUPABASE)

### 5.1 Tabelas por Domínio

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              AUTENTICAÇÃO                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│  auth.users (Supabase)  ◀───────  profiles (public)                         │
│       │                              │                                       │
│       │                              ├──▶ user_subscriptions                 │
│       │                              ├──▶ usage_tracking                     │
│       │                              └──▶ user_notification_preferences      │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              VEÍCULOS                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│  profiles ───▶ vehicles ───┬──▶ diagnostics ───▶ diagnostic_items           │
│                            ├──▶ maintenance_reminders                        │
│                            └──▶ data_recordings                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              PAGAMENTOS                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│  profiles ───▶ checkout_sessions ───▶ payments ───▶ user_subscriptions      │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              SUPORTE                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│  profiles ───▶ support_tickets ───▶ ticket_messages                         │
│                                                                              │
│  admin_notifications (para admins)                                           │
│  system_alerts (alertas globais)                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              CACHE                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│  carcare_procedure_cache    # Procedimentos CarCare                          │
│  video_transcription_cache  # Transcrições de vídeo                          │
│  tutorial_cache             # Tutoriais processados                          │
│  solution_cache             # Soluções geradas por IA                        │
│  cache_statistics           # Métricas de cache                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              EXPERT CHAT                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  profiles ───▶ expert_conversations ───▶ expert_messages                    │
│                      └──▶ favorite_questions                                 │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              OBD CODING                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│  profiles ───▶ coding_executions (histórico de codificações)                │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              SEGURANÇA/ADMIN                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│  blocked_ips              # IPs bloqueados                                   │
│  contact_submissions      # Formulários de contato                           │
│  kpi_targets              # Metas de KPI                                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Relacionamentos Críticos

| Tabela Pai | Tabela Filha | FK | ON DELETE |
|------------|--------------|-----|-----------|
| auth.users | profiles | user_id | CASCADE |
| profiles | vehicles | user_id | CASCADE |
| profiles | user_subscriptions | user_id | CASCADE |
| vehicles | diagnostics | vehicle_id | CASCADE |
| diagnostics | diagnostic_items | diagnostic_id | CASCADE |
| vehicles | maintenance_reminders | vehicle_id | CASCADE |
| profiles | support_tickets | user_id | SET NULL |
| support_tickets | ticket_messages | ticket_id | CASCADE |
| profiles | expert_conversations | user_id | CASCADE |
| expert_conversations | expert_messages | conversation_id | CASCADE |
| profiles | checkout_sessions | user_id | CASCADE |
| checkout_sessions | payments | session_id | SET NULL |

---

## 🔐 6. MATRIZ DE SEGURANÇA E RLS

### 6.1 Políticas por Tabela

| Tabela | SELECT | INSERT | UPDATE | DELETE |
|--------|--------|--------|--------|--------|
| profiles | own + admin | trigger | own + admin | admin |
| vehicles | own + admin | own | own | own |
| diagnostics | own + admin | own | own | own |
| user_subscriptions | own + admin | service_role | service_role | admin |
| payments | own + admin | service_role | service_role | - |
| support_tickets | own + admin | own | own + admin | admin |
| expert_conversations | own | own | own | own |
| admin_notifications | admin | admin | admin | admin |

### 6.2 Funções de Verificação

| Função | Propósito | Usada Por |
|--------|-----------|-----------|
| `has_role(role)` | Verifica role do usuário | RLS policies |
| `is_admin()` | Atalho para has_role('admin') | Admin routes |
| `auth.uid()` | ID do usuário atual | Todas policies |

---

## 📋 7. CHECKLIST DE IMPACTO

### Antes de Alterar...

#### useAuth ou AuthProvider
- [ ] Testar login/logout
- [ ] Verificar todas as rotas protegidas
- [ ] Testar fluxo de signup → checkout
- [ ] Verificar sessão persistida

#### useSubscription
- [ ] Testar FeatureGate em todas features PRO
- [ ] Verificar badges (Basic, Pro, Admin)
- [ ] Testar upgrade/downgrade
- [ ] Verificar paywall em rotas bloqueadas

#### useOBDConnection
- [ ] Testar conexão Bluetooth
- [ ] Testar conexão WiFi
- [ ] Verificar leitura de DTC codes
- [ ] Testar em plataformas nativas

#### Edge Functions de Pagamento
- [ ] Testar criação de QR Code PIX
- [ ] Simular webhook de confirmação
- [ ] Verificar atualização de subscription
- [ ] Testar cenários de falha

#### Tabelas Core (profiles, vehicles, diagnostics)
- [ ] Verificar RLS policies
- [ ] Testar cascading deletes
- [ ] Validar integridade referencial
- [ ] Backup antes de migrations

---

## 🚀 8. COMANDOS ÚTEIS

```bash
# Verificar dependências de um arquivo
grep -r "from.*ComponentName" src/

# Encontrar uso de um hook
grep -r "useHookName" src/ --include="*.tsx"

# Verificar chamadas a tabela específica
grep -r "supabase.from('table_name')" src/

# Listar Edge Functions
ls supabase/functions/

# Verificar imports de um serviço
grep -r "from.*@/services/serviceName" src/
```

---

## 📊 DIAGRAMA VISUAL COMPLETO

```
                              ┌─────────────────────┐
                              │     LANDING (/)     │
                              └──────────┬──────────┘
                                         │
                    ┌────────────────────┼────────────────────┐
                    │                    │                    │
                    ▼                    ▼                    ▼
           ┌───────────────┐    ┌───────────────┐    ┌───────────────┐
           │    LOGIN      │    │    SIGNUP     │    │  PUBLIC PAGES │
           │   (/login)    │    │   (/signup)   │    │  (sobre, etc) │
           └───────┬───────┘    └───────┬───────┘    └───────────────┘
                   │                    │
                   │                    ▼
                   │           ┌───────────────────┐
                   │           │   SELECT PLAN     │
                   │           │  (/select-plan)   │
                   │           └────────┬──────────┘
                   │                    │
                   │                    ▼
                   │           ┌───────────────────┐
                   │           │    CHECKOUT       │
                   │           │ (/subscription-   │
                   │           │    checkout)      │
                   │           └────────┬──────────┘
                   │                    │
                   └────────────────────┼────────────────────────────────────┐
                                        │                                    │
                                        ▼                                    ▼
                        ┌───────────────────────────────┐       ┌───────────────────┐
                        │        DASHBOARD              │       │      ADMIN        │
                        │      (/dashboard)             │       │     (/admin)      │
                        └───────────────┬───────────────┘       └───────────────────┘
                                        │
        ┌───────────────┬───────────────┼───────────────┬───────────────┐
        │               │               │               │               │
        ▼               ▼               ▼               ▼               ▼
   ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
   │Vehicles │    │Diagnos- │    │ Study   │    │Mainten- │    │ Support │
   │ Manager │    │  tics   │    │  Car    │    │  ance   │    │ Center  │
   └────┬────┘    └────┬────┘    └────┬────┘    └─────────┘    └─────────┘
        │              │              │
        │              ▼              ▼
        │       ┌─────────────┐ ┌─────────────┐
        │       │  Report     │ │ Expert Chat │
        │       └─────┬───────┘ └─────────────┘
        │             │
        │             ▼
        │       ┌─────────────┐
        └──────▶│  Solution   │
                │   Guide     │
                └─────────────┘
```

---

**Documento gerado automaticamente para suporte a decisões de arquitetura.**
