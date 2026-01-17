import { useCallback, useEffect, useState } from "react";

// Notification sound as a base64-encoded short beep
const NOTIFICATION_SOUND_DATA = "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleipIjNHFnD8VLn3d4cqIPhVDgdDJnEQoQHvf3r1+Kz5MmN3EiDQRNZbe7dymXT1FhN3LkD8eNH7j5r5zJSxJmd/GizcONJni7NqlWjlChd7MkUAgNn/k5b1yJStJmt/GijgPN5rh69mlWjhChd7MkUEhN3/k5b1yJSxJmt/GizgQOJrh69mlWjhChd7MkUEhN4Dk5b1yJSxJmt/HizgQOJrh69mlWjhDhd7MkUEhN4Dk5b1yJSxJmt/HizgQOJrh69mlWjhDhd7MkUEhN4Dk5b1yJixJmt/GijgQOJvh69mlWjhDhd7MkUEhN4Dk5b1yJitJmt/GijgQOJvh69mlWjhDhd7MkUEhN4Dl5b1yJitJmt/GijgQOJvh69mlWjhDhd7MkUEhN4Dk5b1yJSxKmt/GijgQOJvh69qlWjhDhd7MkUEhN4Dk5b1yJSxJmt/GijgQOJrh69qlWjhDhd7MkUEhN4Dk5b1yJSxJmt/GijgQOJrh69qlWjhDhd7MkUEhN4Dk5bxzJSxKmt/GijgQOJrh69qlWjhDhd7MkT8gNoHl5bxzJSxJmt/GijcPOJrh69qlWjhDhd7MkT8gNoHl5bxzJSxJmd/GijcPOJrh69qlWjhChd7MkT8gNoHl5bxzJSxJmd/GijcPOJrh69qlWjhChd7MkT8gNoHl5bxzJSxJmd/GijcPOJrh69qlWjhChd7MkT8gNoHl5bxzJSxJmd/GijcPOJrh69qlWjhChd7MkT8gNoHl5bxzJSxJmd/GijcPN5rh69qmWjhChd7MkT8gNoHl5bxzJSxJmd/GijcPN5rh69qmWjhChd7MkT8gNoHl5bxzJSxJmd/GijcPN5nh69qmWjhChd7MkT8gNoHl5bxzJSxJmd/GijcPN5nh69qmWjhChd7MkT8gNoHl5bxzJSxJmd/GijcPN5nh69qmWjhChd7MkT8gNoHl5bxzJSxJmd/GijcPN5nh69qmWjhChd7MkT8gNoHl5bxzJSxJmd/GijcPN5nh69qmWjhChd/MkT8gNoHl5bxzJSxJmd/GijcPN5nh69qmWjhChd/MkT8gNoHl5bxzJSxJmd/GijcPN5nh69qmWjhChd/MkT8gNoHl5bxzJSxJmd/GijcPN5nh69qmWjhChd/MkT8gNoHl5bxzJSxJmd/GijcPN5nh69qmWjhChd/MkT8gNoHl5bxzJSxJmd/GijcPN5nh69qmWjhChd/MkT8gNoHl5bxzJSxJmd/GijcPN5nh69qmWjhChd/MkT8gNoHl5bxzJSxJmd/GijcPN5nh69qmWjhChd/MkT8gNoHl5bxzJSxJmd/GijcPN5nh69qmWjhChd/MkT8gNoHl5bxzJSxJmd/GijcPN5nh69qmWjhCheHMkT8gN4Lk5bxzJSxJmd/GijcPN5nh69qmWjhCheHMkT8gN4Lk5bxzJSxJmd/GijcPN5nh69qmWjhCheHMkT8gN4Lk5bxzJSxJmd/GijcPN5nh69qmWjhCheHMkT8gN4Lk5bxzJSxJmd/GijcPN5nh69qmWjhCheHMkT8gN4Lk5bxzJSxJmd/GijcPN5nh69qmWjhCheHMkT8gN4Lk5bxzJSxJmd/GijcPN5nh69qmWjhCheHMkT8gN4Lk5bxzJSxJmd/GijcPN5nh69qmWjhCheHMkT8gN4Lk5bxzJSxJmd/GijcPN5nh69qmWjhCheHMkT8gN4Lk5bxzJSxJmd/GijcPN5nh69qmWjhCheHMkT8gN4Lk5bxzJSxJmd/GijcPN5nh69qmWjhCheHMkT8gN4Lk5bxzJSxJmd/GijcPN5nh69qmWjhCheHMkT8gN4Lk5bxzJSxJmd/GijcPN5nh69qmWjhCheHMkT8gN4Lk5bxzJSxJmd/GijcPN5nh69qmWjhCheHMkT8gN4Lk5bxzJSxJmd/GijcPN5nh69qmWjhCheHMkT8gN4Lk5bxzJSxJmd/GijcPN5nh69qmWjhCheHMkT8gN4Lk5bxzJSxJmd/GijcPN5nh69qmWjhCheHMkT8gN4Lk5bxzJStJmd/GijcPN5nh69qmWjhCheHMkT8gN4Lk5bxzJStJmd/GijcPN5nh69qmWjhCheHMkT8gN4Lk5bxzJStJmd/GijcPN5nh69qmWjhCheHMkT8gN4Lk5bxzJStJmd/GijcPN5nh69qmWjhCheHMkT8gN4Lk5bxzJStJmd/GijcPN5nh69qmWjhCheHMkT8gN4Lk5bxzJStJmd/GijcPN5nh69qmWjhCheHMkT8gN4Lk5bxzJStJmd/GijcPN5nh69qmWjhCheHMkT8gN4Lk5bxzJStJmd/GijcPN5nh69qmWjhCheHMkT8gN4Lk5bxzJStJmd/GijcPN5nh69qmWjhCheHMkT8gN4Lk5bxzJStJmd/GijcPN5nh69qmWjhCheHMkT8gN4Lk5bxzJStJmd/GijcPN5nh69qmWjhCheHMkT8gN4Lk5bxzJStJmd/GijcPN5nh69qmWjhCheHMkT8gN4Lk5bxzJStJmd/GijcPN5nh69qmWjhCheHMkT8gN4Lk5bxzJStJmd/GijcPN5nh69qmWjhCheHMkT8gN4Lk5bxzJStJmd/GijcPN5nh69qmWjhCheHMkT8gN4Lk5bxzJStJmd/GijcPN5nh69qmWjhCheHMkT8gN4Lk5bxzJStJmd/GijcPN5nh69qmWjhCheHMkT8gN4Lk5bxzJStJmd/GijcPN5nh69qmWjhCheHMkT8gN4Lk5bxzJStJmd/GijcPN5nh69qmWjhCheHMkUA=";

interface UseBrowserNotificationsOptions {
  onPermissionGranted?: () => void;
  onPermissionDenied?: () => void;
}

export const useBrowserNotifications = (options?: UseBrowserNotificationsOptions) => {
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== "undefined" ? Notification.permission : "default"
  );
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio(NOTIFICATION_SOUND_DATA);
    audio.volume = 0.5;
    setAudioElement(audio);
    
    return () => {
      audio.pause();
      audio.src = "";
    };
  }, []);

  // Check if notifications are supported
  const isSupported = typeof Notification !== "undefined";

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      console.warn("Browser notifications are not supported");
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === "granted") {
        options?.onPermissionGranted?.();
        console.log("Notification permission granted");
        return true;
      } else {
        options?.onPermissionDenied?.();
        console.log("Notification permission denied");
        return false;
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  }, [isSupported, options]);

  // Play notification sound
  const playSound = useCallback(() => {
    if (audioElement) {
      audioElement.currentTime = 0;
      audioElement.play().catch(error => {
        console.warn("Could not play notification sound:", error);
      });
    }
  }, [audioElement]);

  // Show browser notification
  const showNotification = useCallback(
    (title: string, options?: NotificationOptions & { playSound?: boolean }) => {
      const { playSound: shouldPlaySound = true, ...notificationOptions } = options || {};

      // Play sound if enabled
      if (shouldPlaySound) {
        playSound();
      }

      // Show browser notification if permission granted
      if (isSupported && permission === "granted") {
        try {
          const notification = new Notification(title, {
            icon: "/favicon.ico",
            badge: "/favicon.ico",
            tag: "system-alert",
            requireInteraction: false,
            ...notificationOptions,
          });

          // Auto-close after 5 seconds
          setTimeout(() => notification.close(), 5000);

          // Handle click
          notification.onclick = () => {
            window.focus();
            notification.close();
          };

          return notification;
        } catch (error) {
          console.error("Error showing notification:", error);
        }
      }

      return null;
    },
    [isSupported, permission, playSound]
  );

  // Show alert notification (convenience method)
  const showAlertNotification = useCallback(
    (alert: { title: string; message: string; type: string; priority: string }) => {
      const priorityEmoji = {
        urgent: "🚨",
        high: "⚠️",
        normal: "📢",
        low: "ℹ️",
      }[alert.priority] || "📢";

      return showNotification(`${priorityEmoji} ${alert.title}`, {
        body: alert.message,
        playSound: true,
      });
    },
    [showNotification]
  );

  return {
    isSupported,
    permission,
    requestPermission,
    showNotification,
    showAlertNotification,
    playSound,
  };
};

export default useBrowserNotifications;
