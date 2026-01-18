import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface SystemScanReport {
  generatedAt: string;
  generatedBy: string;
  summary: {
    totalTables: number;
    totalEdgeFunctions: number;
    totalPages: number;
    totalHooks: number;
    securityWarnings: number;
    criticalIssuesFixed: number;
  };
  tables: TableInfo[];
  edgeFunctions: EdgeFunctionInfo[];
  securityIssues: SecurityIssue[];
  corrections: Correction[];
  recommendations: string[];
}

interface TableInfo {
  name: string;
  columns: number;
  hasRLS: boolean;
  hasIndexes: boolean;
  purpose: string;
}

interface EdgeFunctionInfo {
  name: string;
  purpose: string;
  endpoints: string[];
}

interface SecurityIssue {
  level: "critical" | "warning" | "info";
  description: string;
  status: "fixed" | "pending" | "manual";
}

interface Correction {
  type: string;
  description: string;
  status: "applied" | "pending";
}

export function generateSystemScanReport(data: SystemScanReport): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 20;

  // ===== HEADER =====
  doc.setFillColor(20, 30, 48);
  doc.rect(0, 0, pageWidth, 45, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("RELATÓRIO DE VARREDURA DO SISTEMA", pageWidth / 2, 22, { align: "center" });

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Doutor Motors - Análise Completa de Arquitetura", pageWidth / 2, 32, { align: "center" });

  doc.setFontSize(10);
  doc.text(`Gerado em: ${format(new Date(data.generatedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, pageWidth / 2, 40, { align: "center" });

  yPosition = 55;

  // ===== RESUMO EXECUTIVO =====
  doc.setTextColor(20, 30, 48);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("1. RESUMO EXECUTIVO", 14, yPosition);
  yPosition += 10;

  const summaryData = [
    ["Total de Tabelas no Banco", data.summary.totalTables.toString()],
    ["Edge Functions Ativas", data.summary.totalEdgeFunctions.toString()],
    ["Páginas no Frontend", data.summary.totalPages.toString()],
    ["Hooks Customizados", data.summary.totalHooks.toString()],
    ["Avisos de Segurança", data.summary.securityWarnings.toString()],
    ["Problemas Críticos Corrigidos", data.summary.criticalIssuesFixed.toString()],
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [["Métrica", "Valor"]],
    body: summaryData,
    theme: "striped",
    headStyles: { fillColor: [20, 30, 48], textColor: 255 },
    styles: { fontSize: 10 },
    margin: { left: 14, right: 14 },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // ===== ESTRUTURA DO BANCO DE DADOS =====
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("2. ESTRUTURA DO BANCO DE DADOS", 14, yPosition);
  yPosition += 10;

  const tableData = data.tables.map((t) => [
    t.name,
    t.columns.toString(),
    t.hasRLS ? "✓ Sim" : "✗ Não",
    t.hasIndexes ? "✓ Sim" : "✗ Não",
    t.purpose,
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [["Tabela", "Colunas", "RLS", "Índices", "Finalidade"]],
    body: tableData,
    theme: "striped",
    headStyles: { fillColor: [20, 30, 48], textColor: 255 },
    styles: { fontSize: 8, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 15, halign: "center" },
      2: { cellWidth: 15, halign: "center" },
      3: { cellWidth: 15, halign: "center" },
      4: { cellWidth: "auto" },
    },
    margin: { left: 14, right: 14 },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Check if we need a new page
  if (yPosition > 240) {
    doc.addPage();
    yPosition = 20;
  }

  // ===== EDGE FUNCTIONS =====
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("3. EDGE FUNCTIONS (BACKEND)", 14, yPosition);
  yPosition += 10;

  const edgeFunctionData = data.edgeFunctions.map((ef) => [
    ef.name,
    ef.purpose,
    ef.endpoints.join(", "),
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [["Função", "Finalidade", "Endpoints"]],
    body: edgeFunctionData,
    theme: "striped",
    headStyles: { fillColor: [20, 30, 48], textColor: 255 },
    styles: { fontSize: 9 },
    margin: { left: 14, right: 14 },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Check if we need a new page
  if (yPosition > 220) {
    doc.addPage();
    yPosition = 20;
  }

  // ===== PROBLEMAS DE SEGURANÇA =====
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("4. ANÁLISE DE SEGURANÇA", 14, yPosition);
  yPosition += 10;

  const securityData = data.securityIssues.map((issue) => {
    const levelText = issue.level === "critical" ? "🔴 CRÍTICO" : issue.level === "warning" ? "🟡 AVISO" : "🔵 INFO";
    const statusText = issue.status === "fixed" ? "✓ Corrigido" : issue.status === "pending" ? "⏳ Pendente" : "👤 Manual";
    return [levelText, issue.description, statusText];
  });

  autoTable(doc, {
    startY: yPosition,
    head: [["Nível", "Descrição", "Status"]],
    body: securityData,
    theme: "striped",
    headStyles: { fillColor: [20, 30, 48], textColor: 255 },
    styles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: "auto" },
      2: { cellWidth: 30 },
    },
    margin: { left: 14, right: 14 },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Check if we need a new page
  if (yPosition > 220) {
    doc.addPage();
    yPosition = 20;
  }

  // ===== CORREÇÕES APLICADAS =====
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("5. CORREÇÕES APLICADAS", 14, yPosition);
  yPosition += 10;

  const correctionData = data.corrections.map((c) => [
    c.type,
    c.description,
    c.status === "applied" ? "✓ Aplicado" : "⏳ Pendente",
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [["Tipo", "Descrição", "Status"]],
    body: correctionData,
    theme: "striped",
    headStyles: { fillColor: [20, 30, 48], textColor: 255 },
    styles: { fontSize: 9 },
    margin: { left: 14, right: 14 },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Check if we need a new page
  if (yPosition > 220) {
    doc.addPage();
    yPosition = 20;
  }

  // ===== RECOMENDAÇÕES =====
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("6. RECOMENDAÇÕES FUTURAS", 14, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  data.recommendations.forEach((rec, index) => {
    const lines = doc.splitTextToSize(`${index + 1}. ${rec}`, pageWidth - 28);
    if (yPosition + lines.length * 5 > 280) {
      doc.addPage();
      yPosition = 20;
    }
    doc.text(lines, 14, yPosition);
    yPosition += lines.length * 5 + 3;
  });

  // ===== FOOTER =====
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Doutor Motors - Relatório de Varredura | Página ${i} de ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
  }

  // ===== DOWNLOAD =====
  const filename = `relatorio-varredura-sistema-${format(new Date(), "yyyy-MM-dd-HHmm")}.pdf`;
  doc.save(filename);
}

// Função para gerar relatório com dados do sistema atual
export function generateCurrentSystemReport(): void {
  const reportData: SystemScanReport = {
    generatedAt: new Date().toISOString(),
    generatedBy: "Sistema Automatizado",
    summary: {
      totalTables: 19,
      totalEdgeFunctions: 11,
      totalPages: 35,
      totalHooks: 17,
      securityWarnings: 3,
      criticalIssuesFixed: 2,
    },
    tables: [
      { name: "profiles", columns: 8, hasRLS: true, hasIndexes: true, purpose: "Dados do perfil do usuário" },
      { name: "user_roles", columns: 4, hasRLS: true, hasIndexes: false, purpose: "Controle de papéis (admin/user)" },
      { name: "user_subscriptions", columns: 11, hasRLS: true, hasIndexes: false, purpose: "Assinaturas e planos" },
      { name: "vehicles", columns: 10, hasRLS: true, hasIndexes: true, purpose: "Veículos cadastrados" },
      { name: "diagnostics", columns: 8, hasRLS: true, hasIndexes: true, purpose: "Sessões de diagnóstico" },
      { name: "diagnostic_items", columns: 13, hasRLS: true, hasIndexes: true, purpose: "Itens de cada diagnóstico (DTCs)" },
      { name: "support_tickets", columns: 15, hasRLS: true, hasIndexes: true, purpose: "Tickets de suporte" },
      { name: "ticket_messages", columns: 6, hasRLS: true, hasIndexes: false, purpose: "Mensagens dos tickets" },
      { name: "data_recordings", columns: 13, hasRLS: true, hasIndexes: true, purpose: "Gravações de dados OBD" },
      { name: "recording_data_points", columns: 5, hasRLS: true, hasIndexes: true, purpose: "Pontos de dados gravados" },
      { name: "obd_settings", columns: 15, hasRLS: true, hasIndexes: true, purpose: "Configurações OBD do usuário" },
      { name: "legal_consents", columns: 8, hasRLS: true, hasIndexes: true, purpose: "Consentimentos legais" },
      { name: "system_alerts", columns: 15, hasRLS: true, hasIndexes: true, purpose: "Alertas do sistema" },
      { name: "system_settings", columns: 7, hasRLS: true, hasIndexes: false, purpose: "Configurações do sistema" },
      { name: "contact_messages", columns: 9, hasRLS: true, hasIndexes: true, purpose: "Mensagens de contato" },
      { name: "user_notification_preferences", columns: 9, hasRLS: true, hasIndexes: false, purpose: "Preferências de notificação" },
      { name: "video_transcription_cache", columns: 13, hasRLS: true, hasIndexes: true, purpose: "Cache de transcrições de vídeo" },
      { name: "usage_tracking", columns: 10, hasRLS: true, hasIndexes: true, purpose: "Controle de uso mensal" },
      { name: "coding_executions", columns: 14, hasRLS: true, hasIndexes: true, purpose: "Histórico de codificações" },
    ],
    edgeFunctions: [
      { name: "diagnose", purpose: "Análise de códigos DTC com IA", endpoints: ["POST /diagnose"] },
      { name: "fetch-solution", purpose: "Busca soluções para DTCs", endpoints: ["POST /fetch-solution"] },
      { name: "fetch-tutorial", purpose: "Busca tutoriais detalhados", endpoints: ["POST /fetch-tutorial"] },
      { name: "search-tutorials", purpose: "Pesquisa de tutoriais", endpoints: ["POST /search-tutorials"] },
      { name: "send-contact-email", purpose: "Envio de emails de contato", endpoints: ["POST /send-contact-email"] },
      { name: "send-notification", purpose: "Envio de notificações", endpoints: ["POST /send-notification"] },
      { name: "send-system-alert", purpose: "Envio de alertas do sistema", endpoints: ["POST /send-system-alert"] },
      { name: "send-usage-alert", purpose: "Alertas de limite de uso", endpoints: ["POST /send-usage-alert"] },
      { name: "cache-admin", purpose: "Administração do cache", endpoints: ["POST /cache-admin"] },
      { name: "carcare-api", purpose: "API de cuidados com veículos", endpoints: ["POST /carcare-api"] },
      { name: "check-kpi-alerts", purpose: "Verificação de KPIs", endpoints: ["POST /check-kpi-alerts"] },
    ],
    securityIssues: [
      { level: "critical", description: "Tabela usage_tracking não existia - funcionalidade quebrada", status: "fixed" },
      { level: "critical", description: "Tabela coding_executions não existia - funcionalidade quebrada", status: "fixed" },
      { level: "warning", description: "RLS Policy 'USING (true)' em user_subscriptions para UPDATE", status: "fixed" },
      { level: "warning", description: "Extensões instaladas no schema 'public'", status: "manual" },
      { level: "warning", description: "Proteção de senhas vazadas desabilitada", status: "manual" },
      { level: "info", description: "Cache de vídeo permite SELECT público (intencional)", status: "pending" },
    ],
    corrections: [
      { type: "Tabela Criada", description: "usage_tracking - Controle de uso mensal por usuário", status: "applied" },
      { type: "Tabela Criada", description: "coding_executions - Histórico de funções de codificação", status: "applied" },
      { type: "RLS Corrigido", description: "Substituída política USING(true) por verificação de usuário/admin", status: "applied" },
      { type: "Índices Criados", description: "Índices para diagnostic_items, diagnostics, vehicles, tickets", status: "applied" },
      { type: "Trigger Criado", description: "update_usage_tracking_updated_at para timestamp automático", status: "applied" },
      { type: "Hook Atualizado", description: "useUsageTracking.ts - Removido 'as any' type casting", status: "applied" },
      { type: "Hook Atualizado", description: "useCodingHistory.ts - Removido 'as any' type casting", status: "applied" },
    ],
    recommendations: [
      "Habilitar 'Leaked Password Protection' nas configurações de autenticação do Supabase para maior segurança de senhas.",
      "Mover extensões do schema 'public' para um schema dedicado como 'extensions' para melhor organização.",
      "Implementar Stripe Webhooks para atualização automática de assinaturas após pagamentos.",
      "Adicionar tabela de auditoria (audit_logs) para registrar ações críticas dos usuários.",
      "Implementar soft delete em tabelas críticas para evitar perda de dados históricos.",
      "Configurar backups automáticos diários do banco de dados.",
      "Adicionar monitoramento de performance com métricas de tempo de resposta das queries.",
      "Implementar rate limiting nas edge functions para evitar abuso.",
    ],
  };

  generateSystemScanReport(reportData);
}
