import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PLAN_FEATURES } from '@/hooks/useSubscription';
import { USAGE_LIMITS } from '@/hooks/useUsageTracking';

// Enhanced color palette with better contrast
const COLORS = {
  primary: [37, 99, 235] as [number, number, number], // Blue-600
  primaryLight: [59, 130, 246] as [number, number, number], // Blue-500
  secondary: [79, 70, 229] as [number, number, number], // Indigo-600
  success: [22, 163, 74] as [number, number, number], // Green-600
  warning: [202, 138, 4] as [number, number, number], // Yellow-600
  danger: [220, 38, 38] as [number, number, number], // Red-600
  dark: [15, 23, 42] as [number, number, number], // Slate-900
  text: [30, 41, 59] as [number, number, number], // Slate-800
  gray: [71, 85, 105] as [number, number, number], // Slate-600
  lightGray: [226, 232, 240] as [number, number, number], // Slate-200
  background: [248, 250, 252] as [number, number, number], // Slate-50
  white: [255, 255, 255] as [number, number, number],
};

// Typography configuration for better readability
const FONTS = {
  title: { size: 28, weight: 'bold' as const },
  sectionTitle: { size: 16, weight: 'bold' as const },
  subsectionTitle: { size: 13, weight: 'bold' as const },
  body: { size: 11, weight: 'normal' as const },
  small: { size: 10, weight: 'normal' as const },
  caption: { size: 9, weight: 'normal' as const },
};

// Spacing constants
const SPACING = {
  lineHeight: 6,
  paragraphGap: 8,
  sectionGap: 16,
  margin: 20,
};

/**
 * Generates the complete Monetization Development Guide PDF with improved readability
 */
export async function generateMonetizationGuidePDF(): Promise<Blob> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = SPACING.margin;
  const contentWidth = pageWidth - 2 * margin;
  let yPos = margin;

  // === COVER PAGE ===
  drawCoverPage(doc, pageWidth, pageHeight);
  doc.addPage();

  // === TABLE OF CONTENTS ===
  yPos = drawTableOfContents(doc, pageWidth, margin);
  doc.addPage();

  // === SECTION 1: OVERVIEW ===
  yPos = margin;
  yPos = drawSection1Overview(doc, yPos, pageWidth, margin, pageHeight, contentWidth);

  // === SECTION 2: MONETIZATION MODELS ===
  yPos = drawSection2Models(doc, yPos, pageWidth, margin, pageHeight, contentWidth);

  // === SECTION 3: TECHNICAL IMPLEMENTATION ===
  yPos = drawSection3Technical(doc, yPos, pageWidth, margin, pageHeight, contentWidth);

  // === SECTION 4: SECURE PAYMENT FLOW ===
  yPos = drawSection4PaymentFlow(doc, yPos, pageWidth, margin, pageHeight, contentWidth);

  // === SECTION 5: COMPLIANCE & LEGAL ===
  yPos = drawSection5Compliance(doc, yPos, pageWidth, margin, pageHeight, contentWidth);

  // === SECTION 6: FINANCIAL ONBOARDING ===
  yPos = drawSection6Onboarding(doc, yPos, pageWidth, margin, pageHeight, contentWidth);

  // === SECTION 7: METRICS & CONTROL ===
  yPos = drawSection7Metrics(doc, yPos, pageWidth, margin, pageHeight, contentWidth);

  // === SECTION 8: EVOLUTION ROADMAP ===
  yPos = drawSection8Roadmap(doc, yPos, pageWidth, margin, pageHeight, contentWidth);

  // Add page numbers and headers
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawPageDecorations(doc, i, totalPages, pageWidth, pageHeight, margin);
  }

  return doc.output('blob');
}

function drawCoverPage(doc: jsPDF, pageWidth: number, pageHeight: number): void {
  // Clean gradient header
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, 100, 'F');
  
  // Secondary accent
  doc.setFillColor(...COLORS.primaryLight);
  doc.rect(0, 90, pageWidth, 15, 'F');
  
  // Title section
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('DOUTOR MOTORS', pageWidth / 2, 35, { align: 'center' });
  
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.text('Guia de Monetização', pageWidth / 2, 55, { align: 'center' });
  
  doc.setFontSize(18);
  doc.setFont('helvetica', 'normal');
  doc.text('Implementação Segura e Escalável', pageWidth / 2, 70, { align: 'center' });
  
  // Version badge
  doc.setFillColor(...COLORS.white);
  doc.roundedRect(pageWidth / 2 - 20, 78, 40, 8, 2, 2, 'F');
  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Versão 1.0', pageWidth / 2, 84, { align: 'center' });
  
  // Main content area
  const contentStartY = 130;
  
  doc.setTextColor(...COLORS.dark);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Sobre Este Documento', pageWidth / 2, contentStartY, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.text);
  
  const description = [
    'Este guia apresenta uma estratégia completa para implementar',
    'monetização no sistema Doutor Motors, cobrindo aspectos técnicos,',
    'legais, de experiência do usuário e crescimento do negócio.',
  ];
  
  let descY = contentStartY + 15;
  description.forEach(line => {
    doc.text(line, pageWidth / 2, descY, { align: 'center' });
    descY += 7;
  });
  
  // Topics box
  const boxY = descY + 15;
  doc.setFillColor(...COLORS.background);
  doc.setDrawColor(...COLORS.lightGray);
  doc.roundedRect(30, boxY, pageWidth - 60, 70, 4, 4, 'FD');
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.primary);
  doc.text('Conteúdo Abordado', pageWidth / 2, boxY + 12, { align: 'center' });
  
  const topics = [
    { icon: '💰', text: 'Modelos de monetização (Basic e Pro)' },
    { icon: '⚙️', text: 'Implementação técnica front-end e back-end' },
    { icon: '🔒', text: 'Fluxo de pagamento seguro com Stripe' },
    { icon: '📋', text: 'Compliance e proteção do usuário' },
    { icon: '📊', text: 'Métricas e roadmap de evolução' },
  ];
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.text);
  
  let topicY = boxY + 25;
  topics.forEach(topic => {
    doc.text(`${topic.icon}  ${topic.text}`, 45, topicY);
    topicY += 10;
  });
  
  // Footer
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.gray);
  const dateStr = format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  doc.text(`Gerado em: ${dateStr}`, pageWidth / 2, pageHeight - 35, { align: 'center' });
  
  doc.setFontSize(9);
  doc.text('Documento Confidencial - Uso Interno', pageWidth / 2, pageHeight - 27, { align: 'center' });
}

function drawTableOfContents(doc: jsPDF, pageWidth: number, margin: number): number {
  let yPos = margin;
  
  // Header
  doc.setFillColor(...COLORS.primary);
  doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 14, 3, 3, 'F');
  
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('ÍNDICE', margin + 8, yPos + 10);
  yPos += 28;
  
  const sections = [
    { num: '1', title: 'Visão Geral da Monetização', page: 3, isMain: true },
    { num: '1.1', title: 'Objetivos e Princípios', page: 3, isMain: false },
    { num: '1.2', title: 'Práticas a Evitar', page: 3, isMain: false },
    { num: '2', title: 'Modelos de Monetização', page: 4, isMain: true },
    { num: '2.1', title: 'Plano Basic (Gratuito)', page: 4, isMain: false },
    { num: '2.2', title: 'Plano Pro (R$ 29,90/mês)', page: 4, isMain: false },
    { num: '2.3', title: 'Comparativo de Recursos', page: 5, isMain: false },
    { num: '3', title: 'Implementação Técnica', page: 6, isMain: true },
    { num: '3.1', title: 'Front-end', page: 6, isMain: false },
    { num: '3.2', title: 'Back-end', page: 7, isMain: false },
    { num: '4', title: 'Fluxo de Pagamento Seguro', page: 8, isMain: true },
    { num: '4.1', title: 'Integração com Stripe', page: 8, isMain: false },
    { num: '4.2', title: 'Tratamento de Falhas', page: 9, isMain: false },
    { num: '5', title: 'Compliance e Proteção', page: 10, isMain: true },
    { num: '5.1', title: 'Consentimento e Termos', page: 10, isMain: false },
    { num: '5.2', title: 'Comunicação de Riscos', page: 10, isMain: false },
    { num: '6', title: 'Onboarding Financeiro', page: 11, isMain: true },
    { num: '7', title: 'Métricas e Controle', page: 12, isMain: true },
    { num: '8', title: 'Roadmap de Evolução', page: 13, isMain: true },
  ];
  
  sections.forEach(section => {
    if (section.isMain) {
      // Main section styling
      doc.setFillColor(...COLORS.background);
      doc.rect(margin, yPos - 4, pageWidth - 2 * margin, 9, 'F');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(...COLORS.primary);
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(...COLORS.text);
    }
    
    const xOffset = section.isMain ? 0 : 8;
    doc.text(`${section.num}. ${section.title}`, margin + xOffset, yPos);
    
    // Page number
    doc.setTextColor(...COLORS.gray);
    doc.text(String(section.page), pageWidth - margin, yPos, { align: 'right' });
    
    // Dotted line
    const textWidth = doc.getTextWidth(`${section.num}. ${section.title}`);
    const dotsStart = margin + xOffset + textWidth + 3;
    const dotsEnd = pageWidth - margin - 15;
    
    if (dotsEnd > dotsStart) {
      doc.setDrawColor(...COLORS.lightGray);
      doc.setLineDashPattern([1, 2], 0);
      doc.line(dotsStart, yPos - 1, dotsEnd, yPos - 1);
      doc.setLineDashPattern([], 0);
    }
    
    yPos += section.isMain ? 12 : 9;
  });
  
  return yPos;
}

function checkPageBreak(doc: jsPDF, yPos: number, pageHeight: number, margin: number, neededSpace: number = 50): number {
  if (yPos > pageHeight - neededSpace) {
    doc.addPage();
    return margin + 10;
  }
  return yPos;
}

function drawSectionTitle(doc: jsPDF, title: string, yPos: number, pageWidth: number, margin: number): number {
  // Section header with accent bar
  doc.setFillColor(...COLORS.primary);
  doc.rect(margin, yPos, 4, 16, 'F');
  
  doc.setFillColor(...COLORS.background);
  doc.rect(margin + 4, yPos, pageWidth - 2 * margin - 4, 16, 'F');
  
  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(FONTS.sectionTitle.size);
  doc.setFont('helvetica', FONTS.sectionTitle.weight);
  doc.text(title, margin + 10, yPos + 11);
  
  return yPos + 24;
}

function drawSubsectionTitle(doc: jsPDF, title: string, yPos: number, margin: number): number {
  doc.setTextColor(...COLORS.secondary);
  doc.setFontSize(FONTS.subsectionTitle.size);
  doc.setFont('helvetica', FONTS.subsectionTitle.weight);
  doc.text(title, margin, yPos);
  
  // Underline
  const textWidth = doc.getTextWidth(title);
  doc.setDrawColor(...COLORS.secondary);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos + 2, margin + textWidth, yPos + 2);
  
  return yPos + 10;
}

function drawParagraph(doc: jsPDF, text: string, yPos: number, pageWidth: number, margin: number): number {
  doc.setTextColor(...COLORS.text);
  doc.setFontSize(FONTS.body.size);
  doc.setFont('helvetica', FONTS.body.weight);
  
  const contentWidth = pageWidth - 2 * margin;
  const lines = doc.splitTextToSize(text, contentWidth);
  doc.text(lines, margin, yPos);
  
  return yPos + lines.length * SPACING.lineHeight + SPACING.paragraphGap;
}

function drawBulletList(doc: jsPDF, items: string[], yPos: number, pageWidth: number, margin: number): number {
  doc.setTextColor(...COLORS.text);
  doc.setFontSize(FONTS.body.size);
  doc.setFont('helvetica', FONTS.body.weight);
  
  const contentWidth = pageWidth - 2 * margin - 8;
  
  items.forEach(item => {
    // Bullet point
    doc.setFillColor(...COLORS.primary);
    doc.circle(margin + 2, yPos - 1.5, 1.2, 'F');
    
    const lines = doc.splitTextToSize(item, contentWidth);
    doc.text(lines, margin + 8, yPos);
    yPos += lines.length * SPACING.lineHeight + 3;
  });
  
  return yPos + 4;
}

function drawHighlightBox(
  doc: jsPDF, 
  title: string, 
  content: string[], 
  yPos: number, 
  pageWidth: number, 
  margin: number, 
  type: 'info' | 'success' | 'warning' | 'danger' = 'info'
): number {
  const colorMap = {
    info: COLORS.primary,
    success: COLORS.success,
    warning: COLORS.warning,
    danger: COLORS.danger,
  };
  
  const color = colorMap[type];
  const boxPadding = 8;
  const lineHeight = 6;
  const contentWidth = pageWidth - 2 * margin;
  
  // Calculate box height
  let totalContentHeight = 16; // Title height
  content.forEach(line => {
    const lines = doc.splitTextToSize(line, contentWidth - 16);
    totalContentHeight += lines.length * lineHeight + 2;
  });
  
  // Draw box
  doc.setFillColor(color[0], color[1], color[2]);
  doc.rect(margin, yPos, 4, totalContentHeight, 'F');
  
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(...color);
  doc.setLineWidth(0.3);
  doc.rect(margin + 4, yPos, contentWidth - 4, totalContentHeight, 'FD');
  
  // Title
  doc.setTextColor(...color);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(title, margin + boxPadding + 4, yPos + 10);
  
  // Content
  doc.setTextColor(...COLORS.text);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  let contentY = yPos + 18;
  content.forEach(line => {
    const lines = doc.splitTextToSize(line, contentWidth - 16);
    doc.text(lines, margin + boxPadding + 4, contentY);
    contentY += lines.length * lineHeight + 2;
  });
  
  return yPos + totalContentHeight + 10;
}

function drawChecklist(doc: jsPDF, items: string[], yPos: number, pageWidth: number, margin: number): number {
  doc.setFontSize(FONTS.small.size);
  const contentWidth = pageWidth - 2 * margin - 12;
  
  items.forEach(item => {
    // Checkbox
    doc.setDrawColor(...COLORS.success);
    doc.setFillColor(...COLORS.white);
    doc.setLineWidth(0.4);
    doc.rect(margin, yPos - 3.5, 4, 4, 'FD');
    
    // Checkmark
    doc.setDrawColor(...COLORS.success);
    doc.setLineWidth(0.6);
    doc.line(margin + 0.8, yPos - 1.5, margin + 1.8, yPos - 0.5);
    doc.line(margin + 1.8, yPos - 0.5, margin + 3.2, yPos - 2.8);
    
    doc.setTextColor(...COLORS.text);
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(item, contentWidth);
    doc.text(lines, margin + 8, yPos);
    yPos += lines.length * 5.5 + 4;
  });
  
  return yPos + 4;
}

// ====== SECTION 1: OVERVIEW ======
function drawSection1Overview(doc: jsPDF, yPos: number, pageWidth: number, margin: number, pageHeight: number, contentWidth: number): number {
  yPos = drawSectionTitle(doc, '1. VISÃO GERAL DA MONETIZAÇÃO', yPos, pageWidth, margin);
  
  yPos = drawSubsectionTitle(doc, '1.1 Objetivo da Monetização', yPos, margin);
  yPos = drawParagraph(doc, 
    'A monetização do Doutor Motors visa criar um modelo de negócios sustentável que ofereça valor real aos usuários, mantendo a transparência e a confiança como pilares fundamentais. O objetivo é permitir que todos os usuários tenham acesso às funcionalidades básicas de diagnóstico, enquanto oferece recursos avançados para quem deseja uma experiência profissional completa.',
    yPos, pageWidth, margin);
  
  yPos = checkPageBreak(doc, yPos, pageHeight, margin);
  
  yPos = drawSubsectionTitle(doc, '1.2 Princípios de Monetização Segura', yPos, margin);
  yPos = drawBulletList(doc, [
    'TRANSPARÊNCIA: Sempre mostrar claramente o que é incluído em cada plano antes de qualquer cobrança.',
    'CONSENTIMENTO: Nunca realizar cobranças sem confirmação explícita do usuário.',
    'CONTROLE DO USUÁRIO: Permitir cancelamento fácil e acesso ao histórico de transações.',
    'VALOR REAL: Cada recurso pago deve entregar benefício tangível ao usuário.',
    'SEM SURPRESAS: Avisos claros sobre renovações, alterações de preço e vencimentos.',
  ], yPos, pageWidth, margin);
  
  yPos = checkPageBreak(doc, yPos, pageHeight, margin);
  
  yPos = drawSubsectionTitle(doc, '1.3 Práticas a Evitar', yPos, margin);
  yPos = drawHighlightBox(doc, '⚠️ NUNCA FAZER', [
    '• Dark patterns que induzem ao erro (botões confusos, textos enganosos)',
    '• Cobranças automáticas sem aviso prévio claro',
    '• Ocultar funcionalidades essenciais de segurança atrás de paywall',
    '• Dificultar o cancelamento ou estorno',
    '• Usar linguagem que exagere riscos para forçar upgrade',
  ], yPos, pageWidth, margin, 'danger');
  
  return yPos;
}

// ====== SECTION 2: MONETIZATION MODELS ======
function drawSection2Models(doc: jsPDF, yPos: number, pageWidth: number, margin: number, pageHeight: number, contentWidth: number): number {
  yPos = checkPageBreak(doc, yPos, pageHeight, margin, 60);
  
  yPos = drawSectionTitle(doc, '2. MODELOS DE MONETIZAÇÃO', yPos, pageWidth, margin);
  
  // Plan Basic
  yPos = drawSubsectionTitle(doc, '2.1 Plano Basic (Gratuito)', yPos, margin);
  
  yPos = drawParagraph(doc, 
    'O plano Basic oferece acesso às funcionalidades essenciais de diagnóstico veicular, permitindo que usuários conheçam o sistema e realizem diagnósticos básicos sem custo.',
    yPos, pageWidth, margin);
  
  const basicFeatures = PLAN_FEATURES.basic;
  yPos = drawHighlightBox(doc, '✓ INCLUÍDO NO BASIC', [
    `• ${basicFeatures.maxVehicles} veículo cadastrado`,
    `• ${USAGE_LIMITS.basic.diagnostics} diagnósticos por mês`,
    `• ${basicFeatures.maxRealTimeParameters} parâmetros em tempo real`,
    `• ${USAGE_LIMITS.basic.ai_queries} consultas de IA por mês`,
    '• Leitura de códigos DTC básica',
    '• Suporte por email',
  ], yPos, pageWidth, margin, 'success');
  
  yPos = checkPageBreak(doc, yPos, pageHeight, margin);
  
  yPos = drawHighlightBox(doc, '✗ LIMITAÇÕES', [
    '• Sem gravação de dados em tempo real',
    '• Sem exportação CSV/PDF',
    '• Sem funções de codificação',
    '• Sem configurações OBD avançadas',
  ], yPos, pageWidth, margin, 'warning');
  
  yPos = checkPageBreak(doc, yPos, pageHeight, margin, 80);
  
  // Plan Pro
  yPos = drawSubsectionTitle(doc, '2.2 Plano Pro (R$ 29,90/mês)', yPos, margin);
  
  yPos = drawParagraph(doc, 
    'O plano Pro desbloqueia todo o potencial do Doutor Motors, oferecendo diagnósticos ilimitados, funções avançadas de codificação, gravação de dados profissional e suporte prioritário.',
    yPos, pageWidth, margin);
  
  const proFeatures = PLAN_FEATURES.pro;
  yPos = drawHighlightBox(doc, '✓ INCLUÍDO NO PRO', [
    `• Até ${proFeatures.maxVehicles} veículos cadastrados`,
    '• Diagnósticos ILIMITADOS',
    '• Parâmetros em tempo real ILIMITADOS',
    '• Consultas de IA ILIMITADAS',
    '• Gravação de dados com gráficos avançados',
    '• Exportação CSV/PDF completa',
    '• Funções de codificação (marcas selecionadas)',
    '• Configurações OBD avançadas',
    '• Alertas personalizados',
    '• Suporte prioritário',
  ], yPos, pageWidth, margin, 'info');
  
  yPos = checkPageBreak(doc, yPos, pageHeight, margin, 80);
  
  // Comparison Table
  yPos = drawSubsectionTitle(doc, '2.3 Comparativo de Recursos', yPos, margin);
  
  autoTable(doc, {
    startY: yPos,
    head: [['Recurso', 'Basic', 'Pro']],
    body: [
      ['Veículos cadastrados', '1', '10'],
      ['Diagnósticos/mês', '5', 'Ilimitado'],
      ['Funções de Coding/mês', '3', 'Ilimitado'],
      ['Gravações de Dados/mês', '2', 'Ilimitado'],
      ['Consultas IA/mês', '10', 'Ilimitado'],
      ['Parâmetros tempo real', '4', 'Ilimitado'],
      ['Gravação avançada', '✗', '✓'],
      ['Exportação CSV/PDF', '✗', '✓'],
      ['Config. OBD avançadas', '✗', '✓'],
      ['Funções de codificação', '✗', '✓'],
      ['Suporte prioritário', '✗', '✓'],
    ],
    margin: { left: margin, right: margin },
    styles: { 
      fontSize: 10, 
      cellPadding: 4,
      lineColor: COLORS.lightGray,
      lineWidth: 0.3,
    },
    headStyles: { 
      fillColor: COLORS.primary, 
      textColor: COLORS.white,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 75 },
      1: { cellWidth: 35, halign: 'center' },
      2: { cellWidth: 35, halign: 'center' },
    },
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 12;
  
  return yPos;
}

// ====== SECTION 3: TECHNICAL IMPLEMENTATION ======
function drawSection3Technical(doc: jsPDF, yPos: number, pageWidth: number, margin: number, pageHeight: number, contentWidth: number): number {
  yPos = checkPageBreak(doc, yPos, pageHeight, margin, 60);
  
  yPos = drawSectionTitle(doc, '3. IMPLEMENTAÇÃO TÉCNICA', yPos, pageWidth, margin);
  
  // Frontend
  yPos = drawSubsectionTitle(doc, '3.1 Front-end', yPos, margin);
  
  yPos = drawParagraph(doc, 
    'A implementação no front-end utiliza React com TypeScript, seguindo padrões de componentização e hooks personalizados para controle de acesso.',
    yPos, pageWidth, margin);
  
  yPos = checkPageBreak(doc, yPos, pageHeight, margin);
  
  yPos = drawHighlightBox(doc, '📦 COMPONENTES PRINCIPAIS', [
    '• useSubscription: Hook para verificar plano atual e features disponíveis',
    '• useUsageTracking: Controle de uso mensal por tipo de recurso',
    '• FeatureGate: Componente que bloqueia features por plano',
    '• UpgradePrompt: Componente de upgrade não intrusivo',
    '• PlanCard: Exibição de planos com features e preços',
  ], yPos, pageWidth, margin, 'info');
  
  yPos = checkPageBreak(doc, yPos, pageHeight, margin);
  
  yPos = drawParagraph(doc, 
    'CONTROLE DE ACESSO POR PLANO: O hook useSubscription verifica o plano do usuário e expõe funções como canUseFeature() e getFeatureLimit() que são usadas em toda a aplicação para controlar acesso.',
    yPos, pageWidth, margin);
  
  yPos = checkPageBreak(doc, yPos, pageHeight, margin);
  
  // Backend
  yPos = drawSubsectionTitle(doc, '3.2 Back-end', yPos, margin);
  
  yPos = drawParagraph(doc, 
    'O back-end utiliza Supabase com Edge Functions para processamento seguro de pagamentos e validação de assinaturas.',
    yPos, pageWidth, margin);
  
  yPos = drawHighlightBox(doc, '🔧 COMPONENTES DO BACK-END', [
    '• Tabela user_subscriptions: Armazena plano, status e dados Stripe',
    '• Tabela usage_tracking: Controle de uso mensal por recurso',
    '• Edge Function: Criação de checkout session Stripe',
    '• Edge Function: Webhook para eventos Stripe',
    '• RLS Policies: Segurança a nível de linha',
  ], yPos, pageWidth, margin, 'info');
  
  yPos = checkPageBreak(doc, yPos, pageHeight, margin);
  
  yPos = drawChecklist(doc, [
    'Webhook Stripe com verificação de assinatura implementado',
    'Logs de todas as transações com timestamp e user_id',
    'Rate limiting em endpoints de pagamento',
    'Validação dupla: Stripe + banco de dados',
    'Alertas para transações suspeitas',
  ], yPos, pageWidth, margin);
  
  return yPos;
}

// ====== SECTION 4: PAYMENT FLOW ======
function drawSection4PaymentFlow(doc: jsPDF, yPos: number, pageWidth: number, margin: number, pageHeight: number, contentWidth: number): number {
  yPos = checkPageBreak(doc, yPos, pageHeight, margin, 60);
  
  yPos = drawSectionTitle(doc, '4. FLUXO DE PAGAMENTO SEGURO', yPos, pageWidth, margin);
  
  yPos = drawSubsectionTitle(doc, '4.1 Jornada do Usuário', yPos, margin);
  
  yPos = drawParagraph(doc, 
    'O fluxo de pagamento foi projetado para ser simples, transparente e seguro, minimizando fricção enquanto maximiza confiança.',
    yPos, pageWidth, margin);
  
  // Flow steps
  const flowSteps = [
    ['1', 'Descoberta', 'Usuário encontra feature bloqueada ou visita upgrade'],
    ['2', 'Informação', 'Exibição clara de benefícios e preço'],
    ['3', 'Decisão', 'Botão "Assinar Pro" com preço explícito'],
    ['4', 'Checkout', 'Redirecionamento para Stripe Checkout'],
    ['5', 'Pagamento', 'Dados inseridos no ambiente seguro Stripe'],
    ['6', 'Confirmação', 'Webhook atualiza status + email enviado'],
    ['7', 'Ativação', 'Acesso imediato às features Pro'],
  ];
  
  autoTable(doc, {
    startY: yPos,
    head: [['Etapa', 'Nome', 'Descrição']],
    body: flowSteps,
    margin: { left: margin, right: margin },
    styles: { 
      fontSize: 10, 
      cellPadding: 4,
      lineColor: COLORS.lightGray,
    },
    headStyles: { 
      fillColor: COLORS.primary, 
      textColor: COLORS.white,
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 15, halign: 'center', fontStyle: 'bold' },
      1: { cellWidth: 30, fontStyle: 'bold' },
      2: { cellWidth: 'auto' },
    },
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 12;
  
  yPos = checkPageBreak(doc, yPos, pageHeight, margin);
  
  yPos = drawSubsectionTitle(doc, '4.2 Integração com Stripe', yPos, margin);
  
  yPos = drawHighlightBox(doc, '💳 CONFIGURAÇÃO STRIPE', [
    '• Produto: "Doutor Motors Pro" com preço recorrente mensal',
    '• Modo: Subscription com cobrança automática',
    '• Customer Portal: Habilitado para autogerenciamento',
    '• Webhooks: checkout.session.completed, invoice.paid, subscription.*',
  ], yPos, pageWidth, margin, 'info');
  
  yPos = checkPageBreak(doc, yPos, pageHeight, margin);
  
  yPos = drawSubsectionTitle(doc, '4.3 Tratamento de Falhas', yPos, margin);
  
  yPos = drawBulletList(doc, [
    'PAGAMENTO RECUSADO: Mensagem clara + sugestão de verificar dados + retry',
    'TIMEOUT: Verificar status no servidor antes de mostrar erro',
    'ERRO DE REDE: Salvar estado localmente + retry automático',
    'CARTÃO EXPIRADO: Email automático + período de graça de 7 dias',
  ], yPos, pageWidth, margin);
  
  return yPos;
}

// ====== SECTION 5: COMPLIANCE ======
function drawSection5Compliance(doc: jsPDF, yPos: number, pageWidth: number, margin: number, pageHeight: number, contentWidth: number): number {
  yPos = checkPageBreak(doc, yPos, pageHeight, margin, 60);
  
  yPos = drawSectionTitle(doc, '5. COMPLIANCE E PROTEÇÃO DO USUÁRIO', yPos, pageWidth, margin);
  
  yPos = drawSubsectionTitle(doc, '5.1 Consentimento Explícito', yPos, margin);
  
  yPos = drawParagraph(doc, 
    'Antes de qualquer cobrança, o usuário deve ter consentido explicitamente com os Termos de Uso, Política de Privacidade e Termos de Responsabilidade.',
    yPos, pageWidth, margin);
  
  yPos = drawChecklist(doc, [
    'Modal de aceite obrigatório antes do primeiro uso',
    'Checkbox individual para cada documento legal',
    'Registro de consentimento com timestamp e versão',
    'Possibilidade de revisar termos a qualquer momento',
    'Notificação quando termos forem atualizados',
  ], yPos, pageWidth, margin);
  
  yPos = checkPageBreak(doc, yPos, pageHeight, margin);
  
  yPos = drawSubsectionTitle(doc, '5.2 Limites de Responsabilidade', yPos, margin);
  
  yPos = drawHighlightBox(doc, '⚠️ AVISOS OBRIGATÓRIOS', [
    '• "Este sistema é apenas para fins educacionais e informativos"',
    '• "Diagnósticos não substituem avaliação de mecânico profissional"',
    '• "Para problemas críticos, procure uma oficina imediatamente"',
    '• "O usuário é responsável pelas decisões tomadas"',
  ], yPos, pageWidth, margin, 'warning');
  
  yPos = checkPageBreak(doc, yPos, pageHeight, margin);
  
  yPos = drawSubsectionTitle(doc, '5.3 Comunicação de Riscos', yPos, margin);
  
  yPos = drawBulletList(doc, [
    'CRÍTICO (Vermelho): "Requer atenção imediata. Não dirigir até resolver."',
    'ATENÇÃO (Amarelo): "Agende verificação em breve para evitar problemas."',
    'PREVENTIVO (Verde): "Manutenção recomendada. Pode ser agendada com calma."',
  ], yPos, pageWidth, margin);
  
  return yPos;
}

// ====== SECTION 6: ONBOARDING ======
function drawSection6Onboarding(doc: jsPDF, yPos: number, pageWidth: number, margin: number, pageHeight: number, contentWidth: number): number {
  yPos = checkPageBreak(doc, yPos, pageHeight, margin, 60);
  
  yPos = drawSectionTitle(doc, '6. ONBOARDING FINANCEIRO', yPos, pageWidth, margin);
  
  yPos = drawSubsectionTitle(doc, '6.1 Apresentação Sem Pressão', yPos, margin);
  
  yPos = drawBulletList(doc, [
    'Mostrar valor do plano Basic primeiro - deixar usuário experimentar',
    'Após 3-5 usos, sugerir upgrade de forma contextual',
    'Nunca usar countdown timers ou ofertas "limitadas" falsas',
    'Permitir preview de features Pro antes de pagar',
  ], yPos, pageWidth, margin);
  
  yPos = checkPageBreak(doc, yPos, pageHeight, margin);
  
  yPos = drawSubsectionTitle(doc, '6.2 Microcopy para Confiança', yPos, margin);
  
  yPos = drawHighlightBox(doc, '✍️ EXEMPLOS DE MICROCOPY', [
    '• Botão: "Assinar Pro - R$ 29,90/mês" (preço sempre visível)',
    '• Cancelamento: "Cancele a qualquer momento, sem burocracia"',
    '• Garantia: "Satisfação garantida ou dinheiro de volta em 7 dias"',
    '• Segurança: "Pagamento processado com segurança pelo Stripe"',
    '• Renovação: "Renova automaticamente. Avisaremos 3 dias antes."',
  ], yPos, pageWidth, margin, 'success');
  
  yPos = checkPageBreak(doc, yPos, pageHeight, margin);
  
  yPos = drawSubsectionTitle(doc, '6.3 Emails Transacionais', yPos, margin);
  
  autoTable(doc, {
    startY: yPos,
    head: [['Evento', 'Email', 'Timing']],
    body: [
      ['Assinatura criada', 'Boas-vindas + tutorial Pro', 'Imediato'],
      ['Pagamento OK', 'Recibo + link portal', 'Imediato'],
      ['Renovação próxima', 'Aviso de cobrança', '3 dias antes'],
      ['Pagamento falhou', 'Instruções para atualizar', 'Imediato'],
      ['Cancelamento', 'Confirmação + feedback', 'Imediato'],
    ],
    margin: { left: margin, right: margin },
    styles: { 
      fontSize: 10, 
      cellPadding: 4,
      lineColor: COLORS.lightGray,
    },
    headStyles: { 
      fillColor: COLORS.primary, 
      textColor: COLORS.white,
    },
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 12;
  
  return yPos;
}

// ====== SECTION 7: METRICS ======
function drawSection7Metrics(doc: jsPDF, yPos: number, pageWidth: number, margin: number, pageHeight: number, contentWidth: number): number {
  yPos = checkPageBreak(doc, yPos, pageHeight, margin, 60);
  
  yPos = drawSectionTitle(doc, '7. MÉTRICAS E CONTROLE', yPos, pageWidth, margin);
  
  yPos = drawSubsectionTitle(doc, '7.1 Métricas Essenciais', yPos, margin);
  
  autoTable(doc, {
    startY: yPos,
    head: [['Métrica', 'Descrição', 'Meta']],
    body: [
      ['Taxa de Conversão', 'Basic → Pro', '5-8%'],
      ['Churn Mensal', 'Cancelamentos / Total', '< 5%'],
      ['LTV', 'Receita média por cliente', '> R$ 150'],
      ['CAC', 'Custo aquisição cliente', '< R$ 30'],
      ['LTV:CAC Ratio', 'Retorno sobre aquisição', '> 5:1'],
      ['MRR', 'Receita recorrente mensal', '+10%/mês'],
    ],
    margin: { left: margin, right: margin },
    styles: { 
      fontSize: 10, 
      cellPadding: 4,
      lineColor: COLORS.lightGray,
    },
    headStyles: { 
      fillColor: COLORS.primary, 
      textColor: COLORS.white,
    },
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 12;
  
  yPos = checkPageBreak(doc, yPos, pageHeight, margin);
  
  yPos = drawSubsectionTitle(doc, '7.2 Indicadores de Problemas', yPos, margin);
  
  yPos = drawBulletList(doc, [
    'Taxa de estorno > 1%: Revisar comunicação e expectativas',
    'Cancelamento < 7 dias > 30%: Problema na entrega de valor',
    'Reclamações sobre cobrança: Revisar transparência de preços',
    'Baixo engajamento pós-upgrade: Features não estão claras',
  ], yPos, pageWidth, margin);
  
  yPos = checkPageBreak(doc, yPos, pageHeight, margin);
  
  yPos = drawHighlightBox(doc, '🚨 ALERTAS AUTOMÁTICOS', [
    '• Múltiplas tentativas falhadas do mesmo IP',
    '• Uso anormal de recursos (acima da média)',
    '• Criação de múltiplas contas do mesmo dispositivo',
    '• Chargebacks ou disputas de pagamento',
  ], yPos, pageWidth, margin, 'warning');
  
  return yPos;
}

// ====== SECTION 8: ROADMAP ======
function drawSection8Roadmap(doc: jsPDF, yPos: number, pageWidth: number, margin: number, pageHeight: number, contentWidth: number): number {
  yPos = checkPageBreak(doc, yPos, pageHeight, margin, 60);
  
  yPos = drawSectionTitle(doc, '8. ROADMAP DE EVOLUÇÃO', yPos, pageWidth, margin);
  
  yPos = drawSubsectionTitle(doc, '8.1 Fase 1 - MVP (Atual)', yPos, margin);
  
  yPos = drawChecklist(doc, [
    'Dois planos: Basic (R$ 0) e Pro (R$ 29,90/mês)',
    'Integração com Stripe para pagamentos',
    'Controle de uso por tipo de recurso',
    'FeatureGate para bloquear features premium',
    'Página de upgrade com comparativo',
    'Emails transacionais básicos',
  ], yPos, pageWidth, margin);
  
  yPos = checkPageBreak(doc, yPos, pageHeight, margin);
  
  yPos = drawSubsectionTitle(doc, '8.2 Fase 2 - Intermediária', yPos, margin);
  
  yPos = drawBulletList(doc, [
    'Plano anual com desconto (R$ 239/ano = 2 meses grátis)',
    'Trial de 7 dias do Pro sem cartão',
    'Compra pontual de diagnósticos (R$ 5/diagnóstico)',
    'Customer Portal completo',
    'Cupons de desconto e programa de indicação',
  ], yPos, pageWidth, margin);
  
  yPos = checkPageBreak(doc, yPos, pageHeight, margin);
  
  yPos = drawSubsectionTitle(doc, '8.3 Fase 3 - B2B', yPos, margin);
  
  yPos = drawBulletList(doc, [
    'Plano Oficina: R$ 99,90/mês com múltiplos usuários',
    'Plano Frota: Preço por veículo para gestores',
    'API para integração com sistemas de oficinas',
    'Relatórios white-label para oficinas',
    'Marketplace de peças com comissão',
  ], yPos, pageWidth, margin);
  
  yPos = checkPageBreak(doc, yPos, pageHeight, margin, 80);
  
  // Final CTA box
  yPos = drawHighlightBox(doc, '🚀 PRÓXIMOS PASSOS', [
    '1. Habilitar integração Stripe no projeto',
    '2. Criar produtos e preços no dashboard Stripe',
    '3. Implementar Edge Function para checkout',
    '4. Implementar webhook para processar eventos',
    '5. Testar fluxo completo em modo sandbox',
    '6. Configurar emails transacionais',
    '7. Lançar em produção com monitoramento ativo',
  ], yPos, pageWidth, margin, 'info');
  
  return yPos;
}

function drawPageDecorations(doc: jsPDF, currentPage: number, totalPages: number, pageWidth: number, pageHeight: number, margin: number): void {
  // Skip on cover page
  if (currentPage === 1) return;
  
  // Header line
  doc.setDrawColor(...COLORS.primary);
  doc.setLineWidth(0.5);
  doc.line(margin, 12, pageWidth - margin, 12);
  
  // Header text
  doc.setTextColor(...COLORS.gray);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Guia de Monetização Segura', margin, 9);
  doc.text('Doutor Motors', pageWidth - margin, 9, { align: 'right' });
  
  // Footer
  doc.setDrawColor(...COLORS.lightGray);
  doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
  
  doc.setTextColor(...COLORS.gray);
  doc.setFontSize(8);
  
  const dateStr = format(new Date(), 'dd/MM/yyyy', { locale: ptBR });
  doc.text(`Gerado em: ${dateStr}`, margin, pageHeight - 7);
  doc.text(`Página ${currentPage - 1} de ${totalPages - 1}`, pageWidth - margin, pageHeight - 7, { align: 'right' });
}

/**
 * Downloads the generated PDF
 */
export async function downloadMonetizationGuide(): Promise<void> {
  const blob = await generateMonetizationGuidePDF();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Guia_Monetizacao_DoutorMotors_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
