import { DiagnosticItem } from '@/store/useAppStore';

export interface ClassificationCriteria {
  safetyRisk: number;      // 1-10: Risk to driver/passengers
  mechanicalImpact: number; // 1-10: Potential damage to vehicle
  urgency: number;          // 1-10: How quickly it needs attention
  costPotential: number;    // 1-10: Potential repair cost if ignored
}

export interface ClassifiedItem extends DiagnosticItem {
  criteria: ClassificationCriteria;
  overallScore: number;
}

// Classify a single diagnostic item
export function classifyItem(item: DiagnosticItem): ClassifiedItem {
  const criteria = calculateCriteria(item);
  const overallScore = calculateOverallScore(criteria);
  
  return {
    ...item,
    criteria,
    overallScore,
  };
}

// Calculate criteria based on DTC info and severity
function calculateCriteria(item: DiagnosticItem): ClassificationCriteria {
  const baseScore = item.severity;
  
  // Determine safety risk based on system affected
  let safetyRisk = Math.min(10, baseScore);
  if (item.dtc_code.startsWith('P07') || item.dtc_code.startsWith('P03')) {
    safetyRisk = Math.min(10, safetyRisk + 2); // Engine/transmission issues
  }
  
  // Mechanical impact
  let mechanicalImpact = baseScore;
  if (item.priority === 'critical') {
    mechanicalImpact = Math.min(10, mechanicalImpact + 2);
  }
  
  // Urgency
  let urgency = baseScore;
  if (item.priority === 'critical') {
    urgency = 10;
  } else if (item.priority === 'attention') {
    urgency = 7;
  } else {
    urgency = 4;
  }
  
  // Cost potential
  let costPotential = Math.ceil(baseScore * 0.8);
  if (!item.can_diy) {
    costPotential = Math.min(10, costPotential + 2);
  }
  
  return {
    safetyRisk,
    mechanicalImpact,
    urgency,
    costPotential,
  };
}

// Calculate overall score from criteria
function calculateOverallScore(criteria: ClassificationCriteria): number {
  const weights = {
    safetyRisk: 0.35,
    mechanicalImpact: 0.25,
    urgency: 0.25,
    costPotential: 0.15,
  };
  
  return (
    criteria.safetyRisk * weights.safetyRisk +
    criteria.mechanicalImpact * weights.mechanicalImpact +
    criteria.urgency * weights.urgency +
    criteria.costPotential * weights.costPotential
  );
}

// Sort items by priority
export function sortByPriority(items: DiagnosticItem[]): ClassifiedItem[] {
  const classified = items.map(classifyItem);
  
  return classified.sort((a, b) => {
    // First by priority enum
    const priorityOrder = { critical: 0, attention: 1, preventive: 2 };
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    
    if (priorityDiff !== 0) return priorityDiff;
    
    // Then by overall score
    return b.overallScore - a.overallScore;
  });
}

// Get summary statistics
export function getDiagnosticSummary(items: DiagnosticItem[]) {
  return {
    total: items.length,
    critical: items.filter(i => i.priority === 'critical').length,
    attention: items.filter(i => i.priority === 'attention').length,
    preventive: items.filter(i => i.priority === 'preventive').length,
    canDiy: items.filter(i => i.can_diy).length,
    needsProfessional: items.filter(i => !i.can_diy).length,
  };
}

// Get risk level text
export function getRiskLevelText(score: number): string {
  if (score >= 8) return 'Alto Risco - Ação Imediata';
  if (score >= 6) return 'Risco Moderado - Agendar Reparo';
  if (score >= 4) return 'Risco Baixo - Monitorar';
  return 'Mínimo - Manutenção Preventiva';
}

// Get color based on priority
export function getPriorityColor(priority: 'critical' | 'attention' | 'preventive'): string {
  switch (priority) {
    case 'critical': return 'bg-red-600';
    case 'attention': return 'bg-orange-500';
    case 'preventive': return 'bg-yellow-500';
  }
}

export function getPriorityLabel(priority: 'critical' | 'attention' | 'preventive'): string {
  switch (priority) {
    case 'critical': return '🔴 Crítico';
    case 'attention': return '🟠 Atenção';
    case 'preventive': return '🟡 Preventivo';
  }
}
