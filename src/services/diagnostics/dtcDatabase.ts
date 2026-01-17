// Database of common DTC codes with Brazilian Portuguese descriptions
export interface DTCInfo {
  code: string;
  system: string;
  category: string;
  defaultDescription: string;
  defaultCauses: string[];
  defaultSeverity: number;
  defaultPriority: 'critical' | 'attention' | 'preventive';
  canDiy: boolean;
  diyDifficulty: number;
}

// First character meanings
const systemPrefixes: Record<string, string> = {
  'P': 'Powertrain (Motor e Transmissão)',
  'B': 'Body (Carroceria)',
  'C': 'Chassis',
  'U': 'Network (Rede de Comunicação)',
};

// Common DTC codes database
export const dtcDatabase: Record<string, DTCInfo> = {
  // Critical - Engine
  'P0300': {
    code: 'P0300',
    system: 'Ignição',
    category: 'Motor',
    defaultDescription: 'Falhas múltiplas de ignição detectadas em vários cilindros',
    defaultCauses: ['Velas de ignição desgastadas', 'Cabos de ignição danificados', 'Bobinas defeituosas', 'Baixa pressão de combustível'],
    defaultSeverity: 9,
    defaultPriority: 'critical',
    canDiy: false,
    diyDifficulty: 4,
  },
  'P0301': {
    code: 'P0301',
    system: 'Ignição',
    category: 'Motor',
    defaultDescription: 'Falha de ignição detectada no cilindro 1',
    defaultCauses: ['Vela do cilindro 1 desgastada', 'Bobina do cilindro 1 defeituosa', 'Injetor obstruído'],
    defaultSeverity: 8,
    defaultPriority: 'critical',
    canDiy: true,
    diyDifficulty: 3,
  },
  'P0171': {
    code: 'P0171',
    system: 'Combustível',
    category: 'Motor',
    defaultDescription: 'Mistura ar/combustível muito pobre (banco 1)',
    defaultCauses: ['Vazamento de ar na admissão', 'Sensor MAF sujo', 'Bomba de combustível fraca', 'Filtro de combustível entupido'],
    defaultSeverity: 7,
    defaultPriority: 'attention',
    canDiy: true,
    diyDifficulty: 2,
  },
  'P0172': {
    code: 'P0172',
    system: 'Combustível',
    category: 'Motor',
    defaultDescription: 'Mistura ar/combustível muito rica (banco 1)',
    defaultCauses: ['Injetores com vazamento', 'Regulador de pressão defeituoso', 'Sensor de oxigênio com problema'],
    defaultSeverity: 6,
    defaultPriority: 'attention',
    canDiy: false,
    diyDifficulty: 4,
  },
  
  // Attention - Emissions
  'P0420': {
    code: 'P0420',
    system: 'Emissões',
    category: 'Catalisador',
    defaultDescription: 'Eficiência do catalisador abaixo do limite (banco 1)',
    defaultCauses: ['Catalisador desgastado', 'Sensor de oxigênio traseiro defeituoso', 'Vazamento no escapamento'],
    defaultSeverity: 6,
    defaultPriority: 'attention',
    canDiy: false,
    diyDifficulty: 5,
  },
  'P0430': {
    code: 'P0430',
    system: 'Emissões',
    category: 'Catalisador',
    defaultDescription: 'Eficiência do catalisador abaixo do limite (banco 2)',
    defaultCauses: ['Catalisador desgastado', 'Sensor de oxigênio traseiro defeituoso', 'Vazamento no escapamento'],
    defaultSeverity: 6,
    defaultPriority: 'attention',
    canDiy: false,
    diyDifficulty: 5,
  },
  
  // Sensors
  'P0101': {
    code: 'P0101',
    system: 'Sensores',
    category: 'Admissão',
    defaultDescription: 'Sensor de fluxo de ar (MAF) com leitura fora do esperado',
    defaultCauses: ['Sensor MAF sujo', 'Vazamento de ar após o MAF', 'Fiação danificada'],
    defaultSeverity: 5,
    defaultPriority: 'attention',
    canDiy: true,
    diyDifficulty: 2,
  },
  'P0110': {
    code: 'P0110',
    system: 'Sensores',
    category: 'Admissão',
    defaultDescription: 'Sensor de temperatura do ar (IAT) com problema',
    defaultCauses: ['Sensor IAT defeituoso', 'Fiação danificada', 'Conector corroído'],
    defaultSeverity: 4,
    defaultPriority: 'preventive',
    canDiy: true,
    diyDifficulty: 2,
  },
  
  // Cooling
  'P0115': {
    code: 'P0115',
    system: 'Arrefecimento',
    category: 'Motor',
    defaultDescription: 'Sensor de temperatura do líquido de arrefecimento com problema',
    defaultCauses: ['Sensor ECT defeituoso', 'Fiação danificada', 'Termostato preso'],
    defaultSeverity: 5,
    defaultPriority: 'attention',
    canDiy: true,
    diyDifficulty: 2,
  },
  'P0128': {
    code: 'P0128',
    system: 'Arrefecimento',
    category: 'Motor',
    defaultDescription: 'Temperatura do líquido de arrefecimento abaixo do ideal',
    defaultCauses: ['Válvula termostática presa aberta', 'Sensor de temperatura defeituoso'],
    defaultSeverity: 4,
    defaultPriority: 'preventive',
    canDiy: true,
    diyDifficulty: 3,
  },
  
  // Oxygen Sensors
  'P0130': {
    code: 'P0130',
    system: 'Sensores',
    category: 'Emissões',
    defaultDescription: 'Sensor de oxigênio (banco 1, sensor 1) com falha',
    defaultCauses: ['Sensor de O2 defeituoso', 'Fiação danificada', 'Vazamento de escapamento'],
    defaultSeverity: 5,
    defaultPriority: 'attention',
    canDiy: true,
    diyDifficulty: 3,
  },
  'P0136': {
    code: 'P0136',
    system: 'Sensores',
    category: 'Emissões',
    defaultDescription: 'Sensor de oxigênio (banco 1, sensor 2) com falha',
    defaultCauses: ['Sensor de O2 traseiro defeituoso', 'Fiação danificada'],
    defaultSeverity: 4,
    defaultPriority: 'preventive',
    canDiy: true,
    diyDifficulty: 3,
  },
  
  // Evaporative System
  'P0440': {
    code: 'P0440',
    system: 'EVAP',
    category: 'Emissões',
    defaultDescription: 'Sistema de controle de emissões evaporativas com falha',
    defaultCauses: ['Tampa do tanque mal fechada', 'Vazamento no sistema EVAP', 'Válvula de purga defeituosa'],
    defaultSeverity: 3,
    defaultPriority: 'preventive',
    canDiy: true,
    diyDifficulty: 1,
  },
  'P0442': {
    code: 'P0442',
    system: 'EVAP',
    category: 'Emissões',
    defaultDescription: 'Pequeno vazamento detectado no sistema EVAP',
    defaultCauses: ['Tampa do tanque mal fechada', 'Mangueira do EVAP com furo', 'Canister com problema'],
    defaultSeverity: 3,
    defaultPriority: 'preventive',
    canDiy: true,
    diyDifficulty: 1,
  },
  
  // Transmission
  'P0700': {
    code: 'P0700',
    system: 'Transmissão',
    category: 'Câmbio',
    defaultDescription: 'Problema genérico no sistema de controle da transmissão',
    defaultCauses: ['Falha na TCM', 'Problema de fiação', 'Sensor de transmissão defeituoso'],
    defaultSeverity: 7,
    defaultPriority: 'critical',
    canDiy: false,
    diyDifficulty: 5,
  },
  'P0715': {
    code: 'P0715',
    system: 'Transmissão',
    category: 'Câmbio',
    defaultDescription: 'Sensor de rotação da turbina da transmissão com falha',
    defaultCauses: ['Sensor de velocidade da turbina defeituoso', 'Fiação danificada', 'Problema no conversor de torque'],
    defaultSeverity: 7,
    defaultPriority: 'critical',
    canDiy: false,
    diyDifficulty: 5,
  },
};

export function getDTCInfo(code: string): DTCInfo | null {
  return dtcDatabase[code.toUpperCase()] || null;
}

export function getSystemFromCode(code: string): string {
  const prefix = code.charAt(0).toUpperCase();
  return systemPrefixes[prefix] || 'Desconhecido';
}

export function generateMockDTCCodes(): string[] {
  const allCodes = Object.keys(dtcDatabase);
  const numCodes = Math.floor(Math.random() * 4) + 1; // 1-4 codes
  const shuffled = allCodes.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, numCodes);
}
