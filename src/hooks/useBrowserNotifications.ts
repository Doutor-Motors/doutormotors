import { useCallback, useEffect, useRef, useState } from "react";

type AlertPriority = "urgent" | "high" | "normal" | "low";

interface UseBrowserNotificationsOptions {
  onPermissionGranted?: () => void;
  onPermissionDenied?: () => void;
}

// Sound generator using Web Audio API for different priority levels
class NotificationSoundGenerator {
  private audioContext: AudioContext | null = null;

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    return this.audioContext;
  }

  // Play a beep with specific frequency and duration
  private playTone(
    frequency: number,
    duration: number,
    volume: number = 0.3,
    type: OscillatorType = "sine"
  ): Promise<void> {
    return new Promise((resolve) => {
      const ctx = this.getContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

      // Envelope for smooth sound
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
      gainNode.gain.linearRampToValueAtTime(volume * 0.7, ctx.currentTime + duration * 0.7);
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);

      oscillator.onended = () => resolve();
    });
  }

  // Delay helper
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // URGENT: Rapid triple beep with rising pitch (alarming)
  async playUrgent(): Promise<void> {
    console.log("Playing URGENT notification sound");
    await this.playTone(880, 0.1, 0.4, "square"); // A5
    await this.delay(80);
    await this.playTone(988, 0.1, 0.4, "square"); // B5
    await this.delay(80);
    await this.playTone(1047, 0.15, 0.5, "square"); // C6
    await this.delay(100);
    await this.playTone(880, 0.1, 0.4, "square");
    await this.delay(80);
    await this.playTone(988, 0.1, 0.4, "square");
    await this.delay(80);
    await this.playTone(1047, 0.15, 0.5, "square");
  }

  // HIGH: Double beep with attention-grabbing tone
  async playHigh(): Promise<void> {
    console.log("Playing HIGH notification sound");
    await this.playTone(659, 0.15, 0.35, "triangle"); // E5
    await this.delay(120);
    await this.playTone(784, 0.2, 0.4, "triangle"); // G5
    await this.delay(200);
    await this.playTone(659, 0.15, 0.35, "triangle");
    await this.delay(120);
    await this.playTone(784, 0.2, 0.4, "triangle");
  }

  // NORMAL: Pleasant single chime
  async playNormal(): Promise<void> {
    console.log("Playing NORMAL notification sound");
    await this.playTone(523, 0.15, 0.3, "sine"); // C5
    await this.delay(50);
    await this.playTone(659, 0.2, 0.35, "sine"); // E5
    await this.delay(50);
    await this.playTone(784, 0.25, 0.3, "sine"); // G5
  }

  // LOW: Soft, subtle notification
  async playLow(): Promise<void> {
    console.log("Playing LOW notification sound");
    await this.playTone(392, 0.3, 0.2, "sine"); // G4
  }

  // Play sound based on priority
  async playForPriority(priority: AlertPriority): Promise<void> {
    // Resume audio context if suspended (browser autoplay policy)
    const ctx = this.getContext();
    if (ctx.state === "suspended") {
      await ctx.resume();
    }

    switch (priority) {
      case "urgent":
        return this.playUrgent();
      case "high":
        return this.playHigh();
      case "normal":
        return this.playNormal();
      case "low":
        return this.playLow();
      default:
        return this.playNormal();
    }
  }

  // Cleanup
  dispose(): void {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

export const useBrowserNotifications = (options?: UseBrowserNotificationsOptions) => {
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== "undefined" ? Notification.permission : "default"
  );
  const soundGeneratorRef = useRef<NotificationSoundGenerator | null>(null);

  // Initialize sound generator
  useEffect(() => {
    soundGeneratorRef.current = new NotificationSoundGenerator();
    
    return () => {
      soundGeneratorRef.current?.dispose();
      soundGeneratorRef.current = null;
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

  // Play notification sound based on priority
  const playSound = useCallback((priority: AlertPriority = "normal") => {
    if (soundGeneratorRef.current) {
      soundGeneratorRef.current.playForPriority(priority).catch(error => {
        console.warn("Could not play notification sound:", error);
      });
    }
  }, []);

  // Show browser notification
  const showNotification = useCallback(
    (
      title: string, 
      options?: NotificationOptions & { 
        playSound?: boolean;
        priority?: AlertPriority;
      }
    ) => {
      const { 
        playSound: shouldPlaySound = true, 
        priority = "normal",
        ...notificationOptions 
      } = options || {};

      // Play sound if enabled
      if (shouldPlaySound) {
        playSound(priority);
      }

      // Show browser notification if permission granted
      if (isSupported && permission === "granted") {
        try {
          const notification = new Notification(title, {
            icon: "/favicon.ico",
            badge: "/favicon.ico",
            tag: "system-alert",
            requireInteraction: priority === "urgent" || priority === "high",
            ...notificationOptions,
          });

          // Auto-close based on priority (urgent stays longer)
          const closeDelay = priority === "urgent" ? 10000 : priority === "high" ? 7000 : 5000;
          setTimeout(() => notification.close(), closeDelay);

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

      const priority = (["urgent", "high", "normal", "low"].includes(alert.priority) 
        ? alert.priority 
        : "normal") as AlertPriority;

      return showNotification(`${priorityEmoji} ${alert.title}`, {
        body: alert.message,
        playSound: true,
        priority,
      });
    },
    [showNotification]
  );

  // Test sound for a specific priority
  const testSound = useCallback((priority: AlertPriority) => {
    playSound(priority);
  }, [playSound]);

  return {
    isSupported,
    permission,
    requestPermission,
    showNotification,
    showAlertNotification,
    playSound,
    testSound,
  };
};

export default useBrowserNotifications;
