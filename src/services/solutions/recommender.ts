import { DiagnosticItem } from '@/store/useAppStore';

export interface SolutionRecommendation {
  canDIY: boolean;
  difficulty: 'fácil' | 'moderado' | 'difícil' | 'profissional';
  estimatedTime: string;
  estimatedCost: string;
  tools: string[];
  steps: string[];
  warnings: string[];
  externalLinks: ExternalLink[];
}

export interface ExternalLink {
  title: string;
  url: string;
  type: 'video' | 'article' | 'parts';
}

// Generate CarCareKiosk search URL
export function getCarCareKioskUrl(brand: string, model: string, year: number, dtcCode: string): string {
  const searchQuery = encodeURIComponent(`${brand} ${model} ${year} ${dtcCode}`);
  return `https://www.carcarekiosk.com/search?q=${searchQuery}`;
}

// Generate YouTube search URL
export function getYouTubeSearchUrl(brand: string, model: string, dtcCode: string): string {
  const searchQuery = encodeURIComponent(`${brand} ${model} ${dtcCode} repair fix`);
  return `https://www.youtube.com/results?search_query=${searchQuery}`;
}

// Get difficulty text from number
function getDifficultyText(level: number | null): 'fácil' | 'moderado' | 'difícil' | 'profissional' {
  if (!level) return 'profissional';
  if (level <= 2) return 'fácil';
  if (level <= 3) return 'moderado';
  if (level <= 4) return 'difícil';
  return 'profissional';
}

// Estimate repair time
function getEstimatedTime(difficulty: number | null, canDiy: boolean): string {
  if (!canDiy) return '2-4 horas (oficina)';
  if (!difficulty) return '1-2 horas';
  if (difficulty <= 2) return '30 min - 1 hora';
  if (difficulty <= 3) return '1-2 horas';
  if (difficulty <= 4) return '2-4 horas';
  return '4+ horas';
}

// Estimate cost range
function getEstimatedCost(dtcCode: string, canDiy: boolean): string {
  // Simple cost estimation based on code category
  const prefix = dtcCode.substring(0, 2);
  
  const costRanges: Record<string, { diy: string; shop: string }> = {
    'P0': { diy: 'R$ 50 - R$ 300', shop: 'R$ 200 - R$ 800' },
    'P1': { diy: 'R$ 100 - R$ 500', shop: 'R$ 300 - R$ 1.200' },
    'P2': { diy: 'R$ 80 - R$ 400', shop: 'R$ 250 - R$ 1.000' },
    'P3': { diy: 'R$ 50 - R$ 200', shop: 'R$ 150 - R$ 600' },
    'P4': { diy: 'R$ 30 - R$ 150', shop: 'R$ 100 - R$ 400' },
    'P7': { diy: 'N/A', shop: 'R$ 500 - R$ 3.000' },
  };
  
  const range = costRanges[prefix] || { diy: 'R$ 100 - R$ 500', shop: 'R$ 300 - R$ 1.500' };
  return canDiy ? range.diy : range.shop;
}

// Common tools for DIY repairs
const commonTools: Record<string, string[]> = {
  'spark': ['Chave de vela', 'Torquímetro', 'Calibrador de folga'],
  'sensor': ['Chave de fenda', 'Multímetro', 'Limpa contatos'],
  'filter': ['Chave de filtro', 'Bacia coletora', 'Luvas'],
  'coolant': ['Alicate para abraçadeiras', 'Funil', 'Balde'],
  'evap': ['Nenhuma ferramenta especial'],
  'general': ['Jogo de chaves', 'Scanner OBD2', 'Lanterna'],
};

// Get recommended tools based on DTC
function getRecommendedTools(dtcCode: string, canDiy: boolean): string[] {
  if (!canDiy) return ['Equipamento profissional necessário'];
  
  const code = dtcCode.toUpperCase();
  
  if (code.includes('30') || code.includes('01')) return commonTools.spark;
  if (code.includes('1') && code.startsWith('P01')) return commonTools.sensor;
  if (code.includes('12') || code.includes('28')) return commonTools.coolant;
  if (code.includes('44')) return commonTools.evap;
  
  return commonTools.general;
}

// Get generic repair steps
function getRepairSteps(item: DiagnosticItem): string[] {
  if (!item.can_diy) {
    return [
      'Este reparo requer conhecimento técnico avançado',
      'Leve o veículo a uma oficina de confiança',
      'Solicite um orçamento detalhado antes do serviço',
      'Peça para ver a peça substituída após o reparo',
    ];
  }
  
  return [
    'Desligue o motor e aguarde esfriar',
    'Desconecte o terminal negativo da bateria',
    'Localize o componente afetado usando o manual do veículo',
    'Inspecione visualmente o componente e conexões',
    'Realize o reparo ou substituição conforme necessário',
    'Reconecte a bateria e limpe os códigos de erro',
    'Faça um test drive para verificar se o problema foi resolvido',
  ];
}

// Get safety warnings
function getWarnings(item: DiagnosticItem): string[] {
  const warnings: string[] = [];
  
  if (item.priority === 'critical') {
    warnings.push('⚠️ Problema crítico - Evite dirigir até resolver');
  }
  
  if (item.severity >= 7) {
    warnings.push('⚠️ Pode causar danos adicionais se ignorado');
  }
  
  if (!item.can_diy) {
    warnings.push('⚠️ Reparo profissional recomendado');
  }
  
  if (item.dtc_code.startsWith('P07')) {
    warnings.push('⚠️ Problema de transmissão - Não force marchas');
  }
  
  if (item.dtc_code.startsWith('P03')) {
    warnings.push('⚠️ Falha de ignição pode danificar catalisador');
  }
  
  return warnings;
}

// Main recommendation function
export function getSolutionRecommendation(
  item: DiagnosticItem,
  vehicleBrand: string,
  vehicleModel: string,
  vehicleYear: number
): SolutionRecommendation {
  const externalLinks: ExternalLink[] = [
    {
      title: `Guia de reparo - ${vehicleBrand} ${vehicleModel}`,
      url: getCarCareKioskUrl(vehicleBrand, vehicleModel, vehicleYear, item.dtc_code),
      type: 'article',
    },
    {
      title: `Vídeos de como resolver ${item.dtc_code}`,
      url: getYouTubeSearchUrl(vehicleBrand, vehicleModel, item.dtc_code),
      type: 'video',
    },
  ];
  
  // Add parts link if DIY is possible
  if (item.can_diy) {
    externalLinks.push({
      title: 'Comprar peças',
      url: `https://www.mercadolivre.com.br/jm/search?as_word=${encodeURIComponent(`${vehicleBrand} ${vehicleModel} ${vehicleYear}`)}`,
      type: 'parts',
    });
  }
  
  return {
    canDIY: item.can_diy,
    difficulty: getDifficultyText(item.diy_difficulty),
    estimatedTime: getEstimatedTime(item.diy_difficulty, item.can_diy),
    estimatedCost: getEstimatedCost(item.dtc_code, item.can_diy),
    tools: getRecommendedTools(item.dtc_code, item.can_diy),
    steps: getRepairSteps(item),
    warnings: getWarnings(item),
    externalLinks,
  };
}
