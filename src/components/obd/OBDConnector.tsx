// Legacy OBDConnector - now uses the new modular connection system
// This file is kept for backward compatibility

import { useOBDConnection } from './useOBDConnection';
import { OBDConnectionSelector } from './OBDConnectionSelector';

export type { OBDData, OBDDevice, ConnectionType, ConnectionStatus } from './types';

// Re-export the hook for backward compatibility
export const useOBDConnector = useOBDConnection;

// Re-export the selector component
export { OBDConnectionSelector };

// Default export for legacy usage
export default useOBDConnection;
