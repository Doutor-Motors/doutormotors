/**
 * Glossário de Termos Técnicos Automotivos
 * Português-BR com explicações didáticas
 */

export interface GlossaryTerm {
  term: string;
  aliases: string[]; // Variações do termo
  definition: string;
  category: 'motor' | 'eletrica' | 'suspensao' | 'freios' | 'transmissao' | 'arrefecimento' | 'combustivel' | 'sensores' | 'geral';
  difficulty: 'basico' | 'intermediario' | 'avancado';
}

export const AUTOMOTIVE_GLOSSARY: GlossaryTerm[] = [
  // Motor
  {
    term: "Vela de Ignição",
    aliases: ["vela", "velas de ignição", "spark plug", "vela do motor"],
    definition: "Peça que produz a faísca elétrica para iniciar a combustão do combustível no motor. Deve ser trocada periodicamente para manter o bom funcionamento.",
    category: "motor",
    difficulty: "basico"
  },
  {
    term: "Bobina de Ignição",
    aliases: ["bobina", "coil", "ignition coil", "bobina do motor"],
    definition: "Componente elétrico que transforma a baixa tensão da bateria em alta tensão para criar a faísca nas velas. Cada cilindro pode ter sua própria bobina.",
    category: "motor",
    difficulty: "intermediario"
  },
  {
    term: "Corpo de Borboleta",
    aliases: ["throttle body", "borboleta", "corpo de aceleração", "TBI"],
    definition: "Válvula que controla a entrada de ar no motor. Quando você acelera, ela abre para permitir mais ar entrar.",
    category: "motor",
    difficulty: "intermediario"
  },
  {
    term: "Coletor de Admissão",
    aliases: ["intake manifold", "manifold", "coletor de ar"],
    definition: "Tubulação que distribui o ar (ou mistura ar-combustível) para os cilindros do motor de forma equilibrada.",
    category: "motor",
    difficulty: "intermediario"
  },
  {
    term: "Coletor de Escape",
    aliases: ["exhaust manifold", "coletor de escapamento"],
    definition: "Tubulação que coleta os gases queimados de cada cilindro e os direciona para o sistema de escape.",
    category: "motor",
    difficulty: "intermediario"
  },
  {
    term: "Junta do Cabeçote",
    aliases: ["head gasket", "junta de cabeçote", "junta"],
    definition: "Vedação entre o bloco do motor e o cabeçote. Impede vazamento de óleo, água e gases. Sua falha é um problema grave.",
    category: "motor",
    difficulty: "avancado"
  },
  {
    term: "Correia Dentada",
    aliases: ["timing belt", "correia de distribuição", "correia sincronizadora"],
    definition: "Correia que sincroniza a rotação do virabrequim com o comando de válvulas. Sua troca é essencial para evitar danos graves ao motor.",
    category: "motor",
    difficulty: "intermediario"
  },
  {
    term: "Comando de Válvulas",
    aliases: ["camshaft", "eixo comando", "árvore de cames"],
    definition: "Eixo com ressaltos que controla a abertura e fechamento das válvulas de admissão e escape no momento correto.",
    category: "motor",
    difficulty: "avancado"
  },
  {
    term: "Virabrequim",
    aliases: ["crankshaft", "eixo de manivelas", "girabrequim"],
    definition: "Eixo principal do motor que transforma o movimento dos pistões em rotação. É o que faz as rodas girarem.",
    category: "motor",
    difficulty: "intermediario"
  },
  
  // Sensores
  {
    term: "Sensor de Oxigênio",
    aliases: ["sonda lambda", "O2 sensor", "sensor O2", "oxygen sensor", "lambda"],
    definition: "Sensor no escapamento que mede a quantidade de oxigênio nos gases. Ajuda o computador a ajustar a mistura ar-combustível.",
    category: "sensores",
    difficulty: "intermediario"
  },
  {
    term: "Sensor de Fluxo de Ar",
    aliases: ["MAF", "mass air flow", "sensor MAF", "medidor de massa de ar"],
    definition: "Mede a quantidade de ar que entra no motor. Essencial para o cálculo correto da injeção de combustível.",
    category: "sensores",
    difficulty: "intermediario"
  },
  {
    term: "Sensor de Temperatura",
    aliases: ["ECT", "coolant temperature sensor", "sensor de temperatura do motor", "CTS"],
    definition: "Mede a temperatura do líquido de arrefecimento. Informa ao computador se o motor está frio ou aquecido.",
    category: "sensores",
    difficulty: "basico"
  },
  {
    term: "Sensor de Posição do Acelerador",
    aliases: ["TPS", "throttle position sensor", "sensor do acelerador"],
    definition: "Informa ao computador a posição do pedal do acelerador, controlando quanto combustível injetar.",
    category: "sensores",
    difficulty: "intermediario"
  },
  {
    term: "Sensor de Rotação",
    aliases: ["sensor de fase", "CKP", "crankshaft position sensor", "sensor do virabrequim"],
    definition: "Detecta a posição e velocidade de rotação do motor. Essencial para o timing de ignição e injeção.",
    category: "sensores",
    difficulty: "intermediario"
  },
  {
    term: "Sensor de Detonação",
    aliases: ["knock sensor", "sensor de batida", "sensor de pré-ignição"],
    definition: "Detecta vibrações anormais no motor (batida de pino). Protege o motor ajustando o ponto de ignição.",
    category: "sensores",
    difficulty: "avancado"
  },
  
  // Sistema Elétrico
  {
    term: "Alternador",
    aliases: ["alternator", "gerador"],
    definition: "Gera energia elétrica enquanto o motor está funcionando. Carrega a bateria e alimenta os sistemas elétricos.",
    category: "eletrica",
    difficulty: "basico"
  },
  {
    term: "Motor de Arranque",
    aliases: ["starter", "motor de partida", "starter motor", "arranque"],
    definition: "Motor elétrico que gira o motor para dar a partida. Usa muita energia da bateria por poucos segundos.",
    category: "eletrica",
    difficulty: "basico"
  },
  {
    term: "ECU",
    aliases: ["central eletrônica", "módulo de injeção", "computador do carro", "ECM", "PCM"],
    definition: "Computador do veículo que controla injeção, ignição e outros sistemas. É o 'cérebro' do carro.",
    category: "eletrica",
    difficulty: "intermediario"
  },
  {
    term: "Fusível",
    aliases: ["fuse", "fusíveis"],
    definition: "Proteção elétrica que queima para evitar danos quando há sobrecarga. Fácil e barato de substituir.",
    category: "eletrica",
    difficulty: "basico"
  },
  {
    term: "Relé",
    aliases: ["relay", "relê"],
    definition: "Interruptor elétrico controlado por outro circuito. Permite que um circuito fraco controle um mais forte.",
    category: "eletrica",
    difficulty: "intermediario"
  },
  
  // Arrefecimento
  {
    term: "Radiador",
    aliases: ["radiator", "colmeia"],
    definition: "Trocador de calor que resfria o líquido de arrefecimento usando o ar. Essencial para evitar superaquecimento.",
    category: "arrefecimento",
    difficulty: "basico"
  },
  {
    term: "Bomba d'Água",
    aliases: ["water pump", "bomba de água", "bomba do sistema de arrefecimento"],
    definition: "Circula o líquido de arrefecimento pelo motor e radiador. Sua falha pode causar superaquecimento rápido.",
    category: "arrefecimento",
    difficulty: "intermediario"
  },
  {
    term: "Termostato",
    aliases: ["thermostat", "válvula termostática"],
    definition: "Válvula que controla o fluxo de líquido de arrefecimento. Mantém o motor na temperatura ideal de trabalho.",
    category: "arrefecimento",
    difficulty: "intermediario"
  },
  {
    term: "Ventoinha",
    aliases: ["fan", "ventilador do radiador", "eletroventilador"],
    definition: "Ventilador que força ar através do radiador quando o carro está parado ou em baixa velocidade.",
    category: "arrefecimento",
    difficulty: "basico"
  },
  
  // Combustível
  {
    term: "Bico Injetor",
    aliases: ["injector", "injetor", "fuel injector", "bico de injeção"],
    definition: "Válvula que pulveriza combustível no motor. Cada cilindro tem seu próprio injetor controlado pela ECU.",
    category: "combustivel",
    difficulty: "intermediario"
  },
  {
    term: "Bomba de Combustível",
    aliases: ["fuel pump", "bomba de gasolina", "bomba elétrica"],
    definition: "Envia combustível do tanque para o motor sob pressão. Geralmente fica dentro do tanque de combustível.",
    category: "combustivel",
    difficulty: "intermediario"
  },
  {
    term: "Filtro de Combustível",
    aliases: ["fuel filter", "filtro de gasolina"],
    definition: "Remove impurezas do combustível antes de chegar aos injetores. Deve ser trocado periodicamente.",
    category: "combustivel",
    difficulty: "basico"
  },
  {
    term: "Catalisador",
    aliases: ["catalytic converter", "conversor catalítico", "catalizador"],
    definition: "Converte gases poluentes em menos nocivos. Fica no escapamento e é obrigatório por lei.",
    category: "combustivel",
    difficulty: "intermediario"
  },
  {
    term: "Válvula EGR",
    aliases: ["EGR valve", "recirculação de gases", "EGR"],
    definition: "Recircula parte dos gases de escape de volta ao motor para reduzir emissões. Pode entupir com o tempo.",
    category: "combustivel",
    difficulty: "avancado"
  },
  
  // Freios
  {
    term: "Pastilha de Freio",
    aliases: ["brake pad", "pastilha", "brake pads"],
    definition: "Peça de desgaste que pressiona o disco para frear. Deve ser trocada quando fina para não danificar o disco.",
    category: "freios",
    difficulty: "basico"
  },
  {
    term: "Disco de Freio",
    aliases: ["brake disc", "disco", "rotor"],
    definition: "Disco metálico preso à roda que é comprimido pelas pastilhas para frear o veículo.",
    category: "freios",
    difficulty: "basico"
  },
  {
    term: "Pinça de Freio",
    aliases: ["brake caliper", "caliper", "mordente"],
    definition: "Componente hidráulico que pressiona as pastilhas contra o disco. Contém pistões que se movem com pressão.",
    category: "freios",
    difficulty: "intermediario"
  },
  {
    term: "Fluido de Freio",
    aliases: ["brake fluid", "óleo de freio", "DOT"],
    definition: "Líquido hidráulico que transmite a força do pedal para as rodas. Deve ser trocado periodicamente.",
    category: "freios",
    difficulty: "basico"
  },
  {
    term: "ABS",
    aliases: ["anti-lock braking system", "sistema antiblocante", "freio ABS"],
    definition: "Sistema que evita o travamento das rodas durante frenagens bruscas, mantendo o controle do veículo.",
    category: "freios",
    difficulty: "intermediario"
  },
  
  // Suspensão
  {
    term: "Amortecedor",
    aliases: ["shock absorber", "shock", "amortecedores"],
    definition: "Absorve impactos das irregularidades da pista. Mantém os pneus em contato com o solo.",
    category: "suspensao",
    difficulty: "basico"
  },
  {
    term: "Mola",
    aliases: ["spring", "mola helicoidal", "coil spring"],
    definition: "Suporta o peso do veículo e absorve impactos. Trabalha junto com o amortecedor.",
    category: "suspensao",
    difficulty: "basico"
  },
  {
    term: "Barra Estabilizadora",
    aliases: ["sway bar", "barra anti-rolagem", "stabilizer bar"],
    definition: "Reduz a inclinação da carroceria nas curvas. Conecta os lados esquerdo e direito da suspensão.",
    category: "suspensao",
    difficulty: "intermediario"
  },
  {
    term: "Terminal de Direção",
    aliases: ["tie rod end", "terminal", "pivô de direção"],
    definition: "Conecta a caixa de direção às rodas. Seu desgaste causa folga na direção e desgaste irregular dos pneus.",
    category: "suspensao",
    difficulty: "intermediario"
  },
  {
    term: "Pivô de Suspensão",
    aliases: ["ball joint", "pivô", "junta esférica"],
    definition: "Articulação que permite o movimento da suspensão e direção. Essencial para a segurança.",
    category: "suspensao",
    difficulty: "intermediario"
  },
  
  // Transmissão
  {
    term: "Embreagem",
    aliases: ["clutch", "kit de embreagem", "platô"],
    definition: "Conecta e desconecta o motor da transmissão. Permite trocar marchas em carros manuais.",
    category: "transmissao",
    difficulty: "basico"
  },
  {
    term: "Câmbio",
    aliases: ["transmission", "caixa de marchas", "gearbox", "caixa de câmbio"],
    definition: "Conjunto de engrenagens que multiplica a força do motor e permite diferentes velocidades.",
    category: "transmissao",
    difficulty: "basico"
  },
  {
    term: "Conversor de Torque",
    aliases: ["torque converter", "conversor"],
    definition: "Substitui a embreagem em carros automáticos. Usa fluido para transferir potência do motor ao câmbio.",
    category: "transmissao",
    difficulty: "avancado"
  },
  {
    term: "Homocinética",
    aliases: ["CV joint", "junta homocinética", "tulipa"],
    definition: "Junta que transmite força às rodas mesmo com a suspensão se movendo. Comum nas rodas dianteiras.",
    category: "transmissao",
    difficulty: "intermediario"
  },
  {
    term: "Diferencial",
    aliases: ["differential", "caixa de diferencial"],
    definition: "Permite que as rodas girem em velocidades diferentes nas curvas. Essencial para a dirigibilidade.",
    category: "transmissao",
    difficulty: "intermediario"
  },
  
  // Geral
  {
    term: "OBD",
    aliases: ["OBD2", "OBD-II", "diagnóstico", "scanner"],
    definition: "Sistema de diagnóstico que monitora o funcionamento do veículo e registra códigos de falha (DTCs).",
    category: "geral",
    difficulty: "basico"
  },
  {
    term: "DTC",
    aliases: ["código de falha", "código de erro", "trouble code"],
    definition: "Código alfanumérico que identifica um problema específico no veículo. Ex: P0300 = falha de ignição.",
    category: "geral",
    difficulty: "basico"
  },
  {
    term: "Torque",
    aliases: ["nm", "newton metro", "força de aperto"],
    definition: "Força de rotação. Importante para apertar parafusos corretamente e medir a potência do motor.",
    category: "geral",
    difficulty: "intermediario"
  },
  {
    term: "Multímetro",
    aliases: ["multimeter", "voltímetro", "testador"],
    definition: "Ferramenta que mede tensão, corrente e resistência elétrica. Essencial para diagnósticos elétricos.",
    category: "geral",
    difficulty: "basico"
  },
  {
    term: "Chave Soquete",
    aliases: ["socket wrench", "catraca", "soquete"],
    definition: "Ferramenta com encaixe intercambiável para diferentes tamanhos de parafusos e porcas.",
    category: "geral",
    difficulty: "basico"
  }
];

/**
 * Busca termos do glossário que aparecem em um texto
 */
export function findTermsInText(text: string): GlossaryTerm[] {
  const foundTerms: GlossaryTerm[] = [];
  const textLower = text.toLowerCase();
  
  for (const term of AUTOMOTIVE_GLOSSARY) {
    // Verifica o termo principal
    if (textLower.includes(term.term.toLowerCase())) {
      if (!foundTerms.find(t => t.term === term.term)) {
        foundTerms.push(term);
      }
      continue;
    }
    
    // Verifica aliases
    for (const alias of term.aliases) {
      if (textLower.includes(alias.toLowerCase())) {
        if (!foundTerms.find(t => t.term === term.term)) {
          foundTerms.push(term);
        }
        break;
      }
    }
  }
  
  return foundTerms;
}

/**
 * Busca um termo específico no glossário
 */
export function getTermDefinition(searchTerm: string): GlossaryTerm | null {
  const searchLower = searchTerm.toLowerCase();
  
  for (const term of AUTOMOTIVE_GLOSSARY) {
    if (term.term.toLowerCase() === searchLower) {
      return term;
    }
    
    for (const alias of term.aliases) {
      if (alias.toLowerCase() === searchLower) {
        return term;
      }
    }
  }
  
  return null;
}

/**
 * Retorna cor baseada na categoria
 */
export function getCategoryColor(category: GlossaryTerm['category']): string {
  const colors: Record<GlossaryTerm['category'], string> = {
    motor: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    eletrica: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    suspensao: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    freios: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    transmissao: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    arrefecimento: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
    combustivel: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    sensores: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    geral: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
  };
  
  return colors[category] || colors.geral;
}

/**
 * Retorna label da categoria em português
 */
export function getCategoryLabel(category: GlossaryTerm['category']): string {
  const labels: Record<GlossaryTerm['category'], string> = {
    motor: 'Motor',
    eletrica: 'Elétrica',
    suspensao: 'Suspensão',
    freios: 'Freios',
    transmissao: 'Transmissão',
    arrefecimento: 'Arrefecimento',
    combustivel: 'Combustível',
    sensores: 'Sensores',
    geral: 'Geral'
  };
  
  return labels[category] || 'Geral';
}

/**
 * Retorna ícone da dificuldade
 */
export function getDifficultyInfo(difficulty: GlossaryTerm['difficulty']): { label: string; color: string } {
  const info: Record<GlossaryTerm['difficulty'], { label: string; color: string }> = {
    basico: { label: 'Básico', color: 'text-green-600' },
    intermediario: { label: 'Intermediário', color: 'text-yellow-600' },
    avancado: { label: 'Avançado', color: 'text-red-600' }
  };
  
  return info[difficulty] || info.basico;
}
