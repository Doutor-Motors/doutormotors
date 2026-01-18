import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PDFBaseGenerator, PDF_COLORS } from "./pdfBaseGenerator";

// ============================================
// GERADOR DE RELATÓRIO ADMINISTRATIVO
// ============================================

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
  plan: "basic" | "pro";
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

export function generateAdminReport(options: AdminReportOptions): void {
  const generator = new AdminReportGenerator(options);
  generator.generate();
}

export default generateAdminReport;

class AdminReportGenerator extends PDFBaseGenerator {
  private options: AdminReportOptions;

  constructor(options: AdminReportOptions) {
    super();
    this.options = options;
  }

  generate(): void {
    // CAPA
    this.addCoverPage({
      title: "RELATÓRIO ADMINISTRATIVO",
      subtitle: "Doutor Motors",
      description: "Métricas e Estatísticas do Sistema",
      generatedBy: this.options.generatedBy || "Admin",
    });

    // VISÃO GERAL
    this.addNewPage();
    this.addPageHeader("Relatório Administrativo - Doutor Motors");
    this.addSystemOverview();

    // COMPARATIVO
    if (this.options.periodComparison) {
      this.addPeriodComparison();
    }

    // ASSINATURAS
    this.addSubscriptionSection();

    // TOP USUÁRIOS
    this.addNewPage();
    this.addPageHeader("Relatório Administrativo - Doutor Motors");
    this.addTopUsersSection();

    // USO DIÁRIO
    this.addDailyUsageSection();

    // MARCA D'ÁGUA
    this.addWatermark();

    // RODAPÉS
    this.addFooters("Relatório Administrativo");

    // SALVAR
    this.save("relatorio-admin");
  }

  private addSystemOverview(): void {
    this.addSectionTitle("VISÃO GERAL DO SISTEMA", "1");

    const { stats } = this.options;

    // Tabela de métricas principais
    this.addTable({
      headers: ["Métrica", "Valor", "Descrição"],
      data: [
        ["Total de Usuários", stats.totalUsers.toString(), "Usuários cadastrados no sistema"],
        ["Total de Veículos", stats.totalVehicles.toString(), "Veículos registrados"],
        ["Total de Diagnósticos", stats.totalDiagnostics.toString(), "Diagnósticos realizados"],
        ["Diagnósticos Pendentes", stats.pendingDiagnostics.toString(), "Aguardando análise"],
        ["Diagnósticos Concluídos", stats.completedDiagnostics.toString(), "Finalizados com sucesso"],
        ["Problemas Críticos", stats.criticalIssues.toString(), "DTCs críticos detectados"],
        ["Ativos Hoje", stats.activeToday.toString(), "Usuários ativos nas últimas 24h"],
        ["Novos (7 dias)", stats.newUsersThisWeek.toString(), "Novos cadastros na semana"],
      ],
      fontSize: 9,
    });

    this.addSpace(10);

    // Status boxes
    const taxaConclusao = stats.totalDiagnostics > 0 
      ? ((stats.completedDiagnostics / stats.totalDiagnostics) * 100).toFixed(1) 
      : "0";

    this.addColorBox({
      title: "INDICADORES DE SAÚDE",
      items: [
        `✓ Taxa de conclusão de diagnósticos: ${taxaConclusao}%`,
        `✓ Média de veículos por usuário: ${stats.totalUsers > 0 ? (stats.totalVehicles / stats.totalUsers).toFixed(1) : "0"}`,
        `✓ Taxa de engajamento diário: ${stats.totalUsers > 0 ? ((stats.activeToday / stats.totalUsers) * 100).toFixed(1) : "0"}%`,
      ],
      bgColor: [220, 252, 231],
      borderColor: PDF_COLORS.success,
      textColor: [22, 101, 52],
    });
  }

  private addPeriodComparison(): void {
    if (!this.options.periodComparison) return;

    this.addSpace(10);
    this.addSectionTitle("COMPARATIVO MENSAL", "2");

    const { currentMonth, previousMonth } = this.options.periodComparison;

    const calcVariation = (current: number, previous: number): string => {
      if (previous === 0) return current > 0 ? "+100%" : "0%";
      const variation = ((current - previous) / previous) * 100;
      return `${variation >= 0 ? "+" : ""}${variation.toFixed(1)}%`;
    };

    this.addTable({
      headers: ["Métrica", "Mês Anterior", "Mês Atual", "Variação"],
      data: [
        [
          "Diagnósticos",
          previousMonth.diagnostics.toString(),
          currentMonth.diagnostics.toString(),
          calcVariation(currentMonth.diagnostics, previousMonth.diagnostics),
        ],
        [
          "Gravações de Dados",
          previousMonth.recordings.toString(),
          currentMonth.recordings.toString(),
          calcVariation(currentMonth.recordings, previousMonth.recordings),
        ],
        [
          "Novos Usuários",
          previousMonth.newUsers.toString(),
          currentMonth.newUsers.toString(),
          calcVariation(currentMonth.newUsers, previousMonth.newUsers),
        ],
      ],
      headerColor: PDF_COLORS.accent,
    });
  }

  private addSubscriptionSection(): void {
    this.addSpace(10);
    this.addSectionTitle("DISTRIBUIÇÃO DE ASSINATURAS", "3");

    const { subscriptionStats } = this.options;

    const proPercentage = subscriptionStats.total > 0
      ? ((subscriptionStats.pro / subscriptionStats.total) * 100).toFixed(1)
      : "0";
    const basicPercentage = subscriptionStats.total > 0
      ? ((subscriptionStats.basic / subscriptionStats.total) * 100).toFixed(1)
      : "0";

    this.addTable({
      headers: ["Plano", "Usuários", "Percentual"],
      data: [
        ["Basic (Gratuito)", subscriptionStats.basic.toString(), `${basicPercentage}%`],
        ["Pro (Premium)", subscriptionStats.pro.toString(), `${proPercentage}%`],
        ["Total", subscriptionStats.total.toString(), "100%"],
      ],
      headerColor: PDF_COLORS.info,
    });

    // Análise de conversão
    this.addSpace(5);
    this.addColorBox({
      title: "ANÁLISE DE CONVERSÃO",
      items: [
        `📊 Taxa de conversão para Pro: ${proPercentage}%`,
        `💰 Potencial de receita: ${subscriptionStats.basic} usuários Basic podem converter`,
        `📈 Recomendação: Implementar campanhas de upgrade para usuários ativos`,
      ],
      bgColor: [240, 249, 255],
      borderColor: PDF_COLORS.info,
      textColor: [30, 64, 175],
    });
  }

  private addTopUsersSection(): void {
    this.addSectionTitle("TOP 10 USUÁRIOS MAIS ATIVOS", "4");

    const topUsersData = this.options.topUsers.slice(0, 10).map((user, index) => [
      (index + 1).toString(),
      user.name || "N/A",
      user.email,
      user.plan === "pro" ? "Pro" : "Basic",
      user.vehiclesCount.toString(),
      user.diagnosticsCount.toString(),
    ]);

    if (topUsersData.length === 0) {
      this.addParagraph("Nenhum usuário encontrado com atividade registrada.");
    } else {
      this.addTable({
        headers: ["#", "Nome", "Email", "Plano", "Veículos", "Diagnósticos"],
        data: topUsersData,
        columnWidths: [10, 40, 55, 20, 20, 25],
        fontSize: 7,
      });
    }
  }

  private addDailyUsageSection(): void {
    this.addSpace(10);
    this.addSectionTitle("USO DIÁRIO (ÚLTIMOS 14 DIAS)", "5");

    const recentUsage = this.options.dailyUsage.slice(-14);

    if (recentUsage.length === 0) {
      this.addParagraph("Nenhum dado de uso diário disponível.");
    } else {
      const usageData = recentUsage.map(day => [
        format(new Date(day.date), "dd/MM", { locale: ptBR }),
        day.diagnostics.toString(),
        day.recordings.toString(),
        day.total.toString(),
      ]);

      this.addTable({
        headers: ["Data", "Diagnósticos", "Gravações", "Total"],
        data: usageData,
        headerColor: PDF_COLORS.success,
        fontSize: 8,
      });

      // Média diária
      const totalDiagnostics = recentUsage.reduce((sum, d) => sum + d.diagnostics, 0);
      const totalRecordings = recentUsage.reduce((sum, d) => sum + d.recordings, 0);
      const avgDiagnostics = (totalDiagnostics / recentUsage.length).toFixed(1);
      const avgRecordings = (totalRecordings / recentUsage.length).toFixed(1);

      this.addSpace(5);
      this.addColorBox({
        title: "MÉDIAS DO PERÍODO",
        items: [
          `📊 Média de diagnósticos/dia: ${avgDiagnostics}`,
          `📹 Média de gravações/dia: ${avgRecordings}`,
          `📈 Total no período: ${totalDiagnostics + totalRecordings} operações`,
        ],
        bgColor: [220, 252, 231],
        borderColor: PDF_COLORS.success,
        textColor: [22, 101, 52],
      });
    }
  }
}
