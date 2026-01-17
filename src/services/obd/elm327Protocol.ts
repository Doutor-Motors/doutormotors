/**
 * ELM327 OBD-II Protocol Implementation
 * 
 * This module implements the ELM327 protocol for communicating with
 * OBD-II adapters. Supports both Bluetooth and WiFi connections.
 */

// ELM327 AT Commands
export const ELM327_COMMANDS = {
  // Initialization
  RESET: 'ATZ',           // Reset adapter to defaults
  ECHO_OFF: 'ATE0',       // Disable command echo
  ECHO_ON: 'ATE1',        // Enable command echo
  LINEFEED_OFF: 'ATL0',   // Disable linefeeds
  LINEFEED_ON: 'ATL1',    // Enable linefeeds
  HEADERS_OFF: 'ATH0',    // Hide headers
  HEADERS_ON: 'ATH1',     // Show headers
  SPACES_OFF: 'ATS0',     // Remove spaces from responses
  SPACES_ON: 'ATS1',      // Include spaces in responses
  
  // Protocol Selection
  AUTO_PROTOCOL: 'ATSP0', // Automatic protocol selection
  DESCRIBE_PROTOCOL: 'ATDP', // Describe current protocol
  DESCRIBE_PROTOCOL_NUM: 'ATDPN', // Describe protocol by number
  
  // Information
  READ_VOLTAGE: 'ATRV',   // Read battery voltage
  DEVICE_INFO: 'ATI',     // Get device description
  VERSION: 'AT@1',        // Get version
  
  // OBD-II PIDs (Mode 01 - Live Data)
  ENGINE_RPM: '010C',
  VEHICLE_SPEED: '010D',
  COOLANT_TEMP: '0105',
  ENGINE_LOAD: '0104',
  FUEL_PRESSURE: '010A',
  INTAKE_MANIFOLD: '010B',
  TIMING_ADVANCE: '010E',
  INTAKE_TEMP: '010F',
  MAF_RATE: '0110',
  THROTTLE_POS: '0111',
  FUEL_LEVEL: '012F',
  
  // OBD-II Mode 03 - Read DTCs
  READ_DTC: '03',
  
  // OBD-II Mode 04 - Clear DTCs
  CLEAR_DTC: '04',
  
  // OBD-II Mode 07 - Pending DTCs
  READ_PENDING_DTC: '07',
  
  // OBD-II Mode 09 - Vehicle Information
  VIN: '0902',
  CALIBRATION_ID: '0904',
  ECU_NAME: '090A',
} as const;

// OBD-II Protocol Numbers
export const OBD_PROTOCOLS = {
  0: 'Automatic',
  1: 'SAE J1850 PWM (41.6 Kbaud)',
  2: 'SAE J1850 VPW (10.4 Kbaud)',
  3: 'ISO 9141-2 (5 baud init, 10.4 Kbaud)',
  4: 'ISO 14230-4 KWP (5 baud init, 10.4 Kbaud)',
  5: 'ISO 14230-4 KWP (fast init, 10.4 Kbaud)',
  6: 'ISO 15765-4 CAN (11 bit ID, 500 Kbaud)',
  7: 'ISO 15765-4 CAN (29 bit ID, 500 Kbaud)',
  8: 'ISO 15765-4 CAN (11 bit ID, 250 Kbaud)',
  9: 'ISO 15765-4 CAN (29 bit ID, 250 Kbaud)',
  A: 'SAE J1939 CAN (29 bit ID, 250* Kbaud)',
  B: 'USER1 CAN (11* bit ID, 125* Kbaud)',
  C: 'USER2 CAN (11* bit ID, 50* Kbaud)',
} as const;

// DTC System Prefixes
export const DTC_SYSTEMS = {
  P: 'Powertrain',
  C: 'Chassis',
  B: 'Body',
  U: 'Network/Communication',
} as const;

// Response Status
export interface ELM327Response {
  success: boolean;
  data: string;
  rawData: string;
  error?: string;
}

// Parsed DTC
export interface ParsedDTC {
  code: string;
  system: string;
  category: string;
  isGeneric: boolean;
}

// Vehicle Data
export interface VehicleData {
  rpm?: number;
  speed?: number;
  coolantTemp?: number;
  engineLoad?: number;
  throttlePosition?: number;
  fuelLevel?: number;
  batteryVoltage?: string;
  vin?: string;
}

/**
 * Parse ELM327 response and clean it
 */
export function parseELMResponse(response: string): ELM327Response {
  const rawData = response;
  let data = response.trim();
  
  // Check for error responses
  if (data.includes('?') || data.includes('ERROR')) {
    return {
      success: false,
      data: '',
      rawData,
      error: 'Invalid command or no response',
    };
  }
  
  if (data.includes('NO DATA') || data === '') {
    return {
      success: true,
      data: 'NO DATA',
      rawData,
    };
  }
  
  if (data.includes('UNABLE TO CONNECT')) {
    return {
      success: false,
      data: '',
      rawData,
      error: 'Unable to connect to vehicle ECU',
    };
  }
  
  if (data.includes('BUS INIT')) {
    return {
      success: false,
      data: '',
      rawData,
      error: 'Bus initialization error',
    };
  }
  
  // Remove echo if present (command repeated in response)
  const lines = data.split('\r').filter(line => line.trim() !== '');
  if (lines.length > 1) {
    data = lines.slice(1).join('');
  }
  
  // Remove prompt character
  data = data.replace(/>/g, '').trim();
  
  // Remove spaces
  data = data.replace(/\s/g, '');
  
  return {
    success: true,
    data,
    rawData,
  };
}

/**
 * Parse DTC response from Mode 03 command
 */
export function parseDTCResponse(response: string): ParsedDTC[] {
  const parsed = parseELMResponse(response);
  
  if (!parsed.success || parsed.data === 'NO DATA') {
    return [];
  }
  
  const dtcs: ParsedDTC[] = [];
  let data = parsed.data;
  
  // Remove response header (43 for Mode 03)
  if (data.startsWith('43')) {
    data = data.substring(2);
  }
  
  // Each DTC is 4 hex characters (2 bytes)
  for (let i = 0; i + 4 <= data.length; i += 4) {
    const dtcHex = data.substring(i, i + 4);
    
    // Skip if all zeros (no DTC)
    if (dtcHex === '0000') continue;
    
    const dtc = decodeDTC(dtcHex);
    if (dtc) {
      dtcs.push(dtc);
    }
  }
  
  return dtcs;
}

/**
 * Decode a 4-character hex DTC to standard format
 */
export function decodeDTC(hexCode: string): ParsedDTC | null {
  if (hexCode.length !== 4) return null;
  
  const firstByte = parseInt(hexCode.substring(0, 2), 16);
  const secondByte = parseInt(hexCode.substring(2, 4), 16);
  
  // First two bits determine the system (P, C, B, U)
  const systemBits = (firstByte >> 6) & 0x03;
  const systems = ['P', 'C', 'B', 'U'];
  const system = systems[systemBits];
  
  // Next two bits determine if generic or manufacturer-specific
  const categoryBit = (firstByte >> 4) & 0x03;
  const isGeneric = categoryBit === 0;
  
  // Remaining bits form the code number
  const codeNumber = ((firstByte & 0x0F) << 8) | secondByte;
  
  // Format: X0XXX (e.g., P0420)
  const code = `${system}${categoryBit}${codeNumber.toString(16).toUpperCase().padStart(3, '0')}`;
  
  return {
    code,
    system: DTC_SYSTEMS[system as keyof typeof DTC_SYSTEMS],
    category: isGeneric ? 'Generic (SAE)' : 'Manufacturer Specific',
    isGeneric,
  };
}

/**
 * Parse PID response data
 */
export function parsePIDResponse(response: string, pid: string): number | null {
  const parsed = parseELMResponse(response);
  
  if (!parsed.success || parsed.data === 'NO DATA') {
    return null;
  }
  
  let data = parsed.data;
  
  // Remove response header (41 for Mode 01 response)
  if (data.startsWith('41')) {
    data = data.substring(2);
    
    // Remove PID echo
    const pidHex = pid.substring(2); // Remove mode prefix
    if (data.startsWith(pidHex.toUpperCase())) {
      data = data.substring(pidHex.length);
    }
  }
  
  // Parse remaining data based on PID
  const bytes = [];
  for (let i = 0; i < data.length; i += 2) {
    bytes.push(parseInt(data.substring(i, i + 2), 16));
  }
  
  // Calculate value based on PID formula
  return calculatePIDValue(pid, bytes);
}

/**
 * Calculate PID value based on formula
 */
function calculatePIDValue(pid: string, bytes: number[]): number | null {
  if (bytes.length === 0) return null;
  
  const A = bytes[0] || 0;
  const B = bytes[1] || 0;
  
  switch (pid) {
    case ELM327_COMMANDS.ENGINE_RPM:
      // ((A * 256) + B) / 4
      return ((A * 256) + B) / 4;
      
    case ELM327_COMMANDS.VEHICLE_SPEED:
      // A (km/h)
      return A;
      
    case ELM327_COMMANDS.COOLANT_TEMP:
      // A - 40 (°C)
      return A - 40;
      
    case ELM327_COMMANDS.ENGINE_LOAD:
      // (A * 100) / 255 (%)
      return (A * 100) / 255;
      
    case ELM327_COMMANDS.THROTTLE_POS:
      // (A * 100) / 255 (%)
      return (A * 100) / 255;
      
    case ELM327_COMMANDS.FUEL_LEVEL:
      // (A * 100) / 255 (%)
      return (A * 100) / 255;
      
    case ELM327_COMMANDS.TIMING_ADVANCE:
      // (A / 2) - 64 (degrees)
      return (A / 2) - 64;
      
    case ELM327_COMMANDS.INTAKE_TEMP:
      // A - 40 (°C)
      return A - 40;
      
    case ELM327_COMMANDS.MAF_RATE:
      // ((A * 256) + B) / 100 (g/s)
      return ((A * 256) + B) / 100;
      
    default:
      return A;
  }
}

/**
 * Parse VIN response
 */
export function parseVINResponse(response: string): string | null {
  const parsed = parseELMResponse(response);
  
  if (!parsed.success || parsed.data === 'NO DATA') {
    return null;
  }
  
  let data = parsed.data;
  
  // Remove response headers (49 02 for VIN)
  data = data.replace(/4902/g, '');
  
  // Convert hex to ASCII
  let vin = '';
  for (let i = 0; i < data.length; i += 2) {
    const charCode = parseInt(data.substring(i, i + 2), 16);
    if (charCode >= 32 && charCode <= 126) {
      vin += String.fromCharCode(charCode);
    }
  }
  
  return vin.length >= 17 ? vin.substring(0, 17) : null;
}

/**
 * Parse voltage response
 */
export function parseVoltageResponse(response: string): string | null {
  const parsed = parseELMResponse(response);
  
  if (!parsed.success) {
    return null;
  }
  
  // Voltage response is typically "12.4V" or similar
  const match = parsed.rawData.match(/(\d+\.?\d*)\s*V/i);
  return match ? `${match[1]}V` : null;
}

/**
 * Build initialization sequence for ELM327
 */
export function getInitSequence(): string[] {
  return [
    ELM327_COMMANDS.RESET,
    ELM327_COMMANDS.ECHO_OFF,
    ELM327_COMMANDS.LINEFEED_OFF,
    ELM327_COMMANDS.SPACES_OFF,
    ELM327_COMMANDS.HEADERS_OFF,
    ELM327_COMMANDS.AUTO_PROTOCOL,
  ];
}

/**
 * Validate ELM327 device response
 */
export function isValidELM327Response(response: string): boolean {
  return response.includes('ELM') || response.includes('OBD');
}
