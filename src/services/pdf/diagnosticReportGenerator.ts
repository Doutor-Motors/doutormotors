import PDFBaseGenerator, { PDF_COLORS, PDF_LAYOUT } from './pdfBaseGenerator';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface DiagnosticItemData {
  dtc_code: string;
  description_human: string;
  priority: 'critical' | 'attention' | 'preventive';
  severity: number;
  can_diy: boolean;
  diy_difficulty?: number | null;
  probable_causes?: string[] | null;
  status: string;
}

export interface VehicleData {
  brand: string;
  model: string;
  year: number;
  license_plate?: string | null;
  engine?: string | null;
  fuel_type?: string | null;
}

export interface DiagnosticData {
  id: string;
  created_at: string;
  status: string;
  notes?: string | null;
}

export interface PDFGeneratorOptions {
  diagnostic: DiagnosticData;
  items: DiagnosticItemData[];
  vehicle: VehicleData;
  userName?: string;
  includeDisclaimer?: boolean;
}

// Mapeamento de status e prioridades
const PRIORITY_LABELS: Record<string, string> = {
  critical: 'CRÍTICO',
  attention: 'ATENÇÃO',
  preventive: 'PREVENTIVO',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente',
  completed: 'Concluído',
  resolved: 'Resolvido',
};

export class DiagnosticReportPDF extends PDFBaseGenerator {
  constructor() {
    super();
  }

  public async generate(options: PDFGeneratorOptions): Promise<Blob> {
    const { diagnostic, items, vehicle, userName, includeDisclaimer = true } = options;
    const dateStr = format(new Date(diagnostic.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

    // 1. Capa
    this.addCoverPage({
      title: 'Relatório de Diagnóstico',
      subtitle: `${vehicle.brand} ${vehicle.model} ${vehicle.year}`,
      description: 'Análise completa dos sistemas eletrônicos do veículo.',
      generatedBy: userName || 'Doutor Motors',
      version: '1.0'
    });

    this.addNewPage();

    // 2. Cabeçalho da página
    this.addPageHeader('Relatório Técnico de Diagnóstico');

    // 3. Informações do Veículo
    this.addVehicleSection(vehicle);

    // 4. Informações do Diagnóstico
    this.addDiagnosticInfoSection(diagnostic, userName);

    // 5. Resumo Executivo (Cards Coloridos)
    this.addSummaryStats(items);

    // 6. Tabela de Códigos
    this.addCodesTable(items);

    // 7. Detalhamento dos códigos
    this.addDetailedItems(items);

    // 8. Aviso Legal
    if (includeDisclaimer) {
      this.addDisclaimer();
    }

    // 9. Rodapés
    this.addFooters('Relatório de Diagnóstico');

    return this.doc.output('blob');
  }

  private addVehicleSection(vehicle: VehicleData): void {
    this.addSectionTitle('Informações do Veículo');

    // Preparar dados para o box
    const items = [
      `Marca/Modelo: ${vehicle.brand} ${vehicle.model} ${vehicle.year}`,
    ];

    if (vehicle.license_plate) items.push(`Placa: ${vehicle.license_plate}`);
    if (vehicle.engine) items.push(`Motorização: ${vehicle.engine}`);
    if (vehicle.fuel_type) items.push(`Combustível: ${vehicle.fuel_type}`);

    this.addColorBox({
      title: 'Dados do Veículo',
      items: items,
      bgColor: PDF_COLORS.lightGray,
      borderColor: PDF_COLORS.gray,
      textColor: PDF_COLORS.text,
      icon: '🚗'
    });
  }

  private addDiagnosticInfoSection(diagnostic: DiagnosticData, userName?: string): void {
    this.addSectionTitle('Informações da Análise');

    const diagDate = format(new Date(diagnostic.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    const status = STATUS_LABELS[diagnostic.status] || diagnostic.status;

    const items = [
      `ID do Diagnóstico: ${diagnostic.id.substring(0, 8).toUpperCase()}`,
      `Data da Análise: ${diagDate}`,
      `Status: ${status.toUpperCase()}`
    ];

    if (userName) items.push(`Responsável Técnico: ${userName}`);
    if (diagnostic.notes) items.push(`Observações: ${diagnostic.notes}`);

    this.addColorBox({
      title: 'Detalhes da Execução',
      items: items,
      bgColor: [240, 249, 255], // Light blue
      borderColor: PDF_COLORS.info,
      textColor: PDF_COLORS.primary,
      icon: '📋'
    });
  }

  private addSummaryStats(items: DiagnosticItemData[]): void {
    this.addSectionTitle('Resumo dos Resultados');
    this.ensureSpace(30);

    const criticalCount = items.filter(i => i.priority === 'critical').length;
    const attentionCount = items.filter(i => i.priority === 'attention').length;
    const preventiveCount = items.filter(i => i.priority === 'preventive').length;

    // Desenhar "mini boxes" lado a lado manualmente pois a base class não tem suporte direto a grid
    const y = this.currentY;
    const boxWidth = 55;
    const height = 25;

    // Critical
    this.doc.setFillColor(...PDF_COLORS.danger);
    this.doc.roundedRect(PDF_LAYOUT.marginLeft, y, boxWidth, height, 2, 2, 'F');
    this.doc.setTextColor(...PDF_COLORS.white);
    this.doc.setFontSize(20);
    this.doc.text(String(criticalCount), PDF_LAYOUT.marginLeft + boxWidth / 2, y + 12, { align: 'center' });
    this.doc.setFontSize(8);
    this.doc.text('CRÍTICOS', PDF_LAYOUT.marginLeft + boxWidth / 2, y + 20, { align: 'center' });

    // Attention
    this.doc.setFillColor(...PDF_COLORS.warning);
    this.doc.roundedRect(PDF_LAYOUT.marginLeft + boxWidth + 5, y, boxWidth, height, 2, 2, 'F');
    this.doc.setTextColor(...PDF_COLORS.white);
    this.doc.setFontSize(20);
    this.doc.text(String(attentionCount), PDF_LAYOUT.marginLeft + boxWidth + 5 + boxWidth / 2, y + 12, { align: 'center' });
    this.doc.setFontSize(8);
    this.doc.text('ATENÇÃO', PDF_LAYOUT.marginLeft + boxWidth + 5 + boxWidth / 2, y + 20, { align: 'center' });

    // Preventive
    this.doc.setFillColor(...PDF_COLORS.success);
    this.doc.roundedRect(PDF_LAYOUT.marginLeft + (boxWidth + 5) * 2, y, boxWidth, height, 2, 2, 'F');
    this.doc.setTextColor(...PDF_COLORS.white);
    this.doc.setFontSize(20);
    this.doc.text(String(preventiveCount), PDF_LAYOUT.marginLeft + (boxWidth + 5) * 2 + boxWidth / 2, y + 12, { align: 'center' });
    this.doc.setFontSize(8);
    this.doc.text('PREVENTIVOS', PDF_LAYOUT.marginLeft + (boxWidth + 5) * 2 + boxWidth / 2, y + 20, { align: 'center' });

    this.currentY += height + 10;
  }

  private addCodesTable(items: DiagnosticItemData[]): void {
    const tableData = items.map(item => [
      item.dtc_code,
      item.description_human.length > 60 ? item.description_human.substring(0, 60) + '...' : item.description_human,
      PRIORITY_LABELS[item.priority] || item.priority,
      item.can_diy ? 'Sim' : 'Não'
    ]);

    this.addTable({
      headers: ['Código', 'Descrição', 'Prioridade', 'DIY'],
      data: tableData,
      columnWidths: [30, 'auto', 30, 20],
      headerColor: PDF_COLORS.primary
    });
  }

  private addDetailedItems(items: DiagnosticItemData[]): void {
    this.addNewPage();
    this.addPageHeader('Detalhamento Técnico');
    this.addSectionTitle('Análise Detalhada dos Códigos');

    items.forEach(item => {
      this.ensureSpace(50);

      // Header do item com cor baseada na prioridade
      let color = PDF_COLORS.success;
      if (item.priority === 'critical') color = PDF_COLORS.danger;
      if (item.priority === 'attention') color = PDF_COLORS.warning;

      this.doc.setFillColor(...color);
      this.doc.roundedRect(PDF_LAYOUT.marginLeft, this.currentY, PDF_LAYOUT.contentWidth, 8, 1, 1, 'F');

      this.doc.setTextColor(...PDF_COLORS.white);
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(`${item.dtc_code} - ${PRIORITY_LABELS[item.priority]}`, PDF_LAYOUT.marginLeft + 3, this.currentY + 5.5);

      this.currentY += 12;

      // Descrição
      this.doc.setTextColor(...PDF_COLORS.text);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Descrição:', PDF_LAYOUT.marginLeft, this.currentY);
      this.currentY += 5;
      this.addParagraph(item.description_human, 0);

      // Causas
      if (item.probable_causes && item.probable_causes.length > 0) {
        this.currentY += 2;
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('Causas Prováveis:', PDF_LAYOUT.marginLeft, this.currentY);
        this.currentY += 5;
        this.addBulletList(item.probable_causes);
      }

      // DIY
      this.currentY += 4;
      this.doc.setFontSize(8);
      this.doc.setTextColor(...PDF_COLORS.gray);
      const diyText = item.can_diy
        ? `✓ Reparo possível por conta própria ${item.diy_difficulty ? `(Dificuldade: ${item.diy_difficulty}/5)` : ''}`
        : '✗ Recomendado procurar um especialista';
      this.doc.text(diyText, PDF_LAYOUT.marginLeft, this.currentY);

      this.currentY += 10;
    });
  }

  private addDisclaimer(): void {
    this.ensureSpace(50);
    this.addColorBox({
      title: 'AVISO LEGAL IMPORTANTE',
      items: [
        'Este relatório é gerado automaticamente com base na leitura da ECU do veículo.',
        'As informações são para fins de orientação e não substituem o diagnóstico de um mecânico profissional.',
        'Para falhas críticas (freios, airbag, motor), procure uma oficina imediatamente.',
        'O Doutor Motors não se responsabiliza por reparos efetuados sem supervisão técnica.'
      ],
      bgColor: [254, 252, 232], // Yellow 50
      borderColor: PDF_COLORS.warning,
      textColor: PDF_COLORS.warning,
      icon: '⚠️'
    });
  }
}

// Wrapper function para manter compatibilidade com interface antiga se necessário
export async function generateDiagnosticPDF(options: PDFGeneratorOptions): Promise<Blob> {
  const generator = new DiagnosticReportPDF();
  return generator.generate(options);
}

export function downloadPDF(blob: Blob, vehicle: VehicleData, diagnostic: DiagnosticData): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  const dateStr = format(new Date(diagnostic.created_at), 'yyyy-MM-dd');
  const filename = `diagnostico-${vehicle.brand}-${vehicle.model}-${dateStr}.pdf`;

  link.href = url;
  link.download = filename.toLowerCase().replace(/\s+/g, '-');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
