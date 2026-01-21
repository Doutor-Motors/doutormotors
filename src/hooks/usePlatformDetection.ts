import { useState, useEffect } from 'react';
import { 
  getPlatformInfo, 
  getPlatformDescription,
  getConnectionCapabilityMessage,
  canConnectToOBD,
  getRecommendedAction,
  PlatformInfo 
} from '@/utils/platformDetector';

export interface UsePlatformDetectionReturn {
  platformInfo: PlatformInfo;
  platformDescription: string;
  connectionCapabilities: {
    bluetooth: { supported: boolean; message: string };
    wifi: { supported: boolean; message: string };
  };
  canConnect: boolean;
  recommendedAction: string;
  isLoading: boolean;
}

/**
 * Hook for detecting platform capabilities for OBD connections
 * Automatically detects if running in native Capacitor app or web browser
 */
export const usePlatformDetection = (): UsePlatformDetectionReturn => {
  const [isLoading, setIsLoading] = useState(true);
  const [platformInfo, setPlatformInfo] = useState<PlatformInfo>(() => getPlatformInfo());
  const [platformDescription, setPlatformDescription] = useState('');
  const [connectionCapabilities, setConnectionCapabilities] = useState({
    bluetooth: { supported: false, message: '' },
    wifi: { supported: false, message: '' },
  });
  const [canConnect, setCanConnect] = useState(false);
  const [recommendedAction, setRecommendedAction] = useState('');

  useEffect(() => {
    // Small delay to ensure plugins are loaded
    const detectPlatform = () => {
      const info = getPlatformInfo();
      setPlatformInfo(info);
      setPlatformDescription(getPlatformDescription());
      setConnectionCapabilities(getConnectionCapabilityMessage());
      setCanConnect(canConnectToOBD());
      setRecommendedAction(getRecommendedAction());
      setIsLoading(false);
    };

    // Check immediately
    detectPlatform();

    // Re-check after a short delay (plugins might load async)
    const timeout = setTimeout(detectPlatform, 500);

    return () => clearTimeout(timeout);
  }, []);

  return {
    platformInfo,
    platformDescription,
    connectionCapabilities,
    canConnect,
    recommendedAction,
    isLoading,
  };
};

export default usePlatformDetection;
