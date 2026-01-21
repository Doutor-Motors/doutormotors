import { motion, AnimatePresence } from "framer-motion";
import { 
  Bug, 
  X, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  AlertTriangle,
  ChevronDown,
  ChevronUp 
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { DiagnosticLogEntry, DiagnosticLogLevel } from "../hooks/useDiagnosticMode";

interface DiagnosticPanelProps {
  isOpen: boolean;
  logs: DiagnosticLogEntry[];
  onClose: () => void;
  onClear: () => void;
}

const LEVEL_CONFIG: Record<DiagnosticLogLevel, { 
  icon: typeof CheckCircle2; 
  color: string; 
  bg: string;
}> = {
  success: { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10" },
  error: { icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/10" },
  warn: { icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/10" },
  info: { icon: Info, color: "text-blue-500", bg: "bg-blue-500/10" },
};

const DiagnosticPanel = ({ isOpen, logs, onClose, onClear }: DiagnosticPanelProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)]"
      >
        <Card className="border-primary/30 shadow-lg shadow-primary/10 bg-background/95 backdrop-blur-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Bug className="w-4 h-4 text-primary" />
              Modo Diagnóstico
              <Badge variant="secondary" className="text-xs">
                {logs.length} logs
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={onClear}
                title="Limpar logs"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={onClose}
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-2">
            <ScrollArea className="h-64">
              {logs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <Bug className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhum log ainda</p>
                  <p className="text-xs mt-1">Execute operações para ver os logs</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {logs.map((log) => {
                    const config = LEVEL_CONFIG[log.level];
                    const Icon = config.icon;
                    const isExpanded = expandedId === log.id;

                    return (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-2 rounded-lg ${config.bg} cursor-pointer transition-all hover:ring-1 hover:ring-primary/30`}
                        onClick={() => setExpandedId(isExpanded ? null : log.id)}
                      >
                        <div className="flex items-start gap-2">
                          <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${config.color}`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-semibold truncate">
                                {log.operation}
                              </span>
                              <span className="text-[10px] text-muted-foreground shrink-0">
                                {format(log.timestamp, "HH:mm:ss", { locale: ptBR })}
                              </span>
                            </div>
                            <p className="text-xs text-foreground/80 mt-0.5">
                              {log.message}
                            </p>
                            
                            {log.details && (
                              <div className="flex items-center gap-1 mt-1">
                                {isExpanded ? (
                                  <ChevronUp className="w-3 h-3 text-muted-foreground" />
                                ) : (
                                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                                )}
                                <span className="text-[10px] text-muted-foreground">
                                  {isExpanded ? "Ocultar detalhes" : "Ver detalhes"}
                                </span>
                              </div>
                            )}

                            <AnimatePresence>
                              {isExpanded && log.details && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden"
                                >
                                  <pre className="mt-2 p-2 rounded bg-background/50 text-[10px] font-mono whitespace-pre-wrap break-all">
                                    {log.details}
                                  </pre>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default DiagnosticPanel;
