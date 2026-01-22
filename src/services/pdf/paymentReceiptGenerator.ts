import PDFBaseGenerator, { PDF_COLORS, PDF_LAYOUT } from './pdfBaseGenerator';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ReceiptData {
  id: string;
  amount: number;
  date: Date;
  customerName: string;
  customerEmail: string;
  planName: string;
  status: string;
  paymentMethod: string;
}

export class PaymentReceiptPDF extends PDFBaseGenerator {
  constructor() {
    super();
  }

  public async generate(data: ReceiptData): Promise<Blob> {
    // 1. Capa e Título
    this.addPageHeader('Recibo de Pagamento');

    this.doc.setFontSize(24);
    this.doc.setTextColor(...PDF_COLORS.primary);
    this.doc.text('RECIBO', PDF_LAYOUT.pageWidth / 2, 40, { align: 'center' });

    this.currentY = 60;

    // 2. Status e Valor
    this.addColorBox({
      title: 'Detalhes do Pagamento',
      items: [
        `Valor: R$ ${data.amount.toFixed(2).replace('.', ',')}`,
        `Status: ${data.status.toUpperCase()}`,
        `Data: ${format(data.date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}`
      ],
      bgColor: data.status === 'succeeded' || data.status === 'paid' ? [240, 253, 244] : [254, 252, 232],
      borderColor: data.status === 'succeeded' || data.status === 'paid' ? PDF_COLORS.success : PDF_COLORS.warning,
      textColor: PDF_COLORS.text,
      icon: '💲'
    });

    // 3. Informações do Cliente e Plano
    this.addSectionTitle('Informações da Transação');

    this.addTable({
      headers: ['Item', 'Detalhe'],
      data: [
        ['ID da Transação', data.id],
        ['Cliente', data.customerName],
        ['Email', data.customerEmail],
        ['Plano Contratado', data.planName],
        ['Método de Pagamento', data.paymentMethod]
      ],
      columnWidths: [60, 'auto'],
      headerColor: PDF_COLORS.primaryLight
    });

    // 4. Rodapé
    this.addFooters('Comprovante de Pagamento - Doutor Motors');

    return this.doc.output('blob');
  }
}

export async function generatePaymentReceipt(data: ReceiptData): Promise<Blob> {
  const generator = new PaymentReceiptPDF();
  return generator.generate(data);
}
