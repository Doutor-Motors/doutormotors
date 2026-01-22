/**
 * OBD Connection Manager
 * 
 * Manages real OBD-II connections via ELM327 adapters.
 * Supports Bluetooth Classic (SPP) and WiFi (TCP/IP) connections.
 */

import {
  ELM327_COMMANDS,
  getInitSequence,
  parseDTCResponse,
  parsePIDResponse,
  parseVoltageResponse,
  parseVINResponse,
  isValidELM327Response,
  ParsedDTC,
  VehicleData,
} from './elm327Protocol';

export interface OBDSettings {
  atst_value: number;
  atst_mode: "auto" | "manual";
  optimize_requests: boolean;
  preferred_protocol: string;
  auto_reconnect: boolean;
  connection_timeout_seconds: number;
  max_simultaneous_parameters: number;
  polling_interval_ms: number;
  custom_init_commands: string[];
}

export type OBDConnectionState =
  | 'disconnected'
  | 'connecting'
  | 'initializing'
  | 'connected'
  | 'reading'
  | 'error';

export interface OBDConnectionInfo {
  state: OBDConnectionState;
  deviceName?: string;
  deviceAddress?: string;
  protocol?: string;
  voltage?: string;
  error?: string;
  isSimulated: boolean;
}

export interface OBDReadResult {
  success: boolean;
  dtcCodes: string[];
  parsedDTCs: ParsedDTC[];
  vehicleData: VehicleData;
  rawResponse?: string;
  error?: string;
}

type WriteFunction = (data: string) => Promise<void>;
type ReadFunction = () => Promise<string>;

/**
 * OBD Connection Manager Class
 */
export class OBDConnectionManager {
  private state: OBDConnectionState = 'disconnected';
  private deviceName: string = '';
  private deviceAddress: string = '';
  private protocol: string = '';
  private voltage: string = '';
  private isSimulated: boolean = true;
  private lastError: string = '';
  private settings: OBDSettings | null = null;

  private writeFunction: WriteFunction | null = null;
  private readFunction: ReadFunction | null = null;

  private onStateChange?: (info: OBDConnectionInfo) => void;

  constructor(onStateChange?: (info: OBDConnectionInfo) => void) {
    this.onStateChange = onStateChange;
  }

  /**
   * Get current connection info
   */
  getConnectionInfo(): OBDConnectionInfo {
    return {
      state: this.state,
      deviceName: this.deviceName,
      deviceAddress: this.deviceAddress,
      protocol: this.protocol,
      voltage: this.voltage,
      error: this.lastError,
      isSimulated: this.isSimulated,
    };
  }

  /**
   * Update state and notify listeners
   */
  private updateState(newState: OBDConnectionState, error?: string) {
    this.state = newState;
    if (error) this.lastError = error;
    this.onStateChange?.(this.getConnectionInfo());
  }

  /**
   * Set communication functions for real connection
   */
  setTransport(write: WriteFunction, read: ReadFunction) {
    this.writeFunction = write;
    this.readFunction = read;
    this.isSimulated = false;
  }

  /**
   * Apply settings to connection
   */
  applySettings(settings: OBDSettings) {
    this.settings = settings;
    // If currently connected and ATST changed, we might want to send it immediately
    if (this.state === 'connected' && !this.isSimulated) {
      this.configureConnection();
    }
  }

  /**
   * Configure connection parameters based on settings
   */
  private async configureConnection() {
    if (!this.settings || this.isSimulated) return;

    try {
      // Apply ATST (Timeout)
      if (this.settings.atst_mode === 'manual') {
        const hex = this.settings.atst_value.toString(16).toUpperCase().padStart(2, '0');
        await this.sendCommand(`ATST${hex}`, 500);
      }

      // Execute custom init commands
      if (this.settings.custom_init_commands?.length > 0) {
        for (const cmd of this.settings.custom_init_commands) {
          if (cmd.trim()) {
            await this.sendCommand(cmd.trim(), 500);
          }
        }
      }
    } catch (err) {
      console.warn('Failed to configure connection settings:', err);
    }
  }

  /**
   * Send command and receive response
   */
  private async sendCommand(command: string, timeout: number = 2000): Promise<string> {
    if (this.isSimulated) {
      return this.simulateCommand(command);
    }

    if (!this.writeFunction || !this.readFunction) {
      throw new Error('Transport not configured');
    }

    // Send command with carriage return
    await this.writeFunction(`${command}\r`);

    // Wait for response with timeout
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Command timeout: ${command}`));
      }, timeout);

      // Poll for response
      const pollInterval = setInterval(async () => {
        try {
          const response = await this.readFunction!();
          if (response && response.includes('>')) {
            clearInterval(pollInterval);
            clearTimeout(timeoutId);
            resolve(response);
          }
        } catch (err) {
          // Continue polling
        }
      }, 50);
    });
  }

  /**
   * Simulate ELM327 commands for demo/testing
   */
  private async simulateCommand(command: string): Promise<string> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));

    switch (command) {
      case ELM327_COMMANDS.RESET:
        return 'ELM327 v2.1\r\n>';
      case ELM327_COMMANDS.ECHO_OFF:
      case ELM327_COMMANDS.LINEFEED_OFF:
      case ELM327_COMMANDS.SPACES_OFF:
      case ELM327_COMMANDS.HEADERS_OFF:
      case ELM327_COMMANDS.AUTO_PROTOCOL:
        return 'OK\r\n>';
      case ELM327_COMMANDS.READ_VOLTAGE:
        return '12.4V\r\n>';
      case ELM327_COMMANDS.DESCRIBE_PROTOCOL:
        return 'AUTO, ISO 15765-4 CAN (11 bit, 500 kbaud)\r\n>';
      case ELM327_COMMANDS.READ_DTC:
        // Simulate random DTCs
        const hasDTCs = Math.random() > 0.3;
        if (hasDTCs) {
          const simulatedDTCs = ['01200030', '01710128', '04200000'][Math.floor(Math.random() * 3)];
          return `43${simulatedDTCs}\r\n>`;
        }
        return '43\r\n>'; // No DTCs
      case ELM327_COMMANDS.ENGINE_RPM:
        const rpm = Math.floor(800 + Math.random() * 2200);
        const rpmA = Math.floor((rpm * 4) / 256);
        const rpmB = (rpm * 4) % 256;
        return `410C${rpmA.toString(16).padStart(2, '0')}${rpmB.toString(16).padStart(2, '0')}\r\n>`;
      case ELM327_COMMANDS.VEHICLE_SPEED:
        const speed = Math.floor(Math.random() * 120);
        return `410D${speed.toString(16).padStart(2, '0')}\r\n>`;
      case ELM327_COMMANDS.COOLANT_TEMP:
        const temp = Math.floor(70 + Math.random() * 30) + 40; // 70-100°C raw
        return `4105${temp.toString(16).padStart(2, '0')}\r\n>`;
      case ELM327_COMMANDS.ENGINE_LOAD:
        const load = Math.floor(Math.random() * 100 * 255 / 100);
        return `4104${load.toString(16).padStart(2, '0')}\r\n>`;
      case ELM327_COMMANDS.THROTTLE_POS:
        const throttle = Math.floor(Math.random() * 50 * 255 / 100);
        return `4111${throttle.toString(16).padStart(2, '0')}\r\n>`;
      case ELM327_COMMANDS.FUEL_LEVEL:
        const fuel = Math.floor((50 + Math.random() * 50) * 255 / 100);
        return `412F${fuel.toString(16).padStart(2, '0')}\r\n>`;
      case ELM327_COMMANDS.VIN:
        return '490201574442374841485533313030310\r\n>'; // Sample VIN
      default:
        return 'NO DATA\r\n>';
    }
  }

  /**
   * Initialize connection with ELM327
   */
  async initialize(deviceName: string = 'OBD2 Adapter', deviceAddress: string = ''): Promise<boolean> {
    this.deviceName = deviceName;
    this.deviceAddress = deviceAddress;
    this.updateState('initializing');

    try {
      // Send initialization sequence
      for (const command of getInitSequence()) {
        const response = await this.sendCommand(command, 3000);

        // Validate reset response
        if (command === ELM327_COMMANDS.RESET && !isValidELM327Response(response)) {
          throw new Error('Invalid ELM327 response - device may not be an ELM327');
        }
      }



      // Apply settings if available
      if (this.settings) {
        // Apply protocol preference if set manually
        if (this.settings.preferred_protocol !== 'auto') {
          try {
            await this.sendCommand(`ATSP${this.settings.preferred_protocol}`, 1000);
          } catch (e) {
            console.warn('Failed to set preferred protocol:', e);
          }
        }

        // Connect
        await this.configureConnection();
      }

      // Get protocol
      const protocolResponse = await this.sendCommand(ELM327_COMMANDS.DESCRIBE_PROTOCOL);
      this.protocol = protocolResponse.replace(/[\r\n>]/g, '').trim() || 'AUTO';

      // Get voltage
      const voltageResponse = await this.sendCommand(ELM327_COMMANDS.READ_VOLTAGE);
      this.voltage = parseVoltageResponse(voltageResponse) || 'N/A';

      this.updateState('connected');
      return true;
    } catch (error: any) {
      this.updateState('error', error.message);
      return false;
    }
  }

  /**
   * Read DTC codes from vehicle
   */
  async readDTCCodes(): Promise<OBDReadResult> {
    if (this.state !== 'connected') {
      return {
        success: false,
        dtcCodes: [],
        parsedDTCs: [],
        vehicleData: {},
        error: 'Not connected',
      };
    }

    this.updateState('reading');

    try {
      // Read stored DTCs
      const dtcResponse = await this.sendCommand(ELM327_COMMANDS.READ_DTC, 5000);
      const parsedDTCs = parseDTCResponse(dtcResponse);

      // Read vehicle data
      const vehicleData = await this.readVehicleData();

      this.updateState('connected');

      return {
        success: true,
        dtcCodes: parsedDTCs.map(dtc => dtc.code),
        parsedDTCs,
        vehicleData,
        rawResponse: dtcResponse,
      };
    } catch (error: any) {
      this.updateState('error', error.message);
      return {
        success: false,
        dtcCodes: [],
        parsedDTCs: [],
        vehicleData: {},
        error: error.message,
      };
    }
  }

  /**
   * Read live vehicle data
   */
  async readVehicleData(): Promise<VehicleData> {
    const vehicleData: VehicleData = {
      batteryVoltage: this.voltage,
    };

    try {
      // RPM
      const rpmResponse = await this.sendCommand(ELM327_COMMANDS.ENGINE_RPM);
      vehicleData.rpm = parsePIDResponse(rpmResponse, ELM327_COMMANDS.ENGINE_RPM) ?? undefined;

      // Speed
      const speedResponse = await this.sendCommand(ELM327_COMMANDS.VEHICLE_SPEED);
      vehicleData.speed = parsePIDResponse(speedResponse, ELM327_COMMANDS.VEHICLE_SPEED) ?? undefined;

      // Coolant Temperature
      const tempResponse = await this.sendCommand(ELM327_COMMANDS.COOLANT_TEMP);
      vehicleData.coolantTemp = parsePIDResponse(tempResponse, ELM327_COMMANDS.COOLANT_TEMP) ?? undefined;

      // Engine Load
      const loadResponse = await this.sendCommand(ELM327_COMMANDS.ENGINE_LOAD);
      vehicleData.engineLoad = parsePIDResponse(loadResponse, ELM327_COMMANDS.ENGINE_LOAD) ?? undefined;

      // Throttle Position
      const throttleResponse = await this.sendCommand(ELM327_COMMANDS.THROTTLE_POS);
      vehicleData.throttlePosition = parsePIDResponse(throttleResponse, ELM327_COMMANDS.THROTTLE_POS) ?? undefined;

      // Fuel Level
      const fuelResponse = await this.sendCommand(ELM327_COMMANDS.FUEL_LEVEL);
      vehicleData.fuelLevel = parsePIDResponse(fuelResponse, ELM327_COMMANDS.FUEL_LEVEL) ?? undefined;

    } catch (error) {
      console.warn('Error reading vehicle data:', error);
    }

    return vehicleData;
  }

  /**
   * Read VIN
   */
  async readVIN(): Promise<string | null> {
    if (this.state !== 'connected') return null;

    try {
      const vinResponse = await this.sendCommand(ELM327_COMMANDS.VIN, 5000);
      return parseVINResponse(vinResponse);
    } catch (error) {
      console.warn('Error reading VIN:', error);
      return null;
    }
  }

  /**
   * Clear DTC codes
   */
  async clearDTCCodes(): Promise<boolean> {
    if (this.state !== 'connected') return false;

    try {
      await this.sendCommand(ELM327_COMMANDS.CLEAR_DTC, 5000);
      return true;
    } catch (error) {
      console.warn('Error clearing DTCs:', error);
      return false;
    }
  }

  /**
   * Disconnect
   */
  disconnect() {
    this.state = 'disconnected';
    this.writeFunction = null;
    this.readFunction = null;
    this.deviceName = '';
    this.deviceAddress = '';
    this.protocol = '';
    this.voltage = '';
    this.lastError = '';
    this.isSimulated = true;
    this.onStateChange?.(this.getConnectionInfo());
  }
}

// Singleton instance
let connectionManager: OBDConnectionManager | null = null;

export function getOBDConnectionManager(onStateChange?: (info: OBDConnectionInfo) => void): OBDConnectionManager {
  if (!connectionManager) {
    connectionManager = new OBDConnectionManager(onStateChange);
  } else if (onStateChange) {
    // Update callback if provided
    connectionManager = new OBDConnectionManager(onStateChange);
  }
  return connectionManager;
}
