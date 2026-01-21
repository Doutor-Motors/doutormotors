import { useEffect, useRef, useState } from "react";

type Options = {
  enabled: boolean;
  /** Delay between ticks. Smaller = smoother typing. */
  tickMs?: number;
  /** Avoid extremely long animations for very large outputs. */
  maxDurationMs?: number;
};

/**
 * Client-side typewriter effect that follows a growing `target` string.
 * - While enabled: reveals progressively.
 * - When disabled: snaps to full text.
 */
export function useTypewriterText(target: string, options: Options) {
  const { enabled, tickMs = 16, maxDurationMs = 4500 } = options;
  const [displayed, setDisplayed] = useState("");
  const targetRef = useRef(target);
  const startAtRef = useRef<number>(Date.now());

  // Keep refs in sync
  useEffect(() => {
    targetRef.current = target;

    // If the target was reset (e.g. new conversation), reset displayed.
    if (target.length === 0) {
      setDisplayed("");
      startAtRef.current = Date.now();
      return;
    }

    // If target shrank, snap.
    setDisplayed((prev) => (prev.length > target.length ? target : prev));
  }, [target]);

  useEffect(() => {
    // If not animating, always show full content.
    if (!enabled) {
      setDisplayed(targetRef.current);
      return;
    }

    // Restart animation timing whenever we begin typing.
    startAtRef.current = Date.now();

    const interval = window.setInterval(() => {
      setDisplayed((prev) => {
        const currentTarget = targetRef.current;
        if (prev.length >= currentTarget.length) return prev;

        const total = currentTarget.length;
        const maxTicks = Math.max(1, Math.floor(maxDurationMs / tickMs));
        const charsPerTick = Math.max(1, Math.ceil(total / maxTicks));

        const nextLen = Math.min(currentTarget.length, prev.length + charsPerTick);
        return currentTarget.slice(0, nextLen);
      });
    }, tickMs);

    return () => window.clearInterval(interval);
  }, [enabled, tickMs, maxDurationMs]);

  return displayed;
}
