/**
 * OBD-II Coding Functions
 * 
 * Advanced vehicle coding and programming functions via OBD-II/ELM327.
 * Includes adaptation resets, sensor calibrations, and ECU configurations.
 * 
 * WARNING: These functions can modify vehicle behavior. Use with caution.
 */

import { getOBDConnectionManager, OBDConnectionInfo } from './OBDConnectionManager';

// Coding function categories
export type CodingCategory =
  | 'adaptation_reset'
  | 'calibration'
  | 'module_config'
  | 'output_test'
  | 'freeze_frame';

// Coding function risk levels
export type CodingRiskLevel = 'low' | 'medium' | 'high' | 'critical';

// Coding function interface
export interface CodingFunction {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  category: CodingCategory;
  riskLevel: CodingRiskLevel;
  requiresPro: boolean;
  requiresEngineOff?: boolean;
  requiresIgnitionOn?: boolean;
  commands: string[];
  expectedResponse?: string;
  confirmationRequired: boolean;
  estimatedDuration: number; // in seconds
  supportedProtocols?: string[];
}

// Coding function result
export interface CodingFunctionResult {
  success: boolean;
  functionId: string;
  message: string;
  details?: string;
  rawResponses: string[];
  timestamp: Date;
  duration: number; // in milliseconds
}

// Available coding functions
export const CODING_FUNCTIONS: CodingFunction[] = [
  // === ADAPTATION RESET ===
  {
    id: 'reset_throttle_adaptation',
    name: 'Resetar Adaptação da Borboleta',
    nameEn: 'Reset Throttle Adaptation',
    description: 'Redefine os valores aprendidos da posição do corpo de borboleta. Útil após limpeza ou substituição.',
    category: 'adaptation_reset',
    riskLevel: 'low',
    requiresPro: true,
    requiresIgnitionOn: true,
    requiresEngineOff: true,
    commands: ['AT SH 7E0', '3E 00', '10 02', '31 01 0F 0A', '10 01'],
    confirmationRequired: true,
    estimatedDuration: 5,
  },
  {
    id: 'reset_fuel_trim',
    name: 'Resetar Correção de Combustível',
    nameEn: 'Reset Fuel Trim',
    description: 'Redefine os valores de correção de combustível de curto e longo prazo (STFT/LTFT).',
    category: 'adaptation_reset',
    riskLevel: 'medium',
    requiresPro: true,
    requiresIgnitionOn: true,
    commands: ['AT SH 7E0', '3E 00', '10 02', '31 01 0F 0B', '10 01'],
    confirmationRequired: true,
    estimatedDuration: 5,
  },
  {
    id: 'reset_idle_adaptation',
    name: 'Resetar Adaptação de Marcha Lenta',
    nameEn: 'Reset Idle Adaptation',
    description: 'Redefine os valores aprendidos de marcha lenta. Útil após limpeza do corpo de borboleta.',
    category: 'adaptation_reset',
    riskLevel: 'low',
    requiresPro: true,
    requiresIgnitionOn: true,
    requiresEngineOff: true,
    commands: ['AT SH 7E0', '3E 00', '10 02', '31 01 0F 0C', '10 01'],
    confirmationRequired: true,
    estimatedDuration: 5,
  },
  {
    id: 'reset_transmission_adaptation',
    name: 'Resetar Adaptação da Transmissão',
    nameEn: 'Reset Transmission Adaptation',
    description: 'Redefine os valores aprendidos de mudanças de marcha. Útil após troca de óleo ATF.',
    category: 'adaptation_reset',
    riskLevel: 'medium',
    requiresPro: true,
    requiresIgnitionOn: true,
    commands: ['AT SH 7E1', '3E 00', '10 02', '31 01 0F 00', '10 01'],
    confirmationRequired: true,
    estimatedDuration: 8,
  },
  {
    id: 'reset_battery_adaptation',
    name: 'Resetar Adaptação da Bateria',
    nameEn: 'Reset Battery Adaptation',
    description: 'Registra uma nova bateria no sistema de gerenciamento. Execute após trocar a bateria.',
    category: 'adaptation_reset',
    riskLevel: 'low',
    requiresPro: true,
    requiresIgnitionOn: true,
    requiresEngineOff: true,
    commands: ['AT SH 7E0', '3E 00', '10 02', '31 01 F0 0D', '10 01'],
    confirmationRequired: true,
    estimatedDuration: 3,
  },

  // === CALIBRATION ===
  {
    id: 'calibrate_steering_angle',
    name: 'Calibrar Sensor de Ângulo de Direção',
    nameEn: 'Calibrate Steering Angle Sensor',
    description: 'Calibra o sensor de ângulo de direção. Necessário após alinhamento ou troca de componentes.',
    category: 'calibration',
    riskLevel: 'medium',
    requiresPro: true,
    requiresIgnitionOn: true,
    requiresEngineOff: true,
    commands: ['AT SH 710', '3E 00', '10 02', '31 01 F0 06', '10 01'],
    confirmationRequired: true,
    estimatedDuration: 15,
  },
  {
    id: 'calibrate_tpms',
    name: 'Calibrar Sensores TPMS',
    nameEn: 'Calibrate TPMS Sensors',
    description: 'Inicia o processo de recalibração dos sensores de pressão dos pneus.',
    category: 'calibration',
    riskLevel: 'low',
    requiresPro: true,
    requiresIgnitionOn: true,
    commands: ['AT SH 7A0', '3E 00', '10 02', '31 01 E0 01', '10 01'],
    confirmationRequired: true,
    estimatedDuration: 5,
  },
  {
    id: 'calibrate_accelerometer',
    name: 'Calibrar Acelerômetro (ESP)',
    nameEn: 'Calibrate ESP Accelerometer',
    description: 'Calibra o sensor de aceleração do sistema ESP. Veículo deve estar nivelado.',
    category: 'calibration',
    riskLevel: 'high',
    requiresPro: true,
    requiresIgnitionOn: true,
    requiresEngineOff: true,
    commands: ['AT SH 726', '3E 00', '10 02', '31 01 F0 0A', '10 01'],
    confirmationRequired: true,
    estimatedDuration: 20,
  },
  {
    id: 'calibrate_parking_sensors',
    name: 'Calibrar Sensores de Estacionamento',
    nameEn: 'Calibrate Parking Sensors',
    description: 'Recalibra os sensores de estacionamento traseiros e dianteiros.',
    category: 'calibration',
    riskLevel: 'low',
    requiresPro: true,
    requiresIgnitionOn: true,
    commands: ['AT SH 76F', '3E 00', '10 02', '31 01 E0 02', '10 01'],
    confirmationRequired: true,
    estimatedDuration: 10,
  },

  // === MODULE CONFIG ===
  {
    id: 'activate_drl',
    name: 'Ativar/Desativar Luz Diurna (DRL)',
    nameEn: 'Toggle Daytime Running Lights',
    description: 'Configura a ativação das luzes de rodagem diurna (DRL).',
    category: 'module_config',
    riskLevel: 'low',
    requiresPro: true,
    requiresIgnitionOn: true,
    commands: ['AT SH 765', '3E 00', '10 02', '2E 10 00 01', '10 01'],
    confirmationRequired: true,
    estimatedDuration: 3,
  },
  {
    id: 'configure_auto_lock',
    name: 'Configurar Travamento Automático',
    nameEn: 'Configure Auto Lock',
    description: 'Ativa ou desativa o travamento automático das portas em velocidade.',
    category: 'module_config',
    riskLevel: 'low',
    requiresPro: true,
    requiresIgnitionOn: true,
    commands: ['AT SH 765', '3E 00', '10 02', '2E 10 01 01', '10 01'],
    confirmationRequired: true,
    estimatedDuration: 3,
  },
  {
    id: 'configure_needle_sweep',
    name: 'Configurar Animação de Ponteiros',
    nameEn: 'Configure Needle Sweep',
    description: 'Ativa ou desativa a animação de varredura dos ponteiros do painel ao ligar.',
    category: 'module_config',
    riskLevel: 'low',
    requiresPro: true,
    requiresIgnitionOn: true,
    commands: ['AT SH 720', '3E 00', '10 02', '2E 10 02 01', '10 01'],
    confirmationRequired: true,
    estimatedDuration: 3,
  },
  {
    id: 'configure_comfort_blinker',
    name: 'Configurar Seta de Conforto',
    nameEn: 'Configure Comfort Blinker',
    description: 'Configura o número de piscadas da seta de conforto (3, 5 ou 7 vezes).',
    category: 'module_config',
    riskLevel: 'low',
    requiresPro: true,
    requiresIgnitionOn: true,
    commands: ['AT SH 765', '3E 00', '10 02', '2E 10 03 05', '10 01'],
    confirmationRequired: true,
    estimatedDuration: 3,
  },

  // === OUTPUT TEST ===
  {
    id: 'test_injectors',
    name: 'Testar Injetores',
    nameEn: 'Test Injectors',
    description: 'Executa teste de ativação dos injetores de combustível.',
    category: 'output_test',
    riskLevel: 'high',
    requiresPro: true,
    requiresIgnitionOn: true,
    requiresEngineOff: true,
    commands: ['AT SH 7E0', '3E 00', '10 02', '30 01 01 01', '10 01'],
    confirmationRequired: true,
    estimatedDuration: 10,
  },
  {
    id: 'test_coils',
    name: 'Testar Bobinas de Ignição',
    nameEn: 'Test Ignition Coils',
    description: 'Executa teste de ativação das bobinas de ignição.',
    category: 'output_test',
    riskLevel: 'high',
    requiresPro: true,
    requiresIgnitionOn: true,
    requiresEngineOff: true,
    commands: ['AT SH 7E0', '3E 00', '10 02', '30 02 01 01', '10 01'],
    confirmationRequired: true,
    estimatedDuration: 10,
  },
  {
    id: 'test_cooling_fan',
    name: 'Testar Ventoinha do Radiador',
    nameEn: 'Test Cooling Fan',
    description: 'Ativa manualmente a ventoinha de arrefecimento para teste.',
    category: 'output_test',
    riskLevel: 'low',
    requiresPro: true,
    requiresIgnitionOn: true,
    commands: ['AT SH 7E0', '3E 00', '10 02', '30 03 01 01', '10 01'],
    confirmationRequired: true,
    estimatedDuration: 15,
  },
  {
    id: 'test_fuel_pump',
    name: 'Testar Bomba de Combustível',
    nameEn: 'Test Fuel Pump',
    description: 'Ativa manualmente a bomba de combustível para teste.',
    category: 'output_test',
    riskLevel: 'medium',
    requiresPro: true,
    requiresIgnitionOn: true,
    requiresEngineOff: true,
    commands: ['AT SH 7E0', '3E 00', '10 02', '30 04 01 05', '10 01'],
    confirmationRequired: true,
    estimatedDuration: 5,
  },

  // === FREEZE FRAME ===
  {
    id: 'read_freeze_frame',
    name: 'Ler Dados Freeze Frame',
    nameEn: 'Read Freeze Frame Data',
    description: 'Lê os dados do momento em que um código de erro foi registrado.',
    category: 'freeze_frame',
    riskLevel: 'low',
    requiresPro: true,
    requiresIgnitionOn: true,
    commands: ['0200', '0201', '0202', '0203', '0204', '0205'],
    confirmationRequired: false,
    estimatedDuration: 5,
  },
  {
    id: 'clear_freeze_frame',
    name: 'Limpar Dados Freeze Frame',
    nameEn: 'Clear Freeze Frame Data',
    description: 'Limpa os dados de freeze frame armazenados na ECU.',
    category: 'freeze_frame',
    riskLevel: 'medium',
    requiresPro: true,
    requiresIgnitionOn: true,
    commands: ['04'],
    confirmationRequired: true,
    estimatedDuration: 3,
  },
];

// Category labels
export const CATEGORY_LABELS: Record<CodingCategory, { name: string; icon: string; description: string }> = {
  adaptation_reset: {
    name: 'Reset de Adaptações',
    icon: 'RotateCcw',
    description: 'Redefine valores aprendidos pela ECU',
  },
  calibration: {
    name: 'Calibração de Sensores',
    icon: 'Target',
    description: 'Calibra e ajusta sensores do veículo',
  },
  module_config: {
    name: 'Configuração de Módulos',
    icon: 'Settings2',
    description: 'Configura funções e comportamentos do veículo',
  },
  output_test: {
    name: 'Teste de Atuadores',
    icon: 'Zap',
    description: 'Testa componentes e atuadores manualmente',
  },
  freeze_frame: {
    name: 'Freeze Frame',
    icon: 'Camera',
    description: 'Dados capturados no momento de uma falha',
  },
};

// Risk level styling
export const RISK_LEVEL_CONFIG: Record<CodingRiskLevel, { label: string; color: string; bgColor: string }> = {
  low: { label: 'Baixo', color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/30' },
  medium: { label: 'Médio', color: 'text-yellow-600', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30' },
  high: { label: 'Alto', color: 'text-orange-600', bgColor: 'bg-orange-100 dark:bg-orange-900/30' },
  critical: { label: 'Crítico', color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-900/30' },
};

/**
 * OBD Coding Manager
 * Handles execution of coding functions
 */
export class OBDCodingManager {
  private connectionManager = getOBDConnectionManager();

  /**
   * Get all available functions
   */
  getAllFunctions(): CodingFunction[] {
    return CODING_FUNCTIONS;
  }

  /**
   * Get functions by category
   */
  getFunctionsByCategory(category: CodingCategory): CodingFunction[] {
    return CODING_FUNCTIONS.filter(f => f.category === category);
  }

  /**
   * Get functions available for plan
   */
  getFunctionsForPlan(isPro: boolean): CodingFunction[] {
    return isPro
      ? CODING_FUNCTIONS
      : CODING_FUNCTIONS.filter(f => !f.requiresPro);
  }

  /**
   * Check if function can be executed
   */
  canExecuteFunction(func: CodingFunction, isPro: boolean): { canExecute: boolean; reason?: string } {
    // Check subscription
    if (func.requiresPro && !isPro) {
      return { canExecute: false, reason: 'Esta função requer assinatura Pro' };
    }

    // Check connection
    const connectionInfo = this.connectionManager.getConnectionInfo();
    if (connectionInfo.state !== 'connected') {
      return { canExecute: false, reason: 'Não conectado ao veículo' };
    }

    return { canExecute: true };
  }

  /**
   * Execute a coding function
   */
  async executeFunction(
    func: CodingFunction,
    onProgress?: (step: number, total: number, message: string) => void
  ): Promise<CodingFunctionResult> {
    const startTime = Date.now();
    const rawResponses: string[] = [];

    try {
      const connectionInfo = this.connectionManager.getConnectionInfo();

      // Check connection
      if (connectionInfo.state !== 'connected') {
        return {
          success: false,
          functionId: func.id,
          message: 'Não conectado ao veículo',
          rawResponses: [],
          timestamp: new Date(),
          duration: Date.now() - startTime,
        };
      }

      // If simulated, return simulated success
      if (connectionInfo.isSimulated) {
        return this.simulateExecution(func, startTime, onProgress);
      }

      // Execute real commands
      const manager = this.connectionManager;
      const totalCommands = func.commands.length;

      for (let i = 0; i < totalCommands; i++) {
        const command = func.commands[i];
        onProgress?.(i + 1, totalCommands, `Executando comando ${i + 1}/${totalCommands}...`);

        try {
          // @ts-ignore - accessing private method for advanced commands
          const response = await manager['sendCommand'](command, 5000);
          rawResponses.push(response);

          // Check for errors in response
          if (response.includes('ERROR') || response.includes('?')) {
            return {
              success: false,
              functionId: func.id,
              message: `Erro no comando ${i + 1}: Comando não suportado`,
              details: `Comando: ${command}\nResposta: ${response}`,
              rawResponses,
              timestamp: new Date(),
              duration: Date.now() - startTime,
            };
          }

          // Small delay between commands
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (err: any) {
          return {
            success: false,
            functionId: func.id,
            message: `Erro ao executar comando ${i + 1}`,
            details: err.message,
            rawResponses,
            timestamp: new Date(),
            duration: Date.now() - startTime,
          };
        }
      }

      return {
        success: true,
        functionId: func.id,
        message: 'Função executada com sucesso',
        rawResponses,
        timestamp: new Date(),
        duration: Date.now() - startTime,
      };
    } catch (error: any) {
      return {
        success: false,
        functionId: func.id,
        message: 'Erro durante execução',
        details: error.message,
        rawResponses,
        timestamp: new Date(),
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * Simulate function execution for demo/testing
   */
  private async simulateExecution(
    func: CodingFunction,
    startTime: number,
    onProgress?: (step: number, total: number, message: string) => void
  ): Promise<CodingFunctionResult> {
    const rawResponses: string[] = [];
    const totalSteps = func.commands.length;

    for (let i = 0; i < totalSteps; i++) {
      onProgress?.(i + 1, totalSteps, `Executando etapa ${i + 1}/${totalSteps}...`);

      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500));

      // Simulate responses
      if (i === 0) {
        rawResponses.push('OK\r\n>');
      } else if (i === totalSteps - 1) {
        rawResponses.push('OK\r\n>');
      } else {
        rawResponses.push(`71 ${func.commands[i].replace(/\s/g, '').substring(0, 4)}\r\n>`);
      }
    }

    // Simulate occasional failures for realism (10% chance)
    const simulateFailure = Math.random() < 0.1;

    if (simulateFailure) {
      return {
        success: false,
        functionId: func.id,
        message: 'Simulação: Falha na comunicação com ECU',
        details: 'Erro simulado para demonstração. Em uso real, verifique a conexão.',
        rawResponses,
        timestamp: new Date(),
        duration: Date.now() - startTime,
      };
    }

    return {
      success: true,
      functionId: func.id,
      message: 'Função executada com sucesso (modo simulação)',
      details: 'Executado em modo de demonstração. Conecte a um veículo real para efeito.',
      rawResponses,
      timestamp: new Date(),
      duration: Date.now() - startTime,
    };
  }
}

// Singleton instance
let codingManager: OBDCodingManager | null = null;

export function getOBDCodingManager(): OBDCodingManager {
  if (!codingManager) {
    codingManager = new OBDCodingManager();
  }
  return codingManager;
}
