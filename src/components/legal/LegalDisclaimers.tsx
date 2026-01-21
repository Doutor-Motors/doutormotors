// Frases legais obrigatórias para o sistema
export const LEGAL_PHRASES = {
  // Avisos gerais
  EDUCATIONAL_ONLY: "Esta informação é educativa e não substitui avaliação profissional.",
  NOT_INSTRUCTIVE: "Informação educativa, não instrutiva.",
  PROFESSIONAL_EVALUATION: "Este diagnóstico não substitui avaliação profissional.",
  CRITICAL_SPECIALIST: "Problemas críticos devem ser avaliados por um especialista.",
  CONSCIOUS_DECISION: "Use estas informações para tomar decisões conscientes.",
  
  // Avisos de segurança crítica
  SAFETY_CRITICAL: "⚠️ Este componente afeta a segurança do veículo. Procure uma oficina especializada.",
  NO_DIY_BRAKE: "Reparos em sistemas de freio devem ser realizados por profissionais qualificados.",
  NO_DIY_STEERING: "Reparos em sistemas de direção devem ser realizados por profissionais qualificados.",
  NO_DIY_SUSPENSION: "Reparos em sistemas de suspensão devem ser realizados por profissionais qualificados.",
  
  // Avisos legais
  PLATFORM_POSITION: "O Doutor Motors é uma plataforma informativa e educativa, não uma oficina mecânica.",
  NO_WARRANTY: "Não nos responsabilizamos por danos decorrentes de reparos realizados por terceiros.",
  EXTERNAL_CONTENT: "Links externos levam a conteúdos de terceiros, sob responsabilidade deles.",
};

// Sistemas críticos que NUNCA devem ter DIY
export const CRITICAL_SYSTEMS = [
  'freio',
  'brake',
  'steering',
  'direção',
  'suspensão',
  'suspension',
  'airbag',
  'abs',
  'esp',
  'tcs',
  'traction',
];

// Códigos DTC que indicam sistemas críticos
export const CRITICAL_DTC_PREFIXES = [
  'C0', // Chassis - Freios/ABS
  'C1', // Chassis - Fabricante
  'U0', // Comunicação - Pode afetar segurança
  'P07', // Transmissão crítica
  'P26', // Injeção/Fuel
  'B00', // Body - Airbags
];

// Verificar se um DTC é de sistema crítico
export function isCriticalDTC(dtcCode: string): boolean {
  const upperCode = dtcCode.toUpperCase();
  return CRITICAL_DTC_PREFIXES.some(prefix => upperCode.startsWith(prefix));
}

// Verificar se uma descrição menciona sistema crítico
export function mentionsCriticalSystem(text: string): boolean {
  const lowerText = text.toLowerCase();
  return CRITICAL_SYSTEMS.some(system => lowerText.includes(system));
}

// Obter aviso apropriado baseado no contexto
export function getContextualWarning(
  dtcCode: string,
  description: string,
  priority: string
): string | null {
  if (priority === 'critical') {
    return LEGAL_PHRASES.CRITICAL_SPECIALIST;
  }
  
  if (isCriticalDTC(dtcCode)) {
    return LEGAL_PHRASES.SAFETY_CRITICAL;
  }
  
  if (mentionsCriticalSystem(description)) {
    return LEGAL_PHRASES.SAFETY_CRITICAL;
  }
  
  return null;
}

// Determinar se deve bloquear sugestão de DIY
export function shouldBlockDIY(dtcCode: string, description: string): boolean {
  return isCriticalDTC(dtcCode) || mentionsCriticalSystem(description);
}
