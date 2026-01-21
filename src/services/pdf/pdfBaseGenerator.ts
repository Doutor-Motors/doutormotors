import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// ============================================
// MODELO PADRÃO DE PDF - DOUTOR MOTORS
// ============================================

// Constantes de cores
export const PDF_COLORS = {
  primary: [20, 30, 48] as [number, number, number],
  primaryLight: [30, 41, 59] as [number, number, number],
  accent: [59, 130, 246] as [number, number, number],
  success: [34, 197, 94] as [number, number, number],
  warning: [234, 179, 8] as [number, number, number],
  danger: [239, 68, 68] as [number, number, number],
  info: [14, 165, 233] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  gray: [100, 116, 139] as [number, number, number],
  lightGray: [241, 245, 249] as [number, number, number],
  text: [30, 30, 30] as [number, number, number],
  textLight: [100, 100, 100] as [number, number, number],
};

// Constantes de layout
export const PDF_LAYOUT = {
  pageWidth: 210,
  pageHeight: 297,
  marginLeft: 14,
  marginRight: 14,
  marginTop: 25,
  marginBottom: 20,
  headerHeight: 18,
  footerHeight: 12,
  contentWidth: 182, // 210 - 14 - 14
  safeBottom: 265, // Limite seguro antes do rodapé
};

// Interface para opções de página
export interface PDFPageOptions {
  title: string;
  subtitle?: string;
  showDate?: boolean;
  showLogo?: boolean;
}

// Classe base para geração de PDFs
export class PDFBaseGenerator {
  protected doc: jsPDF;
  protected currentY: number;
  protected pageNumber: number;

  constructor() {
    this.doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });
    this.currentY = PDF_LAYOUT.marginTop;
    this.pageNumber = 1;
  }

  // Verifica se precisa de nova página
  protected needsNewPage(requiredSpace: number = 20): boolean {
    return this.currentY + requiredSpace > PDF_LAYOUT.safeBottom;
  }

  // Adiciona nova página
  protected addNewPage(): void {
    this.doc.addPage();
    this.pageNumber++;
    this.currentY = PDF_LAYOUT.marginTop + 5;
  }

  // Garante espaço suficiente ou cria nova página
  protected ensureSpace(requiredSpace: number): void {
    if (this.needsNewPage(requiredSpace)) {
      this.addNewPage();
    }
  }

  // Adiciona capa do documento COM LOGO ÚNICA
  protected addCoverPage(options: {
    title: string;
    subtitle: string;
    description?: string;
    version?: string;
    generatedBy?: string;
  }): void {
    const { title, subtitle, description, version, generatedBy } = options;
    const pageWidth = PDF_LAYOUT.pageWidth;

    // Background
    this.doc.setFillColor(...PDF_COLORS.primary);
    this.doc.rect(0, 0, pageWidth, PDF_LAYOUT.pageHeight, "F");

    // Logo circle - ÚNICO LOGO NO DOCUMENTO
    this.doc.setFillColor(...PDF_COLORS.accent);
    this.doc.circle(pageWidth / 2, 55, 28, "F");
    
    // Inner circle
    this.doc.setFillColor(...PDF_COLORS.primaryLight);
    this.doc.circle(pageWidth / 2, 55, 22, "F");
    
    // Logo text
    this.doc.setTextColor(...PDF_COLORS.white);
    this.doc.setFontSize(18);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("DOUTOR", pageWidth / 2, 52, { align: "center" });
    this.doc.setFontSize(14);
    this.doc.text("MOTORS", pageWidth / 2, 60, { align: "center" });

    // Title
    this.doc.setFontSize(26);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(title.toUpperCase(), pageWidth / 2, 105, { align: "center" });

    // Subtitle
    this.doc.setFontSize(16);
    this.doc.setFont("helvetica", "normal");
    this.doc.text(subtitle, pageWidth / 2, 120, { align: "center" });

    // Description
    if (description) {
      this.doc.setFontSize(12);
      this.doc.text(description, pageWidth / 2, 135, { align: "center" });
    }

    // Divider line
    this.doc.setDrawColor(...PDF_COLORS.accent);
    this.doc.setLineWidth(1.5);
    this.doc.line(pageWidth / 2 - 35, 150, pageWidth / 2 + 35, 150);

    // Info box
    this.doc.setFillColor(...PDF_COLORS.primaryLight);
    this.doc.roundedRect(35, 170, pageWidth - 70, 55, 4, 4, "F");

    this.doc.setFontSize(10);
    this.doc.setTextColor(...PDF_COLORS.gray);
    
    let infoY = 185;
    this.doc.text("Data de Geração:", 50, infoY);
    this.doc.setTextColor(...PDF_COLORS.white);
    this.doc.text(format(new Date(), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR }), 95, infoY);

    if (version) {
      infoY += 12;
      this.doc.setTextColor(...PDF_COLORS.gray);
      this.doc.text("Versão:", 50, infoY);
      this.doc.setTextColor(...PDF_COLORS.white);
      this.doc.text(version, 95, infoY);
    }

    if (generatedBy) {
      infoY += 12;
      this.doc.setTextColor(...PDF_COLORS.gray);
      this.doc.text("Gerado por:", 50, infoY);
      this.doc.setTextColor(...PDF_COLORS.white);
      this.doc.text(generatedBy, 95, infoY);
    }

    // Footer
    this.doc.setFontSize(8);
    this.doc.setTextColor(...PDF_COLORS.gray);
    this.doc.text("Documento confidencial - Uso interno", pageWidth / 2, 280, { align: "center" });
  }

  // Adiciona cabeçalho de página
  protected addPageHeader(title: string): void {
    const pageWidth = PDF_LAYOUT.pageWidth;
    
    this.doc.setFillColor(...PDF_COLORS.primary);
    this.doc.rect(0, 0, pageWidth, PDF_LAYOUT.headerHeight, "F");
    
    this.doc.setTextColor(...PDF_COLORS.white);
    this.doc.setFontSize(9);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(title.toUpperCase(), PDF_LAYOUT.marginLeft, 12);
    
    this.doc.setFont("helvetica", "normal");
    this.doc.text(format(new Date(), "dd/MM/yyyy HH:mm"), pageWidth - PDF_LAYOUT.marginRight, 12, { align: "right" });
    
    this.currentY = PDF_LAYOUT.marginTop + 5;
  }

  // Adiciona título de seção
  protected addSectionTitle(title: string, number?: string): void {
    this.ensureSpace(20);
    
    const pageWidth = PDF_LAYOUT.pageWidth;
    const fullTitle = number ? `${number}. ${title}` : title;
    
    this.doc.setFillColor(...PDF_COLORS.primary);
    this.doc.roundedRect(PDF_LAYOUT.marginLeft, this.currentY - 4, PDF_LAYOUT.contentWidth, 11, 2, 2, "F");
    
    this.doc.setTextColor(...PDF_COLORS.white);
    this.doc.setFontSize(11);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(fullTitle.toUpperCase(), PDF_LAYOUT.marginLeft + 4, this.currentY + 3);
    
    this.currentY += 16;
  }

  // Adiciona subtítulo
  protected addSubsectionTitle(title: string): void {
    this.ensureSpace(15);
    
    this.doc.setTextColor(...PDF_COLORS.primary);
    this.doc.setFontSize(10);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(title, PDF_LAYOUT.marginLeft, this.currentY);
    
    this.currentY += 7;
  }

  // Adiciona parágrafo de texto
  protected addParagraph(text: string, indent: number = 0): void {
    this.doc.setTextColor(...PDF_COLORS.text);
    this.doc.setFontSize(9);
    this.doc.setFont("helvetica", "normal");
    
    const maxWidth = PDF_LAYOUT.contentWidth - indent;
    const lines = this.doc.splitTextToSize(text, maxWidth);
    const lineHeight = 4.5;
    const totalHeight = lines.length * lineHeight;
    
    this.ensureSpace(totalHeight + 5);
    
    this.doc.text(lines, PDF_LAYOUT.marginLeft + indent, this.currentY);
    this.currentY += totalHeight + 3;
  }

  // Adiciona lista com bullets
  protected addBulletList(items: string[], bulletChar: string = "•"): void {
    this.doc.setTextColor(...PDF_COLORS.text);
    this.doc.setFontSize(9);
    this.doc.setFont("helvetica", "normal");
    
    const indent = 6;
    const maxWidth = PDF_LAYOUT.contentWidth - indent;
    const lineHeight = 4.5;
    
    for (const item of items) {
      const lines = this.doc.splitTextToSize(item, maxWidth);
      const itemHeight = lines.length * lineHeight + 2;
      
      this.ensureSpace(itemHeight);
      
      this.doc.text(bulletChar, PDF_LAYOUT.marginLeft + 2, this.currentY);
      this.doc.text(lines, PDF_LAYOUT.marginLeft + indent, this.currentY);
      this.currentY += itemHeight;
    }
    
    this.currentY += 3;
  }

  // Adiciona tabela com autoTable
  protected addTable(config: {
    headers: string[];
    data: (string | number)[][];
    headerColor?: [number, number, number];
    columnWidths?: (number | "auto")[];
    fontSize?: number;
  }): void {
    const { headers, data, headerColor = PDF_COLORS.primary, columnWidths, fontSize = 8 } = config;
    
    this.ensureSpace(30);
    
    const columnStyles: { [key: number]: { cellWidth?: number | "auto"; halign?: "left" | "center" | "right" } } = {};
    if (columnWidths) {
      columnWidths.forEach((width, index) => {
        if (width !== "auto") {
          columnStyles[index] = { cellWidth: width };
        }
      });
    }
    
    autoTable(this.doc, {
      startY: this.currentY,
      head: [headers],
      body: data.map(row => row.map(cell => String(cell))),
      theme: "striped",
      headStyles: { 
        fillColor: headerColor, 
        textColor: PDF_COLORS.white, 
        fontSize: fontSize,
        fontStyle: "bold",
        cellPadding: 3,
      },
      styles: { 
        fontSize: fontSize - 1, 
        cellPadding: 2.5,
        textColor: PDF_COLORS.text,
        overflow: "linebreak",
      },
      alternateRowStyles: {
        fillColor: PDF_LAYOUT.marginLeft > 0 ? [248, 250, 252] : undefined,
      },
      columnStyles,
      margin: { left: PDF_LAYOUT.marginLeft, right: PDF_LAYOUT.marginRight },
    });
    
    this.currentY = (this.doc as any).lastAutoTable.finalY + 8;
  }

  // Adiciona caixa colorida com conteúdo
  protected addColorBox(config: {
    title: string;
    items: string[];
    bgColor: [number, number, number];
    borderColor: [number, number, number];
    textColor: [number, number, number];
    icon?: string;
  }): void {
    const { title, items, bgColor, borderColor, textColor, icon = "" } = config;
    
    const lineHeight = 5;
    const boxHeight = 14 + items.length * lineHeight;
    
    this.ensureSpace(boxHeight + 10);
    
    // Background
    this.doc.setFillColor(...bgColor);
    this.doc.roundedRect(PDF_LAYOUT.marginLeft, this.currentY, PDF_LAYOUT.contentWidth, boxHeight, 3, 3, "F");
    
    // Border
    this.doc.setDrawColor(...borderColor);
    this.doc.setLineWidth(0.5);
    this.doc.roundedRect(PDF_LAYOUT.marginLeft, this.currentY, PDF_LAYOUT.contentWidth, boxHeight, 3, 3, "S");
    
    this.currentY += 8;
    
    // Title
    this.doc.setTextColor(...textColor);
    this.doc.setFontSize(10);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(`${icon} ${title}`.trim(), PDF_LAYOUT.marginLeft + 5, this.currentY);
    
    this.currentY += 6;
    
    // Items
    this.doc.setFontSize(8);
    this.doc.setFont("helvetica", "normal");
    for (const item of items) {
      this.doc.text(item, PDF_LAYOUT.marginLeft + 8, this.currentY);
      this.currentY += lineHeight;
    }
    
    this.currentY += 8;
  }

  // Adiciona índice/sumário
  protected addIndex(items: { title: string; page?: number }[]): void {
    this.ensureSpace(20);
    
    this.doc.setFontSize(16);
    this.doc.setTextColor(...PDF_COLORS.primary);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("ÍNDICE", PDF_LAYOUT.marginLeft, this.currentY);
    this.currentY += 12;
    
    this.doc.setFontSize(10);
    this.doc.setFont("helvetica", "normal");
    
    for (let i = 0; i < items.length; i++) {
      this.ensureSpace(8);
      
      const item = items[i];
      this.doc.setTextColor(...PDF_COLORS.text);
      this.doc.text(`${i + 1}. ${item.title}`, PDF_LAYOUT.marginLeft + 5, this.currentY);
      
      if (item.page) {
        this.doc.setTextColor(...PDF_COLORS.accent);
        this.doc.text(`Pág. ${item.page}`, PDF_LAYOUT.pageWidth - PDF_LAYOUT.marginRight - 15, this.currentY);
      }
      
      this.currentY += 7;
    }
    
    this.currentY += 10;
  }

  // Adiciona espaçamento
  protected addSpace(height: number = 10): void {
    this.currentY += height;
    if (this.needsNewPage(0)) {
      this.addNewPage();
    }
  }

  // NÃO adiciona marca d'água em páginas internas - REMOVIDO para otimização
  protected addWatermark(): void {
    // Marca d'água removida para otimizar o PDF
    // Logo agora aparece SOMENTE na capa
  }

  // Adiciona rodapé em todas as páginas
  protected addFooters(documentTitle: string): void {
    const pageCount = this.doc.getNumberOfPages();
    const pageWidth = PDF_LAYOUT.pageWidth;
    const pageHeight = PDF_LAYOUT.pageHeight;
    
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      
      // Linha separadora
      this.doc.setDrawColor(...PDF_COLORS.lightGray);
      this.doc.setLineWidth(0.3);
      this.doc.line(PDF_LAYOUT.marginLeft, pageHeight - 15, pageWidth - PDF_LAYOUT.marginRight, pageHeight - 15);
      
      // Texto do rodapé
      this.doc.setFontSize(7);
      this.doc.setTextColor(...PDF_COLORS.gray);
      this.doc.setFont("helvetica", "normal");
      
      this.doc.text(`Doutor Motors - ${documentTitle}`, PDF_LAYOUT.marginLeft, pageHeight - 10);
      this.doc.text(`Página ${i} de ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: "center" });
      this.doc.text(format(new Date(), "dd/MM/yyyy"), pageWidth - PDF_LAYOUT.marginRight, pageHeight - 10, { align: "right" });
    }
  }

  // Salva o PDF
  protected save(filename: string): void {
    const timestamp = format(new Date(), "yyyy-MM-dd-HHmm");
    this.doc.save(`${filename}-${timestamp}.pdf`);
  }

  // Getter para o documento
  protected getDoc(): jsPDF {
    return this.doc;
  }

  // Getter para posição Y atual
  protected getY(): number {
    return this.currentY;
  }

  // Setter para posição Y
  protected setY(y: number): void {
    this.currentY = y;
  }
}

export default PDFBaseGenerator;
