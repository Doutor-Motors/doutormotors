import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Message {
  role: "user" | "assistant";
  content: string;
  imageBase64?: string;
  suggestedTutorials?: Tutorial[];
}

interface Tutorial {
  id: string;
  name: string;
  brand?: string;
  model?: string;
  category?: string;
  url?: string;
  thumbnail?: string;
  slug?: string;
}

interface VehicleContext {
  brand: string;
  model: string;
  year: number;
}

interface ExpertConversationPDFOptions {
  messages: Message[];
  vehicle?: VehicleContext | null;
  userName?: string;
  conversationTitle?: string;
  obdCodes?: string[];
}

// Color palette matching the system design
const COLORS = {
  primary: [220, 38, 38] as [number, number, number], // Red (primary brand color)
  dark: [30, 41, 59] as [number, number, number],
  gray: [100, 116, 139] as [number, number, number],
  lightGray: [241, 245, 249] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  userBg: [220, 38, 38] as [number, number, number], // Primary red
  assistantBg: [248, 250, 252] as [number, number, number], // Light background
};

/**
 * Generates a PDF document of the expert conversation
 */
export async function generateExpertConversationPDF(options: ExpertConversationPDFOptions): Promise<Blob> {
  const { messages, vehicle, userName, conversationTitle, obdCodes } = options;
  
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
  yPos = drawHeader(doc, yPos, pageWidth, margin, conversationTitle);
  
  // === VEHICLE INFO ===
  if (vehicle) {
    yPos = drawVehicleInfo(doc, vehicle, yPos, pageWidth, margin);
  }
  
  // === OBD CODES ===
  if (obdCodes && obdCodes.length > 0) {
    yPos = drawOBDCodes(doc, obdCodes, yPos, pageWidth, margin);
  }
  
  // === USER INFO ===
  if (userName) {
    yPos = drawUserInfo(doc, userName, yPos, margin);
  }
  
  // === CONVERSATION ===
  yPos = drawConversation(doc, messages, yPos, pageWidth, margin, pageHeight);
  
  // === FOOTER ===
  drawFooter(doc, pageWidth, pageHeight, margin);
  
  return doc.output('blob');
}

function drawHeader(doc: jsPDF, yPos: number, pageWidth: number, margin: number, title?: string): number {
  // Header background
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, 35, 'F');
  
  // Logo placeholder / Title
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('ESPECIALISTA AUTOMOTIVO', margin, 18);
  
  // Subtitle
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Doutor Motors - Consulta Técnica', margin, 28);
  
  // Date on right side
  doc.setFontSize(9);
  const dateStr = format(new Date(), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR });
  doc.text(dateStr, pageWidth - margin, 18, { align: 'right' });
  
  if (title) {
    doc.setFontSize(8);
    const truncatedTitle = title.length > 40 ? title.substring(0, 40) + '...' : title;
    doc.text(truncatedTitle, pageWidth - margin, 26, { align: 'right' });
  }
  
  return 45;
}

function drawVehicleInfo(doc: jsPDF, vehicle: VehicleContext, yPos: number, pageWidth: number, margin: number): number {
  doc.setTextColor(...COLORS.dark);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('VEÍCULO ANALISADO', margin, yPos);
  yPos += 6;
  
  doc.setFillColor(...COLORS.lightGray);
  doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 12, 2, 2, 'F');
  
  yPos += 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.gray);
  doc.text('Veículo:', margin + 3, yPos);
  
  doc.setTextColor(...COLORS.dark);
  doc.setFont('helvetica', 'bold');
  doc.text(`${vehicle.brand} ${vehicle.model} ${vehicle.year}`, margin + 22, yPos);
  
  return yPos + 12;
}

function drawOBDCodes(doc: jsPDF, codes: string[], yPos: number, pageWidth: number, margin: number): number {
  doc.setTextColor(...COLORS.dark);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('CÓDIGOS OBD ANALISADOS', margin, yPos);
  yPos += 6;
  
  doc.setFillColor(254, 226, 226); // Light red background
  const boxHeight = Math.ceil(codes.length / 4) * 8 + 6;
  doc.roundedRect(margin, yPos, pageWidth - 2 * margin, boxHeight, 2, 2, 'F');
  
  yPos += 6;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.primary);
  
  const codesPerRow = 4;
  const codeWidth = (pageWidth - 2 * margin - 6) / codesPerRow;
  
  codes.forEach((code, i) => {
    const row = Math.floor(i / codesPerRow);
    const col = i % codesPerRow;
    doc.text(code, margin + 3 + col * codeWidth, yPos + row * 8);
  });
  
  return yPos + boxHeight + 4;
}

function drawUserInfo(doc: jsPDF, userName: string, yPos: number, margin: number): number {
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.gray);
  doc.text(`Usuário: ${userName}`, margin, yPos);
  return yPos + 8;
}

function drawConversation(
  doc: jsPDF,
  messages: Message[],
  yPos: number,
  pageWidth: number,
  margin: number,
  pageHeight: number
): number {
  doc.setTextColor(...COLORS.dark);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('CONVERSA', margin, yPos);
  yPos += 8;
  
  messages.forEach((msg) => {
    // Check if we need a new page
    if (yPos > pageHeight - 40) {
      doc.addPage();
      yPos = 20;
    }
    
    const isUser = msg.role === 'user';
    const maxWidth = pageWidth - 2 * margin - 10;
    
    // Role label
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...(isUser ? COLORS.primary : COLORS.gray));
    doc.text(isUser ? '👤 Você' : '🤖 Especialista', margin, yPos);
    yPos += 5;
    
    // Message content
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.dark);
    
    // Clean markdown from content for PDF
    const cleanContent = msg.content
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/#{1,6}\s/g, '')
      .replace(/`/g, '');
    
    const lines = doc.splitTextToSize(cleanContent, maxWidth);
    
    // Draw background for message
    const lineHeight = 4;
    const msgHeight = lines.length * lineHeight + 6;
    
    if (yPos + msgHeight > pageHeight - 30) {
      doc.addPage();
      yPos = 20;
    }
    
    const fillColor = isUser ? [254, 242, 242] as [number, number, number] : COLORS.lightGray;
    doc.setFillColor(fillColor[0], fillColor[1], fillColor[2]);
    doc.roundedRect(margin, yPos, pageWidth - 2 * margin, msgHeight, 2, 2, 'F');
    
    yPos += 4;
    doc.text(lines, margin + 3, yPos);
    yPos += msgHeight + 4;
    
    // Suggested tutorials
    if (msg.suggestedTutorials && msg.suggestedTutorials.length > 0) {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(...COLORS.gray);
      doc.text('📹 Tutoriais sugeridos:', margin + 3, yPos);
      yPos += 4;
      
      msg.suggestedTutorials.forEach((t) => {
        doc.text(`• ${t.name}`, margin + 6, yPos);
        yPos += 4;
      });
      yPos += 2;
    }
  });
  
  return yPos;
}

function drawFooter(doc: jsPDF, pageWidth: number, pageHeight: number, margin: number): void {
  const totalPages = doc.getNumberOfPages();
  
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    
    // Footer line
    doc.setDrawColor(...COLORS.lightGray);
    doc.setLineWidth(0.5);
    doc.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20);
    
    // Disclaimer
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.gray);
    doc.setFont('helvetica', 'italic');
    doc.text(
      'Este documento é apenas informativo. Para diagnósticos definitivos, consulte um mecânico profissional.',
      margin,
      pageHeight - 14
    );
    
    // Page number
    doc.setFont('helvetica', 'normal');
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
    
    // Website
    doc.setTextColor(COLORS.gray[0], COLORS.gray[1], COLORS.gray[2]);
    doc.text('www.doutormotors.com.br', margin, pageHeight - 10);
  }
}

/**
 * Downloads the PDF file
 */
export function downloadExpertConversationPDF(blob: Blob, filename?: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `consulta-especialista-${format(new Date(), 'dd-MM-yyyy-HHmm')}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
