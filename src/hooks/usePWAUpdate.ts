import { useState, useEffect, useCallback } from 'react';

interface UsePWAUpdateReturn {
  needsUpdate: boolean;
  updateReady: boolean;
  updateServiceWorker: () => Promise<void>;
  dismissUpdate: () => void;
}

export function usePWAUpdate(): UsePWAUpdateReturn {
  const [needsUpdate, setNeedsUpdate] = useState(false);
  const [updateReady, setUpdateReady] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    const checkForUpdates = async () => {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        
        if (!registration) {
          console.log('[PWA Update] No service worker registered');
          return;
        }

        // Check if there's already a waiting worker
        if (registration.waiting) {
          console.log('[PWA Update] Update waiting to be installed');
          setWaitingWorker(registration.waiting);
          setNeedsUpdate(true);
          setUpdateReady(true);
        }

        // Listen for new updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          console.log('[PWA Update] New service worker installing');
          
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content is available, show update notification
                console.log('[PWA Update] New version available');
                setWaitingWorker(newWorker);
                setNeedsUpdate(true);
                setUpdateReady(true);
              }
            });
          }
        });

        // Periodically check for updates (every 5 minutes)
        const checkInterval = setInterval(() => {
          registration.update().catch(err => {
            console.log('[PWA Update] Update check failed:', err);
          });
        }, 5 * 60 * 1000);

        return () => clearInterval(checkInterval);
      } catch (error) {
        console.error('[PWA Update] Error checking for updates:', error);
      }
    };

    // Listen for controller change (when new SW takes over)
    const handleControllerChange = () => {
      console.log('[PWA Update] New service worker activated, reloading...');
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
    
    checkForUpdates();

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
    };
  }, []);

  const updateServiceWorker = useCallback(async () => {
    if (!waitingWorker) {
      console.log('[PWA Update] No waiting worker');
      return;
    }

    // Tell the waiting worker to skip waiting
    waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    
    // The controllerchange event will trigger a reload
  }, [waitingWorker]);

  const dismissUpdate = useCallback(() => {
    setNeedsUpdate(false);
    // Store dismissal time to not show again for a while
    localStorage.setItem('pwa-update-dismissed', Date.now().toString());
  }, []);

  return {
    needsUpdate,
    updateReady,
    updateServiceWorker,
    dismissUpdate
  };
}
