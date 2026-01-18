import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PLAN_FEATURES } from '@/hooks/useSubscription';
import { USAGE_LIMITS } from '@/hooks/useUsageTracking';

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

interface GuideSection {
  title: string;
  content: string[];
  subsections?: { title: string; content: string[] }[];
  table?: { headers: string[]; rows: string[][] };
  highlight?: boolean;
  checklist?: string[];
}

/**
 * Generates the complete Monetization Development Guide PDF
 */
export async function generateMonetizationGuidePDF(): Promise<Blob> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let yPos = margin;
  let pageNumber = 1;

  // === COVER PAGE ===
  drawCoverPage(doc, pageWidth, pageHeight);
  doc.addPage();
  pageNumber++;

  // === TABLE OF CONTENTS ===
  yPos = drawTableOfContents(doc, pageWidth, margin);
  doc.addPage();
  pageNumber++;

  // === SECTION 1: OVERVIEW ===
  yPos = margin;
  yPos = drawSection1Overview(doc, yPos, pageWidth, margin, pageHeight);

  // === SECTION 2: MONETIZATION MODELS ===
  yPos = drawSection2Models(doc, yPos, pageWidth, margin, pageHeight);

  // === SECTION 3: TECHNICAL IMPLEMENTATION ===
  yPos = drawSection3Technical(doc, yPos, pageWidth, margin, pageHeight);

  // === SECTION 4: SECURE PAYMENT FLOW ===
  yPos = drawSection4PaymentFlow(doc, yPos, pageWidth, margin, pageHeight);

  // === SECTION 5: COMPLIANCE & LEGAL ===
  yPos = drawSection5Compliance(doc, yPos, pageWidth, margin, pageHeight);

  // === SECTION 6: FINANCIAL ONBOARDING ===
  yPos = drawSection6Onboarding(doc, yPos, pageWidth, margin, pageHeight);

  // === SECTION 7: METRICS & CONTROL ===
  yPos = drawSection7Metrics(doc, yPos, pageWidth, margin, pageHeight);

  // === SECTION 8: EVOLUTION ROADMAP ===
  yPos = drawSection8Roadmap(doc, yPos, pageWidth, margin, pageHeight);

  // Add page numbers
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawFooter(doc, i, totalPages, pageWidth, pageHeight, margin);
  }

  return doc.output('blob');
}

function drawCoverPage(doc: jsPDF, pageWidth: number, pageHeight: number): void {
  // Background gradient effect
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, pageHeight * 0.4, 'F');
  
  // Title section
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.text('GUIA DE DESENVOLVIMENTO', pageWidth / 2, 60, { align: 'center' });
  
  doc.setFontSize(28);
  doc.text('MONETIZAÇÃO SEGURA', pageWidth / 2, 75, { align: 'center' });
  
  // Subtitle
  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.text('Sistema Doutor Motors', pageWidth / 2, 95, { align: 'center' });
  
  // Version badge
  doc.setFillColor(...COLORS.white);
  doc.roundedRect(pageWidth / 2 - 25, 105, 50, 10, 2, 2, 'F');
  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(10);
  doc.text('Versão 1.0', pageWidth / 2, 112, { align: 'center' });
  
  // Decorative line
  doc.setDrawColor(...COLORS.secondary);
  doc.setLineWidth(0.5);
  doc.line(30, pageHeight * 0.4 + 20, pageWidth - 30, pageHeight * 0.4 + 20);
  
  // Description box
  doc.setTextColor(...COLORS.dark);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  
  const description = [
    'Este documento apresenta o guia completo de implementação',
    'de monetização segura para o sistema Doutor Motors,',
    'cobrindo aspectos técnicos, legais e estratégicos.',
  ];
  
  let descY = pageHeight * 0.5;
  description.forEach(line => {
    doc.text(line, pageWidth / 2, descY, { align: 'center' });
    descY += 8;
  });
  
  // Key topics
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Tópicos Abordados:', pageWidth / 2, descY + 15, { align: 'center' });
  
  const topics = [
    '• Modelos de monetização (Basic e Pro)',
    '• Implementação técnica front-end e back-end',
    '• Fluxo de pagamento seguro com Stripe',
    '• Compliance e proteção do usuário',
    '• Métricas e roadmap de evolução',
  ];
  
  doc.setFont('helvetica', 'normal');
  let topicY = descY + 28;
  topics.forEach(topic => {
    doc.text(topic, pageWidth / 2, topicY, { align: 'center' });
    topicY += 7;
  });
  
  // Footer info
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.gray);
  const dateStr = format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  doc.text(`Gerado em: ${dateStr}`, pageWidth / 2, pageHeight - 30, { align: 'center' });
  doc.text('Confidencial - Uso Interno', pageWidth / 2, pageHeight - 22, { align: 'center' });
}

function drawTableOfContents(doc: jsPDF, pageWidth: number, margin: number): number {
  let yPos = margin;
  
  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('ÍNDICE', margin, yPos + 10);
  yPos += 25;
  
  const sections = [
    { num: '1', title: 'Visão Geral da Monetização', page: 3 },
    { num: '1.1', title: 'Objetivos e Princípios', page: 3 },
    { num: '1.2', title: 'Práticas a Evitar', page: 3 },
    { num: '2', title: 'Modelos de Monetização', page: 4 },
    { num: '2.1', title: 'Plano Basic (R$ 0/mês)', page: 4 },
    { num: '2.2', title: 'Plano Pro (R$ 29,90/mês)', page: 4 },
    { num: '2.3', title: 'Comparativo de Recursos', page: 5 },
    { num: '3', title: 'Implementação Técnica', page: 6 },
    { num: '3.1', title: 'Front-end', page: 6 },
    { num: '3.2', title: 'Back-end', page: 7 },
    { num: '4', title: 'Fluxo de Pagamento Seguro', page: 8 },
    { num: '4.1', title: 'Integração com Stripe', page: 8 },
    { num: '4.2', title: 'Tratamento de Falhas', page: 9 },
    { num: '5', title: 'Compliance e Proteção do Usuário', page: 10 },
    { num: '5.1', title: 'Consentimento e Termos', page: 10 },
    { num: '5.2', title: 'Comunicação de Riscos', page: 10 },
    { num: '6', title: 'Onboarding Financeiro', page: 11 },
    { num: '7', title: 'Métricas e Controle', page: 12 },
    { num: '8', title: 'Roadmap de Evolução', page: 13 },
  ];
  
  sections.forEach(section => {
    const isMainSection = !section.num.includes('.');
    
    doc.setFont('helvetica', isMainSection ? 'bold' : 'normal');
    doc.setFontSize(isMainSection ? 12 : 10);
    doc.setTextColor(...(isMainSection ? COLORS.dark : COLORS.gray));
    
    const xOffset = isMainSection ? 0 : 10;
    doc.text(`${section.num}. ${section.title}`, margin + xOffset, yPos);
    
    // Dotted line to page number
    const textWidth = doc.getTextWidth(`${section.num}. ${section.title}`);
    const dotsStart = margin + xOffset + textWidth + 2;
    const dotsEnd = pageWidth - margin - 15;
    
    doc.setDrawColor(...COLORS.lightGray);
    doc.setLineDashPattern([1, 1], 0);
    doc.line(dotsStart, yPos, dotsEnd, yPos);
    doc.setLineDashPattern([], 0);
    
    doc.text(String(section.page), pageWidth - margin, yPos, { align: 'right' });
    
    yPos += isMainSection ? 10 : 7;
  });
  
  return yPos;
}

function checkPageBreak(doc: jsPDF, yPos: number, pageHeight: number, margin: number, neededSpace: number = 40): number {
  if (yPos > pageHeight - neededSpace) {
    doc.addPage();
    return margin;
  }
  return yPos;
}

function drawSectionTitle(doc: jsPDF, title: string, yPos: number, pageWidth: number, margin: number): number {
  doc.setFillColor(...COLORS.primary);
  doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 12, 2, 2, 'F');
  
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(title, margin + 5, yPos + 8);
  
  return yPos + 18;
}

function drawSubsectionTitle(doc: jsPDF, title: string, yPos: number, margin: number): number {
  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(title, margin, yPos);
  
  return yPos + 8;
}

function drawParagraph(doc: jsPDF, text: string, yPos: number, pageWidth: number, margin: number): number {
  doc.setTextColor(...COLORS.dark);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const lines = doc.splitTextToSize(text, pageWidth - 2 * margin);
  doc.text(lines, margin, yPos);
  
  return yPos + lines.length * 5 + 3;
}

function drawBulletList(doc: jsPDF, items: string[], yPos: number, pageWidth: number, margin: number): number {
  doc.setTextColor(...COLORS.dark);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  items.forEach(item => {
    const lines = doc.splitTextToSize(item, pageWidth - 2 * margin - 10);
    doc.text('•', margin, yPos);
    doc.text(lines, margin + 5, yPos);
    yPos += lines.length * 5 + 2;
  });
  
  return yPos + 3;
}

function drawHighlightBox(doc: jsPDF, title: string, content: string[], yPos: number, pageWidth: number, margin: number, color: [number, number, number] = COLORS.secondary): number {
  const boxHeight = 8 + content.length * 6;
  
  doc.setFillColor(color[0], color[1], color[2], 0.1);
  doc.setDrawColor(...color);
  doc.roundedRect(margin, yPos, pageWidth - 2 * margin, boxHeight, 3, 3, 'FD');
  
  doc.setTextColor(...color);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(title, margin + 5, yPos + 6);
  
  doc.setTextColor(...COLORS.dark);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  
  let contentY = yPos + 12;
  content.forEach(line => {
    doc.text(line, margin + 5, contentY);
    contentY += 5;
  });
  
  return yPos + boxHeight + 8;
}

function drawChecklist(doc: jsPDF, items: string[], yPos: number, pageWidth: number, margin: number): number {
  doc.setFontSize(9);
  
  items.forEach(item => {
    doc.setDrawColor(...COLORS.gray);
    doc.rect(margin, yPos - 3, 4, 4);
    
    doc.setTextColor(...COLORS.dark);
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(item, pageWidth - 2 * margin - 10);
    doc.text(lines, margin + 7, yPos);
    yPos += lines.length * 4 + 3;
  });
  
  return yPos + 3;
}

// ====== SECTION 1: OVERVIEW ======
function drawSection1Overview(doc: jsPDF, yPos: number, pageWidth: number, margin: number, pageHeight: number): number {
  yPos = drawSectionTitle(doc, '1. VISÃO GERAL DA MONETIZAÇÃO DO DOUTOR MOTORS', yPos, pageWidth, margin);
  
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
  yPos = drawHighlightBox(doc, '⚠️ NUNCA FAZER:', [
    '• Dark patterns que induzem ao erro (botões confusos, textos enganosos)',
    '• Cobranças automáticas sem aviso prévio claro',
    '• Ocultar funcionalidades essenciais de segurança atrás de paywall',
    '• Dificultar o cancelamento ou estorno',
    '• Usar linguagem que exagere riscos para forçar upgrade',
  ], yPos, pageWidth, margin, COLORS.danger);
  
  return yPos;
}

// ====== SECTION 2: MONETIZATION MODELS ======
function drawSection2Models(doc: jsPDF, yPos: number, pageWidth: number, margin: number, pageHeight: number): number {
  yPos = checkPageBreak(doc, yPos, pageHeight, margin, 60);
  
  yPos = drawSectionTitle(doc, '2. MODELOS DE MONETIZAÇÃO PREVISTOS', yPos, pageWidth, margin);
  
  // Plan Basic
  yPos = drawSubsectionTitle(doc, '2.1 Plano Basic (R$ 0/mês)', yPos, margin);
  
  yPos = drawParagraph(doc, 
    'O plano Basic oferece acesso às funcionalidades essenciais de diagnóstico veicular, permitindo que usuários conheçam o sistema e realizem diagnósticos básicos sem custo.',
    yPos, pageWidth, margin);
  
  const basicFeatures = PLAN_FEATURES.basic;
  yPos = drawHighlightBox(doc, '✓ INCLUÍDO NO BASIC:', [
    `• ${basicFeatures.maxVehicles} veículo cadastrado`,
    `• ${USAGE_LIMITS.basic.diagnostics} diagnósticos por mês`,
    `• ${basicFeatures.maxRealTimeParameters} parâmetros em tempo real`,
    `• ${USAGE_LIMITS.basic.ai_queries} consultas de IA por mês`,
    '• Leitura de códigos DTC básica',
    '• Suporte por email',
  ], yPos, pageWidth, margin, COLORS.success);
  
  yPos = checkPageBreak(doc, yPos, pageHeight, margin);
  
  // Limitations
  yPos = drawHighlightBox(doc, '✗ LIMITAÇÕES:', [
    '• Sem gravação de dados em tempo real',
    '• Sem exportação CSV/PDF',
    '• Sem funções de codificação',
    '• Sem configurações OBD avançadas',
  ], yPos, pageWidth, margin, COLORS.warning);
  
  yPos = checkPageBreak(doc, yPos, pageHeight, margin, 80);
  
  // Plan Pro
  yPos = drawSubsectionTitle(doc, '2.2 Plano Pro (R$ 29,90/mês)', yPos, margin);
  
  yPos = drawParagraph(doc, 
    'O plano Pro desbloqueia todo o potencial do Doutor Motors, oferecendo diagnósticos ilimitados, funções avançadas de codificação, gravação de dados profissional e suporte prioritário.',
    yPos, pageWidth, margin);
  
  const proFeatures = PLAN_FEATURES.pro;
  yPos = drawHighlightBox(doc, '✓ INCLUÍDO NO PRO:', [
    `• Até ${proFeatures.maxVehicles} veículos cadastrados`,
    '• Diagnósticos ILIMITADOS',
    '• Parâmetros em tempo real ILIMITADOS',
    '• Consultas de IA ILIMITADAS',
    '• Gravação de dados com gráficos avançados',
    '• Exportação CSV/PDF completa',
    '• Funções de codificação (marcas selecionadas)',
    '• Configurações OBD avançadas (ATST, protocolos)',
    '• Alertas personalizados',
    '• Suporte prioritário',
    '• Modo offline',
  ], yPos, pageWidth, margin, COLORS.primary);
  
  yPos = checkPageBreak(doc, yPos, pageHeight, margin, 80);
  
  // Comparison Table
  yPos = drawSubsectionTitle(doc, '2.3 Comparativo Detalhado de Recursos', yPos, margin);
  
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
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: COLORS.primary, textColor: COLORS.white },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 35, halign: 'center' },
      2: { cellWidth: 35, halign: 'center' },
    },
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 10;
  
  return yPos;
}

// ====== SECTION 3: TECHNICAL IMPLEMENTATION ======
function drawSection3Technical(doc: jsPDF, yPos: number, pageWidth: number, margin: number, pageHeight: number): number {
  yPos = checkPageBreak(doc, yPos, pageHeight, margin, 60);
  
  yPos = drawSectionTitle(doc, '3. IMPLEMENTAÇÃO TÉCNICA DA MONETIZAÇÃO', yPos, pageWidth, margin);
  
  // Frontend
  yPos = drawSubsectionTitle(doc, '3.1 Front-end', yPos, margin);
  
  yPos = drawParagraph(doc, 
    'A implementação no front-end utiliza React com TypeScript, seguindo padrões de componentização e hooks personalizados para controle de acesso.',
    yPos, pageWidth, margin);
  
  yPos = checkPageBreak(doc, yPos, pageHeight, margin);
  
  yPos = drawHighlightBox(doc, 'COMPONENTES PRINCIPAIS:', [
    '• useSubscription: Hook para verificar plano atual e features disponíveis',
    '• useUsageTracking: Controle de uso mensal por tipo de recurso',
    '• FeatureGate: Componente que bloqueia features por plano',
    '• UpgradePrompt: Componente de upgrade não intrusivo',
    '• PlanCard: Exibição de planos com features e preços',
  ], yPos, pageWidth, margin, COLORS.secondary);
  
  yPos = checkPageBreak(doc, yPos, pageHeight, margin);
  
  yPos = drawParagraph(doc, 
    'CONTROLE DE ACESSO POR PLANO: O hook useSubscription verifica o plano do usuário e expõe funções como canUseFeature() e getFeatureLimit() que são usadas em toda a aplicação para controlar acesso.',
    yPos, pageWidth, margin);
  
  yPos = drawParagraph(doc, 
    'UI/UX DE PAYWALL: Usar o componente FeatureGate para envolver features premium. Quando o usuário não tem acesso, é exibido o UpgradePrompt com mensagem clara de valor e botão de upgrade. Nunca bloquear completamente - sempre mostrar preview do que o usuário ganha.',
    yPos, pageWidth, margin);
  
  yPos = checkPageBreak(doc, yPos, pageHeight, margin);
  
  // Backend
  yPos = drawSubsectionTitle(doc, '3.2 Back-end', yPos, margin);
  
  yPos = drawParagraph(doc, 
    'O back-end utiliza Supabase com Edge Functions para processamento seguro de pagamentos e validação de assinaturas.',
    yPos, pageWidth, margin);
  
  yPos = drawHighlightBox(doc, 'COMPONENTES DO BACK-END:', [
    '• Tabela user_subscriptions: Armazena plano, status e dados Stripe',
    '• Tabela usage_tracking: Controle de uso mensal por recurso',
    '• Edge Function: Criação de checkout session Stripe',
    '• Edge Function: Webhook para eventos Stripe',
    '• RLS Policies: Segurança a nível de linha',
  ], yPos, pageWidth, margin, COLORS.secondary);
  
  yPos = checkPageBreak(doc, yPos, pageHeight, margin);
  
  yPos = drawParagraph(doc, 
    'VALIDAÇÃO DE PAGAMENTOS: Todas as validações de pagamento devem ocorrer no servidor via webhooks do Stripe. Nunca confiar em dados do cliente para confirmar pagamentos.',
    yPos, pageWidth, margin);
  
  yPos = drawParagraph(doc, 
    'SISTEMA ANTIFRAUDE: Implementar rate limiting, validação de IPs suspeitos, e logs detalhados de todas as transações. Usar verificação de assinatura dos webhooks Stripe.',
    yPos, pageWidth, margin);
  
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
function drawSection4PaymentFlow(doc: jsPDF, yPos: number, pageWidth: number, margin: number, pageHeight: number): number {
  yPos = checkPageBreak(doc, yPos, pageHeight, margin, 60);
  
  yPos = drawSectionTitle(doc, '4. FLUXO DE PAGAMENTO SEGURO', yPos, pageWidth, margin);
  
  yPos = drawSubsectionTitle(doc, '4.1 Jornada Completa do Usuário', yPos, margin);
  
  yPos = drawParagraph(doc, 
    'O fluxo de pagamento foi projetado para ser simples, transparente e seguro, minimizando fricção enquanto maximiza confiança.',
    yPos, pageWidth, margin);
  
  // Flow steps
  const flowSteps = [
    ['1', 'DESCOBERTA', 'Usuário encontra feature bloqueada ou visita página de upgrade'],
    ['2', 'INFORMAÇÃO', 'Exibição clara de benefícios, preço e comparativo de planos'],
    ['3', 'DECISÃO', 'Botão de "Assinar Pro" com preço explícito (R$ 29,90/mês)'],
    ['4', 'CHECKOUT', 'Redirecionamento para Stripe Checkout (ambiente seguro)'],
    ['5', 'PAGAMENTO', 'Usuário insere dados de pagamento no Stripe'],
    ['6', 'CONFIRMAÇÃO', 'Webhook atualiza status + email de confirmação'],
    ['7', 'ATIVAÇÃO', 'Acesso imediato a todas as features Pro'],
  ];
  
  autoTable(doc, {
    startY: yPos,
    head: [['Etapa', 'Nome', 'Descrição']],
    body: flowSteps,
    margin: { left: margin, right: margin },
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: COLORS.primary, textColor: COLORS.white },
    columnStyles: {
      0: { cellWidth: 15, halign: 'center', fontStyle: 'bold' },
      1: { cellWidth: 30, fontStyle: 'bold' },
      2: { cellWidth: 'auto' },
    },
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 10;
  
  yPos = checkPageBreak(doc, yPos, pageHeight, margin);
  
  yPos = drawSubsectionTitle(doc, '4.2 Integração com Stripe', yPos, margin);
  
  yPos = drawHighlightBox(doc, 'CONFIGURAÇÃO STRIPE:', [
    '• Produto: "Doutor Motors Pro" com preço recorrente mensal',
    '• Modo: Subscription com cobrança automática',
    '• Customer Portal: Habilitado para autogerenciamento',
    '• Webhooks: checkout.session.completed, invoice.paid, subscription.*',
  ], yPos, pageWidth, margin, COLORS.secondary);
  
  yPos = checkPageBreak(doc, yPos, pageHeight, margin);
  
  yPos = drawSubsectionTitle(doc, '4.3 Tratamento de Falhas', yPos, margin);
  
  yPos = drawBulletList(doc, [
    'PAGAMENTO RECUSADO: Mensagem clara + sugestão de verificar dados + opção de tentar novamente',
    'TIMEOUT: Verificar status no servidor antes de mostrar erro + botão de "Verificar Status"',
    'ERRO DE REDE: Salvar estado localmente + retry automático quando conexão restaurar',
    'CARTÃO EXPIRADO: Email automático + notificação no app + período de graça de 7 dias',
  ], yPos, pageWidth, margin);
  
  yPos = checkPageBreak(doc, yPos, pageHeight, margin);
  
  yPos = drawSubsectionTitle(doc, '4.4 Política de Estornos', yPos, margin);
  
  yPos = drawParagraph(doc, 
    'Garantia de 7 dias: Usuário pode solicitar estorno total se não estiver satisfeito nos primeiros 7 dias. Processamento automático via Stripe sem burocracia.',
    yPos, pageWidth, margin);
  
  return yPos;
}

// ====== SECTION 5: COMPLIANCE ======
function drawSection5Compliance(doc: jsPDF, yPos: number, pageWidth: number, margin: number, pageHeight: number): number {
  yPos = checkPageBreak(doc, yPos, pageHeight, margin, 60);
  
  yPos = drawSectionTitle(doc, '5. COMPLIANCE, LEGAL E PROTEÇÃO DO USUÁRIO', yPos, pageWidth, margin);
  
  yPos = drawSubsectionTitle(doc, '5.1 Consentimento Explícito', yPos, margin);
  
  yPos = drawParagraph(doc, 
    'Antes de qualquer cobrança, o usuário deve ter consentido explicitamente com os Termos de Uso, Política de Privacidade e Termos de Responsabilidade.',
    yPos, pageWidth, margin);
  
  yPos = drawChecklist(doc, [
    'Modal de aceite obrigatório antes do primeiro uso',
    'Checkbox individual para cada documento legal',
    'Registro de consentimento com timestamp e versão do documento',
    'Possibilidade de revisar termos a qualquer momento',
    'Notificação quando termos forem atualizados',
  ], yPos, pageWidth, margin);
  
  yPos = checkPageBreak(doc, yPos, pageHeight, margin);
  
  yPos = drawSubsectionTitle(doc, '5.2 Limites de Responsabilidade', yPos, margin);
  
  yPos = drawHighlightBox(doc, '⚠️ AVISOS OBRIGATÓRIOS:', [
    '• "Este sistema é apenas para fins educacionais e informativos"',
    '• "Diagnósticos não substituem avaliação de mecânico profissional"',
    '• "Para problemas críticos de segurança, procure uma oficina imediatamente"',
    '• "O usuário é responsável por decisões tomadas com base nas informações"',
  ], yPos, pageWidth, margin, COLORS.warning);
  
  yPos = checkPageBreak(doc, yPos, pageHeight, margin);
  
  yPos = drawSubsectionTitle(doc, '5.3 Comunicação de Riscos', yPos, margin);
  
  yPos = drawParagraph(doc, 
    'A comunicação de riscos deve ser clara mas não alarmista. O objetivo é informar o usuário para que tome decisões conscientes, sem criar pânico desnecessário.',
    yPos, pageWidth, margin);
  
  yPos = drawBulletList(doc, [
    'CRÍTICO (Vermelho): "Requer atenção imediata. Recomendamos não dirigir até resolver."',
    'ATENÇÃO (Amarelo): "Agende uma verificação em breve para evitar problemas maiores."',
    'PREVENTIVO (Verde): "Manutenção preventiva recomendada. Pode ser agendada com calma."',
  ], yPos, pageWidth, margin);
  
  yPos = drawParagraph(doc, 
    'Para sistemas críticos de segurança (freios, direção, airbags), sempre recomendar verificação profissional independente do nível de severidade detectado.',
    yPos, pageWidth, margin);
  
  return yPos;
}

// ====== SECTION 6: ONBOARDING ======
function drawSection6Onboarding(doc: jsPDF, yPos: number, pageWidth: number, margin: number, pageHeight: number): number {
  yPos = checkPageBreak(doc, yPos, pageHeight, margin, 60);
  
  yPos = drawSectionTitle(doc, '6. ONBOARDING FINANCEIRO E EDUCATIVO', yPos, pageWidth, margin);
  
  yPos = drawSubsectionTitle(doc, '6.1 Apresentação de Planos Sem Pressão', yPos, margin);
  
  yPos = drawBulletList(doc, [
    'Mostrar valor do plano Basic primeiro - deixar usuário experimentar',
    'Após 3-5 usos, sugerir upgrade de forma contextual (não pop-ups intrusivos)',
    'Nunca usar countdown timers ou ofertas "limitadas" falsas',
    'Permitir que usuário explore features Pro em modo preview antes de pagar',
  ], yPos, pageWidth, margin);
  
  yPos = checkPageBreak(doc, yPos, pageHeight, margin);
  
  yPos = drawSubsectionTitle(doc, '6.2 Microcopy para Confiança', yPos, margin);
  
  yPos = drawHighlightBox(doc, 'EXEMPLOS DE MICROCOPY:', [
    '• Botão de upgrade: "Assinar Pro - R$ 29,90/mês" (preço sempre visível)',
    '• Cancelamento: "Cancele a qualquer momento, sem burocracia"',
    '• Garantia: "Satisfação garantida ou seu dinheiro de volta em 7 dias"',
    '• Segurança: "Pagamento processado com segurança pelo Stripe"',
    '• Renovação: "Renova automaticamente. Avisaremos 3 dias antes."',
  ], yPos, pageWidth, margin, COLORS.success);
  
  yPos = checkPageBreak(doc, yPos, pageHeight, margin);
  
  yPos = drawSubsectionTitle(doc, '6.3 Emails Transacionais', yPos, margin);
  
  autoTable(doc, {
    startY: yPos,
    head: [['Evento', 'Email', 'Timing']],
    body: [
      ['Assinatura criada', 'Boas-vindas + como usar Pro', 'Imediato'],
      ['Pagamento confirmado', 'Recibo + link para portal', 'Imediato'],
      ['Renovação próxima', 'Aviso de cobrança', '3 dias antes'],
      ['Pagamento falhou', 'Instruções para atualizar', 'Imediato + 3 dias'],
      ['Cancelamento', 'Confirmação + feedback', 'Imediato'],
      ['Assinatura expirada', 'O que você perdeu + oferta', '1 dia após'],
    ],
    margin: { left: margin, right: margin },
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: COLORS.primary, textColor: COLORS.white },
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 10;
  
  return yPos;
}

// ====== SECTION 7: METRICS ======
function drawSection7Metrics(doc: jsPDF, yPos: number, pageWidth: number, margin: number, pageHeight: number): number {
  yPos = checkPageBreak(doc, yPos, pageHeight, margin, 60);
  
  yPos = drawSectionTitle(doc, '7. MÉTRICAS E CONTROLE', yPos, pageWidth, margin);
  
  yPos = drawSubsectionTitle(doc, '7.1 Métricas Essenciais de Monetização', yPos, margin);
  
  autoTable(doc, {
    startY: yPos,
    head: [['Métrica', 'Descrição', 'Meta Inicial']],
    body: [
      ['Taxa de Conversão', 'Basic → Pro', '5-8%'],
      ['Churn Mensal', 'Cancelamentos / Total assinantes', '< 5%'],
      ['LTV (Lifetime Value)', 'Receita média por cliente', '> R$ 150'],
      ['CAC (Custo Aquisição)', 'Custo para adquirir 1 cliente', '< R$ 30'],
      ['LTV:CAC Ratio', 'Retorno sobre aquisição', '> 5:1'],
      ['MRR (Monthly Recurring)', 'Receita recorrente mensal', 'Crescimento 10%/mês'],
      ['ARPU', 'Receita média por usuário', '> R$ 5'],
      ['Trial to Paid', 'Conversão de trial', '> 20%'],
    ],
    margin: { left: margin, right: margin },
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: COLORS.primary, textColor: COLORS.white },
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 10;
  
  yPos = checkPageBreak(doc, yPos, pageHeight, margin);
  
  yPos = drawSubsectionTitle(doc, '7.2 Indicadores de Problemas de Confiança', yPos, margin);
  
  yPos = drawBulletList(doc, [
    'Taxa de estorno > 1%: Revisar comunicação e expectativas',
    'Cancelamento antes de 7 dias > 30%: Problema na entrega de valor',
    'Reclamações sobre cobrança: Revisar transparência de preços',
    'Baixo engajamento pós-upgrade: Features não estão claras',
  ], yPos, pageWidth, margin);
  
  yPos = checkPageBreak(doc, yPos, pageHeight, margin);
  
  yPos = drawSubsectionTitle(doc, '7.3 Monitoramento de Abusos', yPos, margin);
  
  yPos = drawHighlightBox(doc, 'ALERTAS AUTOMÁTICOS:', [
    '• Múltiplas tentativas de pagamento falhadas do mesmo IP',
    '• Uso anormal de recursos (muito acima da média)',
    '• Criação de múltiplas contas com mesmo dispositivo',
    '• Chargebacks ou disputas de pagamento',
    '• Padrões de uso que indicam compartilhamento de conta',
  ], yPos, pageWidth, margin, COLORS.warning);
  
  return yPos;
}

// ====== SECTION 8: ROADMAP ======
function drawSection8Roadmap(doc: jsPDF, yPos: number, pageWidth: number, margin: number, pageHeight: number): number {
  yPos = checkPageBreak(doc, yPos, pageHeight, margin, 60);
  
  yPos = drawSectionTitle(doc, '8. ROADMAP DE EVOLUÇÃO DA MONETIZAÇÃO', yPos, pageWidth, margin);
  
  yPos = drawSubsectionTitle(doc, '8.1 MVP de Monetização (Fase 1 - Atual)', yPos, margin);
  
  yPos = drawChecklist(doc, [
    'Dois planos: Basic (R$ 0) e Pro (R$ 29,90/mês)',
    'Integração com Stripe para pagamentos',
    'Controle de uso por tipo de recurso',
    'FeatureGate para bloquear features premium',
    'Página de upgrade com comparativo',
    'Emails transacionais básicos',
  ], yPos, pageWidth, margin);
  
  yPos = checkPageBreak(doc, yPos, pageHeight, margin);
  
  yPos = drawSubsectionTitle(doc, '8.2 Versão Intermediária (Fase 2)', yPos, margin);
  
  yPos = drawBulletList(doc, [
    'Plano anual com desconto (R$ 239/ano = 2 meses grátis)',
    'Trial de 7 dias do Pro sem cartão',
    'Compra pontual de diagnósticos (R$ 5/diagnóstico)',
    'Customer Portal completo (alterar plano, cartão, faturas)',
    'Cupons de desconto e programa de indicação',
    'Dashboard de métricas para admin',
  ], yPos, pageWidth, margin);
  
  yPos = checkPageBreak(doc, yPos, pageHeight, margin);
  
  yPos = drawSubsectionTitle(doc, '8.3 Versão Avançada - B2B (Fase 3)', yPos, margin);
  
  yPos = drawBulletList(doc, [
    'Plano Oficina: R$ 99,90/mês com múltiplos usuários',
    'Plano Frota: Preço por veículo para gestores de frota',
    'API para integração com sistemas de oficinas',
    'Relatórios white-label para oficinas',
    'Marketplace de peças com comissão',
    'Parcerias com seguradoras e locadoras',
  ], yPos, pageWidth, margin);
  
  yPos = checkPageBreak(doc, yPos, pageHeight, margin, 80);
  
  // Final CTA box
  yPos = drawHighlightBox(doc, '🚀 PRÓXIMOS PASSOS RECOMENDADOS:', [
    '1. Habilitar integração Stripe no projeto',
    '2. Criar produtos e preços no dashboard Stripe',
    '3. Implementar Edge Function para checkout',
    '4. Implementar webhook para processar eventos',
    '5. Testar fluxo completo em modo sandbox',
    '6. Configurar emails transacionais',
    '7. Lançar em produção com monitoramento ativo',
  ], yPos, pageWidth, margin, COLORS.primary);
  
  return yPos;
}

function drawFooter(doc: jsPDF, currentPage: number, totalPages: number, pageWidth: number, pageHeight: number, margin: number): void {
  // Skip footer on cover page
  if (currentPage === 1) return;
  
  doc.setDrawColor(...COLORS.lightGray);
  doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
  
  doc.setTextColor(...COLORS.gray);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  
  doc.text('Guia de Monetização Segura - Doutor Motors', margin, pageHeight - 10);
  doc.text(`Página ${currentPage - 1} de ${totalPages - 1}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
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
