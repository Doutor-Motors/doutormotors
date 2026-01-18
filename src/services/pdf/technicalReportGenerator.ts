import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TechnicalReportData {
  generatedAt: string;
  generatedBy: string;
}

// Helper to add section title
function addSectionTitle(doc: jsPDF, title: string, yPosition: number, pageWidth: number): number {
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 25;
  }
  
  // Section background
  doc.setFillColor(20, 30, 48);
  doc.roundedRect(14, yPosition - 6, pageWidth - 28, 12, 2, 2, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(title, 18, yPosition + 2);
  
  return yPosition + 14;
}

// Helper to add subsection title
function addSubsectionTitle(doc: jsPDF, title: string, yPosition: number): number {
  if (yPosition > 260) {
    doc.addPage();
    yPosition = 25;
  }
  
  doc.setTextColor(20, 30, 48);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(title, 14, yPosition);
  
  return yPosition + 8;
}

// Helper to add paragraph text
function addParagraph(doc: jsPDF, text: string, yPosition: number, pageWidth: number, indent: number = 14): number {
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  
  const lines = doc.splitTextToSize(text, pageWidth - 28 - (indent - 14));
  
  if (yPosition + lines.length * 4 > 280) {
    doc.addPage();
    yPosition = 25;
  }
  
  doc.text(lines, indent, yPosition);
  return yPosition + lines.length * 4 + 3;
}

// Helper to add bullet list
function addBulletList(doc: jsPDF, items: string[], yPosition: number, pageWidth: number): number {
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  
  items.forEach((item) => {
    if (yPosition > 275) {
      doc.addPage();
      yPosition = 25;
    }
    
    const lines = doc.splitTextToSize(`• ${item}`, pageWidth - 35);
    doc.text(lines, 18, yPosition);
    yPosition += lines.length * 4 + 2;
  });
  
  return yPosition + 3;
}

export function generateTechnicalReportPDF(data: TechnicalReportData = { generatedAt: new Date().toISOString(), generatedBy: "Sistema" }): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // ===== COVER PAGE =====
  doc.setFillColor(20, 30, 48);
  doc.rect(0, 0, pageWidth, 297, "F");

  // Logo area
  doc.setFillColor(59, 130, 246);
  doc.circle(pageWidth / 2, 60, 25, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("DM", pageWidth / 2, 66, { align: "center" });

  // Title
  doc.setFontSize(32);
  doc.text("RELATÓRIO TÉCNICO", pageWidth / 2, 110, { align: "center" });
  doc.setFontSize(24);
  doc.text("COMPLETO", pageWidth / 2, 125, { align: "center" });

  // Subtitle
  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text("Sistema Doutor Motors", pageWidth / 2, 145, { align: "center" });
  doc.text("Plataforma de Diagnóstico Automotivo OBD-II", pageWidth / 2, 155, { align: "center" });

  // Divider
  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(2);
  doc.line(pageWidth / 2 - 40, 170, pageWidth / 2 + 40, 170);

  // Info box
  doc.setFillColor(30, 40, 60);
  doc.roundedRect(30, 190, pageWidth - 60, 50, 5, 5, "F");
  
  doc.setFontSize(10);
  doc.setTextColor(180, 180, 180);
  doc.text("Data de Geração:", 45, 208);
  doc.text("Versão do Sistema:", 45, 220);
  doc.text("Ambiente:", 45, 232);
  
  doc.setTextColor(255, 255, 255);
  doc.text(format(new Date(data.generatedAt), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR }), 100, 208);
  doc.text("1.0.0", 100, 220);
  doc.text("Produção", 100, 232);

  // Footer on cover
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text("Documento confidencial - Uso interno", pageWidth / 2, 280, { align: "center" });

  // ===== NEW PAGE - INDEX =====
  doc.addPage();
  y = 25;

  doc.setFillColor(20, 30, 48);
  doc.rect(0, 0, pageWidth, 20, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text("RELATÓRIO TÉCNICO - DOUTOR MOTORS", pageWidth / 2, 13, { align: "center" });

  doc.setTextColor(20, 30, 48);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("ÍNDICE", 14, y + 10);
  y += 20;

  const indexItems = [
    "1. Estrutura de Páginas e Rotas",
    "2. Componentes e Funcionalidades",
    "3. Elementos Interativos (Botões e Ações)",
    "4. Banco de Dados",
    "5. Integrações e APIs",
    "6. Gerenciamento de Estado",
    "7. Autenticação e Autorização",
    "8. Configurações e Variáveis de Ambiente",
    "9. Fluxos de Dados",
    "10. Estrutura de Arquivos",
    "11. Erros, Avisos e Cuidados",
    "12. Edge Functions",
    "13. Feedback do Sistema (Linguagem Simples)",
    "14. Implementações Pendentes",
    "15. Sugestões de Melhoria",
  ];

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  indexItems.forEach((item, idx) => {
    doc.setTextColor(60, 60, 60);
    doc.text(item, 20, y);
    doc.setTextColor(59, 130, 246);
    doc.text(`Pág. ${idx + 3}`, pageWidth - 30, y);
    y += 8;
  });

  // ===== SECTION 1: ROUTES =====
  doc.addPage();
  y = 30;
  y = addSectionTitle(doc, "1. ESTRUTURA DE PÁGINAS E ROTAS", y, pageWidth);

  y = addSubsectionTitle(doc, "1.1 Páginas Públicas (Sem Autenticação)", y);
  
  autoTable(doc, {
    startY: y,
    head: [["Rota", "Componente", "Propósito"]],
    body: [
      ["/", "Index.tsx", "Redirecionamento inicial"],
      ["/landing", "LandingPage.tsx", "Página inicial marketing"],
      ["/sobre", "AboutPage.tsx", "Informações da empresa"],
      ["/servicos", "ServicesPage.tsx", "Serviços oferecidos"],
      ["/como-funciona", "HowItWorksPage.tsx", "Explicação do funcionamento"],
      ["/contato", "ContactPage.tsx", "Formulário de contato"],
      ["/faq", "FAQPage.tsx", "Perguntas frequentes"],
      ["/termos", "TermsPage.tsx", "Termos de uso"],
      ["/privacidade", "PrivacyPolicyPage.tsx", "Política de privacidade"],
      ["/login", "LoginPage.tsx", "Autenticação"],
      ["/cadastro", "SignUpPage.tsx", "Registro de usuários"],
      ["/esqueci-senha", "ForgotPasswordPage.tsx", "Recuperação de senha"],
      ["/estudar-carro", "StudyCarPage.tsx", "Aprendizado sobre veículos"],
    ],
    theme: "striped",
    headStyles: { fillColor: [20, 30, 48], textColor: 255, fontSize: 8 },
    styles: { fontSize: 7, cellPadding: 2 },
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  y = addSubsectionTitle(doc, "1.2 Páginas Protegidas (Requer Login)", y);
  
  autoTable(doc, {
    startY: y,
    head: [["Rota", "Componente", "Propósito"]],
    body: [
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
    theme: "striped",
    headStyles: { fillColor: [20, 30, 48], textColor: 255, fontSize: 8 },
    styles: { fontSize: 7, cellPadding: 2 },
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  // Check page
  if (y > 200) {
    doc.addPage();
    y = 30;
  }

  y = addSubsectionTitle(doc, "1.3 Páginas Admin (Requer Role Admin)", y);
  
  autoTable(doc, {
    startY: y,
    head: [["Rota", "Componente", "Propósito"]],
    body: [
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
    theme: "striped",
    headStyles: { fillColor: [20, 30, 48], textColor: 255, fontSize: 8 },
    styles: { fontSize: 7, cellPadding: 2 },
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 15;

  // ===== SECTION 2: COMPONENTS =====
  doc.addPage();
  y = 30;
  y = addSectionTitle(doc, "2. COMPONENTES E FUNCIONALIDADES", y, pageWidth);

  y = addSubsectionTitle(doc, "2.1 Componentes de Layout", y);
  autoTable(doc, {
    startY: y,
    head: [["Componente", "Arquivo", "Funcionalidade", "Hooks"]],
    body: [
      ["Header", "layout/Header.tsx", "Navegação principal, menu responsivo", "useAuth, useNavigate"],
      ["Footer", "layout/Footer.tsx", "Rodapé com links e redes sociais", "-"],
      ["DashboardLayout", "dashboard/DashboardLayout.tsx", "Layout do dashboard com sidebar", "useAuth, useSubscription"],
      ["AdminLayout", "admin/AdminLayout.tsx", "Layout administrativo", "useAdmin"],
    ],
    theme: "striped",
    headStyles: { fillColor: [20, 30, 48], textColor: 255, fontSize: 8 },
    styles: { fontSize: 7, cellPadding: 2 },
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  y = addSubsectionTitle(doc, "2.2 Componentes OBD", y);
  autoTable(doc, {
    startY: y,
    head: [["Componente", "Funcionalidade", "Hooks Utilizados"]],
    body: [
      ["OBDConnector", "Conexão com dispositivo OBD-II", "useOBDConnection, useBluetoothConnection, useWiFiConnection"],
      ["OBDConnectionSelector", "Seleção de método de conexão", "useState"],
      ["VehicleDataDisplay", "Exibição de dados em tempo real", "useState, useEffect"],
      ["ConnectionMethodGuide", "Guia de conexão", "-"],
    ],
    theme: "striped",
    headStyles: { fillColor: [20, 30, 48], textColor: 255, fontSize: 8 },
    styles: { fontSize: 7, cellPadding: 2 },
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  y = addSubsectionTitle(doc, "2.3 Componentes de Soluções", y);
  autoTable(doc, {
    startY: y,
    head: [["Componente", "Funcionalidade"]],
    body: [
      ["SolutionSteps", "Passos de solução com checklist interativo"],
      ["GlossaryPanel", "Glossário de termos técnicos"],
      ["IntegratedContentViewer", "Visualizador de conteúdo integrado"],
      ["SourceSelector", "Seletor de fontes de informação"],
    ],
    theme: "striped",
    headStyles: { fillColor: [20, 30, 48], textColor: 255, fontSize: 8 },
    styles: { fontSize: 7, cellPadding: 2 },
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  y = addSubsectionTitle(doc, "2.4 Componentes de Assinatura", y);
  autoTable(doc, {
    startY: y,
    head: [["Componente", "Funcionalidade", "Props"]],
    body: [
      ["PlanCard", "Card de plano com detalhes", "plan, isCurrentPlan, onSelect"],
      ["FeatureGate", "Controle de funcionalidades por plano", "feature, children, fallback"],
      ["UpgradePrompt", "Prompt de upgrade para Pro", "feature, message"],
    ],
    theme: "striped",
    headStyles: { fillColor: [20, 30, 48], textColor: 255, fontSize: 8 },
    styles: { fontSize: 7, cellPadding: 2 },
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 15;

  // ===== SECTION 3: INTERACTIVE ELEMENTS =====
  doc.addPage();
  y = 30;
  y = addSectionTitle(doc, "3. ELEMENTOS INTERATIVOS (BOTÕES E AÇÕES)", y, pageWidth);

  y = addSubsectionTitle(doc, "3.1 Landing Page", y);
  autoTable(doc, {
    startY: y,
    head: [["Elemento", "Ação", "API/Função"]],
    body: [
      ["Começar Agora", "Navega para /cadastro", "navigate()"],
      ["Fazer Login", "Navega para /login", "navigate()"],
      ["Saiba Mais", "Scroll para seção", "scrollIntoView()"],
      ["Enviar Contato", "Envia formulário", "send-contact-email edge function"],
    ],
    theme: "striped",
    headStyles: { fillColor: [20, 30, 48], textColor: 255, fontSize: 8 },
    styles: { fontSize: 7, cellPadding: 2 },
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  y = addSubsectionTitle(doc, "3.2 Dashboard", y);
  autoTable(doc, {
    startY: y,
    head: [["Elemento", "Ação", "Validações", "API"]],
    body: [
      ["Novo Diagnóstico", "Inicia diagnóstico", "Veículo selecionado", "supabase.from('diagnostics').insert()"],
      ["Adicionar Veículo", "Modal de cadastro", "Marca, modelo, ano obrigatórios", "supabase.from('vehicles').insert()"],
      ["Conectar OBD", "Inicia conexão BT/WiFi", "Browser compatível", "navigator.bluetooth.requestDevice()"],
      ["Exportar PDF", "Gera relatório PDF", "-", "jsPDF"],
      ["Abrir Ticket", "Cria ticket de suporte", "Título e descrição", "supabase.from('support_tickets').insert()"],
    ],
    theme: "striped",
    headStyles: { fillColor: [20, 30, 48], textColor: 255, fontSize: 8 },
    styles: { fontSize: 6, cellPadding: 2 },
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  y = addSubsectionTitle(doc, "3.3 Admin", y);
  autoTable(doc, {
    startY: y,
    head: [["Elemento", "Ação", "API"]],
    body: [
      ["Enviar Alerta", "Envia alerta do sistema", "supabase.from('system_alerts').insert()"],
      ["Alterar Status Ticket", "Atualiza status", "supabase.from('support_tickets').update()"],
      ["Gerar Relatório", "Exporta dados em PDF", "jsPDF, jspdf-autotable"],
      ["Deletar Usuário", "Remove usuário (soft delete)", "supabase.auth.admin.deleteUser()"],
    ],
    theme: "striped",
    headStyles: { fillColor: [20, 30, 48], textColor: 255, fontSize: 8 },
    styles: { fontSize: 7, cellPadding: 2 },
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 15;

  // ===== SECTION 4: DATABASE =====
  doc.addPage();
  y = 30;
  y = addSectionTitle(doc, "4. BANCO DE DADOS", y, pageWidth);

  y = addSubsectionTitle(doc, "4.1 Estrutura das Tabelas Principais", y);
  autoTable(doc, {
    startY: y,
    head: [["Tabela", "Colunas", "RLS", "Índices", "Finalidade"]],
    body: [
      ["profiles", "8", "Sim", "Sim", "Dados do perfil do usuário"],
      ["user_roles", "4", "Sim", "Não", "Controle de papéis (admin/user)"],
      ["user_subscriptions", "11", "Sim", "Não", "Assinaturas e planos"],
      ["vehicles", "10", "Sim", "Sim", "Veículos cadastrados"],
      ["diagnostics", "8", "Sim", "Sim", "Sessões de diagnóstico"],
      ["diagnostic_items", "13", "Sim", "Sim", "Itens de cada diagnóstico (DTCs)"],
      ["support_tickets", "15", "Sim", "Sim", "Tickets de suporte"],
      ["ticket_messages", "6", "Sim", "Não", "Mensagens dos tickets"],
      ["data_recordings", "13", "Sim", "Sim", "Gravações de dados OBD"],
      ["obd_settings", "15", "Sim", "Sim", "Configurações OBD"],
      ["usage_tracking", "10", "Sim", "Sim", "Controle de uso mensal"],
      ["coding_executions", "14", "Sim", "Sim", "Histórico de codificações"],
      ["audit_logs", "11", "Sim", "Sim", "Logs de auditoria"],
      ["system_alerts", "15", "Sim", "Sim", "Alertas do sistema"],
      ["contact_messages", "9", "Sim", "Sim", "Mensagens de contato"],
    ],
    theme: "striped",
    headStyles: { fillColor: [20, 30, 48], textColor: 255, fontSize: 8 },
    styles: { fontSize: 7, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 15, halign: "center" },
      2: { cellWidth: 12, halign: "center" },
      3: { cellWidth: 15, halign: "center" },
      4: { cellWidth: "auto" },
    },
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  y = addSubsectionTitle(doc, "4.2 Enums do Banco de Dados", y);
  autoTable(doc, {
    startY: y,
    head: [["Enum", "Valores"]],
    body: [
      ["app_role", "admin, user"],
      ["diagnostic_priority", "critical, attention, preventive"],
      ["diagnostic_status", "pending, completed, resolved"],
      ["ticket_category", "technical, account, billing, diagnostic, general"],
      ["ticket_priority", "low, medium, high, urgent"],
      ["ticket_status", "open, in_progress, resolved, closed"],
    ],
    theme: "striped",
    headStyles: { fillColor: [20, 30, 48], textColor: 255, fontSize: 8 },
    styles: { fontSize: 8, cellPadding: 3 },
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  y = addSubsectionTitle(doc, "4.3 Funções do Banco", y);
  autoTable(doc, {
    startY: y,
    head: [["Função", "Propósito"]],
    body: [
      ["has_role(_user_id, _role)", "Verifica se usuário tem determinado papel"],
      ["handle_new_user()", "Trigger: cria perfil e role no signup"],
      ["update_updated_at_column()", "Trigger: atualiza timestamp automaticamente"],
      ["generate_ticket_number()", "Trigger: gera número único do ticket"],
    ],
    theme: "striped",
    headStyles: { fillColor: [20, 30, 48], textColor: 255, fontSize: 8 },
    styles: { fontSize: 8, cellPadding: 3 },
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 15;

  // ===== SECTION 5: INTEGRATIONS =====
  doc.addPage();
  y = 30;
  y = addSectionTitle(doc, "5. INTEGRAÇÕES E APIs", y, pageWidth);

  y = addSubsectionTitle(doc, "5.1 Supabase (Backend Principal)", y);
  autoTable(doc, {
    startY: y,
    head: [["Serviço", "Uso", "Autenticação"]],
    body: [
      ["Auth", "Autenticação de usuários", "JWT Token"],
      ["Database", "PostgreSQL com RLS", "JWT Token + RLS Policies"],
      ["Edge Functions", "Lógica serverless", "Service Role Key"],
      ["Realtime", "Atualizações em tempo real", "JWT Token"],
    ],
    theme: "striped",
    headStyles: { fillColor: [20, 30, 48], textColor: 255, fontSize: 8 },
    styles: { fontSize: 8, cellPadding: 3 },
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  y = addSubsectionTitle(doc, "5.2 APIs Externas", y);
  autoTable(doc, {
    startY: y,
    head: [["Serviço", "Propósito", "Secret"]],
    body: [
      ["Resend", "Envio de e-mails transacionais", "RESEND_API_KEY"],
      ["ElevenLabs", "Síntese de voz (acessibilidade)", "ELEVENLABS_API_KEY"],
      ["Firecrawl", "Web scraping para tutoriais", "FIRECRAWL_API_KEY"],
      ["Lovable AI", "IA para diagnósticos e soluções", "LOVABLE_API_KEY"],
    ],
    theme: "striped",
    headStyles: { fillColor: [20, 30, 48], textColor: 255, fontSize: 8 },
    styles: { fontSize: 8, cellPadding: 3 },
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  y = addSubsectionTitle(doc, "5.3 APIs do Navegador", y);
  autoTable(doc, {
    startY: y,
    head: [["API", "Uso", "Compatibilidade"]],
    body: [
      ["Web Bluetooth", "Conexão com OBD-II via Bluetooth", "Chrome, Edge (não Safari)"],
      ["WebSocket", "Conexão WiFi com OBD-II", "Todos os navegadores"],
      ["Service Worker", "Cache offline e PWA", "Todos os navegadores modernos"],
      ["Notifications", "Push notifications", "Chrome, Firefox, Edge"],
    ],
    theme: "striped",
    headStyles: { fillColor: [20, 30, 48], textColor: 255, fontSize: 8 },
    styles: { fontSize: 8, cellPadding: 3 },
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 15;

  // ===== SECTION 6: STATE MANAGEMENT =====
  doc.addPage();
  y = 30;
  y = addSectionTitle(doc, "6. GERENCIAMENTO DE ESTADO", y, pageWidth);

  y = addSubsectionTitle(doc, "6.1 Zustand (Estado Global)", y);
  y = addParagraph(doc, "O Zustand é utilizado para gerenciar o estado global da aplicação. O store principal está em src/store/useAppStore.ts e gerencia:", y, pageWidth);
  y = addBulletList(doc, [
    "activeVehicleId: Veículo atualmente selecionado",
    "vehicles: Lista de veículos do usuário em cache",
    "diagnostics: Lista de diagnósticos em cache",
    "obdConnectionStatus: Estado da conexão OBD (disconnected/connecting/connected)",
    "currentDiagnosticId: ID do diagnóstico em andamento",
  ], y, pageWidth);
  y += 5;

  y = addSubsectionTitle(doc, "6.2 Context APIs", y);
  autoTable(doc, {
    startY: y,
    head: [["Context", "Propósito", "Provider"]],
    body: [
      ["AuthContext", "Autenticação e sessão do usuário", "AuthProvider"],
      ["NotificationContext", "Notificações para usuários", "NotificationProvider"],
      ["AdminNotificationContext", "Notificações para admins", "AdminNotificationProvider"],
    ],
    theme: "striped",
    headStyles: { fillColor: [20, 30, 48], textColor: 255, fontSize: 8 },
    styles: { fontSize: 8, cellPadding: 3 },
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  y = addSubsectionTitle(doc, "6.3 React Query", y);
  y = addParagraph(doc, "React Query (@tanstack/react-query) é utilizado para gerenciar estado de servidor com cache, invalidação automática, retry em falhas e optimistic updates.", y, pageWidth);
  y += 5;

  y = addSubsectionTitle(doc, "6.4 Hooks Personalizados", y);
  autoTable(doc, {
    startY: y,
    head: [["Hook", "Propósito"]],
    body: [
      ["useAuth", "Autenticação e dados do usuário"],
      ["useSubscription", "Assinatura e limites do plano"],
      ["useUsageTracking", "Rastreamento de uso mensal"],
      ["useAuditLog", "Registro de ações para auditoria"],
      ["useAdmin", "Verificação de permissão admin"],
      ["useOBDSettings", "Configurações de conexão OBD"],
      ["useDataRecording", "Gravação de dados OBD"],
      ["useCodingHistory", "Histórico de funções de coding"],
      ["useKPITargets", "Metas de KPI para admin"],
      ["useLegalConsent", "Consentimentos legais do usuário"],
      ["useNotifications", "Sistema de notificações"],
      ["usePushNotifications", "Push notifications do navegador"],
      ["useChartPreferences", "Preferências de gráficos"],
    ],
    theme: "striped",
    headStyles: { fillColor: [20, 30, 48], textColor: 255, fontSize: 8 },
    styles: { fontSize: 7, cellPadding: 2 },
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 15;

  // ===== SECTION 7: AUTH =====
  doc.addPage();
  y = 30;
  y = addSectionTitle(doc, "7. AUTENTICAÇÃO E AUTORIZAÇÃO", y, pageWidth);

  y = addSubsectionTitle(doc, "7.1 Fluxo de Autenticação", y);
  y = addParagraph(doc, "1. Usuário acessa /login ou /cadastro", y, pageWidth);
  y = addParagraph(doc, "2. Insere email + senha e submete o formulário", y, pageWidth);
  y = addParagraph(doc, "3. Supabase Auth processa (signUp ou signInWithPassword)", y, pageWidth);
  y = addParagraph(doc, "4. onAuthStateChange() atualiza o contexto de autenticação", y, pageWidth);
  y = addParagraph(doc, "5. Usuário é redirecionado para /dashboard", y, pageWidth);
  y += 5;

  y = addSubsectionTitle(doc, "7.2 Tipos de Usuários e Permissões", y);
  autoTable(doc, {
    startY: y,
    head: [["Role", "Permissões"]],
    body: [
      ["user", "Acesso ao dashboard, veículos próprios, diagnósticos próprios, tickets próprios"],
      ["admin", "Acesso total + painel administrativo, gerenciamento de usuários, relatórios do sistema"],
    ],
    theme: "striped",
    headStyles: { fillColor: [20, 30, 48], textColor: 255, fontSize: 8 },
    styles: { fontSize: 8, cellPadding: 3 },
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  y = addSubsectionTitle(doc, "7.3 Proteção de Rotas", y);
  y = addParagraph(doc, "ProtectedRoute: Verifica se usuário está autenticado. Redireciona para /login se não estiver.", y, pageWidth);
  y = addParagraph(doc, "AdminProtectedRoute: Verifica role 'admin'. Redireciona para /dashboard se não for admin.", y, pageWidth);

  // ===== SECTION 8: CONFIG =====
  y += 10;
  y = addSectionTitle(doc, "8. CONFIGURAÇÕES E VARIÁVEIS DE AMBIENTE", y, pageWidth);

  y = addSubsectionTitle(doc, "8.1 Secrets Configurados (Supabase)", y);
  autoTable(doc, {
    startY: y,
    head: [["Nome", "Propósito"]],
    body: [
      ["SUPABASE_URL", "URL do projeto Supabase"],
      ["SUPABASE_ANON_KEY", "Chave pública para cliente"],
      ["SUPABASE_SERVICE_ROLE_KEY", "Chave de serviço para edge functions"],
      ["LOVABLE_API_KEY", "API Lovable AI"],
      ["RESEND_API_KEY", "API Resend (e-mails)"],
      ["ELEVENLABS_API_KEY", "API ElevenLabs (áudio)"],
      ["FIRECRAWL_API_KEY", "API Firecrawl (scraping)"],
    ],
    theme: "striped",
    headStyles: { fillColor: [20, 30, 48], textColor: 255, fontSize: 8 },
    styles: { fontSize: 8, cellPadding: 3 },
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  y = addSubsectionTitle(doc, "8.2 Dependências Principais", y);
  autoTable(doc, {
    startY: y,
    head: [["Pacote", "Versão", "Uso"]],
    body: [
      ["react", "^18.3.1", "Biblioteca UI principal"],
      ["react-router-dom", "^6.30.1", "Roteamento SPA"],
      ["@supabase/supabase-js", "^2.90.1", "Cliente Supabase"],
      ["@tanstack/react-query", "^5.83.0", "Gerenciamento de estado de servidor"],
      ["zustand", "^5.0.10", "Gerenciamento de estado global"],
      ["jspdf", "^4.0.0", "Geração de PDFs"],
      ["recharts", "^2.15.4", "Gráficos e visualizações"],
      ["framer-motion", "^12.26.2", "Animações"],
      ["zod", "^3.25.76", "Validação de schemas"],
    ],
    theme: "striped",
    headStyles: { fillColor: [20, 30, 48], textColor: 255, fontSize: 8 },
    styles: { fontSize: 7, cellPadding: 2 },
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 15;

  // ===== SECTION 9: DATA FLOWS =====
  doc.addPage();
  y = 30;
  y = addSectionTitle(doc, "9. FLUXOS DE DADOS", y, pageWidth);

  y = addSubsectionTitle(doc, "9.1 Fluxo de Diagnóstico", y);
  y = addParagraph(doc, "1. Usuário conecta adaptador OBD-II via Bluetooth ou WiFi", y, pageWidth);
  y = addParagraph(doc, "2. Sistema envia comandos ELM327 e lê códigos DTC do veículo", y, pageWidth);
  y = addParagraph(doc, "3. Edge function 'diagnose' processa os códigos com IA", y, pageWidth);
  y = addParagraph(doc, "4. Dados são salvos nas tabelas diagnostics e diagnostic_items", y, pageWidth);
  y = addParagraph(doc, "5. Relatório é gerado e exibido ao usuário", y, pageWidth);
  y = addParagraph(doc, "6. usage_tracking é incrementado para controle de limites", y, pageWidth);
  y += 5;

  y = addSubsectionTitle(doc, "9.2 Fluxo de Ticket de Suporte", y);
  y = addParagraph(doc, "1. Usuário cria ticket via formulário no /dashboard/suporte", y, pageWidth);
  y = addParagraph(doc, "2. Trigger generate_ticket_number() gera número único", y, pageWidth);
  y = addParagraph(doc, "3. Admin visualiza o ticket no painel /admin/tickets", y, pageWidth);
  y = addParagraph(doc, "4. Mensagens são trocadas via tabela ticket_messages", y, pageWidth);
  y = addParagraph(doc, "5. Status é atualizado conforme progresso (open → in_progress → resolved)", y, pageWidth);
  y += 5;

  y = addSubsectionTitle(doc, "9.3 Fluxo de Gravação de Dados", y);
  y = addParagraph(doc, "1. Usuário inicia gravação em /dashboard/gravacao-dados", y, pageWidth);
  y = addParagraph(doc, "2. Sistema coleta parâmetros OBD em tempo real (RPM, velocidade, etc)", y, pageWidth);
  y = addParagraph(doc, "3. Dados são salvos na tabela recording_data_points", y, pageWidth);
  y = addParagraph(doc, "4. Ao parar, duração e contadores são atualizados em data_recordings", y, pageWidth);
  y = addParagraph(doc, "5. Usuário pode exportar dados em CSV", y, pageWidth);

  // ===== SECTION 10: FILE STRUCTURE =====
  doc.addPage();
  y = 30;
  y = addSectionTitle(doc, "10. ESTRUTURA DE ARQUIVOS", y, pageWidth);

  y = addSubsectionTitle(doc, "Organização do Projeto", y);
  autoTable(doc, {
    startY: y,
    head: [["Pasta", "Conteúdo"]],
    body: [
      ["src/components/", "Componentes React organizados por funcionalidade"],
      ["src/components/ui/", "Componentes base do shadcn/ui"],
      ["src/components/admin/", "Componentes específicos do painel admin"],
      ["src/components/dashboard/", "Componentes do dashboard do usuário"],
      ["src/components/obd/", "Componentes de conexão OBD-II"],
      ["src/contexts/", "Context APIs (Auth, Notifications)"],
      ["src/hooks/", "Hooks customizados"],
      ["src/integrations/", "Integrações externas (Supabase)"],
      ["src/pages/", "Páginas/rotas da aplicação"],
      ["src/pages/admin/", "Páginas do painel administrativo"],
      ["src/pages/dashboard/", "Páginas do dashboard do usuário"],
      ["src/services/", "Serviços de negócio"],
      ["src/services/obd/", "Protocolo OBD/ELM327"],
      ["src/services/pdf/", "Geradores de PDF"],
      ["src/services/diagnostics/", "Motor de diagnóstico"],
      ["src/store/", "Zustand stores"],
      ["src/utils/", "Utilitários"],
      ["supabase/functions/", "Edge Functions"],
      ["e2e/", "Testes E2E Playwright"],
    ],
    theme: "striped",
    headStyles: { fillColor: [20, 30, 48], textColor: 255, fontSize: 8 },
    styles: { fontSize: 7, cellPadding: 2 },
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 15;

  // ===== SECTION 11: ERRORS AND WARNINGS =====
  doc.addPage();
  y = 30;
  y = addSectionTitle(doc, "11. ERROS, AVISOS E CUIDADOS", y, pageWidth);

  y = addSubsectionTitle(doc, "11.1 Avisos de Segurança", y);
  autoTable(doc, {
    startY: y,
    head: [["Nível", "Descrição", "Status"]],
    body: [
      ["AVISO", "Extensões instaladas no schema 'public'", "Requer ação manual"],
      ["AVISO", "Proteção de senhas vazadas desabilitada", "Requer ação manual"],
    ],
    theme: "striped",
    headStyles: { fillColor: [255, 193, 7], textColor: 0, fontSize: 8 },
    styles: { fontSize: 8, cellPadding: 3 },
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  y = addSubsectionTitle(doc, "11.2 Problemas Corrigidos Recentemente", y);
  autoTable(doc, {
    startY: y,
    head: [["Tipo", "Descrição", "Status"]],
    body: [
      ["Tabela", "usage_tracking criada - funcionalidade restaurada", "Corrigido"],
      ["Tabela", "coding_executions criada - funcionalidade restaurada", "Corrigido"],
      ["Tabela", "audit_logs criada - auditoria implementada", "Corrigido"],
      ["RLS", "Política USING(true) substituída por verificação adequada", "Corrigido"],
      ["TypeScript", "Removidos 'as any' em hooks", "Corrigido"],
    ],
    theme: "striped",
    headStyles: { fillColor: [34, 197, 94], textColor: 255, fontSize: 8 },
    styles: { fontSize: 8, cellPadding: 3 },
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  y = addSubsectionTitle(doc, "11.3 Cuidados Importantes", y);
  y = addBulletList(doc, [
    "Conexão Bluetooth/WiFi funciona apenas em browsers compatíveis (não Safari iOS)",
    "Limite de 1000 rows por query no Supabase - implementar paginação para tabelas grandes",
    "Edge functions têm timeout de 60 segundos - processos longos devem ser divididos",
    "Dados sensíveis (senhas, tokens) nunca devem ser logados ou expostos no frontend",
  ], y, pageWidth);

  // ===== SECTION 12: EDGE FUNCTIONS =====
  doc.addPage();
  y = 30;
  y = addSectionTitle(doc, "12. EDGE FUNCTIONS", y, pageWidth);

  autoTable(doc, {
    startY: y + 5,
    head: [["Função", "Método", "Propósito", "Secrets Utilizados"]],
    body: [
      ["diagnose", "POST", "Análise de códigos DTC com IA", "LOVABLE_API_KEY"],
      ["fetch-solution", "POST", "Busca soluções para DTCs", "LOVABLE_API_KEY, FIRECRAWL_API_KEY"],
      ["fetch-tutorial", "POST", "Busca tutoriais detalhados", "LOVABLE_API_KEY"],
      ["search-tutorials", "POST", "Pesquisa de tutoriais", "LOVABLE_API_KEY"],
      ["send-contact-email", "POST", "Envio de emails de contato", "RESEND_API_KEY"],
      ["send-notification", "POST", "Envio de notificações", "RESEND_API_KEY"],
      ["send-system-alert", "POST", "Envio de alertas do sistema", "RESEND_API_KEY"],
      ["send-usage-alert", "POST", "Alertas de limite de uso", "RESEND_API_KEY"],
      ["cache-admin", "POST", "Administração do cache", "-"],
      ["carcare-api", "POST", "API de cuidados com veículos", "LOVABLE_API_KEY"],
      ["check-kpi-alerts", "POST", "Verificação de KPIs", "-"],
    ],
    theme: "striped",
    headStyles: { fillColor: [20, 30, 48], textColor: 255, fontSize: 8 },
    styles: { fontSize: 7, cellPadding: 2 },
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 15;

  // ===== SECTION 13: FEEDBACK =====
  doc.addPage();
  y = 30;
  y = addSectionTitle(doc, "13. FEEDBACK DO SISTEMA (LINGUAGEM SIMPLES)", y, pageWidth);

  // Green box
  doc.setFillColor(220, 252, 231);
  doc.roundedRect(14, y, pageWidth - 28, 60, 3, 3, "F");
  doc.setDrawColor(34, 197, 94);
  doc.setLineWidth(0.5);
  doc.roundedRect(14, y, pageWidth - 28, 60, 3, 3, "S");

  y += 8;
  doc.setTextColor(22, 101, 52);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("O QUE ESTÁ FUNCIONANDO BEM", 18, y);
  y += 8;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const workingItems = [
    "Login e cadastro funcionam perfeitamente",
    "Cadastro de veículos está funcionando corretamente",
    "Sistema de tickets funciona bem",
    "Painel admin está completo",
    "PDFs estão sendo gerados corretamente",
    "Sistema de auditoria está implementado",
  ];
  workingItems.forEach((item) => {
    doc.text(`✓ ${item}`, 22, y);
    y += 5;
  });

  y += 15;

  // Yellow box
  doc.setFillColor(254, 249, 195);
  doc.roundedRect(14, y, pageWidth - 28, 45, 3, 3, "F");
  doc.setDrawColor(234, 179, 8);
  doc.roundedRect(14, y, pageWidth - 28, 45, 3, 3, "S");

  y += 8;
  doc.setTextColor(133, 77, 14);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("O QUE PRECISA DE ATENÇÃO", 18, y);
  y += 8;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const attentionItems = [
    "Conexão OBD no iOS não funciona (Safari não suporta Web Bluetooth)",
    "Integração Stripe não está configurada ainda",
    "Verificar se e-mails estão sendo enviados em produção",
  ];
  attentionItems.forEach((item) => {
    doc.text(`⚠ ${item}`, 22, y);
    y += 6;
  });

  y += 15;

  // Red box
  doc.setFillColor(254, 226, 226);
  doc.roundedRect(14, y, pageWidth - 28, 35, 3, 3, "F");
  doc.setDrawColor(239, 68, 68);
  doc.roundedRect(14, y, pageWidth - 28, 35, 3, 3, "S");

  y += 8;
  doc.setTextColor(153, 27, 27);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("O QUE NÃO FUNCIONA AINDA", 18, y);
  y += 8;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const notWorkingItems = [
    "Pagamentos reais (Stripe não integrado)",
    "App nativo completo (Capacitor configurado mas não buildado)",
  ];
  notWorkingItems.forEach((item) => {
    doc.text(`✗ ${item}`, 22, y);
    y += 6;
  });

  // ===== SECTION 14: PENDING IMPLEMENTATIONS =====
  doc.addPage();
  y = 30;
  y = addSectionTitle(doc, "14. IMPLEMENTAÇÕES PENDENTES", y, pageWidth);

  y = addSubsectionTitle(doc, "14.1 Crítico (Necessário para funcionar)", y);
  autoTable(doc, {
    startY: y,
    head: [["Item", "Descrição"]],
    body: [
      ["Integração Stripe", "Criar checkout session, webhooks, atualização automática de subscription"],
      ["Build App Nativo", "Compilar para Android (APK/AAB) e iOS (IPA), publicar nas lojas"],
      ["Conexão OBD Real", "Testar com adaptadores ELM327 reais, validar protocolos CAN/ISO"],
    ],
    theme: "striped",
    headStyles: { fillColor: [239, 68, 68], textColor: 255, fontSize: 8 },
    styles: { fontSize: 8, cellPadding: 3 },
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  y = addSubsectionTitle(doc, "14.2 Importante (Melhora a experiência)", y);
  autoTable(doc, {
    startY: y,
    head: [["Item", "Descrição"]],
    body: [
      ["Push Notifications Nativas", "Integrar com Firebase Cloud Messaging no app Capacitor"],
      ["Recuperação de Senha", "Testar fluxo completo, customizar e-mail"],
      ["Relatórios Avançados", "Comparativo entre diagnósticos, tendências de problemas"],
    ],
    theme: "striped",
    headStyles: { fillColor: [234, 179, 8], textColor: 0, fontSize: 8 },
    styles: { fontSize: 8, cellPadding: 3 },
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  y = addSubsectionTitle(doc, "14.3 Bom ter (Diferenciais)", y);
  autoTable(doc, {
    startY: y,
    head: [["Item", "Descrição"]],
    body: [
      ["Gamificação", "Badges por diagnósticos, ranking de usuários"],
      ["Integração com Oficinas", "Marketplace de serviços, agendamento online"],
      ["Modo Offline", "Salvar dados localmente, sincronizar quando online"],
    ],
    theme: "striped",
    headStyles: { fillColor: [59, 130, 246], textColor: 255, fontSize: 8 },
    styles: { fontSize: 8, cellPadding: 3 },
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 15;

  // ===== SECTION 15: SUGGESTIONS =====
  doc.addPage();
  y = 30;
  y = addSectionTitle(doc, "15. SUGESTÕES DE MELHORIA", y, pageWidth);

  y = addSubsectionTitle(doc, "15.1 Performance", y);
  y = addBulletList(doc, [
    "Implementar Lazy Loading de rotas para carregamento mais rápido",
    "Usar react-virtual para virtualização de listas grandes",
    "Implementar service worker para cache de assets",
    "Otimizar queries do banco com índices adequados",
  ], y, pageWidth);

  y = addSubsectionTitle(doc, "15.2 Segurança", y);
  y = addBulletList(doc, [
    "Implementar Rate Limiting para proteger contra brute force",
    "Usar Zod para validação de entrada em todas as APIs",
    "Detectar tentativas de acesso suspeito e alertar admins",
    "Habilitar Leaked Password Protection no Supabase",
  ], y, pageWidth);

  y = addSubsectionTitle(doc, "15.3 UX/UI", y);
  y = addBulletList(doc, [
    "Implementar onboarding guiado para novos usuários",
    "Adicionar modo offline com sincronização",
    "Melhorar acessibilidade (contraste, leitor de tela)",
    "Adicionar dark mode toggle acessível",
  ], y, pageWidth);

  y = addSubsectionTitle(doc, "15.4 Código e Qualidade", y);
  y = addBulletList(doc, [
    "Aumentar cobertura de testes E2E",
    "Adicionar testes unitários com Vitest",
    "Documentar funções críticas com JSDoc",
    "Criar Storybook para componentes",
    "Integrar Sentry para monitoramento de erros",
  ], y, pageWidth);

  // ===== FINAL PAGE - SUMMARY =====
  doc.addPage();
  y = 30;
  y = addSectionTitle(doc, "RESUMO EXECUTIVO", y, pageWidth);

  autoTable(doc, {
    startY: y + 5,
    head: [["Métrica", "Valor"]],
    body: [
      ["Total de Rotas", "35"],
      ["Tabelas no Banco", "19"],
      ["Edge Functions", "11"],
      ["Componentes", "80+"],
      ["Hooks Customizados", "15+"],
      ["Cobertura RLS", "100%"],
      ["Status Geral", "Funcional"],
    ],
    theme: "striped",
    headStyles: { fillColor: [20, 30, 48], textColor: 255, fontSize: 10 },
    styles: { fontSize: 10, cellPadding: 5 },
    columnStyles: {
      0: { fontStyle: "bold" },
      1: { halign: "center" },
    },
    margin: { left: 40, right: 40 },
  });

  y = (doc as any).lastAutoTable.finalY + 20;

  // Final note
  doc.setFillColor(240, 249, 255);
  doc.roundedRect(14, y, pageWidth - 28, 30, 3, 3, "F");
  doc.setDrawColor(59, 130, 246);
  doc.roundedRect(14, y, pageWidth - 28, 30, 3, 3, "S");

  doc.setTextColor(30, 64, 175);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("CONCLUSÃO", pageWidth / 2, y + 10, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("O sistema Doutor Motors está funcional e bem estruturado. Com a implementação", pageWidth / 2, y + 18, { align: "center" });
  doc.text("da integração Stripe e build do app nativo, estará pronto para produção completa.", pageWidth / 2, y + 24, { align: "center" });

  // ===== FOOTER ON ALL PAGES =====
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    // Header bar on all pages except cover
    if (i > 1) {
      doc.setFillColor(20, 30, 48);
      doc.rect(0, 0, pageWidth, 15, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.text("RELATÓRIO TÉCNICO - DOUTOR MOTORS", 14, 10);
      doc.text(format(new Date(), "dd/MM/yyyy"), pageWidth - 14, 10, { align: "right" });
    }
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Página ${i} de ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: "center" }
    );
  }

  // ===== DOWNLOAD =====
  const filename = `relatorio-tecnico-completo-${format(new Date(), "yyyy-MM-dd-HHmm")}.pdf`;
  doc.save(filename);
}
