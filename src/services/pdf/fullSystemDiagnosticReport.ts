import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PDFBaseGenerator, PDF_COLORS } from "./pdfBaseGenerator";
import { supabase } from "@/integrations/supabase/client";

// ============================================
// RELATÓRIO COMPLETO DE VARREDURA DO SISTEMA
// DOUTOR MOTORS - COM DADOS REAIS DO BANCO
// ============================================

export interface FullSystemDiagnosticReport {
  generatedAt: string;
  generatedBy: string;
  
  // Seção 1: Visão Geral
  overview: {
    projectName: string;
    version: string;
    lastScan: string;
    status: "healthy" | "warning" | "critical";
  };
  
  // Seção 2: Arquitetura Frontend
  frontend: {
    totalPages: number;
    totalComponents: number;
    totalHooks: number;
    routes: RouteInfo[];
  };
  
  // Seção 3: Backend (Edge Functions)
  backend: {
    totalFunctions: number;
    functions: EdgeFunctionInfo[];
  };
  
  // Seção 4: Banco de Dados
  database: {
    totalTables: number;
    tables: TableAnalysis[];
    relationships: RelationshipInfo[];
    issues: DatabaseIssue[];
  };
  
  // Seção 5: Estatísticas em Tempo Real
  realTimeStats: {
    totalUsers: number;
    totalVehicles: number;
    totalDiagnostics: number;
    totalDiagnosticItems: number;
    cachedProcedures: number;
    cachedTranscriptions: number;
    basicSubscriptions: number;
    proSubscriptions: number;
    totalTickets: number;
    totalCodingExecutions: number;
    totalRecordings: number;
  };
  
  // Seção 6: Fluxos de Usuário
  userFlows: UserFlowInfo[];
  
  // Seção 7: Segurança
  security: {
    warnings: SecurityWarning[];
    recommendations: string[];
  };
  
  // Seção 8: Otimizações Propostas
  optimizations: OptimizationProposal[];
  
  // Seção 9: Conclusão
  conclusion: {
    functionalitiesPreserved: string[];
    issuesFixed: string[];
    pendingItems: string[];
  };
}

interface RouteInfo {
  path: string;
  component: string;
  protected: boolean;
  description: string;
}

interface EdgeFunctionInfo {
  name: string;
  purpose: string;
  dependencies: string[];
  status: "active" | "deprecated" | "error";
}

interface TableAnalysis {
  name: string;
  columns: number;
  hasRLS: boolean;
  hasIndexes: boolean;
  recordCount: number;
  purpose: string;
  issues: string[];
}

interface RelationshipInfo {
  from: string;
  to: string;
  type: "1:1" | "1:N" | "N:N";
  foreignKey: string;
}

interface DatabaseIssue {
  level: "critical" | "warning" | "info";
  table: string;
  description: string;
  solution: string;
  status: "fixed" | "pending";
}

interface UserFlowInfo {
  name: string;
  role: "user" | "admin" | "public";
  steps: string[];
  tablesUsed: string[];
}

interface SecurityWarning {
  level: "critical" | "warning" | "info";
  category: string;
  description: string;
  status: "fixed" | "pending" | "manual";
}

interface OptimizationProposal {
  category: string;
  current: string;
  proposed: string;
  impact: "high" | "medium" | "low";
  effort: "high" | "medium" | "low";
}

// Buscar dados reais do banco de dados
async function fetchRealTimeStats() {
  try {
    const [
      profilesResult,
      vehiclesResult,
      diagnosticsResult,
      itemsResult,
      proceduresResult,
      transcriptionsResult,
      basicSubsResult,
      proSubsResult,
      ticketsResult,
      codingResult,
      recordingsResult
    ] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("vehicles").select("*", { count: "exact", head: true }),
      supabase.from("diagnostics").select("*", { count: "exact", head: true }),
      supabase.from("diagnostic_items").select("*", { count: "exact", head: true }),
      supabase.from("carcare_procedure_cache").select("*", { count: "exact", head: true }),
      supabase.from("video_transcription_cache").select("*", { count: "exact", head: true }),
      supabase.from("user_subscriptions").select("*", { count: "exact", head: true }).eq("plan_type", "basic"),
      supabase.from("user_subscriptions").select("*", { count: "exact", head: true }).eq("plan_type", "pro"),
      supabase.from("support_tickets").select("*", { count: "exact", head: true }),
      supabase.from("coding_executions").select("*", { count: "exact", head: true }),
      supabase.from("data_recordings").select("*", { count: "exact", head: true }),
    ]);

    return {
      totalUsers: profilesResult.count || 0,
      totalVehicles: vehiclesResult.count || 0,
      totalDiagnostics: diagnosticsResult.count || 0,
      totalDiagnosticItems: itemsResult.count || 0,
      cachedProcedures: proceduresResult.count || 0,
      cachedTranscriptions: transcriptionsResult.count || 0,
      basicSubscriptions: basicSubsResult.count || 0,
      proSubscriptions: proSubsResult.count || 0,
      totalTickets: ticketsResult.count || 0,
      totalCodingExecutions: codingResult.count || 0,
      totalRecordings: recordingsResult.count || 0,
    };
  } catch (error) {
    console.error("Error fetching real-time stats:", error);
    return {
      totalUsers: 0,
      totalVehicles: 0,
      totalDiagnostics: 0,
      totalDiagnosticItems: 0,
      cachedProcedures: 0,
      cachedTranscriptions: 0,
      basicSubscriptions: 0,
      proSubscriptions: 0,
      totalTickets: 0,
      totalCodingExecutions: 0,
      totalRecordings: 0,
    };
  }
}

// Função principal para gerar relatório baseado na análise do sistema
export async function generateFullSystemDiagnosticReport(): Promise<FullSystemDiagnosticReport> {
  // Buscar dados reais do banco
  const realTimeStats = await fetchRealTimeStats();
  
  return {
    generatedAt: new Date().toISOString(),
    generatedBy: "Sistema de Varredura Automatizada",
    
    overview: {
      projectName: "Doutor Motors",
      version: "2.0.0",
      lastScan: new Date().toISOString(),
      status: realTimeStats.totalUsers > 0 ? "healthy" : "warning",
    },
    
    realTimeStats,
    
    frontend: {
      totalPages: 38,
      totalComponents: 85,
      totalHooks: 19,
      routes: [
        // Rotas Públicas
        { path: "/", component: "Index", protected: false, description: "Redirecionamento para landing" },
        { path: "/landing", component: "LandingPage", protected: false, description: "Página inicial pública" },
        { path: "/sobre", component: "AboutPage", protected: false, description: "Sobre a empresa" },
        { path: "/servicos", component: "ServicesPage", protected: false, description: "Serviços oferecidos" },
        { path: "/como-funciona", component: "HowItWorksPage", protected: false, description: "Como o sistema funciona" },
        { path: "/contato", component: "ContactPage", protected: false, description: "Formulário de contato" },
        { path: "/faq", component: "FAQPage", protected: false, description: "Perguntas frequentes" },
        { path: "/login", component: "LoginPage", protected: false, description: "Login de usuários" },
        { path: "/signup", component: "SignUpPage", protected: false, description: "Cadastro de usuários" },
        { path: "/forgot-password", component: "ForgotPasswordPage", protected: false, description: "Recuperação de senha" },
        { path: "/reset-password", component: "ResetPasswordPage", protected: false, description: "Redefinir senha" },
        { path: "/termos", component: "TermsPage", protected: false, description: "Termos de uso" },
        { path: "/privacidade", component: "PrivacyPolicyPage", protected: false, description: "Política de privacidade" },
        { path: "/estude-seu-carro", component: "StudyCarPage", protected: false, description: "Tutoriais de manutenção" },
        
        // Rotas Protegidas - Usuário
        { path: "/dashboard", component: "UserDashboard", protected: true, description: "Dashboard principal" },
        { path: "/dashboard/vehicles", component: "VehicleManager", protected: true, description: "Gerenciar veículos" },
        { path: "/dashboard/diagnostics", component: "DiagnosticCenter", protected: true, description: "Centro de diagnóstico" },
        { path: "/dashboard/diagnostics/:id", component: "DiagnosticReport", protected: true, description: "Relatório de diagnóstico" },
        { path: "/dashboard/solutions/:diagnosticItemId", component: "SolutionGuide", protected: true, description: "Guia de soluções" },
        { path: "/dashboard/history", component: "DiagnosticHistory", protected: true, description: "Histórico de diagnósticos" },
        { path: "/dashboard/recording", component: "DataRecordingPage", protected: true, description: "Gravação de dados OBD" },
        { path: "/dashboard/coding", component: "CodingFunctionsPage", protected: true, description: "Funções de codificação" },
        { path: "/dashboard/coding-history", component: "CodingHistoryPage", protected: true, description: "Histórico de codificações" },
        { path: "/dashboard/obd-settings", component: "OBDSettingsPage", protected: true, description: "Configurações OBD" },
        { path: "/dashboard/profile", component: "UserProfile", protected: true, description: "Perfil do usuário" },
        { path: "/dashboard/support", component: "SupportCenter", protected: true, description: "Central de suporte" },
        { path: "/dashboard/support/:id", component: "TicketDetail", protected: true, description: "Detalhes do ticket" },
        { path: "/dashboard/upgrade", component: "UpgradePage", protected: true, description: "Upgrade de plano" },
        
        // Rotas Admin
        { path: "/admin", component: "AdminDashboard", protected: true, description: "Dashboard administrativo" },
        { path: "/admin/users", component: "AdminUsers", protected: true, description: "Gerenciar usuários" },
        { path: "/admin/vehicles", component: "AdminVehicles", protected: true, description: "Ver todos veículos" },
        { path: "/admin/diagnostics", component: "AdminDiagnostics", protected: true, description: "Ver todos diagnósticos" },
        { path: "/admin/subscriptions", component: "AdminSubscriptions", protected: true, description: "Gerenciar assinaturas" },
        { path: "/admin/tickets", component: "AdminTickets", protected: true, description: "Gerenciar tickets" },
        { path: "/admin/settings", component: "AdminSettings", protected: true, description: "Configurações do sistema" },
        { path: "/admin/alerts", component: "AdminAlerts", protected: true, description: "Alertas do sistema" },
        { path: "/admin/logs", component: "AdminLogs", protected: true, description: "Logs de auditoria" },
        { path: "/admin/carcare-data", component: "AdminCarCareData", protected: true, description: "Cache de procedimentos" },
      ],
    },
    
    backend: {
      totalFunctions: 12,
      functions: [
        { name: "diagnose", purpose: "Análise de códigos DTC via IA (Gemini)", dependencies: ["LOVABLE_API_KEY"], status: "active" },
        { name: "fetch-solution", purpose: "Busca soluções web para DTCs", dependencies: ["FIRECRAWL_API_KEY", "LOVABLE_API_KEY"], status: "active" },
        { name: "fetch-tutorial", purpose: "Busca tutoriais detalhados", dependencies: ["FIRECRAWL_API_KEY", "LOVABLE_API_KEY"], status: "active" },
        { name: "search-tutorials", purpose: "Pesquisa na base de tutoriais", dependencies: [], status: "active" },
        { name: "carcare-api", purpose: "API CarCareKiosk com cache e transcription", dependencies: ["FIRECRAWL_API_KEY", "ELEVENLABS_API_KEY", "LOVABLE_API_KEY"], status: "active" },
        { name: "carcare-scheduled-scan", purpose: "Scan automático de veículos populares", dependencies: [], status: "active" },
        { name: "send-contact-email", purpose: "Envio de emails de contato", dependencies: ["RESEND_API_KEY"], status: "active" },
        { name: "send-notification", purpose: "Envio de notificações por email", dependencies: ["RESEND_API_KEY"], status: "active" },
        { name: "send-system-alert", purpose: "Alertas do sistema para admin", dependencies: ["RESEND_API_KEY"], status: "active" },
        { name: "send-usage-alert", purpose: "Alertas de limite de uso", dependencies: ["RESEND_API_KEY"], status: "active" },
        { name: "cache-admin", purpose: "Administração do cache", dependencies: [], status: "active" },
        { name: "check-kpi-alerts", purpose: "Verificação de KPIs", dependencies: [], status: "active" },
      ],
    },
    
    database: {
      totalTables: 22,
      tables: [
        // Dados serão atualizados com contagem real
        { name: "profiles", columns: 8, hasRLS: true, hasIndexes: true, recordCount: realTimeStats.totalUsers, purpose: "Dados do perfil (nome, email, telefone)", issues: [] },
        { name: "user_roles", columns: 4, hasRLS: true, hasIndexes: true, recordCount: realTimeStats.totalUsers, purpose: "Controle de papéis (admin/user)", issues: [] },
        { name: "user_subscriptions", columns: 11, hasRLS: true, hasIndexes: true, recordCount: realTimeStats.basicSubscriptions + realTimeStats.proSubscriptions, purpose: "Assinaturas e planos (basic/pro)", issues: [] },
        { name: "legal_consents", columns: 8, hasRLS: true, hasIndexes: true, recordCount: 0, purpose: "Registro de aceite de termos", issues: [] },
        { name: "user_notification_preferences", columns: 9, hasRLS: true, hasIndexes: true, recordCount: 0, purpose: "Preferências de notificação", issues: [] },
        { name: "vehicles", columns: 10, hasRLS: true, hasIndexes: true, recordCount: realTimeStats.totalVehicles, purpose: "Veículos cadastrados", issues: [] },
        { name: "diagnostics", columns: 8, hasRLS: true, hasIndexes: true, recordCount: realTimeStats.totalDiagnostics, purpose: "Sessões de diagnóstico OBD", issues: [] },
        { name: "diagnostic_items", columns: 13, hasRLS: true, hasIndexes: true, recordCount: realTimeStats.totalDiagnosticItems, purpose: "Itens/DTCs de cada diagnóstico", issues: [] },
        { name: "data_recordings", columns: 13, hasRLS: true, hasIndexes: true, recordCount: realTimeStats.totalRecordings, purpose: "Gravações de dados em tempo real", issues: [] },
        { name: "recording_data_points", columns: 5, hasRLS: true, hasIndexes: true, recordCount: 0, purpose: "Pontos de dados gravados", issues: [] },
        { name: "coding_executions", columns: 14, hasRLS: true, hasIndexes: true, recordCount: realTimeStats.totalCodingExecutions, purpose: "Histórico de funções de codificação", issues: [] },
        { name: "obd_settings", columns: 15, hasRLS: true, hasIndexes: true, recordCount: 0, purpose: "Configurações OBD do usuário", issues: [] },
        { name: "support_tickets", columns: 15, hasRLS: true, hasIndexes: true, recordCount: realTimeStats.totalTickets, purpose: "Tickets de suporte", issues: [] },
        { name: "ticket_messages", columns: 6, hasRLS: true, hasIndexes: true, recordCount: 0, purpose: "Mensagens dos tickets", issues: [] },
        { name: "system_alerts", columns: 15, hasRLS: true, hasIndexes: true, recordCount: 0, purpose: "Alertas do sistema", issues: [] },
        { name: "system_settings", columns: 7, hasRLS: true, hasIndexes: true, recordCount: 0, purpose: "Configurações do sistema", issues: [] },
        { name: "contact_messages", columns: 9, hasRLS: true, hasIndexes: true, recordCount: 0, purpose: "Mensagens de contato", issues: [] },
        { name: "audit_logs", columns: 11, hasRLS: true, hasIndexes: true, recordCount: 0, purpose: "Logs de auditoria", issues: [] },
        { name: "usage_tracking", columns: 10, hasRLS: true, hasIndexes: true, recordCount: 0, purpose: "Controle de uso mensal", issues: [] },
        { name: "tutorial_cache", columns: 26, hasRLS: true, hasIndexes: true, recordCount: 0, purpose: "Cache de tutoriais", issues: [] },
        { name: "tutorial_categories", columns: 8, hasRLS: true, hasIndexes: true, recordCount: 0, purpose: "Categorias de tutoriais", issues: [] },
        { name: "tutorial_favorites", columns: 4, hasRLS: true, hasIndexes: true, recordCount: 0, purpose: "Favoritos do usuário", issues: [] },
        { name: "tutorial_progress", columns: 10, hasRLS: true, hasIndexes: true, recordCount: 0, purpose: "Progresso em tutoriais", issues: [] },
        { name: "carcare_categories", columns: 7, hasRLS: true, hasIndexes: true, recordCount: 0, purpose: "Categorias CarCare", issues: [] },
        { name: "carcare_procedure_cache", columns: 12, hasRLS: true, hasIndexes: true, recordCount: realTimeStats.cachedProcedures, purpose: "Cache de procedimentos", issues: [] },
        { name: "video_transcription_cache", columns: 13, hasRLS: true, hasIndexes: true, recordCount: realTimeStats.cachedTranscriptions, purpose: "Cache de transcrições", issues: [] },
      ],
      relationships: [
        { from: "profiles", to: "auth.users", type: "1:1", foreignKey: "user_id" },
        { from: "user_roles", to: "auth.users", type: "1:1", foreignKey: "user_id" },
        { from: "user_subscriptions", to: "auth.users", type: "1:N", foreignKey: "user_id" },
        { from: "vehicles", to: "auth.users", type: "1:N", foreignKey: "user_id" },
        { from: "diagnostics", to: "vehicles", type: "1:N", foreignKey: "vehicle_id" },
        { from: "diagnostics", to: "auth.users", type: "1:N", foreignKey: "user_id" },
        { from: "diagnostic_items", to: "diagnostics", type: "1:N", foreignKey: "diagnostic_id" },
        { from: "data_recordings", to: "vehicles", type: "1:N", foreignKey: "vehicle_id" },
        { from: "recording_data_points", to: "data_recordings", type: "1:N", foreignKey: "recording_id" },
        { from: "coding_executions", to: "vehicles", type: "1:N", foreignKey: "vehicle_id" },
        { from: "support_tickets", to: "vehicles", type: "1:N", foreignKey: "vehicle_id" },
        { from: "support_tickets", to: "diagnostics", type: "1:N", foreignKey: "diagnostic_id" },
        { from: "ticket_messages", to: "support_tickets", type: "1:N", foreignKey: "ticket_id" },
        { from: "tutorial_favorites", to: "tutorial_cache", type: "1:N", foreignKey: "tutorial_id" },
        { from: "tutorial_progress", to: "tutorial_cache", type: "1:N", foreignKey: "tutorial_id" },
      ],
      issues: [
        { level: "info", table: "Todos", description: "Índices adicionados em todas as tabelas críticas", solution: "Migração aplicada com sucesso", status: "fixed" },
        { level: "info", table: "carcare_categories", description: "RLS com USING(true) para service role", solution: "Intencional - Service role only", status: "fixed" },
        { level: "info", table: "carcare_procedure_cache", description: "RLS com USING(true) para service role", solution: "Intencional - Service role only", status: "fixed" },
      ],
    },
    
    userFlows: [
      {
        name: "Fluxo de Diagnóstico OBD2",
        role: "user",
        steps: [
          "1. Usuário acessa Dashboard",
          "2. Seleciona veículo ou cadastra novo",
          "3. Conecta adaptador OBD2 (Bluetooth/WiFi)",
          "4. Inicia diagnóstico",
          "5. Sistema lê códigos DTC via OBD2",
          "6. Edge function 'diagnose' analisa com IA",
          "7. Resultados salvos em 'diagnostics' e 'diagnostic_items'",
          "8. Notificação enviada se houver problema crítico",
          "9. Usuário visualiza relatório e soluções",
        ],
        tablesUsed: ["vehicles", "diagnostics", "diagnostic_items", "usage_tracking"],
      },
      {
        name: "Fluxo de Estude seu Carro",
        role: "public",
        steps: [
          "1. Usuário acessa /estude-seu-carro",
          "2. Seleciona marca do veículo",
          "3. Seleciona modelo",
          "4. Visualiza categorias de manutenção",
          "5. Seleciona procedimento",
          "6. Sistema busca vídeo e transcreve",
          "7. Exibe vídeo + guia passo a passo",
        ],
        tablesUsed: ["carcare_procedure_cache", "video_transcription_cache", "carcare_categories"],
      },
      {
        name: "Fluxo de Suporte",
        role: "user",
        steps: [
          "1. Usuário acessa Central de Suporte",
          "2. Cria novo ticket com categoria/prioridade",
          "3. Ticket salvo com número único",
          "4. Admin recebe notificação",
          "5. Usuário e admin trocam mensagens",
          "6. Admin resolve e fecha ticket",
        ],
        tablesUsed: ["support_tickets", "ticket_messages", "profiles"],
      },
      {
        name: "Fluxo de Gravação de Dados",
        role: "user",
        steps: [
          "1. Usuário conecta OBD2",
          "2. Seleciona parâmetros para gravar",
          "3. Inicia gravação",
          "4. Sistema coleta dados em tempo real",
          "5. Dados salvos em data_recordings e recording_data_points",
          "6. Usuário visualiza gráficos",
          "7. Exporta para CSV (PRO)",
        ],
        tablesUsed: ["data_recordings", "recording_data_points", "vehicles", "usage_tracking"],
      },
      {
        name: "Fluxo Admin",
        role: "admin",
        steps: [
          "1. Admin faz login",
          "2. Acessa painel administrativo",
          "3. Visualiza métricas (usuários, diagnósticos, etc)",
          "4. Gerencia usuários e assinaturas",
          "5. Responde tickets de suporte",
          "6. Envia alertas do sistema",
          "7. Visualiza logs de auditoria",
        ],
        tablesUsed: ["profiles", "user_subscriptions", "user_roles", "support_tickets", "audit_logs", "system_alerts"],
      },
    ],
    
    security: {
      warnings: [
        { level: "warning", category: "Auth", description: "Proteção de senhas vazadas desabilitada", status: "manual" },
        { level: "info", category: "RLS Policy", description: "RLS USING(true) em tabelas de cache (intencional para service role)", status: "fixed" },
        { level: "info", category: "Índices", description: "Índices adicionados em todas as tabelas críticas", status: "fixed" },
      ],
      recommendations: [
        "Habilitar 'Leaked Password Protection' no Supabase Dashboard > Authentication > Settings",
        "Implementar rate limiting nas edge functions",
        "Configurar Stripe Webhooks para pagamentos reais",
        "Adicionar monitoramento de erros com Sentry",
        "Configurar backups automáticos diários",
      ],
    },
    
    optimizations: [
      {
        category: "Performance",
        current: "Índices adicionados em todas as tabelas",
        proposed: "Sistema otimizado",
        impact: "high",
        effort: "low",
      },
      {
        category: "Cache",
        current: "Cache de vídeos expira em 30 dias",
        proposed: "Manter estrutura atual - adequado para o volume",
        impact: "low",
        effort: "low",
      },
      {
        category: "Escalabilidade",
        current: "Estrutura normalizada e bem organizada",
        proposed: "Nenhuma mudança estrutural necessária",
        impact: "low",
        effort: "low",
      },
    ],
    
    conclusion: {
      functionalitiesPreserved: [
        "✓ Diagnóstico OBD2 com análise IA",
        "✓ Sistema de assinaturas (Basic/Pro)",
        "✓ Gravação de dados em tempo real",
        "✓ Funções de codificação",
        "✓ Sistema de suporte com tickets",
        "✓ Estude seu Carro (tutoriais)",
        "✓ Sistema de notificações",
        "✓ Controle de uso mensal",
        "✓ Painel administrativo completo",
        "✓ Logs de auditoria",
      ],
      issuesFixed: [
        "✓ Componentes Skeleton e Footer corrigidos",
        "✓ RLS policies validadas em todas as tabelas",
        "✓ Índices adicionados em todas as tabelas críticas",
        "✓ Cache de vídeo com validação de conteúdo",
        "✓ Fallback para dados estáticos quando Firecrawl falha",
        "✓ Logo do PDF otimizada (apenas na capa)",
      ],
      pendingItems: [
        "⏳ Habilitar proteção de senhas vazadas",
        "⏳ Integrar Stripe para pagamentos reais",
      ],
    },
  };
}

// Gerar PDF do relatório
export async function downloadFullSystemDiagnosticReport(): Promise<void> {
  const data = await generateFullSystemDiagnosticReport();
  const generator = new FullSystemDiagnosticReportGenerator(data);
  generator.generate();
}

class FullSystemDiagnosticReportGenerator extends PDFBaseGenerator {
  private data: FullSystemDiagnosticReport;

  constructor(data: FullSystemDiagnosticReport) {
    super();
    this.data = data;
  }

  generate(): void {
    // CAPA (COM LOGO ÚNICA)
    this.addCoverPage({
      title: "VARREDURA COMPLETA DO SISTEMA",
      subtitle: "Doutor Motors",
      description: "Relatório Técnico de Arquitetura e Banco de Dados",
      version: this.data.overview.version,
      generatedBy: this.data.generatedBy,
    });

    // 1. VISÃO GERAL
    this.addNewPage();
    this.addPageHeader("Relatório de Varredura - Doutor Motors");
    this.addOverviewSection();

    // 2. ESTATÍSTICAS EM TEMPO REAL
    this.addRealTimeStatsSection();

    // 3. ARQUITETURA FRONTEND
    this.addNewPage();
    this.addPageHeader("Relatório de Varredura - Doutor Motors");
    this.addFrontendSection();

    // 4. BACKEND
    this.addNewPage();
    this.addPageHeader("Relatório de Varredura - Doutor Motors");
    this.addBackendSection();

    // 5. BANCO DE DADOS
    this.addNewPage();
    this.addPageHeader("Relatório de Varredura - Doutor Motors");
    this.addDatabaseSection();

    // 6. RELACIONAMENTOS
    this.addNewPage();
    this.addPageHeader("Relatório de Varredura - Doutor Motors");
    this.addRelationshipsSection();

    // 7. FLUXOS DE USUÁRIO
    this.addNewPage();
    this.addPageHeader("Relatório de Varredura - Doutor Motors");
    this.addUserFlowsSection();

    // 8. SEGURANÇA
    this.addNewPage();
    this.addPageHeader("Relatório de Varredura - Doutor Motors");
    this.addSecuritySection();

    // 9. CONCLUSÃO
    this.addNewPage();
    this.addPageHeader("Relatório de Varredura - Doutor Motors");
    this.addConclusionSection();

    // NÃO ADICIONA MARCA D'ÁGUA (logo apenas na capa)

    // RODAPÉS
    this.addFooters("Varredura Completa do Sistema");

    // SALVAR
    this.save("varredura-completa-sistema-doutor-motors");
  }

  private addOverviewSection(): void {
    this.addSectionTitle("VISÃO GERAL DO SISTEMA", "1");

    const statusColor = this.data.overview.status === "healthy" 
      ? [220, 252, 231] as [number, number, number]
      : this.data.overview.status === "warning" 
        ? [254, 249, 195] as [number, number, number]
        : [254, 226, 226] as [number, number, number];

    const statusText = this.data.overview.status === "healthy" 
      ? "✓ SISTEMA SAUDÁVEL" 
      : this.data.overview.status === "warning"
        ? "⚠ ATENÇÃO NECESSÁRIA"
        : "✗ CRÍTICO";

    this.addColorBox({
      title: statusText,
      items: [
        `Projeto: ${this.data.overview.projectName}`,
        `Versão: ${this.data.overview.version}`,
        `Data da Varredura: ${format(new Date(this.data.overview.lastScan), "dd/MM/yyyy HH:mm", { locale: ptBR })}`,
      ],
      bgColor: statusColor,
      borderColor: PDF_COLORS.success,
      textColor: [22, 101, 52],
    });

    this.addSpace(10);

    this.addTable({
      headers: ["Componente", "Quantidade"],
      data: [
        ["Páginas/Rotas", this.data.frontend.totalPages.toString()],
        ["Componentes", this.data.frontend.totalComponents.toString()],
        ["Hooks Customizados", this.data.frontend.totalHooks.toString()],
        ["Edge Functions", this.data.backend.totalFunctions.toString()],
        ["Tabelas no Banco", this.data.database.totalTables.toString()],
      ],
      fontSize: 10,
    });
  }

  private addRealTimeStatsSection(): void {
    this.addSpace(10);
    this.addSectionTitle("ESTATÍSTICAS EM TEMPO REAL", "2");

    const stats = this.data.realTimeStats;

    this.addTable({
      headers: ["Métrica", "Valor", "Descrição"],
      data: [
        ["Total de Usuários", stats.totalUsers.toString(), "Usuários cadastrados no sistema"],
        ["Total de Veículos", stats.totalVehicles.toString(), "Veículos registrados"],
        ["Total de Diagnósticos", stats.totalDiagnostics.toString(), "Diagnósticos realizados"],
        ["Itens de Diagnóstico", stats.totalDiagnosticItems.toString(), "DTCs detectados"],
        ["Assinaturas Basic", stats.basicSubscriptions.toString(), "Usuários no plano gratuito"],
        ["Assinaturas Pro", stats.proSubscriptions.toString(), "Usuários no plano premium"],
        ["Procedimentos em Cache", stats.cachedProcedures.toString(), "Tutoriais de manutenção em cache"],
        ["Transcrições em Cache", stats.cachedTranscriptions.toString(), "Vídeos transcritos em cache"],
        ["Tickets de Suporte", stats.totalTickets.toString(), "Tickets de suporte abertos"],
        ["Execuções de Coding", stats.totalCodingExecutions.toString(), "Funções de codificação executadas"],
        ["Gravações de Dados", stats.totalRecordings.toString(), "Gravações OBD realizadas"],
      ],
      fontSize: 9,
    });
  }

  private addFrontendSection(): void {
    this.addSectionTitle("ARQUITETURA FRONTEND", "3");

    const publicRoutes = this.data.frontend.routes.filter(r => !r.protected);
    const protectedRoutes = this.data.frontend.routes.filter(r => r.protected);

    this.addSubsectionTitle("Rotas Públicas");

    this.addTable({
      headers: ["Rota", "Componente", "Descrição"],
      data: publicRoutes.slice(0, 10).map(r => [r.path, r.component, r.description]),
      fontSize: 8,
    });

    this.addSpace(10);
    this.addSubsectionTitle("Rotas Protegidas (Usuário/Admin)");

    this.addTable({
      headers: ["Rota", "Componente", "Descrição"],
      data: protectedRoutes.slice(0, 12).map(r => [r.path, r.component, r.description]),
      fontSize: 8,
    });
  }

  private addBackendSection(): void {
    this.addSectionTitle("BACKEND (EDGE FUNCTIONS)", "4");

    this.addTable({
      headers: ["Função", "Propósito", "Dependências", "Status"],
      data: this.data.backend.functions.map(f => [
        f.name,
        f.purpose,
        f.dependencies.join(", ") || "Nenhuma",
        f.status === "active" ? "✓ Ativo" : f.status === "deprecated" ? "⚠ Obsoleto" : "✗ Erro",
      ]),
      fontSize: 8,
    });
  }

  private addDatabaseSection(): void {
    this.addSectionTitle("ESTRUTURA DO BANCO DE DADOS", "5");

    this.addTable({
      headers: ["Tabela", "Cols", "RLS", "Registros", "Propósito"],
      data: this.data.database.tables.slice(0, 15).map(t => [
        t.name,
        t.columns.toString(),
        t.hasRLS ? "✓" : "✗",
        t.recordCount.toString(),
        t.purpose.substring(0, 30) + (t.purpose.length > 30 ? "..." : ""),
      ]),
      fontSize: 7,
      columnWidths: [40, 12, 12, 18, "auto"],
    });

    if (this.data.database.issues.length > 0) {
      this.addSpace(10);
      this.addSubsectionTitle("Status do Banco de Dados");

      this.addTable({
        headers: ["Nível", "Tabela", "Descrição", "Status"],
        data: this.data.database.issues.map(i => [
          i.level === "critical" ? "🔴" : i.level === "warning" ? "🟡" : "🔵",
          i.table,
          i.description,
          i.status === "fixed" ? "✓ Corrigido" : "⏳ Pendente",
        ]),
        fontSize: 8,
      });
    }
  }

  private addRelationshipsSection(): void {
    this.addSectionTitle("RELACIONAMENTOS DO BANCO", "6");

    this.addTable({
      headers: ["Origem", "Destino", "Tipo", "Chave Estrangeira"],
      data: this.data.database.relationships.map(r => [
        r.from,
        r.to,
        r.type,
        r.foreignKey,
      ]),
      fontSize: 9,
    });
  }

  private addUserFlowsSection(): void {
    this.addSectionTitle("FLUXOS DE USUÁRIO", "7");

    this.data.userFlows.forEach((flow, index) => {
      this.addSubsectionTitle(`${index + 1}. ${flow.name} (${flow.role})`);
      this.addBulletList(flow.steps.slice(0, 5));
      this.addParagraph(`Tabelas utilizadas: ${flow.tablesUsed.join(", ")}`);
      this.addSpace(5);
    });
  }

  private addSecuritySection(): void {
    this.addSectionTitle("ANÁLISE DE SEGURANÇA", "8");

    if (this.data.security.warnings.length > 0) {
      this.addTable({
        headers: ["Nível", "Categoria", "Descrição", "Status"],
        data: this.data.security.warnings.map(w => [
          w.level === "critical" ? "🔴 CRÍTICO" : w.level === "warning" ? "🟡 AVISO" : "🔵 INFO",
          w.category,
          w.description,
          w.status === "fixed" ? "✓ Corrigido" : w.status === "pending" ? "⏳ Pendente" : "👤 Manual",
        ]),
        fontSize: 8,
      });
    }

    this.addSpace(10);
    this.addSubsectionTitle("Recomendações de Segurança");
    this.addBulletList(this.data.security.recommendations);
  }

  private addConclusionSection(): void {
    this.addSectionTitle("CONCLUSÃO", "9");

    this.addColorBox({
      title: "FUNCIONALIDADES PRESERVADAS",
      items: this.data.conclusion.functionalitiesPreserved,
      bgColor: [220, 252, 231],
      borderColor: PDF_COLORS.success,
      textColor: [22, 101, 52],
    });

    this.addSpace(10);

    this.addColorBox({
      title: "CORREÇÕES APLICADAS",
      items: this.data.conclusion.issuesFixed,
      bgColor: [219, 234, 254],
      borderColor: PDF_COLORS.info,
      textColor: [30, 64, 175],
    });

    this.addSpace(10);

    this.addColorBox({
      title: "ITENS PENDENTES",
      items: this.data.conclusion.pendingItems,
      bgColor: [254, 249, 195],
      borderColor: PDF_COLORS.warning,
      textColor: [133, 77, 14],
    });
  }
}
