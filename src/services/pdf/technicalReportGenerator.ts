import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PDFBaseGenerator, PDF_COLORS, PDF_LAYOUT } from "./pdfBaseGenerator";

// ============================================
// GERADOR DE RELATÓRIO TÉCNICO COMPLETO
// ============================================

export function generateTechnicalReportPDF(): void {
  const generator = new TechnicalReportGenerator();
  generator.generate();
}

class TechnicalReportGenerator extends PDFBaseGenerator {
  generate(): void {
    // CAPA
    this.addCoverPage({
      title: "RELATÓRIO TÉCNICO",
      subtitle: "Sistema Doutor Motors",
      description: "Plataforma de Diagnóstico Automotivo OBD-II",
      version: "1.0.0",
      generatedBy: "Sistema Automatizado",
    });

    // ÍNDICE
    this.addNewPage();
    this.addPageHeader("Relatório Técnico - Doutor Motors");
    this.addIndex([
      { title: "Estrutura de Páginas e Rotas" },
      { title: "Componentes e Funcionalidades" },
      { title: "Elementos Interativos" },
      { title: "Banco de Dados" },
      { title: "Integrações e APIs" },
      { title: "Gerenciamento de Estado" },
      { title: "Autenticação e Autorização" },
      { title: "Configurações e Variáveis" },
      { title: "Fluxos de Dados" },
      { title: "Estrutura de Arquivos" },
      { title: "Erros, Avisos e Cuidados" },
      { title: "Edge Functions" },
      { title: "Feedback do Sistema" },
      { title: "Implementações Pendentes" },
      { title: "Sugestões de Melhoria" },
    ]);

    // SEÇÃO 1: ROTAS
    this.addNewPage();
    this.addPageHeader("Relatório Técnico - Doutor Motors");
    this.addSection1Routes();

    // SEÇÃO 2: COMPONENTES
    this.addNewPage();
    this.addPageHeader("Relatório Técnico - Doutor Motors");
    this.addSection2Components();

    // SEÇÃO 3: ELEMENTOS INTERATIVOS
    this.addNewPage();
    this.addPageHeader("Relatório Técnico - Doutor Motors");
    this.addSection3Interactive();

    // SEÇÃO 4: BANCO DE DADOS
    this.addNewPage();
    this.addPageHeader("Relatório Técnico - Doutor Motors");
    this.addSection4Database();

    // SEÇÃO 5: INTEGRAÇÕES
    this.addNewPage();
    this.addPageHeader("Relatório Técnico - Doutor Motors");
    this.addSection5Integrations();

    // SEÇÃO 6: ESTADO
    this.addNewPage();
    this.addPageHeader("Relatório Técnico - Doutor Motors");
    this.addSection6State();

    // SEÇÃO 7: AUTH
    this.addNewPage();
    this.addPageHeader("Relatório Técnico - Doutor Motors");
    this.addSection7Auth();

    // SEÇÃO 8: CONFIG
    this.addSection8Config();

    // SEÇÃO 9: FLUXOS
    this.addNewPage();
    this.addPageHeader("Relatório Técnico - Doutor Motors");
    this.addSection9Flows();

    // SEÇÃO 10: ARQUIVOS
    this.addNewPage();
    this.addPageHeader("Relatório Técnico - Doutor Motors");
    this.addSection10Files();

    // SEÇÃO 11: ERROS
    this.addNewPage();
    this.addPageHeader("Relatório Técnico - Doutor Motors");
    this.addSection11Errors();

    // SEÇÃO 12: EDGE FUNCTIONS
    this.addNewPage();
    this.addPageHeader("Relatório Técnico - Doutor Motors");
    this.addSection12EdgeFunctions();

    // SEÇÃO 13: FEEDBACK
    this.addNewPage();
    this.addPageHeader("Relatório Técnico - Doutor Motors");
    this.addSection13Feedback();

    // SEÇÃO 14: PENDENTES
    this.addNewPage();
    this.addPageHeader("Relatório Técnico - Doutor Motors");
    this.addSection14Pending();

    // SEÇÃO 15: SUGESTÕES
    this.addNewPage();
    this.addPageHeader("Relatório Técnico - Doutor Motors");
    this.addSection15Suggestions();

    // RESUMO EXECUTIVO
    this.addNewPage();
    this.addPageHeader("Relatório Técnico - Doutor Motors");
    this.addExecutiveSummary();

    // MARCA D'ÁGUA
    this.addWatermark();

    // RODAPÉS
    this.addFooters("Relatório Técnico Completo");

    // SALVAR
    this.save("relatorio-tecnico-completo");
  }

  private addSection1Routes(): void {
    this.addSectionTitle("ESTRUTURA DE PÁGINAS E ROTAS", "1");

    this.addSubsectionTitle("1.1 Páginas Públicas (Sem Autenticação)");
    this.addTable({
      headers: ["Rota", "Componente", "Propósito"],
      data: [
        ["/", "Index.tsx", "Redirecionamento inicial"],
        ["/landing", "LandingPage.tsx", "Página inicial marketing"],
        ["/sobre", "AboutPage.tsx", "Informações da empresa"],
        ["/servicos", "ServicesPage.tsx", "Serviços oferecidos"],
        ["/como-funciona", "HowItWorksPage.tsx", "Explicação do funcionamento"],
        ["/contato", "ContactPage.tsx", "Formulário de contato"],
        ["/faq", "FAQPage.tsx", "Perguntas frequentes"],
        ["/termos", "TermsPage.tsx", "Termos de uso"],
        ["/privacidade", "PrivacyPolicyPage.tsx", "Política de privacidade"],
        ["/login", "LoginPage.tsx", "Autenticação de usuários"],
        ["/cadastro", "SignUpPage.tsx", "Registro de novos usuários"],
        ["/esqueci-senha", "ForgotPasswordPage.tsx", "Recuperação de senha"],
        ["/estudar-carro", "StudyCarPage.tsx", "Aprendizado sobre veículos"],
      ],
      columnWidths: [35, 45, "auto"],
    });

    this.addSpace(5);
    this.addSubsectionTitle("1.2 Páginas Protegidas (Requer Login)");
    this.addTable({
      headers: ["Rota", "Componente", "Propósito"],
      data: [
        ["/dashboard", "UserDashboard.tsx", "Painel principal do usuário"],
        ["/dashboard/veiculos", "VehicleManager.tsx", "Gestão de veículos"],
        ["/dashboard/diagnostico", "DiagnosticCenter.tsx", "Central de diagnósticos"],
        ["/dashboard/historico", "DiagnosticHistory.tsx", "Histórico de diagnósticos"],
        ["/dashboard/relatorio/:id", "DiagnosticReport.tsx", "Relatório detalhado"],
        ["/dashboard/solucao/:itemId", "SolutionGuide.tsx", "Guia de soluções"],
        ["/dashboard/upgrade", "UpgradePage.tsx", "Planos e assinaturas"],
        ["/dashboard/perfil", "UserProfile.tsx", "Perfil do usuário"],
        ["/dashboard/suporte", "SupportCenter.tsx", "Central de suporte"],
        ["/dashboard/gravacao-dados", "DataRecordingPage.tsx", "Gravação de dados OBD"],
        ["/dashboard/coding", "CodingFunctionsPage.tsx", "Funções de codificação"],
        ["/dashboard/configuracoes-obd", "OBDSettingsPage.tsx", "Configurações OBD"],
      ],
      columnWidths: [50, 45, "auto"],
    });

    this.addSpace(5);
    this.addSubsectionTitle("1.3 Páginas Admin (Requer Role Admin)");
    this.addTable({
      headers: ["Rota", "Componente", "Propósito"],
      data: [
        ["/admin", "AdminDashboard.tsx", "Dashboard administrativo"],
        ["/admin/usuarios", "AdminUsers.tsx", "Gestão de usuários"],
        ["/admin/veiculos", "AdminVehicles.tsx", "Gestão de veículos"],
        ["/admin/diagnosticos", "AdminDiagnostics.tsx", "Gestão de diagnósticos"],
        ["/admin/tickets", "AdminTickets.tsx", "Gestão de tickets"],
        ["/admin/mensagens", "AdminMessages.tsx", "Mensagens de contato"],
        ["/admin/assinaturas", "AdminSubscriptions.tsx", "Gestão de assinaturas"],
        ["/admin/relatorios", "AdminReports.tsx", "Relatórios do sistema"],
        ["/admin/alertas", "AdminAlerts.tsx", "Sistema de alertas"],
        ["/admin/logs", "AdminLogs.tsx", "Logs de auditoria"],
        ["/admin/configuracoes", "AdminSettings.tsx", "Configurações do sistema"],
      ],
      columnWidths: [45, 50, "auto"],
    });
  }

  private addSection2Components(): void {
    this.addSectionTitle("COMPONENTES E FUNCIONALIDADES", "2");

    this.addSubsectionTitle("2.1 Componentes de Layout");
    this.addTable({
      headers: ["Componente", "Arquivo", "Funcionalidade", "Hooks"],
      data: [
        ["Header", "layout/Header.tsx", "Navegação principal, menu responsivo", "useAuth, useNavigate"],
        ["Footer", "layout/Footer.tsx", "Rodapé com links e redes sociais", "-"],
        ["DashboardLayout", "dashboard/DashboardLayout.tsx", "Layout do dashboard com sidebar", "useAuth, useSubscription"],
        ["AdminLayout", "admin/AdminLayout.tsx", "Layout administrativo com menu lateral", "useAdmin"],
      ],
      columnWidths: [35, 50, 55, "auto"],
    });

    this.addSpace(5);
    this.addSubsectionTitle("2.2 Componentes OBD");
    this.addTable({
      headers: ["Componente", "Funcionalidade", "Hooks Utilizados"],
      data: [
        ["OBDConnector", "Conexão com dispositivo OBD-II", "useOBDConnection, useBluetoothConnection"],
        ["OBDConnectionSelector", "Seleção de método de conexão", "useState"],
        ["VehicleDataDisplay", "Exibição de dados em tempo real", "useState, useEffect"],
        ["ConnectionMethodGuide", "Guia visual de conexão", "-"],
      ],
      columnWidths: [45, 60, "auto"],
    });

    this.addSpace(5);
    this.addSubsectionTitle("2.3 Componentes de Soluções");
    this.addTable({
      headers: ["Componente", "Funcionalidade"],
      data: [
        ["SolutionSteps", "Passos de solução com checklist interativo"],
        ["GlossaryPanel", "Glossário de termos técnicos automotivos"],
        ["IntegratedContentViewer", "Visualizador de conteúdo integrado (vídeos, tutoriais)"],
        ["SourceSelector", "Seletor de fontes de informação"],
      ],
    });

    this.addSpace(5);
    this.addSubsectionTitle("2.4 Componentes de Assinatura");
    this.addTable({
      headers: ["Componente", "Funcionalidade", "Props"],
      data: [
        ["PlanCard", "Card de plano com detalhes e preço", "plan, isCurrentPlan, onSelect"],
        ["FeatureGate", "Controle de funcionalidades por plano", "feature, children, fallback"],
        ["UpgradePrompt", "Prompt de upgrade para plano Pro", "feature, message"],
      ],
      columnWidths: [35, 60, "auto"],
    });

    this.addSpace(5);
    this.addSubsectionTitle("2.5 Componentes de Notificação");
    this.addTable({
      headers: ["Componente", "Funcionalidade"],
      data: [
        ["NotificationContainer", "Container de notificações do usuário"],
        ["AdminNotificationContainer", "Container de notificações do admin"],
        ["PushNotificationManager", "Gerenciador de push notifications"],
        ["SystemAlertsBanner", "Banner de alertas do sistema"],
      ],
    });
  }

  private addSection3Interactive(): void {
    this.addSectionTitle("ELEMENTOS INTERATIVOS (BOTÕES E AÇÕES)", "3");

    this.addSubsectionTitle("3.1 Landing Page");
    this.addTable({
      headers: ["Elemento", "Ação Executada", "API/Função Chamada"],
      data: [
        ["Começar Agora", "Navega para /cadastro", "navigate('/cadastro')"],
        ["Fazer Login", "Navega para /login", "navigate('/login')"],
        ["Saiba Mais", "Scroll para seção", "scrollIntoView()"],
        ["Enviar Contato", "Envia formulário", "send-contact-email edge function"],
      ],
    });

    this.addSpace(5);
    this.addSubsectionTitle("3.2 Dashboard");
    this.addTable({
      headers: ["Elemento", "Ação", "Validações", "API"],
      data: [
        ["Novo Diagnóstico", "Inicia diagnóstico", "Veículo selecionado", "diagnostics.insert()"],
        ["Adicionar Veículo", "Modal de cadastro", "Marca, modelo, ano", "vehicles.insert()"],
        ["Conectar OBD", "Inicia conexão BT/WiFi", "Browser compatível", "navigator.bluetooth"],
        ["Exportar PDF", "Gera relatório PDF", "-", "jsPDF"],
        ["Abrir Ticket", "Cria ticket suporte", "Título, descrição", "support_tickets.insert()"],
      ],
      fontSize: 7,
    });

    this.addSpace(5);
    this.addSubsectionTitle("3.3 Gestão de Veículos");
    this.addTable({
      headers: ["Elemento", "Ação", "Validações"],
      data: [
        ["Adicionar Veículo", "Abre modal de cadastro", "Marca, modelo e ano obrigatórios"],
        ["Editar Veículo", "Abre modal de edição", "Campos preenchidos corretamente"],
        ["Excluir Veículo", "Remove veículo", "Confirmação do usuário"],
        ["Selecionar Veículo", "Define veículo ativo", "-"],
      ],
    });

    this.addSpace(5);
    this.addSubsectionTitle("3.4 Painel Admin");
    this.addTable({
      headers: ["Elemento", "Ação Executada", "API Utilizada"],
      data: [
        ["Enviar Alerta", "Envia alerta do sistema", "system_alerts.insert()"],
        ["Alterar Status Ticket", "Atualiza status do ticket", "support_tickets.update()"],
        ["Gerar Relatório", "Exporta dados em PDF", "jsPDF, jspdf-autotable"],
        ["Promover Admin", "Altera role do usuário", "user_roles.update()"],
        ["Bloquear Usuário", "Desativa conta", "supabase.auth.admin"],
      ],
    });
  }

  private addSection4Database(): void {
    this.addSectionTitle("BANCO DE DADOS", "4");

    this.addSubsectionTitle("4.1 Estrutura das Tabelas Principais");
    this.addTable({
      headers: ["Tabela", "Cols", "RLS", "Índices", "Finalidade"],
      data: [
        ["profiles", "8", "✓", "✓", "Dados do perfil do usuário"],
        ["user_roles", "4", "✓", "-", "Controle de papéis (admin/user)"],
        ["user_subscriptions", "11", "✓", "-", "Assinaturas e planos"],
        ["vehicles", "10", "✓", "✓", "Veículos cadastrados"],
        ["diagnostics", "8", "✓", "✓", "Sessões de diagnóstico"],
        ["diagnostic_items", "13", "✓", "✓", "Itens de diagnóstico (DTCs)"],
        ["support_tickets", "15", "✓", "✓", "Tickets de suporte"],
        ["ticket_messages", "6", "✓", "-", "Mensagens dos tickets"],
        ["data_recordings", "13", "✓", "✓", "Gravações de dados OBD"],
        ["recording_data_points", "5", "✓", "✓", "Pontos de dados gravados"],
        ["obd_settings", "15", "✓", "✓", "Configurações OBD"],
        ["usage_tracking", "10", "✓", "✓", "Controle de uso mensal"],
        ["coding_executions", "14", "✓", "✓", "Histórico de codificações"],
        ["audit_logs", "11", "✓", "✓", "Logs de auditoria"],
        ["system_alerts", "15", "✓", "✓", "Alertas do sistema"],
        ["contact_messages", "9", "✓", "✓", "Mensagens de contato"],
        ["legal_consents", "8", "✓", "✓", "Consentimentos legais"],
        ["system_settings", "7", "✓", "-", "Configurações do sistema"],
        ["video_transcription_cache", "13", "✓", "✓", "Cache de transcrições"],
      ],
      columnWidths: [40, 12, 12, 15, "auto"],
      fontSize: 7,
    });

    this.addSpace(5);
    this.addSubsectionTitle("4.2 Enums do Banco de Dados");
    this.addTable({
      headers: ["Enum", "Valores Possíveis"],
      data: [
        ["app_role", "admin, user"],
        ["diagnostic_priority", "critical, attention, preventive"],
        ["diagnostic_status", "pending, completed, resolved"],
        ["ticket_category", "technical, account, billing, diagnostic, general"],
        ["ticket_priority", "low, medium, high, urgent"],
        ["ticket_status", "open, in_progress, resolved, closed"],
      ],
    });

    this.addSpace(5);
    this.addSubsectionTitle("4.3 Funções do Banco");
    this.addTable({
      headers: ["Função", "Propósito"],
      data: [
        ["has_role(_user_id, _role)", "Verifica se usuário tem determinado papel"],
        ["handle_new_user()", "Trigger: cria perfil e role no signup"],
        ["update_updated_at_column()", "Trigger: atualiza timestamp automaticamente"],
        ["generate_ticket_number()", "Trigger: gera número único do ticket"],
      ],
    });
  }

  private addSection5Integrations(): void {
    this.addSectionTitle("INTEGRAÇÕES E APIs", "5");

    this.addSubsectionTitle("5.1 Supabase (Backend Principal)");
    this.addTable({
      headers: ["Serviço", "Uso", "Autenticação"],
      data: [
        ["Auth", "Autenticação de usuários (email/senha)", "JWT Token"],
        ["Database", "PostgreSQL com Row Level Security", "JWT Token + RLS"],
        ["Edge Functions", "Lógica serverless (11 funções)", "Service Role Key"],
        ["Realtime", "Atualizações em tempo real", "JWT Token"],
        ["Storage", "Armazenamento de arquivos", "JWT Token + Policies"],
      ],
    });

    this.addSpace(5);
    this.addSubsectionTitle("5.2 APIs Externas");
    this.addTable({
      headers: ["Serviço", "Propósito", "Secret"],
      data: [
        ["Motor IA Automotiva", "IA para diagnósticos e soluções", "AI_ENGINE_KEY"],
        ["Resend", "Envio de e-mails transacionais", "RESEND_API_KEY"],
        ["ElevenLabs", "Síntese de voz (acessibilidade)", "ELEVENLABS_API_KEY"],
        ["Firecrawl", "Web scraping para tutoriais", "FIRECRAWL_API_KEY"],
      ],
    });

    this.addSpace(5);
    this.addSubsectionTitle("5.3 APIs do Navegador");
    this.addTable({
      headers: ["API", "Uso", "Compatibilidade"],
      data: [
        ["Web Bluetooth", "Conexão com OBD-II via Bluetooth", "Chrome, Edge (não Safari)"],
        ["WebSocket", "Conexão WiFi com OBD-II", "Todos os navegadores"],
        ["Service Worker", "Cache offline e PWA", "Navegadores modernos"],
        ["Notifications API", "Notificações do navegador", "Chrome, Firefox, Edge"],
      ],
    });
  }

  private addSection6State(): void {
    this.addSectionTitle("GERENCIAMENTO DE ESTADO", "6");

    this.addSubsectionTitle("6.1 Zustand (Estado Global)");
    this.addParagraph("O Zustand é utilizado para gerenciar o estado global da aplicação. O store principal está em src/store/useAppStore.ts e gerencia:");
    this.addBulletList([
      "activeVehicleId: Veículo atualmente selecionado",
      "vehicles: Lista de veículos do usuário em cache",
      "diagnostics: Lista de diagnósticos em cache",
      "obdConnectionStatus: Estado da conexão OBD (disconnected/connecting/connected)",
      "currentDiagnosticId: ID do diagnóstico em andamento",
    ]);

    this.addSubsectionTitle("6.2 Context APIs");
    this.addTable({
      headers: ["Context", "Propósito", "Provider"],
      data: [
        ["AuthContext", "Autenticação e sessão do usuário", "AuthProvider em hooks/useAuth.tsx"],
        ["NotificationContext", "Notificações para usuários", "NotificationProvider"],
        ["AdminNotificationContext", "Notificações para admins", "AdminNotificationProvider"],
      ],
    });

    this.addSpace(5);
    this.addSubsectionTitle("6.3 React Query");
    this.addParagraph("React Query (@tanstack/react-query) é utilizado para gerenciar estado de servidor com cache, invalidação automática, retry em falhas e optimistic updates. Configurado no App.tsx com QueryClient.");

    this.addSpace(5);
    this.addSubsectionTitle("6.4 Hooks Personalizados");
    this.addTable({
      headers: ["Hook", "Propósito"],
      data: [
        ["useAuth", "Autenticação e dados do usuário logado"],
        ["useSubscription", "Assinatura e limites do plano atual"],
        ["useUsageTracking", "Rastreamento de uso mensal"],
        ["useAuditLog", "Registro de ações para auditoria"],
        ["useAdmin", "Verificação de permissão admin"],
        ["useOBDSettings", "Configurações de conexão OBD"],
        ["useDataRecording", "Gravação de dados OBD em tempo real"],
        ["useCodingHistory", "Histórico de funções de coding"],
        ["useKPITargets", "Metas de KPI para admin"],
        ["useLegalConsent", "Consentimentos legais do usuário"],
        ["useNotifications", "Sistema de notificações"],
        ["usePushNotifications", "Push notifications do navegador"],
        ["useChartPreferences", "Preferências de visualização de gráficos"],
      ],
      fontSize: 7,
    });
  }

  private addSection7Auth(): void {
    this.addSectionTitle("AUTENTICAÇÃO E AUTORIZAÇÃO", "7");

    this.addSubsectionTitle("7.1 Fluxo de Autenticação");
    this.addBulletList([
      "1. Usuário acessa /login ou /cadastro",
      "2. Insere email + senha e submete o formulário",
      "3. Supabase Auth processa (signUp ou signInWithPassword)",
      "4. Trigger handle_new_user() cria perfil e role automaticamente",
      "5. onAuthStateChange() atualiza o contexto de autenticação",
      "6. Usuário é redirecionado para /dashboard",
    ]);

    this.addSubsectionTitle("7.2 Tipos de Usuários e Permissões");
    this.addTable({
      headers: ["Role", "Permissões"],
      data: [
        ["user", "Dashboard, veículos próprios, diagnósticos próprios, tickets próprios, perfil"],
        ["admin", "Tudo do user + painel admin, gestão de usuários, relatórios, configurações"],
      ],
    });

    this.addSpace(5);
    this.addSubsectionTitle("7.3 Proteção de Rotas");
    this.addParagraph("ProtectedRoute: Verifica se usuário está autenticado. Redireciona para /login se não estiver.");
    this.addParagraph("AdminProtectedRoute: Verifica role 'admin' via supabase.rpc('has_role'). Redireciona para /dashboard se não for admin.");
  }

  private addSection8Config(): void {
    this.addSpace(10);
    this.addSectionTitle("CONFIGURAÇÕES E VARIÁVEIS DE AMBIENTE", "8");

    this.addSubsectionTitle("8.1 Secrets Configurados (Supabase Edge Functions)");
    this.addTable({
      headers: ["Nome", "Propósito"],
      data: [
        ["SUPABASE_URL", "URL do projeto Supabase"],
        ["SUPABASE_ANON_KEY", "Chave pública para cliente"],
        ["SUPABASE_SERVICE_ROLE_KEY", "Chave de serviço para edge functions"],
        ["AI_ENGINE_KEY", "API de IA para diagnósticos"],
        ["RESEND_API_KEY", "API Resend para envio de e-mails"],
        ["ELEVENLABS_API_KEY", "API ElevenLabs para síntese de voz"],
        ["FIRECRAWL_API_KEY", "API Firecrawl para web scraping"],
      ],
    });

    this.addSpace(5);
    this.addSubsectionTitle("8.2 Dependências Principais");
    this.addTable({
      headers: ["Pacote", "Versão", "Uso"],
      data: [
        ["react", "^18.3.1", "Biblioteca UI principal"],
        ["react-router-dom", "^6.30.1", "Roteamento SPA"],
        ["@supabase/supabase-js", "^2.90.1", "Cliente Supabase"],
        ["@tanstack/react-query", "^5.83.0", "Cache de estado de servidor"],
        ["zustand", "^5.0.10", "Gerenciamento de estado global"],
        ["jspdf", "^4.0.0", "Geração de PDFs"],
        ["recharts", "^2.15.4", "Gráficos e visualizações"],
        ["framer-motion", "^12.26.2", "Animações"],
        ["zod", "^3.25.76", "Validação de schemas"],
      ],
      fontSize: 7,
    });
  }

  private addSection9Flows(): void {
    this.addSectionTitle("FLUXOS DE DADOS", "9");

    this.addSubsectionTitle("9.1 Fluxo de Diagnóstico");
    this.addBulletList([
      "1. Usuário conecta adaptador OBD-II via Bluetooth ou WiFi",
      "2. Sistema envia comandos ELM327 e lê códigos DTC do veículo",
      "3. Edge function 'diagnose' processa os códigos com motor de IA",
      "4. Dados são salvos nas tabelas diagnostics e diagnostic_items",
      "5. Relatório é gerado e exibido ao usuário",
      "6. usage_tracking é incrementado para controle de limites",
    ]);

    this.addSubsectionTitle("9.2 Fluxo de Ticket de Suporte");
    this.addBulletList([
      "1. Usuário cria ticket via formulário no /dashboard/suporte",
      "2. Trigger generate_ticket_number() gera número único (TKT-XXXXXX)",
      "3. Admin visualiza o ticket no painel /admin/tickets",
      "4. Mensagens são trocadas via tabela ticket_messages",
      "5. Status é atualizado conforme progresso (open → in_progress → resolved)",
      "6. audit_log registra todas as alterações",
    ]);

    this.addSubsectionTitle("9.3 Fluxo de Gravação de Dados");
    this.addBulletList([
      "1. Usuário inicia gravação em /dashboard/gravacao-dados",
      "2. Sistema coleta parâmetros OBD em tempo real (RPM, velocidade, temperatura)",
      "3. Dados são salvos na tabela recording_data_points",
      "4. Ao parar, duração e contadores são atualizados em data_recordings",
      "5. Usuário pode exportar dados em CSV",
    ]);
  }

  private addSection10Files(): void {
    this.addSectionTitle("ESTRUTURA DE ARQUIVOS", "10");

    this.addSubsectionTitle("Organização do Projeto");
    this.addTable({
      headers: ["Pasta", "Conteúdo"],
      data: [
        ["src/components/", "Componentes React organizados por funcionalidade"],
        ["src/components/ui/", "Componentes base do shadcn/ui"],
        ["src/components/admin/", "Componentes específicos do painel admin"],
        ["src/components/dashboard/", "Componentes do dashboard do usuário"],
        ["src/components/obd/", "Componentes de conexão OBD-II"],
        ["src/contexts/", "Context APIs (Auth, Notifications)"],
        ["src/hooks/", "Hooks customizados (17+ hooks)"],
        ["src/integrations/", "Integrações externas (Supabase client)"],
        ["src/pages/", "Páginas/rotas da aplicação"],
        ["src/pages/admin/", "Páginas do painel administrativo"],
        ["src/pages/dashboard/", "Páginas do dashboard do usuário"],
        ["src/services/", "Serviços de negócio"],
        ["src/services/obd/", "Protocolo OBD/ELM327"],
        ["src/services/pdf/", "Geradores de PDF"],
        ["src/services/diagnostics/", "Motor de diagnóstico"],
        ["src/store/", "Zustand stores"],
        ["src/utils/", "Utilitários gerais"],
        ["supabase/functions/", "Edge Functions (11 funções)"],
        ["e2e/", "Testes E2E com Playwright"],
      ],
      fontSize: 7,
    });
  }

  private addSection11Errors(): void {
    this.addSectionTitle("ERROS, AVISOS E CUIDADOS", "11");

    this.addSubsectionTitle("11.1 Avisos de Segurança");
    this.addTable({
      headers: ["Nível", "Descrição", "Status"],
      headerColor: PDF_COLORS.warning,
      data: [
        ["AVISO", "Extensões instaladas no schema 'public'", "Requer ação manual"],
        ["AVISO", "Proteção de senhas vazadas desabilitada", "Requer ação manual"],
      ],
    });

    this.addSpace(5);
    this.addSubsectionTitle("11.2 Problemas Corrigidos Recentemente");
    this.addTable({
      headers: ["Tipo", "Descrição", "Status"],
      headerColor: PDF_COLORS.success,
      data: [
        ["Tabela", "usage_tracking criada - funcionalidade restaurada", "✓ Corrigido"],
        ["Tabela", "coding_executions criada - funcionalidade restaurada", "✓ Corrigido"],
        ["Tabela", "audit_logs criada - auditoria implementada", "✓ Corrigido"],
        ["RLS", "Política USING(true) substituída por verificação adequada", "✓ Corrigido"],
        ["TypeScript", "Removidos 'as any' em hooks", "✓ Corrigido"],
      ],
    });

    this.addSpace(5);
    this.addSubsectionTitle("11.3 Cuidados Importantes");
    this.addBulletList([
      "Conexão Bluetooth/WiFi funciona apenas em browsers compatíveis (não Safari iOS)",
      "Limite de 1000 rows por query no Supabase - implementar paginação",
      "Edge functions têm timeout de 60 segundos - dividir processos longos",
      "Dados sensíveis (senhas, tokens) nunca devem ser logados",
    ]);
  }

  private addSection12EdgeFunctions(): void {
    this.addSectionTitle("EDGE FUNCTIONS", "12");

    this.addTable({
      headers: ["Função", "Método", "Propósito", "Secrets"],
      data: [
        ["diagnose", "POST", "Análise de códigos DTC com IA", "AI_ENGINE_KEY"],
        ["fetch-solution", "POST", "Busca soluções para DTCs", "AI_ENGINE_KEY, FIRECRAWL_API_KEY"],
        ["fetch-tutorial", "POST", "Busca tutoriais detalhados", "AI_ENGINE_KEY"],
        ["search-tutorials", "POST", "Pesquisa de tutoriais", "AI_ENGINE_KEY"],
        ["send-contact-email", "POST", "Envio de emails de contato", "RESEND_API_KEY"],
        ["send-notification", "POST", "Envio de notificações", "RESEND_API_KEY"],
        ["send-system-alert", "POST", "Envio de alertas do sistema", "RESEND_API_KEY"],
        ["send-usage-alert", "POST", "Alertas de limite de uso", "RESEND_API_KEY"],
        ["cache-admin", "POST", "Administração do cache", "-"],
        ["carcare-api", "POST", "API de cuidados com veículos", "AI_ENGINE_KEY"],
        ["check-kpi-alerts", "POST", "Verificação de KPIs", "-"],
      ],
      fontSize: 7,
    });
  }

  private addSection13Feedback(): void {
    this.addSectionTitle("FEEDBACK DO SISTEMA (LINGUAGEM SIMPLES)", "13");

    // Box verde - funcionando
    this.addColorBox({
      title: "O QUE ESTÁ FUNCIONANDO BEM",
      items: [
        "✓ Login e cadastro funcionam perfeitamente",
        "✓ Cadastro de veículos está funcionando corretamente",
        "✓ Sistema de tickets de suporte funciona bem",
        "✓ Painel admin está completo e funcional",
        "✓ PDFs estão sendo gerados corretamente",
        "✓ Sistema de auditoria está implementado",
        "✓ Notificações do sistema funcionam",
      ],
      bgColor: [220, 252, 231],
      borderColor: PDF_COLORS.success,
      textColor: [22, 101, 52],
    });

    // Box amarelo - atenção
    this.addColorBox({
      title: "O QUE PRECISA DE ATENÇÃO",
      items: [
        "⚠ Conexão OBD no iOS não funciona (Safari não suporta Web Bluetooth)",
        "⚠ Integração Stripe não está configurada ainda",
        "⚠ Verificar se e-mails estão sendo enviados em produção",
        "⚠ Testar conexão OBD com hardware real",
      ],
      bgColor: [254, 249, 195],
      borderColor: PDF_COLORS.warning,
      textColor: [133, 77, 14],
    });

    // Box vermelho - não funciona
    this.addColorBox({
      title: "O QUE NÃO FUNCIONA AINDA",
      items: [
        "✗ Pagamentos reais (Stripe não integrado)",
        "✗ App nativo completo (Capacitor configurado mas não buildado)",
        "✗ Push notifications nativas no app móvel",
      ],
      bgColor: [254, 226, 226],
      borderColor: PDF_COLORS.danger,
      textColor: [153, 27, 27],
    });
  }

  private addSection14Pending(): void {
    this.addSectionTitle("IMPLEMENTAÇÕES PENDENTES", "14");

    this.addSubsectionTitle("14.1 Crítico (Necessário para funcionar)");
    this.addTable({
      headers: ["Item", "Descrição"],
      headerColor: PDF_COLORS.danger,
      data: [
        ["Integração Stripe", "Criar checkout session, webhooks, atualização automática de subscription"],
        ["Build App Nativo", "Compilar para Android (APK/AAB) e iOS (IPA), publicar nas lojas"],
        ["Conexão OBD Real", "Testar com adaptadores ELM327 reais, validar protocolos CAN/ISO"],
      ],
    });

    this.addSpace(5);
    this.addSubsectionTitle("14.2 Importante (Melhora a experiência)");
    this.addTable({
      headers: ["Item", "Descrição"],
      headerColor: PDF_COLORS.warning,
      data: [
        ["Push Notifications", "Integrar com Firebase Cloud Messaging no app Capacitor"],
        ["Recuperação de Senha", "Testar fluxo completo, customizar e-mail"],
        ["Relatórios Avançados", "Comparativo entre diagnósticos, tendências de problemas"],
        ["Rate Limiting", "Proteção contra abuso nas edge functions"],
      ],
    });

    this.addSpace(5);
    this.addSubsectionTitle("14.3 Bom ter (Diferenciais)");
    this.addTable({
      headers: ["Item", "Descrição"],
      headerColor: PDF_COLORS.accent,
      data: [
        ["Gamificação", "Badges por diagnósticos, ranking de usuários, conquistas"],
        ["Marketplace de Oficinas", "Integração com oficinas, agendamento online"],
        ["Modo Offline", "Salvar dados localmente, sincronizar quando online"],
        ["IA Preditiva", "Prever problemas futuros com base no histórico"],
      ],
    });
  }

  private addSection15Suggestions(): void {
    this.addSectionTitle("SUGESTÕES DE MELHORIA", "15");

    this.addSubsectionTitle("15.1 Performance");
    this.addBulletList([
      "Implementar Lazy Loading de rotas para carregamento mais rápido",
      "Usar react-virtual para virtualização de listas grandes",
      "Implementar service worker para cache de assets",
      "Otimizar queries do banco com índices adequados",
    ]);

    this.addSubsectionTitle("15.2 Segurança");
    this.addBulletList([
      "Implementar Rate Limiting para proteger contra brute force",
      "Usar Zod para validação de entrada em todas as APIs",
      "Detectar tentativas de acesso suspeito e alertar admins",
      "Habilitar Leaked Password Protection no Supabase",
    ]);

    this.addSubsectionTitle("15.3 UX/UI");
    this.addBulletList([
      "Implementar onboarding guiado para novos usuários",
      "Adicionar modo offline com sincronização",
      "Melhorar acessibilidade (contraste, leitor de tela)",
      "Adicionar dark mode toggle acessível",
    ]);

    this.addSubsectionTitle("15.4 Código e Qualidade");
    this.addBulletList([
      "Aumentar cobertura de testes E2E com Playwright",
      "Adicionar testes unitários com Vitest",
      "Documentar funções críticas com JSDoc",
      "Criar Storybook para componentes",
      "Integrar Sentry para monitoramento de erros em produção",
    ]);
  }

  private addExecutiveSummary(): void {
    this.addSectionTitle("RESUMO EXECUTIVO");

    this.addTable({
      headers: ["Métrica", "Valor"],
      data: [
        ["Total de Rotas", "35 páginas"],
        ["Tabelas no Banco", "19 tabelas"],
        ["Edge Functions", "11 funções"],
        ["Componentes React", "80+ componentes"],
        ["Hooks Customizados", "17 hooks"],
        ["Cobertura RLS", "100%"],
        ["Status Geral", "Funcional"],
      ],
      fontSize: 10,
    });

    this.addSpace(15);

    // Caixa de conclusão
    this.addColorBox({
      title: "CONCLUSÃO",
      items: [
        "O sistema Doutor Motors está funcional e bem estruturado.",
        "Com a implementação da integração Stripe e build do app nativo,",
        "estará pronto para produção completa e lançamento.",
      ],
      bgColor: [240, 249, 255],
      borderColor: PDF_COLORS.accent,
      textColor: [30, 64, 175],
    });
  }
}
