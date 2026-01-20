import jsPDF from "jspdf";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PDF_COLORS, PDF_LAYOUT } from "./pdfBaseGenerator";

interface PaymentData {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  paid_at: string | null;
  planType?: string;
  customerName?: string;
  customerEmail?: string;
}

const formatCurrency = (cents: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
};

export function generatePaymentReceipt(payment: PaymentData): void {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = PDF_LAYOUT.pageWidth;
  const marginLeft = PDF_LAYOUT.marginLeft;
  const contentWidth = PDF_LAYOUT.contentWidth;
  let currentY = 20;

  // Header Background
  doc.setFillColor(...PDF_COLORS.primary);
  doc.rect(0, 0, pageWidth, 65, "F");

  // Logo circle
  doc.setFillColor(...PDF_COLORS.accent);
  doc.circle(pageWidth / 2, 28, 18, "F");

  doc.setFillColor(...PDF_COLORS.primaryLight);
  doc.circle(pageWidth / 2, 28, 14, "F");

  // Logo text
  doc.setTextColor(...PDF_COLORS.white);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("DOUTOR", pageWidth / 2, 26, { align: "center" });
  doc.setFontSize(9);
  doc.text("MOTORS", pageWidth / 2, 32, { align: "center" });

  // Title
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("RECIBO DE PAGAMENTO", pageWidth / 2, 55, { align: "center" });

  currentY = 80;

  // Success badge
  doc.setFillColor(...PDF_COLORS.success);
  doc.roundedRect(pageWidth / 2 - 30, currentY - 8, 60, 16, 3, 3, "F");
  doc.setTextColor(...PDF_COLORS.white);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("✓ PAGAMENTO CONFIRMADO", pageWidth / 2, currentY, { align: "center" });

  currentY += 25;

  // Info card background
  doc.setFillColor(...PDF_COLORS.lightGray);
  doc.roundedRect(marginLeft, currentY, contentWidth, 85, 4, 4, "F");

  currentY += 12;
  const labelX = marginLeft + 10;
  const valueX = marginLeft + 55;

  // Transaction ID
  doc.setTextColor(...PDF_COLORS.textLight);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("ID da Transação:", labelX, currentY);
  doc.setTextColor(...PDF_COLORS.text);
  doc.setFont("helvetica", "bold");
  doc.text(payment.id.substring(0, 20) + "...", valueX, currentY);

  // Plan
  currentY += 12;
  doc.setTextColor(...PDF_COLORS.textLight);
  doc.setFont("helvetica", "normal");
  doc.text("Plano:", labelX, currentY);
  doc.setTextColor(...PDF_COLORS.text);
  doc.setFont("helvetica", "bold");
  const planLabel = payment.planType === "pro" ? "Plano Pro" : "Plano Basic";
  doc.text(planLabel, valueX, currentY);

  // Amount
  currentY += 12;
  doc.setTextColor(...PDF_COLORS.textLight);
  doc.setFont("helvetica", "normal");
  doc.text("Valor:", labelX, currentY);
  doc.setTextColor(...PDF_COLORS.success);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(formatCurrency(payment.amount), valueX, currentY);

  // Payment date
  currentY += 14;
  doc.setTextColor(...PDF_COLORS.textLight);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Data do Pagamento:", labelX, currentY);
  doc.setTextColor(...PDF_COLORS.text);
  doc.setFont("helvetica", "bold");
  const paidDate = payment.paid_at 
    ? format(new Date(payment.paid_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
    : format(new Date(payment.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  doc.text(paidDate, valueX, currentY);

  // Payment method
  currentY += 12;
  doc.setTextColor(...PDF_COLORS.textLight);
  doc.setFont("helvetica", "normal");
  doc.text("Método:", labelX, currentY);
  doc.setTextColor(...PDF_COLORS.text);
  doc.setFont("helvetica", "bold");
  doc.text("PIX", valueX, currentY);

  // Customer info if available
  if (payment.customerName || payment.customerEmail) {
    currentY += 12;
    doc.setTextColor(...PDF_COLORS.textLight);
    doc.setFont("helvetica", "normal");
    doc.text("Cliente:", labelX, currentY);
    doc.setTextColor(...PDF_COLORS.text);
    doc.setFont("helvetica", "bold");
    doc.text(payment.customerName || payment.customerEmail || "", valueX, currentY);
  }

  // Divider
  currentY += 25;
  doc.setDrawColor(...PDF_COLORS.accent);
  doc.setLineWidth(0.5);
  doc.line(marginLeft + 20, currentY, pageWidth - marginLeft - 20, currentY);

  // Footer info
  currentY += 15;
  doc.setTextColor(...PDF_COLORS.textLight);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Este documento serve como comprovante de pagamento.", pageWidth / 2, currentY, { align: "center" });
  currentY += 6;
  doc.text("Doutor Motors - Diagnóstico Automotivo Inteligente", pageWidth / 2, currentY, { align: "center" });
  currentY += 6;
  doc.text(`Gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, pageWidth / 2, currentY, { align: "center" });

  // Watermark
  doc.setTextColor(200, 200, 200);
  doc.setFontSize(40);
  doc.setFont("helvetica", "bold");
  doc.text("PAGO", pageWidth / 2, 250, { align: "center", angle: 45 });

  // Save
  const filename = `recibo-${payment.id.substring(0, 8)}-${format(new Date(), "yyyyMMdd")}.pdf`;
  doc.save(filename);
}
