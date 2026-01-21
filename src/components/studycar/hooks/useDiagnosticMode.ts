import { useState, useCallback } from "react";

export type DiagnosticLogLevel = "info" | "success" | "error" | "warn";

export interface DiagnosticLogEntry {
  id: string;
  timestamp: Date;
  level: DiagnosticLogLevel;
  operation: string;
  message: string;
  details?: string;
}

export const useDiagnosticMode = () => {
  const [isDiagnosticEnabled, setIsDiagnosticEnabled] = useState(false);
  const [logs, setLogs] = useState<DiagnosticLogEntry[]>([]);

  const log = useCallback((
    level: DiagnosticLogLevel,
    operation: string,
    message: string,
    details?: string
  ) => {
    const entry: DiagnosticLogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      level,
      operation,
      message,
      details,
    };

    setLogs((prev) => [entry, ...prev].slice(0, 50)); // Keep last 50 logs

    // Also log to console if diagnostic mode is enabled
    const consoleMethod = level === "error" ? "error" : level === "warn" ? "warn" : "log";
    console[consoleMethod](`[DIAG] ${operation}: ${message}`, details || "");
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const toggleDiagnosticMode = useCallback(() => {
    setIsDiagnosticEnabled((prev) => !prev);
  }, []);

  return {
    isDiagnosticEnabled,
    toggleDiagnosticMode,
    logs,
    log,
    clearLogs,
  };
};
