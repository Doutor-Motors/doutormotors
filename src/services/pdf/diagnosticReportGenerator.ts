import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import logoWatermark from '@/assets/images/logo-watermark.png';
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

// Color palette
const COLORS = {
  primary: [59, 130, 246] as [number, number, number], // Blue
  critical: [220, 38, 38] as [number, number, number], // Red
  attention: [234, 179, 8] as [number, number, number], // Yellow/Amber
  preventive: [34, 197, 94] as [number, number, number], // Green
  dark: [30, 41, 59] as [number, number, number], // Slate
  gray: [100, 116, 139] as [number, number, number], // Slate gray
  lightGray: [241, 245, 249] as [number, number, number], // Slate 100
  white: [255, 255, 255] as [number, number, number],
};

// Priority labels in Portuguese
const PRIORITY_LABELS: Record<string, string> = {
  critical: 'CRÍTICO',
  attention: 'ATENÇÃO',
  preventive: 'PREVENTIVO',
};

// Status labels in Portuguese
const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente',
  completed: 'Concluído',
  resolved: 'Resolvido',
};

/**
 * Generates a professional PDF report for a diagnostic
 */
export async function generateDiagnosticPDF(options: PDFGeneratorOptions): Promise<Blob> {
  const { diagnostic, items, vehicle, userName, includeDisclaimer = true } = options;
  
  // Create PDF document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let yPos = margin;
  
  // === HEADER ===
  yPos = drawHeader(doc, yPos, pageWidth, margin);
  
  // === VEHICLE INFO ===
  yPos = drawVehicleInfo(doc, vehicle, yPos, pageWidth, margin);
  
  // === DIAGNOSTIC INFO ===
  yPos = drawDiagnosticInfo(doc, diagnostic, userName, yPos, pageWidth, margin);
  
  // === SUMMARY STATS ===
  yPos = drawSummaryStats(doc, items, yPos, pageWidth, margin);
  
  // === DIAGNOSTIC ITEMS TABLE ===
  yPos = drawDiagnosticTable(doc, items, yPos, margin);
  
  // === DETAILED ITEMS ===
  yPos = drawDetailedItems(doc, items, yPos, pageWidth, margin);
  
  // === DISCLAIMER ===
  if (includeDisclaimer) {
    yPos = drawDisclaimer(doc, yPos, pageWidth, margin, pageHeight);
  }
  
  // === FOOTER ===
  drawFooter(doc, pageWidth, pageHeight, margin);
  
  // Return as blob
  return doc.output('blob');
}

/**
 * Draws the header section
 */
function drawHeader(doc: jsPDF, yPos: number, pageWidth: number, margin: number): number {
  // Header background
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, 35, 'F');
  
  // Title
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('RELATÓRIO DE DIAGNÓSTICO', margin, 18);
  
  // Subtitle
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Doutor Motors - Diagnóstico Automotivo Inteligente', margin, 28);
  
  // Date on right side
  doc.setFontSize(9);
  const dateStr = format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  doc.text(dateStr, pageWidth - margin, 18, { align: 'right' });
  doc.text('Gerado automaticamente', pageWidth - margin, 25, { align: 'right' });
  
  return 45;
}

/**
 * Draws vehicle information section
 */
function drawVehicleInfo(
  doc: jsPDF, 
  vehicle: VehicleData, 
  yPos: number, 
  pageWidth: number, 
  margin: number
): number {
  // Section title
  doc.setTextColor(...COLORS.dark);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('INFORMAÇÕES DO VEÍCULO', margin, yPos);
  yPos += 8;
  
  // Info box
  doc.setFillColor(...COLORS.lightGray);
  doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 25, 3, 3, 'F');
  
  yPos += 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.gray);
  
  // Vehicle details in columns
  const col1 = margin + 5;
  const col2 = pageWidth / 3 + 5;
  const col3 = 2 * pageWidth / 3;
  
  // Row 1
  doc.text('Veículo:', col1, yPos);
  doc.setTextColor(...COLORS.dark);
  doc.setFont('helvetica', 'bold');
  doc.text(`${vehicle.brand} ${vehicle.model} ${vehicle.year}`, col1 + 18, yPos);
  
  if (vehicle.license_plate) {
    doc.setTextColor(...COLORS.gray);
    doc.setFont('helvetica', 'normal');
    doc.text('Placa:', col2, yPos);
    doc.setTextColor(...COLORS.dark);
    doc.setFont('helvetica', 'bold');
    doc.text(vehicle.license_plate, col2 + 15, yPos);
  }
  
  yPos += 8;
  
  // Row 2
  if (vehicle.engine) {
    doc.setTextColor(...COLORS.gray);
    doc.setFont('helvetica', 'normal');
    doc.text('Motor:', col1, yPos);
    doc.setTextColor(...COLORS.dark);
    doc.setFont('helvetica', 'bold');
    doc.text(vehicle.engine, col1 + 15, yPos);
  }
  
  if (vehicle.fuel_type) {
    doc.setTextColor(...COLORS.gray);
    doc.setFont('helvetica', 'normal');
    doc.text('Combustível:', col2, yPos);
    doc.setTextColor(...COLORS.dark);
    doc.setFont('helvetica', 'bold');
    doc.text(vehicle.fuel_type, col2 + 28, yPos);
  }
  
  return yPos + 18;
}

/**
 * Draws diagnostic info section
 */
function drawDiagnosticInfo(
  doc: jsPDF,
  diagnostic: DiagnosticData,
  userName: string | undefined,
  yPos: number,
  pageWidth: number,
  margin: number
): number {
  doc.setTextColor(...COLORS.dark);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('INFORMAÇÕES DO DIAGNÓSTICO', margin, yPos);
  yPos += 8;
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.gray);
  
  // ID and date
  doc.text(`ID: ${diagnostic.id.substring(0, 8)}...`, margin, yPos);
  
  const diagDate = format(new Date(diagnostic.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  doc.text(`Data: ${diagDate}`, pageWidth / 3, yPos);
  
  doc.text(`Status: ${STATUS_LABELS[diagnostic.status] || diagnostic.status}`, 2 * pageWidth / 3, yPos);
  
  yPos += 6;
  
  if (userName) {
    doc.text(`Responsável: ${userName}`, margin, yPos);
    yPos += 6;
  }
  
  if (diagnostic.notes) {
    doc.text(`Observações: ${diagnostic.notes}`, margin, yPos);
    yPos += 6;
  }
  
  return yPos + 6;
}

/**
 * Draws summary statistics
 */
function drawSummaryStats(
  doc: jsPDF,
  items: DiagnosticItemData[],
  yPos: number,
  pageWidth: number,
  margin: number
): number {
  // Count by priority
  const criticalCount = items.filter(i => i.priority === 'critical').length;
  const attentionCount = items.filter(i => i.priority === 'attention').length;
  const preventiveCount = items.filter(i => i.priority === 'preventive').length;
  const diyCount = items.filter(i => i.can_diy).length;
  
  doc.setTextColor(...COLORS.dark);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('RESUMO', margin, yPos);
  yPos += 8;
  
  const boxWidth = (pageWidth - 2 * margin - 15) / 4;
  const boxHeight = 20;
  let xPos = margin;
  
  // Critical box
  doc.setFillColor(...COLORS.critical);
  doc.roundedRect(xPos, yPos, boxWidth, boxHeight, 2, 2, 'F');
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(String(criticalCount), xPos + boxWidth / 2, yPos + 10, { align: 'center' });
  doc.setFontSize(7);
  doc.text('CRÍTICOS', xPos + boxWidth / 2, yPos + 16, { align: 'center' });
  xPos += boxWidth + 5;
  
  // Attention box
  doc.setFillColor(...COLORS.attention);
  doc.roundedRect(xPos, yPos, boxWidth, boxHeight, 2, 2, 'F');
  doc.setTextColor(...COLORS.dark);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(String(attentionCount), xPos + boxWidth / 2, yPos + 10, { align: 'center' });
  doc.setFontSize(7);
  doc.text('ATENÇÃO', xPos + boxWidth / 2, yPos + 16, { align: 'center' });
  xPos += boxWidth + 5;
  
  // Preventive box
  doc.setFillColor(...COLORS.preventive);
  doc.roundedRect(xPos, yPos, boxWidth, boxHeight, 2, 2, 'F');
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(String(preventiveCount), xPos + boxWidth / 2, yPos + 10, { align: 'center' });
  doc.setFontSize(7);
  doc.text('PREVENTIVOS', xPos + boxWidth / 2, yPos + 16, { align: 'center' });
  xPos += boxWidth + 5;
  
  // DIY box
  doc.setFillColor(...COLORS.primary);
  doc.roundedRect(xPos, yPos, boxWidth, boxHeight, 2, 2, 'F');
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(String(diyCount), xPos + boxWidth / 2, yPos + 10, { align: 'center' });
  doc.setFontSize(7);
  doc.text('FAÇA VOCÊ', xPos + boxWidth / 2, yPos + 16, { align: 'center' });
  
  return yPos + boxHeight + 12;
}

/**
 * Draws the diagnostic items table
 */
function drawDiagnosticTable(
  doc: jsPDF,
  items: DiagnosticItemData[],
  yPos: number,
  margin: number
): number {
  doc.setTextColor(...COLORS.dark);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('CÓDIGOS DETECTADOS', margin, yPos);
  yPos += 5;
  
  // Prepare table data
  const tableData = items.map(item => [
    item.dtc_code,
    item.description_human.length > 50 
      ? item.description_human.substring(0, 50) + '...' 
      : item.description_human,
    PRIORITY_LABELS[item.priority] || item.priority,
    `${item.severity}/10`,
    item.can_diy ? 'Sim' : 'Não',
  ]);
  
  // Draw table using autoTable
  autoTable(doc, {
    startY: yPos,
    head: [['Código', 'Descrição', 'Prioridade', 'Severidade', 'DIY']],
    body: tableData,
    margin: { left: margin, right: margin },
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: COLORS.dark,
      textColor: COLORS.white,
      fontStyle: 'bold',
    },
    bodyStyles: {
      textColor: COLORS.dark,
    },
    alternateRowStyles: {
      fillColor: COLORS.lightGray,
    },
    columnStyles: {
      0: { cellWidth: 25, fontStyle: 'bold' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 25, halign: 'center' },
      3: { cellWidth: 22, halign: 'center' },
      4: { cellWidth: 15, halign: 'center' },
    },
    didParseCell: (data) => {
      // Color priority cells
      if (data.section === 'body' && data.column.index === 2) {
        const priority = items[data.row.index]?.priority;
        if (priority === 'critical') {
          data.cell.styles.fillColor = COLORS.critical;
          data.cell.styles.textColor = COLORS.white;
        } else if (priority === 'attention') {
          data.cell.styles.fillColor = COLORS.attention;
          data.cell.styles.textColor = COLORS.dark;
        } else if (priority === 'preventive') {
          data.cell.styles.fillColor = COLORS.preventive;
          data.cell.styles.textColor = COLORS.white;
        }
      }
    },
  });
  
  // Get final Y position after table
  return (doc as any).lastAutoTable.finalY + 10;
}

/**
 * Draws detailed information for each item
 */
function drawDetailedItems(
  doc: jsPDF,
  items: DiagnosticItemData[],
  yPos: number,
  pageWidth: number,
  margin: number
): number {
  const pageHeight = doc.internal.pageSize.getHeight();
  
  doc.setTextColor(...COLORS.dark);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('DETALHAMENTO DOS CÓDIGOS', margin, yPos);
  yPos += 8;
  
  items.forEach((item, index) => {
    // Check if we need a new page
    if (yPos > pageHeight - 50) {
      doc.addPage();
      yPos = 20;
    }
    
    // Priority color
    let priorityColor = COLORS.preventive;
    if (item.priority === 'critical') priorityColor = COLORS.critical;
    if (item.priority === 'attention') priorityColor = COLORS.attention;
    
    // Item header
    doc.setFillColor(...priorityColor);
    doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 8, 1, 1, 'F');
    
    doc.setTextColor(...COLORS.white);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`${item.dtc_code} - ${PRIORITY_LABELS[item.priority]}`, margin + 3, yPos + 5.5);
    
    yPos += 12;
    
    // Description
    doc.setTextColor(...COLORS.dark);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    const descLines = doc.splitTextToSize(item.description_human, pageWidth - 2 * margin - 10);
    doc.text(descLines, margin + 3, yPos);
    yPos += descLines.length * 4 + 4;
    
    // Probable causes
    if (item.probable_causes && item.probable_causes.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.text('Causas Prováveis:', margin + 3, yPos);
      yPos += 4;
      
      doc.setFont('helvetica', 'normal');
      item.probable_causes.forEach(cause => {
        if (yPos > pageHeight - 30) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(`• ${cause}`, margin + 6, yPos);
        yPos += 4;
      });
      yPos += 2;
    }
    
    // DIY info
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.gray);
    const diyText = item.can_diy 
      ? `✓ Possível fazer você mesmo${item.diy_difficulty ? ` (Dificuldade: ${item.diy_difficulty}/5)` : ''}`
      : '✗ Recomendado procurar mecânico';
    doc.text(diyText, margin + 3, yPos);
    
    yPos += 10;
  });
  
  return yPos;
}

/**
 * Draws legal disclaimer
 */
function drawDisclaimer(
  doc: jsPDF,
  yPos: number,
  pageWidth: number,
  margin: number,
  pageHeight: number
): number {
  // Check if we need a new page
  if (yPos > pageHeight - 60) {
    doc.addPage();
    yPos = 20;
  }
  
  doc.setFillColor(255, 243, 205); // Light yellow
  doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 45, 2, 2, 'F');
  
  doc.setTextColor(133, 100, 4); // Dark yellow
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('⚠️ AVISO LEGAL', margin + 5, yPos + 7);
  
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  
  const disclaimerText = `Este relatório é gerado automaticamente com base nos dados coletados do sistema OBD2 do veículo. 
As informações são fornecidas apenas para fins informativos e não substituem uma avaliação profissional.

Para problemas críticos de segurança (freios, direção, airbags), SEMPRE consulte um mecânico qualificado.
O Doutor Motors não se responsabiliza por danos decorrentes de reparos feitos sem supervisão profissional.

Este documento foi gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm")} e reflete os dados disponíveis no momento da análise.`;
  
  const lines = doc.splitTextToSize(disclaimerText, pageWidth - 2 * margin - 10);
  doc.text(lines, margin + 5, yPos + 14);
  
  return yPos + 50;
}

/**
 * Draws watermark on all pages
 */
function drawWatermark(doc: jsPDF, pageWidth: number, pageHeight: number): void {
  const pageCount = doc.getNumberOfPages();
  const centerX = pageWidth / 2;
  const centerY = pageHeight / 2;
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    // Adiciona o logo como marca d'água
    const logoWidth = 80;
    const logoHeight = 40;
    
    try {
      doc.addImage(
        logoWatermark,
        'PNG',
        centerX - logoWidth / 2,
        centerY - logoHeight / 2 - 10,
        logoWidth,
        logoHeight,
        undefined,
        'FAST'
      );
    } catch (e) {
      console.log('Watermark image could not be loaded');
    }
    
    // Texto "Doutor Motors"
    doc.setTextColor(200, 200, 200);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('Doutor Motors', centerX, centerY + 30, { align: 'center' });
    
    // Subtexto
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Diagnóstico Automotivo Inteligente', centerX, centerY + 40, { align: 'center' });
  }
}

/**
 * Draws footer on all pages
 */
function drawFooter(
  doc: jsPDF,
  pageWidth: number,
  pageHeight: number,
  margin: number
): void {
  const pageCount = doc.getNumberOfPages();
  
  // Primeiro adiciona a marca d'água em todas as páginas
  drawWatermark(doc, pageWidth, pageHeight);
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.gray);
    doc.setFont('helvetica', 'normal');
    
    // Left: Doutor Motors branding
    doc.text('Doutor Motors - Diagnóstico Automotivo', margin, pageHeight - 10);
    
    // Center: Page number
    doc.text(`Página ${i} de ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    
    // Right: Website
    doc.text('www.doutormotors.com.br', pageWidth - margin, pageHeight - 10, { align: 'right' });
    
    // Line separator
    doc.setDrawColor(...COLORS.lightGray);
    doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
  }
}

/**
 * Downloads the PDF with a nice filename
 */
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
