import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PDFBaseGenerator, PDF_COLORS, PDF_LAYOUT } from "./pdfBaseGenerator";
import type { MaintenanceReminder } from "@/hooks/useMaintenanceReminders";

interface VehicleInfo {
  id: string;
  brand: string;
  model: string;
  year: number;
  plate?: string;
  current_mileage?: number;
}

interface MaintenanceReportData {
  vehicle: VehicleInfo;
  reminders: MaintenanceReminder[];
  userName?: string;
}

const PRIORITY_LABELS: Record<string, string> = {
  critical: "Crítico",
  attention: "Atenção",
  preventive: "Preventivo",
};

const PRIORITY_COLORS: Record<string, [number, number, number]> = {
  critical: PDF_COLORS.danger,
  attention: PDF_COLORS.warning,
  preventive: PDF_COLORS.info,
};

const REMINDER_TYPE_LABELS: Record<string, string> = {
  oil_change: "Troca de Óleo",
  tire_rotation: "Rodízio de Pneus",
  brake_inspection: "Inspeção de Freios",
  air_filter: "Filtro de Ar",
  coolant: "Fluido de Arrefecimento",
  transmission: "Óleo de Câmbio",
  battery: "Bateria",
  spark_plugs: "Velas de Ignição",
  timing_belt: "Correia Dentada",
  custom: "Personalizado",
};

export class MaintenanceReportGenerator extends PDFBaseGenerator {
  private data: MaintenanceReportData;

  constructor(data: MaintenanceReportData) {
    super();
    this.data = data;
  }

  generate(): void {
    const { vehicle, reminders, userName } = this.data;

    // Cover page
    this.addCoverPage({
      title: "Relatório de Manutenções",
      subtitle: `${vehicle.brand} ${vehicle.model} ${vehicle.year}`,
      description: vehicle.plate ? `Placa: ${vehicle.plate}` : undefined,
      version: "1.0",
      generatedBy: userName || "Doutor Motors",
    });

    // Start content page
    this.addNewPage();
    this.addPageHeader("Relatório de Manutenções");

    // Vehicle info section
    this.addSectionTitle("Informações do Veículo", "1");
    this.addVehicleInfo();

    // Summary section
    this.addSectionTitle("Resumo das Manutenções", "2");
    this.addSummary();

    // Overdue reminders
    const overdue = reminders.filter(r => !r.is_completed && new Date(r.due_date) < new Date());
    if (overdue.length > 0) {
      this.addSectionTitle("Manutenções Atrasadas", "3");
      this.addRemindersTable(overdue, PDF_COLORS.danger);
    }

    // Upcoming reminders
    const upcoming = reminders.filter(r => !r.is_completed && new Date(r.due_date) >= new Date());
    if (upcoming.length > 0) {
      const sectionNum = overdue.length > 0 ? "4" : "3";
      this.addSectionTitle("Manutenções Programadas", sectionNum);
      this.addRemindersTable(upcoming, PDF_COLORS.accent);
    }

    // Completed reminders
    const completed = reminders.filter(r => r.is_completed);
    if (completed.length > 0) {
      const sectionNum = (overdue.length > 0 ? 4 : 3) + (upcoming.length > 0 ? 1 : 0);
      this.addSectionTitle("Histórico de Manutenções", String(sectionNum));
      this.addCompletedTable(completed);
    }

    // Recommendations
    this.addNewPage();
    this.addPageHeader("Relatório de Manutenções");
    this.addSectionTitle("Recomendações", "5");
    this.addRecommendations();

    // Add footers
    this.addFooters("Relatório de Manutenções");

    // Save
    this.save(`manutencoes-${vehicle.brand}-${vehicle.model}`);
  }

  private addVehicleInfo(): void {
    const { vehicle } = this.data;
    
    const info = [
      ["Marca", vehicle.brand],
      ["Modelo", vehicle.model],
      ["Ano", String(vehicle.year)],
    ];
    
    if (vehicle.plate) {
      info.push(["Placa", vehicle.plate]);
    }
    
    if (vehicle.current_mileage) {
      info.push(["Quilometragem Atual", `${vehicle.current_mileage.toLocaleString("pt-BR")} km`]);
    }

    this.addTable({
      headers: ["Campo", "Valor"],
      data: info,
      columnWidths: [60, "auto"],
    });
  }

  private addSummary(): void {
    const { reminders } = this.data;
    const now = new Date();

    const total = reminders.length;
    const completed = reminders.filter(r => r.is_completed).length;
    const overdue = reminders.filter(r => !r.is_completed && new Date(r.due_date) < now).length;
    const upcoming = reminders.filter(r => !r.is_completed && new Date(r.due_date) >= now).length;

    const critical = reminders.filter(r => r.priority === "critical" && !r.is_completed).length;
    const attention = reminders.filter(r => r.priority === "attention" && !r.is_completed).length;
    const preventive = reminders.filter(r => r.priority === "preventive" && !r.is_completed).length;

    // Status box
    if (overdue > 0) {
      this.addColorBox({
        title: "ATENÇÃO: Manutenções Atrasadas",
        items: [
          `Você tem ${overdue} manutenção(ões) atrasada(s) que precisa(m) de atenção imediata.`,
          critical > 0 ? `${critical} item(ns) crítico(s) requer(em) ação urgente.` : "",
        ].filter(Boolean),
        bgColor: [254, 226, 226],
        borderColor: PDF_COLORS.danger,
        textColor: PDF_COLORS.danger,
        icon: "⚠️",
      });
    } else {
      this.addColorBox({
        title: "Status: Manutenções em Dia",
        items: [
          "Todas as manutenções estão em dia.",
          `Próximas ${upcoming} manutenções programadas.`,
        ],
        bgColor: [220, 252, 231],
        borderColor: PDF_COLORS.success,
        textColor: [21, 128, 61],
        icon: "✅",
      });
    }

    this.addSpace(5);

    // Summary table
    this.addTable({
      headers: ["Categoria", "Quantidade", "Percentual"],
      data: [
        ["Total de Lembretes", total, "100%"],
        ["Concluídos", completed, total > 0 ? `${Math.round((completed / total) * 100)}%` : "0%"],
        ["Atrasados", overdue, total > 0 ? `${Math.round((overdue / total) * 100)}%` : "0%"],
        ["Programados", upcoming, total > 0 ? `${Math.round((upcoming / total) * 100)}%` : "0%"],
      ],
    });

    this.addSubsectionTitle("Por Prioridade:");
    this.addTable({
      headers: ["Prioridade", "Pendentes"],
      data: [
        ["Crítico", critical],
        ["Atenção", attention],
        ["Preventivo", preventive],
      ],
      headerColor: PDF_COLORS.primaryLight,
    });
  }

  private addRemindersTable(reminders: MaintenanceReminder[], headerColor: [number, number, number]): void {
    const data = reminders.map(r => {
      const dueDate = new Date(r.due_date);
      const now = new Date();
      const daysUntil = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      let status = "";
      if (daysUntil < 0) {
        status = `${Math.abs(daysUntil)} dias atrasado`;
      } else if (daysUntil === 0) {
        status = "Vence hoje";
      } else {
        status = `Em ${daysUntil} dias`;
      }

      return [
        r.title,
        REMINDER_TYPE_LABELS[r.reminder_type] || r.reminder_type,
        PRIORITY_LABELS[r.priority] || r.priority,
        format(dueDate, "dd/MM/yyyy", { locale: ptBR }),
        r.due_mileage ? `${r.due_mileage.toLocaleString("pt-BR")} km` : "-",
        status,
      ];
    });

    this.addTable({
      headers: ["Título", "Tipo", "Prioridade", "Data Prevista", "Km Previsto", "Status"],
      data,
      headerColor,
      fontSize: 7,
    });
  }

  private addCompletedTable(reminders: MaintenanceReminder[]): void {
    const data = reminders.map(r => [
      r.title,
      REMINDER_TYPE_LABELS[r.reminder_type] || r.reminder_type,
      r.completed_at ? format(new Date(r.completed_at), "dd/MM/yyyy", { locale: ptBR }) : "-",
      r.last_service_mileage ? `${r.last_service_mileage.toLocaleString("pt-BR")} km` : "-",
    ]);

    this.addTable({
      headers: ["Título", "Tipo", "Data Conclusão", "Km na Conclusão"],
      data,
      headerColor: PDF_COLORS.success,
      fontSize: 7,
    });
  }

  private addRecommendations(): void {
    const { reminders } = this.data;
    const now = new Date();
    
    const overdue = reminders.filter(r => !r.is_completed && new Date(r.due_date) < now);
    const critical = reminders.filter(r => r.priority === "critical" && !r.is_completed);

    this.addParagraph(
      "Com base nas manutenções registradas, seguem as recomendações para manter seu veículo em perfeitas condições:"
    );

    const recommendations = [
      "Mantenha um registro atualizado de todas as manutenções realizadas.",
      "Siga os intervalos recomendados pelo fabricante do veículo.",
      "Priorize manutenções classificadas como 'Críticas' para evitar problemas graves.",
      "Considere a quilometragem e a idade do veículo ao planejar manutenções preventivas.",
    ];

    if (overdue.length > 0) {
      recommendations.unshift(
        `URGENTE: Realize as ${overdue.length} manutenção(ões) atrasada(s) o mais rápido possível.`
      );
    }

    if (critical.length > 0) {
      recommendations.splice(1, 0,
        `Atenção especial para ${critical.length} item(ns) crítico(s) pendente(s).`
      );
    }

    this.addBulletList(recommendations);

    this.addSpace(10);

    this.addColorBox({
      title: "Dica Importante",
      items: [
        "Use o aplicativo Doutor Motors para receber notificações automáticas",
        "quando suas manutenções estiverem próximas do vencimento.",
      ],
      bgColor: [239, 246, 255],
      borderColor: PDF_COLORS.info,
      textColor: PDF_COLORS.info,
      icon: "💡",
    });
  }
}

export function generateMaintenanceReport(data: MaintenanceReportData): void {
  const generator = new MaintenanceReportGenerator(data);
  generator.generate();
}

export default generateMaintenanceReport;
