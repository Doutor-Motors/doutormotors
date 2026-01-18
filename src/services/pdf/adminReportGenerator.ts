import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Color palette
const COLORS = {
  primary: [59, 130, 246] as [number, number, number],
  secondary: [99, 102, 241] as [number, number, number],
  success: [34, 197, 94] as [number, number, number],
  warning: [234, 179, 8] as [number, number, number],
  danger: [220, 38, 38] as [number, number, number],
  dark: [30, 41, 59] as [number, number, number],
  gray: [100, 116, 139] as [number, number, number],
  lightGray: [241, 245, 249] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
};

export interface SystemStats {
  totalUsers: number;
  totalVehicles: number;
  totalDiagnostics: number;
  pendingDiagnostics: number;
  completedDiagnostics: number;
  criticalIssues: number;
  activeToday: number;
  newUsersThisWeek: number;
}

export interface SubscriptionStats {
  basic: number;
  pro: number;
  total: number;
}

export interface TopUser {
  name: string;
  email: string;
  plan: 'basic' | 'pro';
  diagnosticsCount: number;
  vehiclesCount: number;
}

export interface DailyUsage {
  date: string;
  diagnostics: number;
  recordings: number;
  total: number;
}

export interface PeriodComparison {
  currentMonth: {
    diagnostics: number;
    recordings: number;
    newUsers: number;
  };
  previousMonth: {
    diagnostics: number;
    recordings: number;
    newUsers: number;
  };
}

export interface AdminReportOptions {
  stats: SystemStats;
  subscriptionStats: SubscriptionStats;
  topUsers: TopUser[];
  dailyUsage: DailyUsage[];
  periodComparison?: PeriodComparison;
  generatedBy?: string;
}

function addHeader(doc: jsPDF): number {
  // Header background
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, 210, 35, 'F');

  // Title
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('DOUTOR MOTORS', 15, 18);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Relatório Administrativo', 15, 27);

  // Date
  doc.setFontSize(10);
  doc.text(format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }), 195, 18, { align: 'right' });
  doc.text(format(new Date(), 'HH:mm'), 195, 25, { align: 'right' });

  return 45;
}

function addSectionTitle(doc: jsPDF, title: string, y: number): number {
  doc.setFillColor(...COLORS.lightGray);
  doc.rect(10, y - 5, 190, 10, 'F');
  
  doc.setTextColor(...COLORS.dark);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 15, y + 2);
  
  return y + 15;
}

function addStatCard(doc: jsPDF, x: number, y: number, label: string, value: string | number, color: [number, number, number] = COLORS.primary): void {
  const width = 42;
  const height = 25;
  
  // Card background
  doc.setFillColor(...COLORS.white);
  doc.setDrawColor(...COLORS.lightGray);
  doc.roundedRect(x, y, width, height, 2, 2, 'FD');
  
  // Value
  doc.setTextColor(...color);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(String(value), x + width / 2, y + 12, { align: 'center' });
  
  // Label
  doc.setTextColor(...COLORS.gray);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text(label, x + width / 2, y + 20, { align: 'center' });
}

export function generateAdminReport(options: AdminReportOptions): void {
  const doc = new jsPDF();
  const { stats, subscriptionStats, topUsers, dailyUsage, periodComparison, generatedBy } = options;

  let y = addHeader(doc);

  // System Overview Section
  y = addSectionTitle(doc, 'Visão Geral do Sistema', y);

  // Stats cards row 1
  addStatCard(doc, 15, y, 'Total Usuários', stats.totalUsers, COLORS.primary);
  addStatCard(doc, 62, y, 'Veículos', stats.totalVehicles, COLORS.success);
  addStatCard(doc, 109, y, 'Diagnósticos', stats.totalDiagnostics, COLORS.secondary);
  addStatCard(doc, 156, y, 'Críticos', stats.criticalIssues, COLORS.danger);

  y += 35;

  // Stats cards row 2
  addStatCard(doc, 15, y, 'Pendentes', stats.pendingDiagnostics, COLORS.warning);
  addStatCard(doc, 62, y, 'Concluídos', stats.completedDiagnostics, COLORS.success);
  addStatCard(doc, 109, y, 'Ativos Hoje', stats.activeToday, COLORS.primary);
  addStatCard(doc, 156, y, 'Novos (7d)', stats.newUsersThisWeek, COLORS.secondary);

  y += 40;

  // Period Comparison Section (if available)
  if (periodComparison) {
    y = addSectionTitle(doc, 'Comparativo Mensal', y);
    
    const calcVariation = (current: number, previous: number): string => {
      if (previous === 0) return current > 0 ? '+100%' : '0%';
      const variation = ((current - previous) / previous) * 100;
      return `${variation >= 0 ? '+' : ''}${variation.toFixed(1)}%`;
    };

    autoTable(doc, {
      startY: y,
      head: [['Métrica', 'Mês Anterior', 'Mês Atual', 'Variação']],
      body: [
        [
          'Diagnósticos',
          periodComparison.previousMonth.diagnostics.toString(),
          periodComparison.currentMonth.diagnostics.toString(),
          calcVariation(periodComparison.currentMonth.diagnostics, periodComparison.previousMonth.diagnostics),
        ],
        [
          'Gravações',
          periodComparison.previousMonth.recordings.toString(),
          periodComparison.currentMonth.recordings.toString(),
          calcVariation(periodComparison.currentMonth.recordings, periodComparison.previousMonth.recordings),
        ],
        [
          'Novos Usuários',
          periodComparison.previousMonth.newUsers.toString(),
          periodComparison.currentMonth.newUsers.toString(),
          calcVariation(periodComparison.currentMonth.newUsers, periodComparison.previousMonth.newUsers),
        ],
      ],
      theme: 'striped',
      headStyles: { fillColor: COLORS.primary, fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      margin: { left: 15, right: 15 },
      columnStyles: {
        3: { 
          fontStyle: 'bold',
          halign: 'center',
        },
      },
    });

    y = (doc as any).lastAutoTable.finalY + 15;
  }

  // Subscriptions Section
  y = addSectionTitle(doc, 'Distribuição de Assinaturas', y);
  
  const proPercentage = subscriptionStats.total > 0 
    ? ((subscriptionStats.pro / subscriptionStats.total) * 100).toFixed(1) 
    : '0';
  const basicPercentage = subscriptionStats.total > 0 
    ? ((subscriptionStats.basic / subscriptionStats.total) * 100).toFixed(1) 
    : '0';

  autoTable(doc, {
    startY: y,
    head: [['Plano', 'Usuários', 'Percentual']],
    body: [
      ['Basic', subscriptionStats.basic.toString(), `${basicPercentage}%`],
      ['Pro', subscriptionStats.pro.toString(), `${proPercentage}%`],
      ['Total', subscriptionStats.total.toString(), '100%'],
    ],
    theme: 'striped',
    headStyles: { fillColor: COLORS.secondary, fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    margin: { left: 15, right: 15 },
    columnStyles: {
      0: { fontStyle: 'bold' },
    },
  });

  y = (doc as any).lastAutoTable.finalY + 15;

  // Check if we need a new page
  if (y > 200) {
    doc.addPage();
    y = 20;
  }

  // Top Users Section
  y = addSectionTitle(doc, 'Top 10 Usuários Mais Ativos', y);

  autoTable(doc, {
    startY: y,
    head: [['#', 'Nome', 'Email', 'Plano', 'Veículos', 'Diagnósticos']],
    body: topUsers.slice(0, 10).map((user, index) => [
      (index + 1).toString(),
      user.name,
      user.email,
      user.plan === 'pro' ? 'Pro' : 'Basic',
      user.vehiclesCount.toString(),
      user.diagnosticsCount.toString(),
    ]),
    theme: 'striped',
    headStyles: { fillColor: COLORS.primary, fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    margin: { left: 15, right: 15 },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 40 },
      2: { cellWidth: 55 },
      3: { cellWidth: 20, halign: 'center' },
      4: { cellWidth: 20, halign: 'center' },
      5: { cellWidth: 25, halign: 'center' },
    },
  });

  y = (doc as any).lastAutoTable.finalY + 15;

  // Check if we need a new page for usage data
  if (y > 180) {
    doc.addPage();
    y = 20;
  }

  // Daily Usage Section (last 14 days)
  y = addSectionTitle(doc, 'Uso Diário (Últimos 14 dias)', y);

  const recentUsage = dailyUsage.slice(-14);
  autoTable(doc, {
    startY: y,
    head: [['Data', 'Diagnósticos', 'Gravações', 'Total']],
    body: recentUsage.map(day => [
      format(new Date(day.date), 'dd/MM', { locale: ptBR }),
      day.diagnostics.toString(),
      day.recordings.toString(),
      day.total.toString(),
    ]),
    theme: 'striped',
    headStyles: { fillColor: COLORS.success, fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    margin: { left: 15, right: 15 },
    columnStyles: {
      0: { halign: 'center' },
      1: { halign: 'center' },
      2: { halign: 'center' },
      3: { halign: 'center', fontStyle: 'bold' },
    },
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    // Footer line
    doc.setDrawColor(...COLORS.lightGray);
    doc.line(15, 285, 195, 285);
    
    // Footer text
    doc.setTextColor(...COLORS.gray);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    
    doc.text('Doutor Motors - Sistema de Diagnóstico Automotivo', 15, 291);
    doc.text(`Página ${i} de ${pageCount}`, 195, 291, { align: 'right' });
    
    if (generatedBy) {
      doc.text(`Gerado por: ${generatedBy}`, 105, 291, { align: 'center' });
    }
  }

  // Download the PDF
  const fileName = `relatorio-admin-${format(new Date(), 'yyyy-MM-dd-HHmm')}.pdf`;
  doc.save(fileName);
}

export default generateAdminReport;
