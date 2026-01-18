// ============================================
// CONSTANTES E MAPEAMENTOS - ESTUDE SEU CARRO
// ============================================

import type { TutorialDifficulty, TutorialCategory } from '@/types/tutorials';

// ============================================
// MAPEAMENTO DE CATEGORIAS EN → PT
// ============================================
export const CATEGORY_MAP: Record<string, string> = {
  // Freios
  'brakes': 'Freios',
  'brake': 'Freios',
  'brake-pads': 'Pastilhas de Freio',
  'brake-rotors': 'Discos de Freio',
  'brake-calipers': 'Pinças de Freio',
  'brake-fluid': 'Fluido de Freio',
  'abs': 'Sistema ABS',
  
  // Suspensão
  'suspension': 'Suspensão',
  'shocks': 'Amortecedores',
  'struts': 'Amortecedores Dianteiros',
  'springs': 'Molas',
  'control-arms': 'Braços de Controle',
  'ball-joints': 'Pivôs',
  'tie-rods': 'Terminais de Direção',
  'sway-bar': 'Barra Estabilizadora',
  
  // Motor
  'engine': 'Motor',
  'oil': 'Óleo do Motor',
  'oil-change': 'Troca de Óleo',
  'spark-plugs': 'Velas de Ignição',
  'ignition': 'Sistema de Ignição',
  'timing-belt': 'Correia Dentada',
  'serpentine-belt': 'Correia Poly-V',
  'water-pump': 'Bomba d\'Água',
  'thermostat': 'Válvula Termostática',
  'head-gasket': 'Junta do Cabeçote',
  'valve-cover': 'Tampa de Válvulas',
  'intake': 'Admissão',
  'exhaust-manifold': 'Coletor de Escape',
  
  // Elétrica
  'electrical': 'Elétrica',
  'electric': 'Elétrica',
  'battery': 'Bateria',
  'alternator': 'Alternador',
  'starter': 'Motor de Arranque',
  'starter-motor': 'Motor de Arranque',
  'fuses': 'Fusíveis',
  'relays': 'Relés',
  'wiring': 'Fiação',
  'sensors': 'Sensores',
  'ecu': 'Módulo do Motor',
  
  // Transmissão
  'transmission': 'Transmissão',
  'clutch': 'Embreagem',
  'gearbox': 'Câmbio',
  'cv-axle': 'Semieixo',
  'driveshaft': 'Eixo Cardã',
  'differential': 'Diferencial',
  'transfer-case': 'Caixa de Transferência',
  
  // Arrefecimento
  'cooling': 'Arrefecimento',
  'cooling-system': 'Sistema de Arrefecimento',
  'radiator': 'Radiador',
  'coolant': 'Líquido de Arrefecimento',
  'hoses': 'Mangueiras',
  'fan': 'Ventoinha',
  
  // Escapamento
  'exhaust': 'Escapamento',
  'muffler': 'Silencioso',
  'catalytic-converter': 'Catalisador',
  'exhaust-pipe': 'Tubo de Escape',
  'oxygen-sensor': 'Sonda Lambda',
  
  // Direção
  'steering': 'Direção',
  'power-steering': 'Direção Hidráulica',
  'steering-wheel': 'Volante',
  'steering-column': 'Coluna de Direção',
  'steering-rack': 'Caixa de Direção',
  
  // Ar Condicionado
  'air-conditioning': 'Ar Condicionado',
  'ac': 'Ar Condicionado',
  'hvac': 'Climatização',
  'ac-compressor': 'Compressor do AC',
  'condenser': 'Condensador',
  'evaporator': 'Evaporador',
  'cabin-filter': 'Filtro de Cabine',
  
  // Combustível
  'fuel': 'Combustível',
  'fuel-system': 'Sistema de Combustível',
  'fuel-pump': 'Bomba de Combustível',
  'fuel-filter': 'Filtro de Combustível',
  'fuel-injectors': 'Bicos Injetores',
  'fuel-tank': 'Tanque de Combustível',
  
  // Iluminação
  'lights': 'Iluminação',
  'lighting': 'Iluminação',
  'headlights': 'Faróis',
  'taillights': 'Lanternas Traseiras',
  'turn-signals': 'Setas',
  'fog-lights': 'Faróis de Neblina',
  'interior-lights': 'Luzes Internas',
  
  // Pneus e Rodas
  'tires': 'Pneus',
  'wheels': 'Rodas',
  'tire-rotation': 'Rodízio de Pneus',
  'wheel-alignment': 'Alinhamento',
  'wheel-balancing': 'Balanceamento',
  
  // Interior
  'interior': 'Interior',
  'seats': 'Bancos',
  'dashboard': 'Painel',
  'doors': 'Portas',
  'windows': 'Vidros',
  'mirrors': 'Espelhos',
  
  // Exterior
  'exterior': 'Exterior',
  'body': 'Carroceria',
  'paint': 'Pintura',
  'bumpers': 'Para-choques',
  'fenders': 'Para-lamas',
  'hood': 'Capô',
  'trunk': 'Porta-malas',
  
  // Manutenção
  'maintenance': 'Manutenção',
  'inspection': 'Inspeção',
  'tune-up': 'Revisão',
  'filters': 'Filtros',
  'air-filter': 'Filtro de Ar',
  'wipers': 'Limpadores',
  'windshield': 'Para-brisa',
  'fluids': 'Fluidos',
};

// ============================================
// ÍCONES POR CATEGORIA
// ============================================
export const CATEGORY_ICONS: Record<string, string> = {
  'Freios': 'disc',
  'Suspensão': 'git-merge',
  'Motor': 'cog',
  'Elétrica': 'zap',
  'Transmissão': 'settings',
  'Arrefecimento': 'thermometer',
  'Escapamento': 'wind',
  'Direção': 'navigation',
  'Ar Condicionado': 'snowflake',
  'Combustível': 'fuel',
  'Iluminação': 'lightbulb',
  'Pneus': 'circle',
  'Interior': 'layout',
  'Exterior': 'car',
  'Manutenção': 'wrench',
};

// ============================================
// CORES POR CATEGORIA
// ============================================
export const CATEGORY_COLORS: Record<string, string> = {
  'Freios': '#EF4444',
  'Suspensão': '#3B82F6',
  'Motor': '#6B7280',
  'Elétrica': '#EAB308',
  'Transmissão': '#8B5CF6',
  'Arrefecimento': '#06B6D4',
  'Escapamento': '#F97316',
  'Direção': '#22C55E',
  'Ar Condicionado': '#0EA5E9',
  'Combustível': '#F59E0B',
  'Iluminação': '#FBBF24',
  'Pneus': '#1F2937',
  'Interior': '#78350F',
  'Exterior': '#9CA3AF',
  'Manutenção': '#14B8A6',
};

// ============================================
// DIFICULDADE
// ============================================
export const DIFFICULTY_CONFIG: Record<TutorialDifficulty, {
  label: string;
  color: string;
  bgColor: string;
  description: string;
  icon: string;
}> = {
  easy: {
    label: 'Fácil',
    color: 'text-green-500',
    bgColor: 'bg-green-500/20',
    description: 'Iniciante - Não requer experiência prévia',
    icon: 'smile',
  },
  medium: {
    label: 'Médio',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/20',
    description: 'Intermediário - Requer conhecimento básico',
    icon: 'meh',
  },
  hard: {
    label: 'Difícil',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/20',
    description: 'Avançado - Requer experiência e ferramentas especiais',
    icon: 'frown',
  },
  expert: {
    label: 'Expert',
    color: 'text-red-500',
    bgColor: 'bg-red-500/20',
    description: 'Profissional - Requer conhecimento técnico avançado',
    icon: 'alert-triangle',
  },
};

// ============================================
// FERRAMENTAS COMUNS
// ============================================
export const COMMON_TOOLS: Record<string, { name_pt: string; icon: string }> = {
  'socket set': { name_pt: 'Jogo de Soquetes', icon: 'wrench' },
  'wrench set': { name_pt: 'Jogo de Chaves', icon: 'wrench' },
  'screwdriver': { name_pt: 'Chave de Fenda', icon: 'tool' },
  'pliers': { name_pt: 'Alicate', icon: 'tool' },
  'jack': { name_pt: 'Macaco', icon: 'arrow-up' },
  'jack stands': { name_pt: 'Cavaletes', icon: 'triangle' },
  'torque wrench': { name_pt: 'Torquímetro', icon: 'gauge' },
  'oil drain pan': { name_pt: 'Bandeja de Óleo', icon: 'container' },
  'funnel': { name_pt: 'Funil', icon: 'filter' },
  'rags': { name_pt: 'Panos', icon: 'layers' },
  'gloves': { name_pt: 'Luvas', icon: 'hand' },
  'safety glasses': { name_pt: 'Óculos de Segurança', icon: 'eye' },
  'flashlight': { name_pt: 'Lanterna', icon: 'flashlight' },
  'brake cleaner': { name_pt: 'Limpa Freios', icon: 'spray-can' },
  'penetrating oil': { name_pt: 'Desengripante', icon: 'droplet' },
  'multimeter': { name_pt: 'Multímetro', icon: 'activity' },
  'obd scanner': { name_pt: 'Scanner OBD', icon: 'cpu' },
};

// ============================================
// MARCAS DE VEÍCULOS SUPORTADAS
// ============================================
export const SUPPORTED_MAKES = [
  'Acura', 'Alfa Romeo', 'Audi', 'BMW', 'Buick', 'Cadillac', 
  'Chevrolet', 'Chrysler', 'Citroën', 'Dodge', 'Fiat', 'Ford', 
  'Genesis', 'GMC', 'Honda', 'Hyundai', 'Infiniti', 'Jaguar', 
  'Jeep', 'Kia', 'Land Rover', 'Lexus', 'Lincoln', 'Mazda', 
  'Mercedes-Benz', 'Mini', 'Mitsubishi', 'Nissan', 'Peugeot', 
  'Porsche', 'Ram', 'Renault', 'Subaru', 'Suzuki', 'Tesla', 
  'Toyota', 'Volkswagen', 'Volvo'
];

// ============================================
// ANOS DISPONÍVEIS
// ============================================
export const AVAILABLE_YEARS = Array.from(
  { length: 30 }, 
  (_, i) => (new Date().getFullYear() - i).toString()
);

// ============================================
// CATEGORIAS PADRÃO PARA EXIBIÇÃO
// ============================================
export const DEFAULT_CATEGORIES: Partial<TutorialCategory>[] = [
  { slug: 'brakes', name_pt: 'Freios', icon: 'disc', color: 'red' },
  { slug: 'suspension', name_pt: 'Suspensão', icon: 'git-merge', color: 'blue' },
  { slug: 'engine', name_pt: 'Motor', icon: 'cog', color: 'gray' },
  { slug: 'electrical', name_pt: 'Elétrica', icon: 'zap', color: 'yellow' },
  { slug: 'transmission', name_pt: 'Transmissão', icon: 'settings', color: 'purple' },
  { slug: 'cooling', name_pt: 'Arrefecimento', icon: 'thermometer', color: 'cyan' },
  { slug: 'exhaust', name_pt: 'Escapamento', icon: 'wind', color: 'orange' },
  { slug: 'steering', name_pt: 'Direção', icon: 'navigation', color: 'green' },
  { slug: 'ac', name_pt: 'Ar Condicionado', icon: 'snowflake', color: 'sky' },
  { slug: 'fuel', name_pt: 'Combustível', icon: 'fuel', color: 'amber' },
  { slug: 'maintenance', name_pt: 'Manutenção', icon: 'wrench', color: 'teal' },
  { slug: 'interior', name_pt: 'Interior', icon: 'layout', color: 'brown' },
];

// ============================================
// FUNÇÕES UTILITÁRIAS
// ============================================

/**
 * Traduz categoria de EN para PT
 */
export function translateCategory(category: string): string {
  const normalized = category.toLowerCase().replace(/[_\s]+/g, '-');
  return CATEGORY_MAP[normalized] || category;
}

/**
 * Obtém ícone da categoria
 */
export function getCategoryIcon(category: string): string {
  return CATEGORY_ICONS[category] || CATEGORY_ICONS[translateCategory(category)] || 'folder';
}

/**
 * Obtém cor da categoria
 */
export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] || CATEGORY_COLORS[translateCategory(category)] || '#6B7280';
}

/**
 * Traduz nome de ferramenta
 */
export function translateTool(tool: string): string {
  const normalized = tool.toLowerCase().trim();
  return COMMON_TOOLS[normalized]?.name_pt || tool;
}

/**
 * Formata duração em minutos para string legível
 */
export function formatDuration(minutes: number | null): string {
  if (!minutes) return '--';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
}

/**
 * Gera slug a partir de texto
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Extrai ID do YouTube de URL
 */
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

/**
 * Gera URL de thumbnail do YouTube
 */
export function getYouTubeThumbnail(videoId: string, quality: 'default' | 'medium' | 'high' | 'max' = 'high'): string {
  const qualityMap = {
    default: 'default',
    medium: 'mqdefault',
    high: 'hqdefault',
    max: 'maxresdefault',
  };
  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
}

/**
 * Gera URL de embed do YouTube
 */
export function getYouTubeEmbedUrl(videoId: string, options?: {
  autoplay?: boolean;
  start?: number;
  controls?: boolean;
}): string {
  const params = new URLSearchParams();
  if (options?.autoplay) params.set('autoplay', '1');
  if (options?.start) params.set('start', options.start.toString());
  if (options?.controls === false) params.set('controls', '0');
  params.set('rel', '0');
  params.set('modestbranding', '1');
  
  const query = params.toString();
  return `https://www.youtube.com/embed/${videoId}${query ? `?${query}` : ''}`;
}

/**
 * Converte timestamp string para segundos
 */
export function timestampToSeconds(timestamp: string): number {
  const parts = timestamp.split(':').map(Number);
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return 0;
}

/**
 * Converte segundos para timestamp string
 */
export function secondsToTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
